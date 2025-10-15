const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Security-related configuration
const allowedOriginsCsv = process.env.CORS_ORIGINS || 'http://localhost:5173';
const allowedOrigins = allowedOriginsCsv
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const exposeRaw = String(process.env.EXPOSE_RAW || '').toLowerCase() === 'true';
const defaultModel = process.env.DEFAULT_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
const allowedModels = (process.env.ALLOWED_MODELS || defaultModel)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

// Restrict CORS to allowed origins (development default: http://localhost:5173)
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true); // allow tools without Origin header
      const ok = allowedOrigins.includes(origin);
      cb(null, ok);
    },
  })
);
app.use(express.json());

// 프로덕션에서 Vite 빌드 결과를 정적으로 서빙
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


app.post('/api/ask', async (req, res) => {
  try {
    const { question, model, scenario, persona } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '유저 답변 텍스트를 보내주세요.' });
    }
    // Basic input size guard to prevent excessive payloads
    if (question.length > 4000) {
      return res.status(413).json({ error: 'Question too long (max 4000 characters).' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OPENROUTER_API_KEY가 설정되어 있지 않습니다. .env에 키를 추가하세요.'
      });
    }

    // Sanitize and restrict referer to allowed origins only
    const defaultReferer = allowedOrigins[0] || `http://localhost:${PORT}/`;
    let clientReferer = defaultReferer;
    if (typeof req.body?.referer === 'string' && req.body.referer.trim()) {
      try {
        const u = new URL(req.body.referer.trim());
        const originOnly = `${u.protocol}//${u.host}`;
        if (allowedOrigins.includes(originOnly)) {
          clientReferer = req.body.referer.trim();
        }
      } catch (_) {
        // ignore invalid referer
      }
    }

    // 메시지 구성 우선순위:
    // 1) persona가 있으면 시스템 프롬프트로 사용
    // 2) persona가 없고 scenario가 있으면 기본 캐릭터 페르소나 + 시나리오/유저 답변 사용
    // 3) 그 외에는 유저 질문만 전달
    const hasPersona = typeof persona === 'string' && persona.trim().length > 0;
    const hasScenario = typeof scenario === 'string' && scenario.trim().length > 0;

    const messages = hasPersona
      ? [
          { role: 'system', content: persona.trim() },
          { role: 'user', content: question }
        ]
      : hasScenario
      ? [
          { role: 'system', content: CHARACTER_PERSONA },
          {
            role: 'user',
            content: `상황:\n${scenario}\n\n유저의 답변:\n${question}\n\n위 캐릭터 페르소나를 유지하며 자연스럽게 반응해줘.`
          }
        ]
      : [
          { role: 'user', content: question }
        ];

    // Model restriction: only allow models from the allowlist
    const requestedModel = typeof model === 'string' && model.trim() ? model.trim() : defaultModel;
    const finalModel = allowedModels.includes(requestedModel) ? requestedModel : defaultModel;

    const payload = {
      model: finalModel,
      messages
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': clientReferer,
        'X-Title': 'otaku_AI LLM key test'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error || 'OpenRouter 요청 실패', details: data });
    }

    const text = data?.choices?.[0]?.message?.content || '';
    if (exposeRaw) {
      return res.json({ answer: text, raw: data });
    }
    res.json({ answer: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.', details: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
const { fetch } = require('undici');

function parseAllowedModels() {
  const defaultModel = process.env.DEFAULT_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
  const allowed = (process.env.ALLOWED_MODELS || defaultModel)
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return { defaultModel, allowedModels: allowed };
}

function pickModel(requested) {
  const { defaultModel, allowedModels } = parseAllowedModels();
  const req = typeof requested === 'string' && requested.trim() ? requested.trim() : defaultModel;
  return allowedModels.includes(req) ? req : defaultModel;
}

function buildMessages({ message, persona, scenario }) {
  const hasPersona = typeof persona === 'string' && persona.trim().length > 0;
  const hasScenario = typeof scenario === 'string' && scenario.trim().length > 0;

  if (hasPersona) {
    const sys = persona.trim();
    const sysWithFormat = `${sys}\n\n응답 형식 지침:\n- 반드시 순수 JSON으로만 응답하세요.\n- 필수 키: situation, speech, action, nextCharacter.\n- nextCharacter 값은 'yuri' | 'jiho' | 'seyeon' 또는 null 중 하나여야 합니다.\n- 모든 값은 한국어로 작성하세요.\n- 메타 텍스트나 설명은 금지합니다.\n- 사용자가 특정 인물을 찾아가거나 대화하려고 한다면 nextCharacter를 해당 인물의 id('yuri'|'jiho'|'seyeon')로 설정하세요. 그렇지 않으면 null입니다.`;
    if (hasScenario) {
      return [
        { role: 'system', content: sysWithFormat },
        { role: 'user', content: `상황:\n${scenario}\n\n유저의 답변:\n${message}\n\n지침: 위 캐릭터 페르소나를 유지하고, JSON으로만 응답하세요. 구조: { "situation": string, "speech": string, "action": string, "nextCharacter": "yuri"|"jiho"|"seyeon"|null }` }
      ];
    }
    return [
      { role: 'system', content: sysWithFormat },
      { role: 'user', content: message }
    ];
  }

  if (hasScenario) {
    return [
      { role: 'user', content: `상황:\n${scenario}\n\n유저의 답변:\n${message}\n\nJSON으로만 응답: { "situation": ..., "speech": ..., "action": ..., "nextCharacter": "yuri"|"jiho"|"seyeon"|null }` }
    ];
  }

  return [
    { role: 'user', content: message }
  ];
}

async function generateReply(message, { model, scenario, persona, referer, exposeRaw } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err = new Error('Missing OpenRouter API key');
    err.status = 500;
    throw err;
  }

  const finalModel = pickModel(model);
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const payload = {
    model: finalModel,
    response_format: { type: 'json_object' },
    messages: buildMessages({ message, persona, scenario })
  };

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-Title': process.env.X_TITLE || 'StoryAI',
  };
  if (referer) headers['HTTP-Referer'] = referer;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data?.error?.message || 'OpenRouter error');
    err.status = response.status;
    err.details = data;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content || '';

  let structured = null;
  try {
    const raw = text.trim();
    const jsonCandidate = raw.startsWith('{') ? raw : (raw.match(/\{[\s\S]*\}/)?.[0] || '');
    if (jsonCandidate) {
      const parsed = JSON.parse(jsonCandidate);
      const situation = typeof parsed?.situation === 'string' ? parsed.situation.trim() : '';
      const speech = typeof parsed?.speech === 'string' ? parsed.speech.trim() : '';
      const action = typeof parsed?.action === 'string' ? parsed.action.trim() : '';
      const nextCharacterRaw = parsed?.nextCharacter;
      const allowedChars = ['yuri','jiho','seyeon'];

      let nextCharacter = null;
      if (typeof nextCharacterRaw === 'string') {
        const val = nextCharacterRaw.trim().toLowerCase();
        const map = {
          'yuri': 'yuri', '유리': 'yuri',
          'jiho': 'jiho', '지호': 'jiho',
          'seyeon': 'seyeon', '세연': 'seyeon', 'se-yeon': 'seyeon', 'se yeon': 'seyeon'
        };
        nextCharacter = map[val] || (allowedChars.includes(val) ? val : null);
        if (['none','null','stay','current',''].includes(val)) nextCharacter = null;
      } else if (nextCharacterRaw && typeof nextCharacterRaw === 'object') {
        const id = (nextCharacterRaw.id || nextCharacterRaw.name || nextCharacterRaw.value || '').trim().toLowerCase();
        const map = {
          'yuri': 'yuri', '유리': 'yuri',
          'jiho': 'jiho', '지호': 'jiho',
          'seyeon': 'seyeon', '세연': 'seyeon', 'se-yeon': 'seyeon', 'se yeon': 'seyeon'
        };
        nextCharacter = map[id] || (allowedChars.includes(id) ? id : null);
      }

      structured = { situation, speech, action, nextCharacter };
    }
  } catch (e) {
    // ignore parse errors; fall back to plain text
  }

  const exposeRawEnv = String(process.env.EXPOSE_RAW || '').toLowerCase() === 'true';
  const result = structured ? { answer: structured.speech || text, ...structured } : { answer: text };
  if (exposeRaw || exposeRawEnv) result.raw = data;
  return result;
}

module.exports = { generateReply };
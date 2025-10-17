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
    if (hasScenario) {
      return [
        { role: 'system', content: sys },
        { role: 'user', content: `상황:\n${scenario}\n\n유저의 답변:\n${message}\n\n위 캐릭터 페르소나를 유지하며 자연스럽게 반응해줘.` }
      ];
    }
    return [
      { role: 'system', content: sys },
      { role: 'user', content: message }
    ];
  }

  if (hasScenario) {
    return [
      { role: 'user', content: `상황:\n${scenario}\n\n유저의 답변:\n${message}` }
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
  const exposeRawEnv = String(process.env.EXPOSE_RAW || '').toLowerCase() === 'true';
  if (exposeRaw || exposeRawEnv) return { answer: text, raw: data };
  return { answer: text };
}

module.exports = { generateReply };
const { fetch } = require('undici');

const DEFAULT_BACKGROUNDS = ['classroom', 'cafeteria', 'library'];
const DEFAULT_CHARACTERS = ['yuri', 'jiho', 'seyeon'];
const DEFAULT_EXPRESSIONS = ['neutral','happy','sad','angry','shy','surprised','thinking'];

function normalizeBackground(bg, allowed = DEFAULT_BACKGROUNDS) {
  if (!bg) return null;
  const map = {
    classroom: 'classroom',
    교실: 'classroom',
    cafeteria: 'cafeteria',
    식당: 'cafeteria',
    카페테리아: 'cafeteria',
    library: 'library',
    도서관: 'library',
  };
  const key = String(bg).trim().toLowerCase();
  const normalized = map[key] || key;
  return allowed.includes(normalized) ? normalized : null;
}

function normalizeCharacter(ch, allowed = DEFAULT_CHARACTERS) {
  if (!ch) return null;
  const map = {
    yuri: 'yuri', '유리': 'yuri',
    jiho: 'jiho', '지호': 'jiho',
    seyeon: 'seyeon', '세연': 'seyeon', 'se-yeon': 'seyeon', 'se yeon': 'seyeon'
  };
  const key = String(ch).trim().toLowerCase();
  const normalized = map[key] || key;
  return allowed.includes(normalized) ? normalized : null;
}

function normalizeExpression(expr, allowed = DEFAULT_EXPRESSIONS) {
  if (!expr) return null;
  const map = {
    neutral: 'neutral', '평온': 'neutral', '무표정': 'neutral',
    happy: 'happy', '행복': 'happy', '기쁨': 'happy', '웃음': 'happy', '웃는': 'happy',
    sad: 'sad', '슬픔': 'sad', '슬픈': 'sad', '우는': 'sad', '눈물': 'sad',
    angry: 'angry', '화남': 'angry', '화난': 'angry', '분노': 'angry', '짜증': 'angry',
    shy: 'shy', '수줍': 'shy', '부끄': 'shy',
    surprised: 'surprised', '놀람': 'surprised', '놀란': 'surprised', '깜짝': 'surprised',
    thinking: 'thinking', '고민': 'thinking', '생각': 'thinking', '숙고': 'thinking',
  };
  const key = String(expr).trim().toLowerCase();
  const normalized = map[key] || key;
  return allowed.includes(normalized) ? normalized : null;
}

function heuristicVisuals({ situation, action, speech, currentCharacter, nextCharacter, allowedBackgrounds, allowedCharacters, allowedExpressions }) {
  const text = [situation, action, speech].filter(Boolean).join('\n').toLowerCase();
  const backgrounds = allowedBackgrounds?.length ? allowedBackgrounds : DEFAULT_BACKGROUNDS;
  const characters = allowedCharacters?.length ? allowedCharacters : DEFAULT_CHARACTERS;
  const expressions = allowedExpressions?.length ? allowedExpressions : DEFAULT_EXPRESSIONS;

  let background = 'classroom';
  if (text.includes('library') || text.includes('도서관')) background = 'library';
  else if (text.includes('cafeteria') || text.includes('식당') || text.includes('카페')) background = 'cafeteria';
  else if (text.includes('classroom') || text.includes('교실')) background = 'classroom';
  else {
    if (currentCharacter === 'jiho') background = 'cafeteria';
    else if (currentCharacter === 'seyeon') background = 'library';
    else background = 'classroom';
  }
  if (!backgrounds.includes(background)) background = backgrounds[0];

  let character = normalizeCharacter(nextCharacter, characters) || null;
  if (!character) {
    if (text.includes('지호') || text.includes('jiho')) character = 'jiho';
    else if (text.includes('유리') || text.includes('yuri')) character = 'yuri';
    else if (text.includes('세연') || text.includes('seyeon') || text.includes('se-yeon') || text.includes('se yeon')) character = 'seyeon';
  }
  if (!character) character = normalizeCharacter(currentCharacter, characters) || characters[0];

  // expression heuristic
  let expression = 'neutral';
  if (text.match(/웃|기뻐|행복|happy|smile/)) expression = 'happy';
  else if (text.match(/슬프|울|눈물|sad|cry/)) expression = 'sad';
  else if (text.match(/화|짜증|분노|angry/)) expression = 'angry';
  else if (text.match(/부끄|수줍|shy/)) expression = 'shy';
  else if (text.match(/놀라|깜짝|surpris/)) expression = 'surprised';
  else if (text.match(/생각|고민|숙고|think/)) expression = 'thinking';
  expression = normalizeExpression(expression, expressions) || 'neutral';

  return {
    background,
    character,
    expression,
    confidence: 'heuristic',
    reason: 'Keyword-based fallback classification without external API.'
  };
}

function buildMessagesForProvider({ situation, action, speech, persona, allowedBackgrounds, allowedCharacters, allowedExpressions }) {
  const allowedBgStr = (allowedBackgrounds?.length ? allowedBackgrounds : DEFAULT_BACKGROUNDS).join('|');
  const allowedCharStr = (allowedCharacters?.length ? allowedCharacters : DEFAULT_CHARACTERS).join('|');
  const allowedExprStr = (allowedExpressions?.length ? allowedExpressions : DEFAULT_EXPRESSIONS).join('|');
  const sys = `${persona || ''}\n\n시각 연출 판단 지침:\n- 반드시 순수 JSON 객체로만 응답하세요.\n- 키: background, character, expression, reason.\n- background는 다음 중 하나여야 합니다: ${allowedBgStr}.\n- character는 다음 중 하나거나 null이어야 합니다: ${allowedCharStr}.\n- expression은 다음 중 하나여야 합니다: ${allowedExprStr}.\n- reason은 간단한 한국어 설명.\n- 메타 텍스트나 코드블록은 금지.\n`;
  const user = `상황:\n${(situation || '').trim()}\n\n행동:\n${(action || '').trim()}\n\n대화:\n${(speech || '').trim()}\n\n현재 장면에 가장 어울리는 배경, 캐릭터, 표정을 선택하세요.`;
  return [
    { role: 'system', content: sys },
    { role: 'user', content: user }
  ];
}

async function callProvider(messages, { referer } = {}) {
  const apiUrl = process.env.VISUAL_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const apiKey = process.env.VISUAL_API_KEY || process.env.OPENROUTER_API_KEY;
  const model = process.env.VISUAL_MODEL || process.env.DEFAULT_MODEL;

  if (!apiKey) return null; // indicate to use heuristic fallback

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-Title': process.env.X_TITLE || 'StoryAI-Visuals',
  };
  if (referer) headers['HTTP-Referer'] = referer;

  const payload = {
    model,
    response_format: { type: 'json_object' },
    messages
  };

  const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Visual API error');
    err.status = res.status;
    err.details = data;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content || '';
  try {
    const parsed = JSON.parse(text.trim());
    return parsed;
  } catch {
    const candidate = text.match(/\{[\s\S]*\}/)?.[0];
    if (candidate) {
      try { return JSON.parse(candidate); } catch {}
    }
  }
  return null;
}

async function inferVisuals(payload = {}, { referer } = {}) {
  const {
    situation,
    action,
    speech,
    persona,
    currentCharacter,
    nextCharacter,
    allowedBackgrounds = DEFAULT_BACKGROUNDS,
    allowedCharacters = DEFAULT_CHARACTERS,
    allowedExpressions = DEFAULT_EXPRESSIONS,
  } = payload;

  let providerResult = null;
  try {
    const messages = buildMessagesForProvider({ situation, action, speech, persona, allowedBackgrounds, allowedCharacters, allowedExpressions });
    providerResult = await callProvider(messages, { referer });
  } catch (e) {
    console.warn('visual provider error, falling back:', e?.message || e);
  }

  if (providerResult) {
    const bg = normalizeBackground(providerResult.background, allowedBackgrounds) || allowedBackgrounds[0];
    const ch = normalizeCharacter(providerResult.character, allowedCharacters) || null;
    const expr = normalizeExpression(providerResult.expression, allowedExpressions) || 'neutral';
    return {
      background: bg,
      character: ch,
      expression: expr,
      confidence: 'model',
      reason: providerResult.reason || 'Model-selected visuals',
      raw: process.env.EXPOSE_RAW?.toLowerCase() === 'true' ? providerResult : undefined,
    };
  }

  return heuristicVisuals({ situation, action, speech, currentCharacter, nextCharacter, allowedBackgrounds, allowedCharacters, allowedExpressions });
}

module.exports = { inferVisuals, DEFAULT_BACKGROUNDS, DEFAULT_CHARACTERS, DEFAULT_EXPRESSIONS };
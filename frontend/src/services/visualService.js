import { requestVisuals } from './visualClient';

const BACKGROUND_MAP = {
  classroom: '/backgrounds/classroom.jpg',
  cafeteria: '/backgrounds/cafeteria.jpg',
  library: '/backgrounds/library.jpg',
};

const ALLOWED_BACKGROUNDS = Object.keys(BACKGROUND_MAP);
const ALLOWED_CHARACTERS = ['yuri', 'jiho', 'seyeon'];
const ALLOWED_EXPRESSIONS = [
  'neutral',
  'expressionless',
  'angry',
  'sad',
  'shy',
  'surprised',
  'dismay',
  'happy',
];

function resolveCharacterImage(characterId, expression) {
  const base = `/characters/${characterId}.png`;
  const expr = (expression || '').toLowerCase();

  // Per-character filename mapping with typo tolerance
  const MAP = {
    jiho: {
      angry: '/characters/jiho_angry.png',
      sad: '/characters/jiho_sad.png',
      shy: '/characters/jiho_shyness.png',
      surprised: '/characters/jiho_surprise.png',
      dismay: '/characters/jiho_dismay.png',
      expressionless: '/characters/jiho_expressionless.png',
      neutral: base,
      happy: base,
    },
    yuri: {
      angry: '/characters/yuri_angry.png',
      sad: '/characters/yuri_sad.png',
      shy: '/characters/yuri_shyness.png',
      surprised: '/characters/yuri_surpise.png', // file name has typo
      dismay: '/characters/yuri_dismay.png',
      expressionless: '/characters/yuri_expressionless.png',
      neutral: base,
      happy: base,
    },
    seyeon: {
      angry: '/characters/seyeon_angey.png', // file name has typo
      sad: '/characters/seyeon_sad.png',
      shy: '/characters/seyeon_shyness.png',
      surprised: '/characters/seyeon_surpise.png', // file name has typo
      dismay: '/characters/seyeon_dismay.png',
      expressionless: base, // fallback to base
      neutral: base,
      happy: '/characters/seyeon_hapy.png', // file name has typo
    },
  };

  const charMap = MAP[characterId];
  if (!charMap) return base;
  return charMap[expr] || base;
}

export async function generateVisuals({ currentCharacter, nextCharacter, situation, action, speech, persona }) {
  try {
    const payload = {
      situation,
      action,
      speech,
      persona,
      currentCharacter,
      nextCharacter,
      allowedBackgrounds: ALLOWED_BACKGROUNDS,
      allowedCharacters: ALLOWED_CHARACTERS,
      allowedExpressions: ALLOWED_EXPRESSIONS,
    };

    const res = await requestVisuals(payload);

    const bgKey = ALLOWED_BACKGROUNDS.includes(res?.background) ? res.background : 'classroom';
    const characterId = res?.character && ALLOWED_CHARACTERS.includes(res.character) ? res.character : null;
    const expression = res?.expression && ALLOWED_EXPRESSIONS.includes(res.expression) ? res.expression : 'neutral';

    const effectiveCharacter = characterId || nextCharacter || currentCharacter;
    const characterUrl = effectiveCharacter ? resolveCharacterImage(effectiveCharacter, expression) : null;

    return {
      backgroundUrl: BACKGROUND_MAP[bgKey],
      characterId,
      characterUrl,
      expression,
      meta: { confidence: res?.confidence, reason: res?.reason },
    };
  } catch (e) {
    // fallback to default by character
    let bgKey = 'classroom';
    if (currentCharacter === 'jiho') bgKey = 'cafeteria';
    else if (currentCharacter === 'seyeon') bgKey = 'library';
    const characterUrl = currentCharacter ? resolveCharacterImage(currentCharacter, 'neutral') : null;
    return { backgroundUrl: BACKGROUND_MAP[bgKey], characterId: null, characterUrl, expression: 'neutral', meta: { confidence: 'fallback', reason: 'Client-side default' } };
  }
}
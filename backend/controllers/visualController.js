const { inferVisuals, DEFAULT_BACKGROUNDS, DEFAULT_CHARACTERS, DEFAULT_EXPRESSIONS } = require('../services/visualService');

async function visualize(req, res) {
  try {
    const body = req.body || {};
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
    } = body;

    const referer = req.headers['referer'] || req.headers['origin'];

    const result = await inferVisuals({
      situation,
      action,
      speech,
      persona,
      currentCharacter,
      nextCharacter,
      allowedBackgrounds,
      allowedCharacters,
      allowedExpressions,
    }, { referer });

    return res.json(result);
  } catch (err) {
    console.error('visualize error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

module.exports = { visualize };
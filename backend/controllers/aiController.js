const { generateReply } = require('../services/llmService');

async function askAI(req, res) {
  try {
    const { message, persona, scenario, model } = req.body || {};
    const referer = req.headers['referer'] || req.headers['origin'];

    const result = await generateReply(message, { model, scenario, persona, referer });

    // 프런트가 기대하는 구조에 맞춰 그대로 전달
    // 가능한 경우: situation, speech, action, nextCharacter
    // 폴백: answer만 존재
    return res.json(result);
  } catch (err) {
    console.error('askAI error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

module.exports = { askAI };
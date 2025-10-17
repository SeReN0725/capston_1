const { generateReply } = require('../services/llmService');

exports.askAI = async (req, res, next) => {
  try {
    const { message: msgBody, question, model, scenario, persona, exposeRaw } = req.body || {};
    const message = typeof msgBody === 'string' && msgBody.trim() ? msgBody.trim() : (typeof question === 'string' ? question.trim() : '');
    if (!message) {
      const err = new Error('`message` or `question` must be a non-empty string');
      err.status = 400;
      return next(err);
    }
    if (message.length > 4000) {
      const err = new Error('Message too long (max 4000 characters)');
      err.status = 413;
      return next(err);
    }

    const referer = req.headers?.referer || req.headers?.origin || undefined;
    const result = await generateReply(message, { model, scenario, persona, referer, exposeRaw });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
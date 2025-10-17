const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');

router.post('/ask', askAI);
router.get('/ping', (req, res) => res.json({ ok: true }));

module.exports = router;
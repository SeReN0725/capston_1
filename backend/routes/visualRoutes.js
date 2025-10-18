const express = require('express');
const router = express.Router();
const { visualize } = require('../controllers/visualController');

router.post('/visualize', visualize);
router.get('/visualize/ping', (req, res) => res.json({ ok: true }));

module.exports = router;
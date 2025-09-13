const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/transcribe', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Voice transcription endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transcribe voice' });
  }
});

module.exports = router;
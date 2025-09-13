const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/prd', authenticate, async (req, res) => {
  try {
    res.json({ message: 'PRD generation endpoint', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PRD' });
  }
});

router.post('/user-story', authenticate, async (req, res) => {
  try {
    res.json({ message: 'User story generation endpoint', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate user story' });
  }
});

module.exports = router;
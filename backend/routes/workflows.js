const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Workflow = require('../models/Workflow');

router.get('/', authenticate, async (req, res) => {
  try {
    const workflows = await Workflow.find({ owner: req.user.id })
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const workflow = await Workflow.create({
      ...req.body,
      owner: req.user.id
    });
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

module.exports = router;
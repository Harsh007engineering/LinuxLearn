// progress.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');

router.get('/', protect, async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).populate('lessonId');
    res.json({ progress });
  } catch (err) { next(err); }
});

module.exports = router;

const User = require('../models/User');
const Progress = require('../models/Progress');
const History = require('../models/History');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements');
    const progress = await Progress.find({ userId: req.user._id, completed: true })
      .populate('lessonId', 'title moduleId command');
    const recentHistory = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // XP needed for next level
    const xpForNextLevel = (user.level) * 500;
    const xpProgress = user.xp % 500;

    res.json({
      user,
      progress,
      recentHistory,
      stats: {
        xpForNextLevel,
        xpProgress,
        xpPercent: Math.floor((xpProgress / 500) * 100)
      }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['username'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };

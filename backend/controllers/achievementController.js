const Achievement = require('../models/Achievement');
const User = require('../models/User');

// GET /api/achievements
const getAchievements = async (req, res, next) => {
  try {
    const allAchievements = await Achievement.find();
    const user = await User.findById(req.user._id).populate('achievements');
    const earnedIds = user.achievements.map(a => a._id.toString());

    const achievements = allAchievements.map(a => ({
      ...a.toObject(),
      earned: earnedIds.includes(a._id.toString())
    }));

    res.json({ achievements });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAchievements };

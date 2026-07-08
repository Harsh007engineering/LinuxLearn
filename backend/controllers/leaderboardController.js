const User = require('../models/User');

// GET /api/leaderboard/xp
const getXPLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('username xp level avatar')
      .sort({ xp: -1 })
      .limit(50);
    res.json({ leaderboard: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/leaderboard/streak
const getStreakLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('username streak level avatar')
      .sort({ streak: -1 })
      .limit(50);
    res.json({ leaderboard: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/leaderboard/lessons
const getLessonsLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('username lessonsCompleted level avatar')
      .sort({ lessonsCompleted: -1 })
      .limit(50);
    res.json({ leaderboard: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getXPLeaderboard, getStreakLeaderboard, getLessonsLeaderboard };

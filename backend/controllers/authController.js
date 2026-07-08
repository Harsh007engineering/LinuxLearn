const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Filesystem = require('../models/Filesystem');
const achievementService = require('../services/achievementService');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} is already taken.` });
    }

    const user = await User.create({ username, email, password });

    // Create default filesystem for user
    await Filesystem.create({ userId: user._id });

    // Award first-login achievement
    await achievementService.checkAndAward(user._id, 'first_login');

    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Handle daily login streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    let streakBonus = 0;

    if (lastLogin) {
      const lastLoginDay = new Date(lastLogin);
      lastLoginDay.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastLoginDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day — no streak update
      } else if (diffDays === 1) {
        user.streak += 1;
        streakBonus = 10 + (user.streak * 2); // Scaling streak bonus
        user.xp += streakBonus;
        user.calculateLevel();
      } else {
        user.streak = 1;
        streakBonus = 10;
        user.xp += streakBonus;
        user.calculateLevel();
      }
    } else {
      user.streak = 1;
      streakBonus = 10;
      user.xp += streakBonus;
      user.calculateLevel();
    }

    user.lastLoginDate = new Date();
    await user.save();

    // Check streak achievements
    if (user.streak >= 7) {
      await achievementService.checkAndAward(user._id, 'seven_day_streak');
    }

    const token = signToken(user._id);

    res.json({
      message: `Welcome back, ${user.username}!`,
      token,
      streakBonus,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        lessonsCompleted: user.lessonsCompleted,
        commandsUsed: user.commandsUsed
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };

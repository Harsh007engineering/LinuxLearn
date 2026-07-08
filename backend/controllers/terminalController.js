const { executeCommand } = require('../services/filesystemService');
const { checkThresholdAchievements } = require('../services/achievementService');
const User = require('../models/User');
const History = require('../models/History');

// POST /api/terminal/execute
const execute = async (req, res, next) => {
  try {
    const { command, history: cmdHistory = [] } = req.body;
    if (!command || !command.trim()) {
      return res.status(400).json({ error: 'Command is required.' });
    }

    const result = await executeCommand(req.user._id, command, cmdHistory);

    // Track command in history (skip clear/empty)
    if (command.trim() !== 'clear') {
      await History.create({
        userId: req.user._id,
        command: command.trim(),
        output: result.output,
        success: !result.output?.includes('command not found') && !result.output?.includes('No such file'),
        path: result.newPath,
        xpEarned: result.xpEarned
      });
    }

    // Update user XP and command count
    if (result.xpEarned > 0) {
      const user = await User.findById(req.user._id);
      user.xp += result.xpEarned;
      user.commandsUsed += 1;
      user.calculateLevel();
      await user.save();

      // Check achievements
      const newAchievements = await checkThresholdAchievements(req.user._id);

      return res.json({
        output: result.output,
        newPath: result.newPath,
        xpEarned: result.xpEarned,
        newAchievements,
        user: {
          xp: user.xp,
          level: user.level,
          commandsUsed: user.commandsUsed
        }
      });
    }

    res.json({
      output: result.output,
      newPath: result.newPath,
      xpEarned: 0,
      newAchievements: []
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/terminal/filesystem
const getFilesystem = async (req, res, next) => {
  try {
    const Filesystem = require('../models/Filesystem');
    const fs = await Filesystem.findOne({ userId: req.user._id });
    if (!fs) return res.status(404).json({ error: 'Filesystem not found.' });
    res.json({ currentPath: fs.currentPath, tree: fs.tree });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/terminal/filesystem/reset
const resetFilesystem = async (req, res, next) => {
  try {
    const Filesystem = require('../models/Filesystem');
    await Filesystem.findOneAndDelete({ userId: req.user._id });
    await Filesystem.create({ userId: req.user._id });
    res.json({ message: 'Filesystem reset to defaults.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { execute, getFilesystem, resetFilesystem };

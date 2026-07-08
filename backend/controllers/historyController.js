const History = require('../models/History');

// GET /api/history
const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ history });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/history
const clearHistory = async (req, res, next) => {
  try {
    await History.deleteMany({ userId: req.user._id });
    res.json({ message: 'History cleared.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, clearHistory };

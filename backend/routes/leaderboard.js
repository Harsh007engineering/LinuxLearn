const express = require('express');
const router = express.Router();
const { getXPLeaderboard, getStreakLeaderboard, getLessonsLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

router.get('/xp', protect, getXPLeaderboard);
router.get('/streak', protect, getStreakLeaderboard);
router.get('/lessons', protect, getLessonsLeaderboard);

module.exports = router;

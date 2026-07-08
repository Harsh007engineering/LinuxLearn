const express = require('express');
const router = express.Router();
const { getHistory, clearHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getHistory);
router.delete('/', protect, clearHistory);

module.exports = router;

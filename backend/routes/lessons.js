const express = require('express');
const router = express.Router();
const { getAllLessons, getLessonById, completeLesson, completeMission, getAllProgress } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllLessons);
router.get('/progress/all', protect, getAllProgress);
router.get('/:id', protect, getLessonById);
router.post('/:id/complete', protect, completeLesson);
router.post('/:id/mission', protect, completeMission);

module.exports = router;

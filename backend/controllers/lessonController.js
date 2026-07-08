const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { checkThresholdAchievements } = require('../services/achievementService');

// GET /api/lessons
const getAllLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find().sort({ order: 1 });
    // Group by module
    const modules = {};
    for (const lesson of lessons) {
      if (!modules[lesson.moduleId]) {
        modules[lesson.moduleId] = { moduleId: lesson.moduleId, lessons: [] };
      }
      modules[lesson.moduleId].lessons.push(lesson);
    }
    res.json({ lessons, modules: Object.values(modules) });
  } catch (err) {
    next(err);
  }
};

// GET /api/lessons/:id
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const progress = await Progress.findOne({ userId: req.user._id, lessonId: lesson._id });
    res.json({ lesson, progress });
  } catch (err) {
    next(err);
  }
};

// POST /api/lessons/:id/complete
const completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    let progress = await Progress.findOne({ userId: req.user._id, lessonId: lesson._id });

    const wasAlreadyCompleted = progress?.completed;

    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        lessonId: lesson._id,
        completed: true,
        completedAt: new Date(),
        xpEarned: lesson.xpReward
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
      progress.xpEarned = lesson.xpReward;
      await progress.save();
    }

    let xpGained = 0;
    let newAchievements = [];

    if (!wasAlreadyCompleted) {
      // Award XP to user
      const user = await User.findById(req.user._id);
      user.xp += lesson.xpReward;
      user.lessonsCompleted += 1;
      user.calculateLevel();
      await user.save();

      xpGained = lesson.xpReward;
      newAchievements = await checkThresholdAchievements(req.user._id);
    }

    res.json({
      message: 'Lesson completed!',
      xpEarned: xpGained,
      newAchievements,
      progress
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/lessons/:id/mission
const completeMission = async (req, res, next) => {
  try {
    const { missionId, command } = req.body;
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const mission = lesson.missions.find(m => m.id === missionId);
    if (!mission) return res.status(404).json({ error: 'Mission not found.' });

    // Normalize both commands for comparison (trim, lowercase, collapse spaces)
    const normalize = (cmd) => cmd.trim().replace(/\s+/g, ' ').toLowerCase();
    const isCorrect = normalize(command) === normalize(mission.expectedCommand);

    if (!isCorrect) {
      // Increment attempt count
      await Progress.findOneAndUpdate(
        { userId: req.user._id, lessonId: lesson._id },
        { $inc: { attempts: 1 } },
        { upsert: true }
      );
      return res.json({ correct: false, hint: mission.hint });
    }

    // Mark mission as completed
    let progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, lessonId: lesson._id },
      { $addToSet: { missionsCompleted: missionId }, $inc: { xpEarned: mission.xpReward } },
      { upsert: true, new: true }
    );

    // Award XP
    const user = await User.findById(req.user._id);
    user.xp += mission.xpReward;
    user.calculateLevel();
    await user.save();

    res.json({
      correct: true,
      successMessage: mission.successMessage,
      explanation: mission.explanation,
      xpEarned: mission.xpReward,
      user: { xp: user.xp, level: user.level }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lessons/progress/all
const getAllProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).populate('lessonId', 'title moduleId');
    res.json({ progress });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllLessons, getLessonById, completeLesson, completeMission, getAllProgress };

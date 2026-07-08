const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  instruction: { type: String, required: true },
  expectedCommand: { type: String, required: true },
  hint: { type: String },
  successMessage: { type: String, default: 'Correct!' },
  xpReward: { type: Number, default: 20 },
  explanation: { type: String }
});

const lessonSchema = new mongoose.Schema({
  moduleId: { type: Number, required: true },
  lessonId: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  command: { type: String, required: true },
  explanation: { type: String, required: true },
  syntax: { type: String },
  examples: [{ command: String, description: String }],
  commonMistakes: [{ type: String }],
  bestPractices: [{ type: String }],
  missions: [missionSchema],
  xpReward: { type: Number, default: 50 },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tags: [{ type: String }],
  order: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);

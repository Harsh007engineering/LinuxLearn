const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  missionsCompleted: [{ type: String }], // mission IDs
  attempts: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 }
}, { timestamps: true });

progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

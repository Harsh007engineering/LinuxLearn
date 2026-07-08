const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  xpReward: { type: Number, default: 100 },
  condition: {
    type: { type: String, enum: ['commands', 'lessons', 'streak', 'login', 'special'] },
    value: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);

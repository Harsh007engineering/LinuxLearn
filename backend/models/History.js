const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  command: { type: String, required: true },
  output: { type: String },
  success: { type: Boolean, default: true },
  path: { type: String },
  xpEarned: { type: Number, default: 0 }
}, { timestamps: true });

historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);

require('dotenv').config();
const mongoose = require('mongoose');
const { seedLessons } = require('./services/lessonService');
const { seedAchievements } = require('./services/achievementService');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await seedLessons();
    await seedAchievements();
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

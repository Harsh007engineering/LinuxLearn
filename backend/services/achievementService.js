const User = require('../models/User');
const Achievement = require('../models/Achievement');

const ACHIEVEMENTS = [
  {
    key: 'first_login',
    title: 'First Steps',
    description: 'Welcome to LinuxLearn! Your journey begins.',
    icon: '🚀',
    xpReward: 50,
    condition: { type: 'login', value: 1 }
  },
  {
    key: 'first_command',
    title: 'Hello Terminal',
    description: 'You ran your very first command.',
    icon: '⌨️',
    xpReward: 50,
    condition: { type: 'commands', value: 1 }
  },
  {
    key: 'first_lesson',
    title: 'Student',
    description: 'Completed your first lesson.',
    icon: '📚',
    xpReward: 100,
    condition: { type: 'lessons', value: 1 }
  },
  {
    key: 'ten_lessons',
    title: 'Dedicated Learner',
    description: 'Completed 10 lessons.',
    icon: '🎓',
    xpReward: 200,
    condition: { type: 'lessons', value: 10 }
  },
  {
    key: 'fifty_commands',
    title: 'Command Runner',
    description: 'Ran 50 commands in the terminal.',
    icon: '💻',
    xpReward: 150,
    condition: { type: 'commands', value: 50 }
  },
  {
    key: 'hundred_commands',
    title: 'Terminal Ninja',
    description: 'Ran 100 commands — you\'re getting the hang of this!',
    icon: '🥷',
    xpReward: 300,
    condition: { type: 'commands', value: 100 }
  },
  {
    key: 'seven_day_streak',
    title: '7-Day Streak',
    description: 'Logged in 7 days in a row.',
    icon: '🔥',
    xpReward: 250,
    condition: { type: 'streak', value: 7 }
  },
  {
    key: 'terminal_explorer',
    title: 'Terminal Explorer',
    description: 'Used more than 10 different commands.',
    icon: '🗺️',
    xpReward: 200,
    condition: { type: 'special', value: 10 }
  }
];

// Seed achievements into DB
async function seedAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    await Achievement.findOneAndUpdate(
      { key: achievement.key },
      achievement,
      { upsert: true, new: true }
    );
  }
  console.log('✅ Achievements seeded');
}

// Check and award achievement
async function checkAndAward(userId, achievementKey) {
  const achievement = await Achievement.findOne({ key: achievementKey });
  if (!achievement) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  // Check if already awarded
  if (user.achievements.some(a => a.toString() === achievement._id.toString())) {
    return null;
  }

  // Award
  user.achievements.push(achievement._id);
  user.xp += achievement.xpReward;
  user.badges.push(achievement.key);
  user.calculateLevel();
  await user.save();

  return achievement;
}

// Check all threshold achievements
async function checkThresholdAchievements(userId) {
  const user = await User.findById(userId).populate('achievements');
  if (!user) return [];

  const awarded = [];

  // Check commands
  if (user.commandsUsed >= 1) {
    const a = await checkAndAward(userId, 'first_command');
    if (a) awarded.push(a);
  }
  if (user.commandsUsed >= 50) {
    const a = await checkAndAward(userId, 'fifty_commands');
    if (a) awarded.push(a);
  }
  if (user.commandsUsed >= 100) {
    const a = await checkAndAward(userId, 'hundred_commands');
    if (a) awarded.push(a);
  }

  // Check lessons
  if (user.lessonsCompleted >= 1) {
    const a = await checkAndAward(userId, 'first_lesson');
    if (a) awarded.push(a);
  }
  if (user.lessonsCompleted >= 10) {
    const a = await checkAndAward(userId, 'ten_lessons');
    if (a) awarded.push(a);
  }

  // Check streak
  if (user.streak >= 7) {
    const a = await checkAndAward(userId, 'seven_day_streak');
    if (a) awarded.push(a);
  }

  return awarded;
}

module.exports = { seedAchievements, checkAndAward, checkThresholdAchievements, ACHIEVEMENTS };

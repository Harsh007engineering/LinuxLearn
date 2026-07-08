const mongoose = require('mongoose');

const filesystemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // Store the entire virtual filesystem as a nested object
  // Structure: { '/': { type: 'dir', children: { 'home': { type: 'dir', children: { 'user': { ... } } } } } }
  tree: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      type: 'dir',
      name: '/',
      children: {
        home: {
          type: 'dir',
          name: 'home',
          children: {
            user: {
              type: 'dir',
              name: 'user',
              children: {
                Documents: { type: 'dir', name: 'Documents', children: {} },
                Downloads: { type: 'dir', name: 'Downloads', children: {} },
                Desktop: { type: 'dir', name: 'Desktop', children: {} },
                Projects: { type: 'dir', name: 'Projects', children: {} }
              }
            }
          }
        },
        etc: { type: 'dir', name: 'etc', children: {} },
        tmp: { type: 'dir', name: 'tmp', children: {} },
        var: { type: 'dir', name: 'var', children: {} }
      }
    })
  },
  currentPath: { type: String, default: '/home/user' }
}, { timestamps: true });

module.exports = mongoose.model('Filesystem', filesystemSchema);

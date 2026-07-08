const express = require('express');
const router = express.Router();
const { execute, getFilesystem, resetFilesystem } = require('../controllers/terminalController');
const { protect } = require('../middleware/auth');

router.post('/execute', protect, execute);
router.get('/filesystem', protect, getFilesystem);
router.delete('/filesystem/reset', protect, resetFilesystem);

module.exports = router;

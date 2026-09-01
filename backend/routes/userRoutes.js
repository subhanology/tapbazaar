const express = require('express');
const { getProfile, updateProfilePicture } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me/picture', protect, upload.single('displayPicture'), updateProfilePicture);

module.exports = router;
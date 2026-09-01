const express = require('express');
const { signup, signin, signout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/signout', signout);
router.get('/me', protect, getMe);

module.exports = router;

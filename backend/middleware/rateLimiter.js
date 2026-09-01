const rateLimit = require('express-rate-limit');

// Brute-force protection on auth routes: max 5 attempts / 15 min / IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

module.exports = { authLimiter };

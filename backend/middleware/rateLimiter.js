const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for authentication routes.
 * Prevents brute-force attacks by restricting each IP to 5 requests per 15-minute window.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

module.exports = { authLimiter };
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware that verifies a JWT from HttpOnly cookies and attaches the user object to the request.
 * Blocks the request with a 401 response if the token is missing, invalid, or expired.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please sign in again' });
    }
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

/**
 * Optional authentication middleware that attaches the user object to the request if a valid token is present.
 * Does not block unauthenticated requests, allowing controllers to handle guest fallbacks.
 * 
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object (unused)
 * @param {Function} next - Express next middleware function
 */
const attachUserIfPresent = async (req, _res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) req.user = user;
  } catch (err) {
    // Proceed without attaching user if token verification fails
  }
  next();
};

module.exports = { protect, attachUserIfPresent };
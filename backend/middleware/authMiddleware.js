const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Requires a valid JWT (delivered via HttpOnly cookie). Attaches req.user.
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
 * Optional auth: attaches req.user if a valid token is present, but never blocks
 * the request. Used on routes that behave differently for guests vs. logged-in users
 * (e.g. cart routes that fall back to guestSessionId).
 */
const attachUserIfPresent = async (req, _res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) req.user = user;
  } catch (err) {
    // silently ignore — request proceeds as guest
  }
  next();
};

module.exports = { protect, attachUserIfPresent };

const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for the given user id and sets it as an HttpOnly, Secure cookie.
 * Storing the token in a cookie (not localStorage) protects it from XSS token theft.
 */
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });

  return token;
};

module.exports = { generateTokenAndSetCookie };

const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const { generateTokenAndSetCookie } = require('../utils/generateToken');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Registers a new user, hashes their password, and sets an auth cookie.
 * Route: POST /api/auth/signup
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const signup = async (req, res, next) => {
  try {
    const { email, password } = signupSchema.parse(req.body);

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ email, passwordHash });

    generateTokenAndSetCookie(res, user._id);

    return res.status(201).json({ user });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

/**
 * Authenticates an existing user and sets an auth cookie.
 * Route: POST /api/auth/signin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const signin = async (req, res, next) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateTokenAndSetCookie(res, user._id);

    return res.status(200).json({ user });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

/**
 * Clears the authentication token cookie to sign the user out.
 * Route: POST /api/auth/signout
 * 
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 */
const signout = async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Signed out' });
};

/**
 * Retrieves the currently authenticated user's profile data.
 * Route: GET /api/auth/me
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { signup, signin, signout, getMe };
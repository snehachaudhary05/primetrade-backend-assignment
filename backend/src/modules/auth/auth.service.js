const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const SALT_ROUNDS = 12;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async ({ name, email, password, role = 'user' }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashedPassword, role });
  const token = generateToken(user);

  return { user: user.toJSON(), token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is deactivated. Contact support.');
    err.statusCode = 403;
    err.isOperational = true;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  const token = generateToken(user);
  return { user: user.toJSON(), token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  return user ? user.toJSON() : null;
};

module.exports = { register, login, getProfile };

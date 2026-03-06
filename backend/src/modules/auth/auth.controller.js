const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { user, token } = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, message: 'Registration successful.', data: { user, token } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    res.status(200).json({ success: true, message: 'Login successful.', data: { user, token } });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };

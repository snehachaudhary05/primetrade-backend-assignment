const adminService = require('./admin.service');

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAllUsers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(422).json({ success: false, message: 'Role must be "user" or "admin".' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }
    const user = await adminService.updateUserRole(req.params.id, role);
    res.json({ success: true, message: 'User role updated.', data: { user } });
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate yourself.' });
    }
    const user = await adminService.toggleUserStatus(req.params.id);
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}.`, data: { user } });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, getStats };

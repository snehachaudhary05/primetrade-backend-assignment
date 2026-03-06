const User = require('../../models/User');
const Task = require('../../models/Task');

const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const [users, total] = await Promise.all([
    User.find().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  return {
    users: users.map((u) => u.toJSON()),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }
  return user.toJSON();
};

const toggleUserStatus = async (userId) => {
  const existing = await User.findById(userId);
  if (!existing) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { is_active: !existing.is_active },
    { new: true }
  );
  return user.toJSON();
};

const getStats = async () => {
  const [totalUsers, admins, deactivated, totalTasks, pending, inProgress, completed, cancelled] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ is_active: false }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'in_progress' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'cancelled' }),
    ]);

  return {
    users: {
      total: totalUsers,
      admins,
      regular_users: totalUsers - admins,
      deactivated,
    },
    tasks: {
      total: totalTasks,
      pending,
      in_progress: inProgress,
      completed,
      cancelled,
    },
  };
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, getStats };

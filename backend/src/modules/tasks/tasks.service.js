const Task = require('../../models/Task');

const getTasks = async ({ userId, role, status, priority, page = 1, limit = 10 }) => {
  const filter = {};

  if (role !== 'admin') filter.user_id = userId;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('user_id', 'name email')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  const formatted = tasks.map((t) => {
    const obj = t.toJSON();
    if (t.user_id && typeof t.user_id === 'object') {
      obj.owner_name = t.user_id.name;
      obj.owner_email = t.user_id.email;
      obj.user_id = t.user_id._id.toString();
    }
    return obj;
  });

  return {
    tasks: formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTaskById = async (taskId, userId, role) => {
  const task = await Task.findById(taskId).populate('user_id', 'name email');

  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  if (role !== 'admin' && task.user_id._id.toString() !== userId) {
    const err = new Error('Access denied. You do not own this task.');
    err.statusCode = 403;
    err.isOperational = true;
    throw err;
  }

  const obj = task.toJSON();
  obj.owner_name = task.user_id.name;
  obj.owner_email = task.user_id.email;
  obj.user_id = task.user_id._id.toString();
  return obj;
};

const createTask = async ({ title, description, status, priority, due_date, userId }) => {
  const task = await Task.create({
    title,
    description: description || null,
    status: status || 'pending',
    priority: priority || 'medium',
    due_date: due_date || null,
    user_id: userId,
  });
  return task.toJSON();
};

const updateTask = async (taskId, userId, role, updates) => {
  await getTaskById(taskId, userId, role);

  const allowed = ['title', 'description', 'status', 'priority', 'due_date'];
  const updateData = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key];
  }

  if (Object.keys(updateData).length === 0) {
    const err = new Error('No valid fields provided for update.');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const updated = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
  return updated.toJSON();
};

const deleteTask = async (taskId, userId, role) => {
  await getTaskById(taskId, userId, role);
  await Task.findByIdAndDelete(taskId);
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };

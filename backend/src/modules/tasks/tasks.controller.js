const tasksService = require('./tasks.service');

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page, limit } = req.query;
    const result = await tasksService.getTasks({
      userId: req.user.id,
      role: req.user.role,
      status,
      priority,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await tasksService.getTaskById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, message: 'Task created.', data: { task } });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(req.params.id, req.user.id, req.user.role, req.body);
    res.json({ success: true, message: 'Task updated.', data: { task } });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await tasksService.deleteTask(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };

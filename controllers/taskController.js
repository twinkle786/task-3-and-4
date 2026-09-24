const Task = require("../models/Task");
const { ApiError } = require("../middleware/errorHandler");

async function getAllTasks(req, res, next) {
  try {
    const tasks = await Task.find().populate("projectId", "title");
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await Task.findById(req.params.id).populate("projectId", "title");
    if (!task) {
      return next(new ApiError(404, "Task nahi mila"));
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, projectId, priority, dueDate, assignedTo } = req.body;
    if (!title || !projectId) {
      return next(new ApiError(400, "Title aur projectId dono zaroori hain"));
    }

    const newTask = await Task.create({ title, projectId, priority, dueDate, assignedTo });
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { title, priority, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, priority, dueDate },
      { new: true, runValidators: true }
    );

    if (!task) {
      return next(new ApiError(404, "Task nahi mila"));
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["todo", "in-progress", "done"];
    if (!status || !validStatuses.includes(status)) {
      return next(new ApiError(400, `Status in mein se ek hona chahiye: ${validStatuses.join(", ")}`));
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) {
      return next(new ApiError(404, "Task nahi mila"));
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return next(new ApiError(404, "Task nahi mila"));
    }
    res.status(200).json({ success: true, message: "Task delete ho gaya" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
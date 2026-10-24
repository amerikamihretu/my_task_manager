import { Task } from "../models/Task.js";

export async function listTasks(req, res, next) {
  try {
    const filter = { user: req.user._id };
    if (req.query?.status) filter.status = req.query.status;
    if (req.query?.priority) filter.priority = req.query.priority;
    if (req.query?.tag) filter.tags = req.query.tag;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
}

const Project = require("../models/Project");
const { ApiError } = require("../middleware/errorHandler");

async function getAllProjects(req, res, next) {
  try {
    const projects = await Project.find();
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new ApiError(404, "Project nahi mila"));
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const { title, description, owner } = req.body;
    if (!title) {
      return next(new ApiError(400, "Project title zaroori hai"));
    }

    const newProject = await Project.create({ title, description, owner });
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const { title, description, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return next(new ApiError(404, "Project nahi mila"));
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return next(new ApiError(404, "Project nahi mila"));
    }
    res.status(200).json({ success: true, message: "Project delete ho gaya" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
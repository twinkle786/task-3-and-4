const User = require("../models/User");
const { ApiError } = require("../middleware/errorHandler");

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ApiError(404, "User nahi mila"));
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return next(new ApiError(400, "Name aur email dono zaroori hain"));
    }

    const newUser = await User.create({ name, email });
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, "Ye email already registered hai"));
    }
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ApiError(404, "User nahi mila"));
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new ApiError(404, "User nahi mila"));
    }
    res.status(200).json({ success: true, message: "User delete ho gaya" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
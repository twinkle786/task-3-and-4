const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("../middleware/errorHandler");

// JWT token banane ka helper function
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// POST /api/auth/register - naya user register karo
async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ApiError(400, "Name, email aur password sab zaroori hain"));
    }
    if (password.length < 6) {
      return next(new ApiError(400, "Password kam se kam 6 characters ka hona chahiye"));
    }

    // Check karo email already exist to nahi karta
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "Ye email already registered hai"));
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login - existing user login
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Email aur password dono zaroori hain"));
    }

    // +password isliye kyunki User model mein select:false hai, yahan explicitly maangna padta hai
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ApiError(401, "Email ya password galat hai"));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError(401, "Email ya password galat hai"));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me - logged-in user ki details (token se verify hoga)
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerUser, loginUser, getMe };
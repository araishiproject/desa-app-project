const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { AppError } = require("../middleware/errorHandler");

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, phone, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      phone,
      role: role || "buyer"
    });
    
    await user.save();
    
    const token = generateToken(user._id, user.role);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 401);
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }
    
    const token = generateToken(user._id, user.role);
    
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

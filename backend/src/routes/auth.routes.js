const express = require("express");
const { handleValidationErrors, validationRules } = require("../middleware/validation");
const { verifyToken } = require("../middleware/auth");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Register
router.post(
  "/register",
  validationRules.register(),
  handleValidationErrors,
  authController.register
);

// Login
router.post(
  "/login",
  validationRules.login(),
  handleValidationErrors,
  authController.login
);

// Get current user
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;

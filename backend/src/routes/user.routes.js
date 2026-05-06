const express = require("express");
const { verifyToken } = require("../middleware/auth");
const userController = require("../controllers/user.controller");

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

// Profile
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);

// Addresses
router.post("/addresses", userController.addAddress);
router.patch("/addresses/:addressId", userController.updateAddress);
router.delete("/addresses/:addressId", userController.deleteAddress);

module.exports = router;

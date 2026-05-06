const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { handleValidationErrors, validationRules } = require("../middleware/validation");
const orderController = require("../controllers/order.controller");

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// Create order
router.post(
  "/",
  validationRules.createOrder(),
  handleValidationErrors,
  orderController.createOrder
);

// Get orders
router.get("/", orderController.getOrders);

// Get order by ID
router.get("/:id", orderController.getOrderById);

// Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

// Cancel order
router.patch("/:id/cancel", orderController.cancelOrder);

module.exports = router;

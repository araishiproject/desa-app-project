const express = require("express");
const { verifyToken } = require("../middleware/auth");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

// All payment routes require authentication
router.use(verifyToken);

// Create payment
router.post("/", paymentController.createPayment);

// Get payment by order
router.get("/order/:orderId", paymentController.getPaymentByOrder);

// Update payment status
router.patch("/:id/status", paymentController.updatePaymentStatus);

// Request refund
router.post("/:id/refund", paymentController.requestRefund);

module.exports = router;

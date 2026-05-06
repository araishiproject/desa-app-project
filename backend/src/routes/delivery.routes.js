const express = require("express");
const { verifyToken } = require("../middleware/auth");
const deliveryController = require("../controllers/delivery.controller");

const router = express.Router();

// Create delivery
router.post(
  "/",
  verifyToken,
  deliveryController.createDelivery
);

// Get delivery by order
router.get("/order/:orderId", deliveryController.getDeliveryByOrder);

// Track delivery
router.get("/track/:orderId", deliveryController.trackDelivery);

// Update delivery location
router.patch(
  "/:id/location",
  verifyToken,
  deliveryController.updateDeliveryLocation
);

// Update delivery status
router.patch(
  "/:id/status",
  verifyToken,
  deliveryController.updateDeliveryStatus
);

module.exports = router;

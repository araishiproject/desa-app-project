const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const { AppError } = require("../middleware/errorHandler");

// Create delivery (when order is confirmed)
exports.createDelivery = async (req, res, next) => {
  try {
    const { orderId, deliveryType, pickupLocation } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    
    const delivery = new Delivery({
      orderId,
      deliveryType,
      pickupLocation,
      deliveryLocation: order.deliveryAddress.coordinates
    });
    
    await delivery.save();
    
    res.status(201).json({
      success: true,
      message: "Delivery created",
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// Get delivery by order ID
exports.getDeliveryByOrder = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ orderId: req.params.orderId })
      .populate("orderId")
      .populate("driverId", "username phone profile");
    
    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }
    
    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery location (real-time tracking)
exports.updateDeliveryLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          lat,
          lng,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }
    
    // Emit WebSocket event for real-time tracking
    // io.emit('delivery:location_updated', delivery);
    
    res.json({
      success: true,
      message: "Location updated",
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        status,
        deliveryNotes: notes,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }
    
    // Update related order status
    if (status === "delivered") {
      await Order.findByIdAndUpdate(
        delivery.orderId,
        { status: "delivered" }
      );
    }
    
    res.json({
      success: true,
      message: "Delivery status updated",
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

// Track delivery
exports.trackDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ orderId: req.params.orderId })
      .populate("orderId");
    
    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }
    
    res.json({
      success: true,
      data: {
        status: delivery.status,
        currentLocation: delivery.currentLocation,
        deliveryLocation: delivery.deliveryLocation,
        estimatedTime: delivery.estimatedTime,
        driver: delivery.driverId ? { id: delivery.driverId, phone: "" } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

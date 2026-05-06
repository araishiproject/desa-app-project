const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { AppError } = require("../middleware/errorHandler");

// Create payment
exports.createPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    
    const transactionId = `PAY-${Date.now()}`;
    
    const payment = new Payment({
      orderId,
      transactionId,
      amount,
      paymentMethod,
      status: "pending"
    });
    
    await payment.save();
    
    res.status(201).json({
      success: true,
      message: "Payment initiated",
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Get payment by order
exports.getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, gatewayResponse } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        gatewayResponse,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }
    
    // Update order payment status
    if (status === "completed") {
      await Order.findByIdAndUpdate(
        payment.orderId,
        { paymentStatus: "paid", status: "confirmed" }
      );
    }
    
    res.json({
      success: true,
      message: "Payment status updated",
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Request refund
exports.requestRefund = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      throw new AppError("Payment not found", 404);
    }
    
    payment.refund = {
      status: "pending",
      amount: payment.amount,
      reason,
      processedAt: null
    };
    
    await payment.save();
    
    res.json({
      success: true,
      message: "Refund requested",
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "IDR"
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer", "e_wallet", "card"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending"
  },
  gatewayResponse: {
    gatewayName: String, // midtrans, xendit, etc
    gatewayTransactionId: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  refund: {
    status: String,
    amount: Number,
    reason: String,
    processedAt: Date
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    unique: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["pending", "assigned", "picked_up", "in_transit", "arrived", "delivered", "failed"],
    default: "pending"
  },
  deliveryType: {
    type: String,
    enum: ["ojek", "kurir", "seller_direct"],
    required: true
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  pickupLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  deliveryLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 60
  },
  actualTime: Number,
  deliveryNotes: String,
  recipientName: String,
  recipientPhone: String,
  proofOfDelivery: {
    photo: String,
    signature: String,
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Delivery", deliverySchema);

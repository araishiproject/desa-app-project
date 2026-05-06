const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  totalAmount: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer", "e_wallet", "card"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  deliveryAddress: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    notes: String
  },
  notes: String,
  cancelReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before save
orderSchema.pre("save", async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    this.orderNumber = `ORD-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

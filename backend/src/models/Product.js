const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["food", "clothing", "electronics", "household", "beauty", "books", "other"]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    cloudinaryId: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, sellerId: 1 });

module.exports = mongoose.model("Product", productSchema);

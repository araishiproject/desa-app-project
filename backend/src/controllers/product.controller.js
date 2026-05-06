const Product = require("../models/Product");
const { AppError } = require("../middleware/errorHandler");

// Get all products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20, sortBy = "-createdAt" } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate("sellerId", "profile.firstName seller.shopName seller.rating");
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sellerId", "profile.firstName seller.shopName seller.rating reviews");
    
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Create product (seller only)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock, images, tags, discount, originalPrice } = req.body;
    
    const product = new Product({
      sellerId: req.user.userId,
      name,
      description,
      category,
      price,
      stock,
      images,
      tags,
      discount,
      originalPrice
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    
    if (product.sellerId.toString() !== req.user.userId) {
      throw new AppError("You can only update your own products", 403);
    }
    
    Object.assign(product, req.body);
    await product.save();
    
    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    
    if (product.sellerId.toString() !== req.user.userId) {
      throw new AppError("You can only delete your own products", 403);
    }
    
    product.isActive = false;
    await product.save();
    
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

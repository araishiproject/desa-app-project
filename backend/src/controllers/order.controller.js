const Order = require("../models/Order");
const Product = require("../models/Product");
const { AppError } = require("../middleware/errorHandler");

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, notes } = req.body;
    
    let totalAmount = 0;
    const orderItems = [];
    
    // Calculate total and prepare items
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }
      
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }
      
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });
    }
    
    const order = new Order({
      buyerId: req.user.userId,
      sellerId: items[0].sellerId, // Assuming single seller per order
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      notes
    });
    
    await order.save();
    await order.populate("items.productId");
    
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get user orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { $or: [{ buyerId: req.user.userId }, { sellerId: req.user.userId }] };
    if (status) filter.status = status;
    
    const orders = await Order.find(filter)
      .populate("items.productId")
      .populate("buyerId", "username email phone")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: orders,
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

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId")
      .populate("buyerId", "username email phone")
      .populate("sellerId", "username seller.shopName");
    
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    
    order.status = status;
    await order.save();
    
    res.json({
      success: true,
      message: "Order status updated",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    
    if (order.status !== "pending") {
      throw new AppError("Can only cancel pending orders", 400);
    }
    
    order.status = "cancelled";
    order.cancelReason = cancelReason;
    await order.save();
    
    res.json({
      success: true,
      message: "Order cancelled",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

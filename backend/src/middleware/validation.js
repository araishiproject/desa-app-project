const { body, validationResult } = require("express-validator");

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const validationRules = {
  register: () => [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("username").notEmpty(),
    body("role").isIn(["buyer", "seller"])
  ],
  
  login: () => [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty()
  ],
  
  createProduct: () => [
    body("name").notEmpty().trim(),
    body("description").notEmpty().trim(),
    body("price").isFloat({ min: 0 }),
    body("stock").isInt({ min: 0 }),
    body("category").notEmpty()
  ],
  
  createOrder: () => [
    body("items").isArray({ min: 1 }),
    body("deliveryAddressId").notEmpty(),
    body("paymentMethod").notEmpty()
  ]
};

module.exports = {
  handleValidationErrors,
  validationRules
};

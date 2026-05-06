const express = require("express");
const { verifyToken, checkRole } = require("../middleware/auth");
const { handleValidationErrors, validationRules } = require("../middleware/validation");
const productController = require("../controllers/product.controller");

const router = express.Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Protected routes (seller only)
router.post(
  "/",
  verifyToken,
  checkRole("seller"),
  validationRules.createProduct(),
  handleValidationErrors,
  productController.createProduct
);

router.patch(
  "/:id",
  verifyToken,
  checkRole("seller"),
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("seller"),
  productController.deleteProduct
);

module.exports = router;

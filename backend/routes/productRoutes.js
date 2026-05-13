const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Route untuk mengambil semua produk
router.get('/', productController.getAllProducts);

// Route untuk mengambil satu produk
router.get('/:id', productController.getProductById);

// Route untuk menambah produk baru
router.post('/add', authMiddleware, upload.single('image'), productController.addProduct);

// Route untuk menghapus produk
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
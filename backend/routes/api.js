const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');

// Routes Autentikasi
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Routes Produk
router.get('/products', productController.getProducts);
router.post('/products', upload.single('image'), productController.addProduct);
router.delete('/products/:id', productController.deleteProduct);

// Routes Order & Ojek Desa
router.post('/orders', orderController.createOrder);
router.put('/orders/take/:id', orderController.takeOrder);
router.put('/orders/complete/:id', orderController.completeOrder);

module.exports = router;
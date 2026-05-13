const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua rute admin harus melewati middleware checkAdminRole
router.use(authMiddleware, adminController.checkAdminRole);
router.get('/orders', adminController.getAllOrdersAdmin);
router.get('/earnings', adminController.getCourierEarnings);
module.exports = router;
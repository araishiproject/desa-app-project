const router = require('express').Router();
const order = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', order.getOrders);
router.get('/status', authMiddleware, order.getOrdersByStatus); // NEW: Filter by status
router.get('/:id', order.getOrderById);
router.get('/user/:user_id', authMiddleware, order.getOrdersByUser);
router.get('/route/:orderId', authMiddleware, order.getCourierRoute); // NEW: Get courier route history
router.post('/', authMiddleware, order.createOrder);
router.put('/take/:id', authMiddleware, order.takeOrder);
router.put('/complete/:id', authMiddleware, order.completeOrder);
router.put('/cancel/:id', authMiddleware, order.cancelOrder);
router.put('/update-address/:id', authMiddleware, order.updateOrderAddress);

module.exports = router;

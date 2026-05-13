const router = require('express').Router();
const order = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', order.getOrders);
router.get('/:id', order.getOrderById);
router.get('/user/:user_id', authMiddleware, order.getOrdersByUser);
router.post('/', authMiddleware, order.createOrder);
router.put('/take/:id', authMiddleware, order.takeOrder);
router.put('/complete/:id', authMiddleware, order.completeOrder);
router.put('/cancel/:id', authMiddleware, order.cancelOrder);

module.exports = router;

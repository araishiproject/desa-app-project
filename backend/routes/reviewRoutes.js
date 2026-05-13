const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/product/:productId', reviewController.getReviewsByProduct);

module.exports = router;
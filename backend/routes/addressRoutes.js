const router = require('express').Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, addressController.getAddresses);
router.post('/', authMiddleware, addressController.addAddress);
router.put('/:id', authMiddleware, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressController.deleteAddress);

module.exports = router;
const express = require('express');
const router = express.Router();
const { register, login, updateFcmToken, updateProfileImage } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Perlu authMiddleware
const upload = require('../middleware/upload'); // Perlu middleware upload

router.post('/register', register);
router.post('/login', login);
router.put('/update-fcm-token', authMiddleware, updateFcmToken); // Rute baru
router.put('/update-profile-image', authMiddleware, upload.single('profile_image'), updateProfileImage); // NEW

module.exports = router;
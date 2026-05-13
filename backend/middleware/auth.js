// DEPRECATED: Use authMiddleware.js instead
// File ini disimpan untuk backward compatibility, tetapi jangan gunakan.
// Semua route harus menggunakan middleware dari ./authMiddleware.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_desa_123';

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) return res.status(401).json({ message: 'Akses ditolak, token tidak ada' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token tidak valid' });
    }
};
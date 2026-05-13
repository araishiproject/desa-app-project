const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_desa_123';

module.exports = (req, res, next) => {
    try {
        let token = req.headers['authorization'];

        if (!token) {
            return res.status(401).json({ message: 'Token tidak ada' });
        }

        // Hapus prefix 'Bearer ' jika ada
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token tidak valid', error: err.message });
    }
};
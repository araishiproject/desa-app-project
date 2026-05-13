const db = require('../config/db');

// ===== BUAT REVIEW BARU =====
exports.createReview = (req, res) => {
    const user_id = req.user.id;
    const { product_id, order_id, rating, comment } = req.body;

    if (!product_id || !order_id || !rating) {
        return res.status(400).json({ message: 'Product ID, Order ID, dan Rating wajib diisi' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating harus antara 1 dan 5' });
    }

    // Pastikan user benar-benar membeli produk ini di order ini dan order sudah completed
    db.query(
        'SELECT oi.id FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.id = ? AND o.user_id = ? AND o.status = "Completed"',
        [product_id, order_id, user_id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Gagal memverifikasi pesanan', error: err });
            if (result.length === 0) return res.status(403).json({ message: 'Anda tidak berhak memberikan review untuk produk ini atau pesanan belum selesai.' });

            const sql = 'INSERT INTO product_reviews (product_id, user_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [product_id, user_id, order_id, rating, comment], (err, reviewResult) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: 'Anda sudah memberikan review untuk produk ini pada pesanan yang sama.' });
                    }
                    return res.status(500).json({ message: 'Gagal membuat review', error: err });
                }
                res.status(201).json({ message: 'Review berhasil ditambahkan', reviewId: reviewResult.insertId });
            });
        }
    );
};

// ===== GET REVIEW BERDASARKAN PRODUK =====
exports.getReviewsByProduct = (req, res) => {
    const { productId } = req.params;
    const sql = 'SELECT pr.*, u.username FROM product_reviews pr JOIN users u ON pr.user_id = u.id WHERE pr.product_id = ? ORDER BY pr.created_at DESC';
    db.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil review produk', error: err });
        res.json(results);
    });
};

// Tambahkan fungsi lain jika diperlukan (misal: updateReview, deleteReview)
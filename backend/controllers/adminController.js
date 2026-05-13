const db = require('../config/db');

// Middleware untuk cek role admin
exports.checkAdminRole = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
};

// ===== GET SEMUA PESANAN (untuk Admin) =====
// Mengambil semua pesanan dengan detail pelanggan, kurir, dan item produk
exports.getAllOrdersAdmin = (req, res) => {
    const sql = `
        SELECT 
            o.*, 
            u.username as customer_name, 
            k.username as kurir_name,
            JSON_ARRAYAGG(
                JSON_OBJECT('nama', p.nama, 'qty', oi.quantity, 'harga', oi.price)
            ) as items
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        LEFT JOIN users k ON o.kurir_id = k.id 
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.id DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil semua pesanan', error: err });
        res.json(results);
    });
};

// ===== GET PENDAPATAN KURIR =====
exports.getCourierEarnings = (req, res) => {
    const { kurir_id, startDate, endDate } = req.query;
    let sql = 'SELECT o.kurir_id, u.username as kurir_name, SUM(o.total_price) as total_earnings, COUNT(o.id) as total_orders FROM orders o JOIN users u ON o.kurir_id = u.id WHERE o.status = "Completed"';
    const params = [];
    if (kurir_id) { sql += ' AND o.kurir_id = ?'; params.push(kurir_id); }
    if (startDate) { sql += ' AND o.created_at >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND o.created_at <= ?'; params.push(endDate); }
    sql += ' GROUP BY o.kurir_id, u.username ORDER BY total_earnings DESC';
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil pendapatan kurir', error: err });
        res.json(results);
    });
};
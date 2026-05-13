const db = require('../config/db');

// ===== 0. GET SEMUA PESANAN =====
exports.getOrders = (req, res) => {
    const sql = 'SELECT * FROM orders ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil data', error: err });
        res.json(results);
    });
};


// ===== 0.1 GET PESANAN BY ID =====
exports.getOrderById = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM orders WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil detail pesanan', error: err });
        if (result.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        res.json(result[0]);
    });
};

// ===== 0.2 GET PESANAN BY USER (History Pelanggan) =====
exports.getOrdersByUser = (req, res) => {
    const { user_id } = req.params;
    const sql = `
        SELECT o.*, 
               JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'nama', p.nama, 
                       'qty', oi.quantity, 
                       'harga', oi.price
                   )
               ) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ? 
        GROUP BY o.id 
        ORDER BY o.id DESC`;
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil riwayat pesanan', error: err });
        res.json(results);
    });
};

// ===== 1. BUAT PESANAN BARU =====
exports.createOrder = (req, res) => {
    const { user_id, total_price, address, products } = req.body;
    
    const sql = 'INSERT INTO orders (user_id, total_price, address, status) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, total_price, address, 'Pending'], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal membuat pesanan', error: err });
        
        const orderId = result.insertId;

        // Jika ada data produk, masukkan ke tabel order_items (Opsional sesuai skema DB)
        if (products && products.length > 0) {
            const itemValues = products.map(p => [orderId, p.product_id, p.quantity, p.price]);
            const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
            
            db.query(itemSql, [itemValues], (itemErr) => {
                if (itemErr) return res.status(500).json({ message: 'Gagal menyimpan detail produk', error: itemErr });
                res.status(201).json({ message: 'Pesanan berhasil dibuat dengan detail produk', orderId });
            });
        } else {
            res.status(201).json({ message: 'Order created', orderId });
        }
    });
};

// ===== 2. KURIR AMBIL PESANAN (Sistem Ojek) =====
exports.takeOrder = (req, res) => {
    const { id } = req.params; // ID Pesanan
    const { kurir_id } = req.body; // ID User yang menjadi Kurir

    const sql = 'UPDATE orders SET status = "On Delivery", kurir_id = ? WHERE id = ?';
    db.query(sql, [kurir_id, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil pesanan', error: err });
        res.json({ message: 'Pesanan sedang diantar oleh kurir' });
    });
};

// ===== 3. SELESAIKAN PESANAN =====
exports.completeOrder = (req, res) => {
    const { id } = req.params;
    db.query('UPDATE orders SET status = "Completed" WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal menyelesaikan pesanan', error: err });
        res.json({ message: 'Pesanan telah sampai tujuan' });
    });
};

// ===== 4. BATALKAN PESANAN =====
exports.cancelOrder = (req, res) => {
    const { id } = req.params;
    // Pesanan hanya bisa dibatalkan jika status masih 'Pending'
    db.query('UPDATE orders SET status = "Cancelled" WHERE id = ? AND status = "Pending"', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal membatalkan pesanan', error: err });
        if (result.affectedRows === 0) return res.status(400).json({ message: 'Pesanan tidak bisa dibatalkan (sudah diproses/tidak ditemukan)' });
        res.json({ message: 'Pesanan telah dibatalkan' });
    });
};
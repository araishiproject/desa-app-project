const db = require('../config/db');
const admin = require('../config/firebaseAdmin'); // Import Firebase Admin SDK

// Fungsi Helper Kalkulasi Jarak (Haversine Formula) - Pindahkan ke util jika banyak digunakan
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
        WHERE o.id = ? 
        GROUP BY o.id`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil detail pesanan', error: err });
        if (result.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        res.json(result[0]);
    });
};

// ===== 0.2 GET PESANAN BY USER (History Pelanggan) =====
exports.getOrdersByUser = (req, res) => {
    const { user_id } = req.params;
    const { status } = req.query;
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
        WHERE o.user_id = ? ${status ? 'AND o.status = ?' : ''}
        GROUP BY o.id 
        ORDER BY o.id DESC`;
    
    const queryParams = status ? [user_id, status] : [user_id];
    db.query(sql, queryParams, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil riwayat pesanan', error: err });
        res.json(results);
    });
};

// ===== 0.3 GET RIWAYAT RUTE KURIR UNTUK PESANAN =====
exports.getCourierRoute = (req, res) => {
    const { orderId } = req.params;
    const sql = 'SELECT latitude, longitude, timestamp FROM courier_routes WHERE order_id = ? ORDER BY timestamp ASC';
    db.query(sql, [orderId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil riwayat rute', error: err });
        res.json(results);
    });
};

// ===== 0.4 GET PESANAN BERDASARKAN STATUS (untuk Admin/Kurir) =====
exports.getOrdersByStatus = (req, res) => {
    const { status } = req.query; // status bisa 'Pending', 'On Delivery', 'Completed', 'Cancelled'
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (status) {
        sql += ' WHERE status = ?';
        params.push(status);
    }
    sql += ' ORDER BY id DESC';
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil pesanan berdasarkan status', error: err });
        res.json(results);
    });
};
// ===== 1. BUAT PESANAN BARU =====
exports.createOrder = (req, res) => {
    // Mengambil user_id dari token (melalui authMiddleware) untuk keamanan
    const user_id = req.user.id;
    const { total_price, address, products, lat, lng } = req.body;
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Gagal memulai transaksi', error: err });

        const sql = 'INSERT INTO orders (user_id, total_price, address, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [user_id, total_price, address, 'Pending', lat, lng], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ message: 'Gagal membuat pesanan', error: err }));
            }
            
            const orderId = result.insertId;

            if (products && products.length > 0) {
                const itemValues = products.map(p => [orderId, p.product_id, p.quantity, p.price]);
                const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
                
                db.query(itemSql, [itemValues], (itemErr) => {
                    if (itemErr) {
                        return db.rollback(() => res.status(500).json({ message: 'Gagal menyimpan detail produk', error: itemErr }));
                    }
                    db.commit(err => {
                        if (err) return db.rollback(() => res.status(500).json({ error: err }));
                        res.status(201).json({ message: 'Pesanan berhasil dibuat', orderId });
                    });
                });
            } else {
                db.commit(() => {
                    res.status(201).json({ message: 'Pesanan dibuat tanpa detail produk', orderId });
                });
            }
        });
    });
};

// ===== 2. KURIR AMBIL PESANAN (Sistem Ojek) =====
exports.takeOrder = (req, res) => {
    const { id } = req.params; // ID Pesanan
    const { kurir_id } = req.body; // ID User yang menjadi Kurir

    // Pertama, ambil user_id dari pesanan yang akan diambil
    db.query('SELECT user_id FROM orders WHERE id = ?', [id], (err, orderResult) => {
        if (err) return res.status(500).json({ message: 'Gagal mencari pesanan', error: err });
        if (orderResult.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        
        const customer_user_id = orderResult[0].user_id;

        // Update status pesanan
        const sql = 'UPDATE orders SET status = "On Delivery", kurir_id = ? WHERE id = ?';
        db.query(sql, [kurir_id, id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Gagal mengambil pesanan', error: err });

            res.json({ message: 'Pesanan sedang diantar oleh kurir' });

            // Setelah berhasil update, ambil FCM token pelanggan
            db.query('SELECT fcm_token FROM users WHERE id = ?', [customer_user_id], (fcmErr, userFcmResult) => {
                if (!fcmErr && userFcmResult.length > 0 && userFcmResult[0].fcm_token) {
                    const message = {
                        notification: {
                            title: 'Pesananmu Sedang Dikirim! 🛵',
                            body: `Pesanan #${id} sedang diantar oleh kurir.`,
                        },
                        token: userFcmResult[0].fcm_token,
                    };
                    admin.messaging().send(message)
                        .then((response) => console.log('Successfully sent message:', response))
                        .catch((error) => console.error('Error sending message:', error));
                }
            });
        });
    });
};

// ===== 3. SELESAIKAN PESANAN =====
exports.completeOrder = (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT user_id FROM orders WHERE id = ?', [id], (err, orderResult) => {
        if (err) return res.status(500).json({ message: 'Gagal mencari pesanan', error: err });
        if (orderResult.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        
        const customer_user_id = orderResult[0].user_id;

        db.query('UPDATE orders SET status = "Completed" WHERE id = ?', [id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Gagal menyelesaikan pesanan', error: err });
            
            res.json({ message: 'Pesanan telah sampai tujuan' });
            
            // Kirim Notifikasi Selesai
            db.query('SELECT fcm_token FROM users WHERE id = ?', [customer_user_id], (fcmErr, fcmRes) => {
                if (!fcmErr && fcmRes.length > 0 && fcmRes[0].fcm_token) {
                    admin.messaging().send({
                        notification: {
                            title: 'Pesanan Selesai! ✅',
                            body: `Pesanan #${id} telah sampai di tujuan.`,
                        },
                        token: fcmRes[0].fcm_token
                    }).catch(e => console.error(e));
                }
            });
        });
    });
};

// ===== 4. BATALKAN PESANAN =====
exports.cancelOrder = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    // Pesanan hanya bisa dibatalkan jika status masih 'Pending' dan milik user tersebut
    db.query('UPDATE orders SET status = "Cancelled" WHERE id = ? AND user_id = ? AND status = "Pending"', [id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal membatalkan pesanan', error: err });
        if (result.affectedRows === 0) return res.status(400).json({ message: 'Pesanan tidak bisa dibatalkan (sudah diproses/tidak ditemukan)' });
        res.json({ message: 'Pesanan telah dibatalkan' });
    });
};

// ===== 5. UBAH ALAMAT PESANAN (Hanya jika Pending) =====
exports.updateOrderAddress = (req, res) => {
    const { id } = req.params;
    const { address } = req.body;
    const user_id = req.user.id;

    if (!address) return res.status(400).json({ message: 'Alamat baru wajib diisi' });

    const sql = 'UPDATE orders SET address = ? WHERE id = ? AND user_id = ? AND status = "Pending"';
    db.query(sql, [address, id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal mengubah alamat', error: err });
        if (result.affectedRows === 0) return res.status(400).json({ message: 'Gagal mengubah alamat. Pastikan pesanan masih Pending.' });
        res.json({ message: 'Alamat pengiriman berhasil diperbarui' });
    });
};
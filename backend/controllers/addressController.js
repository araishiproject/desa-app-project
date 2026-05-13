const db = require('../config/db');

// ===== GET SEMUA ALAMAT PENGIRIMAN USER =====
exports.getAddresses = (req, res) => {
    const user_id = req.user.id;
    const sql = 'SELECT * FROM delivery_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil alamat', error: err });
        res.json(results);
    });
};

// ===== TAMBAH ALAMAT BARU =====
exports.addAddress = (req, res) => {
    const user_id = req.user.id;
    const { label, address, lat, lng, is_default } = req.body;

    if (!label || !address || !lat || !lng) {
        return res.status(400).json({ message: 'Label, alamat, latitude, dan longitude wajib diisi' });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Gagal memulai transaksi', error: err });

        // Jika alamat baru diset default, set semua alamat lain user menjadi non-default
        if (is_default) {
            db.query('UPDATE delivery_addresses SET is_default = 0 WHERE user_id = ?', [user_id], (updateErr) => {
                if (updateErr) return db.rollback(() => res.status(500).json({ message: 'Gagal memperbarui status default alamat lain', error: updateErr }));
            });
        }

        const sql = 'INSERT INTO delivery_addresses (user_id, label, address, lat, lng, is_default) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [user_id, label, address, lat, lng, is_default || 0], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Gagal menambahkan alamat', error: err }));
            db.commit(commitErr => {
                if (commitErr) return db.rollback(() => res.status(500).json({ error: commitErr }));
                res.status(201).json({ message: 'Alamat berhasil ditambahkan', addressId: result.insertId });
            });
        });
    });
};

// ===== UPDATE ALAMAT =====
exports.updateAddress = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const { label, address, lat, lng, is_default } = req.body;

    if (!label || !address || !lat || !lng) {
        return res.status(400).json({ message: 'Label, alamat, latitude, dan longitude wajib diisi' });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Gagal memulai transaksi', error: err });

        if (is_default) {
            db.query('UPDATE delivery_addresses SET is_default = 0 WHERE user_id = ?', [user_id], (updateErr) => {
                if (updateErr) return db.rollback(() => res.status(500).json({ message: 'Gagal memperbarui status default alamat lain', error: updateErr }));
            });
        }

        const sql = 'UPDATE delivery_addresses SET label = ?, address = ?, lat = ?, lng = ?, is_default = ? WHERE id = ? AND user_id = ?';
        db.query(sql, [label, address, lat, lng, is_default || 0, id, user_id], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ message: 'Gagal memperbarui alamat', error: err }));
            if (result.affectedRows === 0) return db.rollback(() => res.status(404).json({ message: 'Alamat tidak ditemukan atau bukan milik Anda' }));
            db.commit(commitErr => {
                if (commitErr) return db.rollback(() => res.status(500).json({ error: commitErr }));
                res.json({ message: 'Alamat berhasil diperbarui' });
            });
        });
    });
};

// ===== HAPUS ALAMAT =====
exports.deleteAddress = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    db.query('DELETE FROM delivery_addresses WHERE id = ? AND user_id = ?', [id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal menghapus alamat', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Alamat tidak ditemukan atau bukan milik Anda' });
        res.json({ message: 'Alamat berhasil dihapus' });
    });
};
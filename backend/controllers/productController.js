const db = require('../config/db');

// Ambil semua barang dari database
exports.getAllProducts = (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
// Simpan barang baru ke database
exports.addProduct = (req, res) => {
    const { nama, harga, stok } = req.body;
    const image = req.file ? req.file.filename : null; // Ambil nama file dari multer
    const sql = "INSERT INTO products (nama, harga, stok, image) VALUES (?, ?, ?, ?)";
    db.query(sql, [nama, harga, stok, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Berhasil!", id: result.insertId });
    });
};

// Ambil satu barang berdasarkan ID
exports.getProductById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });
        res.json(result[0]);
    });
};

// Hapus barang
exports.deleteProduct = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });
        res.json({ message: "Produk berhasil dihapus" });
    });
};
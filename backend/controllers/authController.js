const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_desa_123';

// ===== REGISTER USER =====
exports.register = async (req, res) => {
  try {
    const { phone, password, username } = req.body;

    if (!phone || !password || !username) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Cek apakah user sudah ada
    db.query('SELECT phone FROM users WHERE phone = ?', [phone], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) return res.status(400).json({ message: 'Nomor HP sudah terdaftar' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const sql = 'INSERT INTO users (phone, password, username, role) VALUES (?, ?, ?, ?)';
      db.query(sql, [phone, hashedPassword, username, 'customer'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Register berhasil', userId: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error register', error: error.message });
  }
};

// ===== LOGIN USER/KURIR =====
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Nomor HP dan password wajib diisi' });
    }

    // Cari user di database
    db.query('SELECT * FROM users WHERE phone = ?', [phone], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(400).json({ message: 'User tidak ditemukan' });

      const user = results[0];

      // Bandingkan password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Password salah' });

      // Buat Token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Login berhasil',
        token: token,
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error login', error: error.message });
  }
};

// ===== UPDATE PROFILE IMAGE =====
exports.updateProfileImage = (req, res) => {
  const user_id = req.user.id;
  const profile_image = req.file ? req.file.filename : null;

  if (!profile_image) {
    return res.status(400).json({ message: 'Tidak ada gambar yang diunggah' });
  }

  const sql = 'UPDATE users SET profile_image = ? WHERE id = ?';
  db.query(sql, [profile_image, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal memperbarui foto profil', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ message: 'Foto profil berhasil diperbarui', profile_image: profile_image }); // Mengembalikan nama file
  });
};

// ===== UPDATE FCM TOKEN =====
exports.updateFcmToken = (req, res) => {
  const user_id = req.user.id; // Dari token JWT
  const { fcm_token } = req.body;

  if (!fcm_token) {
    return res.status(400).json({ message: 'FCM token wajib diisi' });
  }

  const sql = 'UPDATE users SET fcm_token = ? WHERE id = ?';
  db.query(sql, [fcm_token, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal menyimpan FCM token', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ message: 'FCM token berhasil diperbarui' });
  });
};
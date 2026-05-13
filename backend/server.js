<<<<<<< HEAD
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

const db = require('./config/db');
const admin = require('./config/firebaseAdmin');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // NEW
const addressRoutes = require('./routes/addressRoutes'); // NEW
const adminRoutes = require('./routes/adminRoutes'); // NEW

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes); // NEW
app.use('/api/addresses', addressRoutes); // NEW
app.use('/api/admin', adminRoutes); // NEW

app.get('/', (req, res) => {
  res.json({ message: 'API Desa App running...' });
});

// Fungsi Helper Kalkulasi Jarak (Haversine Formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam meter
};

// Socket.io Logic untuk Real-time Tracking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinOrder', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User joined room: order_${orderId}`);
  });

  socket.on('updateLocation', ({ orderId, latitude, longitude, kurir_id }) => { // Tambahkan kurir_id
    // Broadcast lokasi ke semua orang di room order tersebut (pelanggan)
    io.to(`order_${orderId}`).emit('locationUpdate', { latitude, longitude });

    // Simpan riwayat rute kurir ke database
    db.query(
      'INSERT INTO courier_routes (order_id, kurir_id, latitude, longitude) VALUES (?, ?, ?, ?)',
      [orderId, kurir_id, latitude, longitude], // Gunakan kurir_id yang dikirim dari client
      (err) => {
        if (err) console.error('Error saving courier route:', err);
      }
    );
    // Cek jarak kurir ke tujuan untuk notifikasi otomatis
    db.query(
      'SELECT o.lat, o.lng, o.notified_arrival, u.fcm_token FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId],
      (err, results) => {
        if (err) {
          console.error('Error fetching order proximity data:', err);
          return;
        }

        if (results.length > 0) {
          const notified_arrival = results[0].notified_arrival;
          const fcm_token = results[0].fcm_token;
          const lat = results[0].lat != null ? parseFloat(results[0].lat) : null;
          const lng = results[0].lng != null ? parseFloat(results[0].lng) : null;
          
          // Jika belum dinotifikasi dan koordinat tujuan tersedia
          if (!notified_arrival && lat !== null && lng !== null && fcm_token) {
            const distance = calculateDistance(parseFloat(latitude), parseFloat(longitude), lat, lng);
            
            if (distance < 100) { // Jika radius < 100 meter
              // Update flag agar tidak spam notifikasi
              db.query('UPDATE orders SET notified_arrival = 1 WHERE id = ?', [orderId], (updErr) => {
                if (updErr) console.error('Error updating notified_arrival status:', updErr);
              });

              // Kirim Push Notification via FCM
              admin.messaging().send({
                notification: {
                  title: 'Kurir Sudah Dekat! 🏁',
                  body: `Kurir sudah berada dalam radius 100m dari lokasi Anda.`,
                },
                token: fcm_token,
              }).catch(e => console.error('FCM Error:', e));
            }
          }
        }
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
=======
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Desa App running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
>>>>>>> fca9c97065abe0e3d52d1dab59f87b32bcb4aa1e
});
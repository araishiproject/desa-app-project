# Desa App Project - Online Shop Lokal

Aplikasi online shop yang dirancang khusus untuk daerah tertentu dengan sistem pengiriman berbasis ojek atau jasa kirim langsung dari penjual.

## 🎯 Fitur Utama

### Untuk Pembeli
- ✅ Browse produk dari seller lokal
- ✅ Sistem keranjang dan checkout yang mudah
- ✅ Berbagai metode pembayaran (tunai saat terima, transfer, dompet digital)
- ✅ Real-time tracking pengiriman
- ✅ Rating dan review produk
- ✅ Wishlist dan rekomendasi produk

### Untuk Penjual
- ✅ Dashboard manajemen produk
- ✅ Kelola pesanan masuk
- ✅ Atur metode pengiriman (ojek/kurir sendiri)
- ✅ Tracking pengiriman real-time
- ✅ Analisis penjualan dan laporan
- ✅ Manajemen inventori

### Untuk Admin
- ✅ Manajemen kategori produk
- ✅ Verifikasi seller baru
- ✅ Monitoring transaksi
- ✅ Manajemen area layanan
- ✅ Laporan dan analytics

## 📋 Struktur Proyek

```
desa-app-project/
├── backend/                 # Node.js/Express API
├── frontend/               # React aplikasi web
├── mobile/                 # React Native (opsional)
├── docs/                   # Dokumentasi
└── docker-compose.yml      # Docker setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14
- MongoDB >= 4.4
- npm atau yarn

### Setup Development

1. **Clone repository**
   ```bash
   git clone https://github.com/araishiproject/desa-app-project.git
   cd desa-app-project
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + Refresh Tokens
- **Real-time**: Socket.io
- **Payment**: Midtrans / Xendit integration
- **Maps**: Google Maps API

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI / Tailwind CSS
- **Maps**: Google Maps / Leaflet
- **Real-time**: Socket.io Client

## 📝 API Endpoints (Ringkasan)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - List produk
- `GET /api/products/:id` - Detail produk
- `POST /api/products` - Create produk (seller)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List order user
- `PATCH /api/orders/:id` - Update order status

### Delivery
- `GET /api/delivery/track/:orderId` - Track pengiriman
- `PATCH /api/delivery/:orderId` - Update delivery status

Lihat `/docs/API.md` untuk dokumentasi lengkap.

## 🗺️ Area Layanan

Aplikasi ini dirancang untuk melayani area geografis tertentu dengan:
- Pengiriman via ojek lokal
- Pickup point di tiap desa
- Jangkauan delivery yang terdefinisi jelas

## 🔐 Security

- Input validation dan sanitization
- CORS protection
- Rate limiting
- JWT authentication
- Password hashing (bcrypt)
- HTTPS ready

## 📈 Roadmap

- [ ] Phase 1: MVP (Authentication, Products, Orders, Basic Delivery)
- [ ] Phase 2: Payment Integration & Real-time Tracking
- [ ] Phase 3: Seller Dashboard & Analytics
- [ ] Phase 4: Mobile App (React Native)
- [ ] Phase 5: Advanced Features (AI Recommendations, Subscription)

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

MIT License - lihat LICENSE file untuk detail

## 📞 Kontak

Untuk pertanyaan atau saran, silakan buat issue atau hubungi tim development.

---
**Made with ❤️ for local communities**

# Setup Guide - Desa App Project

## Prerequisites

Sebelum mulai development, pastikan Anda sudah install:

### Required Software
- **Node.js** >= 14.x ([Download](https://nodejs.org/))
- **npm** >= 6.x atau **yarn**
- **Git**
- **MySQL/MariaDB** (XAMPP/WAMP disarankan)
- **Redis** (optional, untuk development)

### Optional
- **Docker** & **Docker Compose** (untuk containerized development)
- **VS Code** atau IDE favorit Anda
- **MongoDB Compass** (GUI untuk MongoDB)

## Step 1: Clone Repository

```bash
git clone https://github.com/araishiproject/desa-app-project.git
cd desa-app-project
```

## Step 2: Setup Backend

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment Variables
Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=desa_app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Gateway (optional)
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
XENDIT_API_KEY=your_xendit_api_key

# Maps API (optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2.4 Setup Database

Jika menggunakan MySQL/MariaDB, pastikan service berjalan (misal: XAMPP/WAMP):

```bash
# macOS (jika install via Homebrew)
brew services start mongodb-community

# Windows (jika install via installer)
# MongoDB akan auto start sebagai service

# Linux
sudo systemctl start mongod
```

### 2.5 Run Database Migrations (jika ada)
```bash
npm run migrate
```

### 2.6 Start Backend Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Step 3: Setup Frontend
### 3.1 Install Dependencies (di root proyek)
```bash
npm install # atau npm run clean jika ada masalah
```

### 3.2 Start Frontend Development Server (di root proyek)
```bash
npx expo start
```

Pilih `w` untuk menjalankan di browser.

## Step 4: Verify Installation

### Check Backend
```bash
curl http://localhost:5000/api/health # Ganti dengan endpoint yang sesuai, misal /api/products
```

Expected response:
```json
{
  "message": "API Desa App running..."
}
```

### Check Frontend
Buka browser ke `http://localhost:8081` (atau port yang ditunjukkan Expo) - Anda seharusnya melihat homepage aplikasi.

## Using Docker (Alternative Setup)

### Prerequisites
- Docker >= 20.x
- Docker Compose >= 1.29.x

### Run with Docker Compose

```bash
# Dari root directory
docker-compose up -d
```

Services akan accessible di:
- Frontend: http://localhost:8081 (atau port Expo)
- Backend: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Useful Commands

### Backend (dari folder `backend`)
```bash
cd backend

# Start development server
npm run dev
```

### Frontend (dari root proyek)
```bash
# Start development server (mobile/web)
npx expo start

# Start development server (web only)
npx expo start --web

# Build for production (web)
npx expo export --platform web
```

## Troubleshooting

### MySQL Connection Error
```
"ER_ACCESS_DENIED_ERROR" atau "Connection refused"
```

**Solution:**
- Pastikan MySQL service sudah berjalan (XAMPP/WAMP).
- Check DB_HOST, DB_USER, DB_PASS, DB_NAME di file `.env` backend.
- Pastikan user MySQL memiliki izin yang benar untuk database `desa_app`.

### Port Already in Use
```
"listen EADDRINUSE: address already in use :::5000"
```

**Solution:**
- Cari proses yang menggunakan port 5000 dan hentikan.
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  # Linux/macOS
  lsof -i :5000
  kill -9 <PID_NUMBER>
  ```
- Atau ganti `PORT` di `.env` backend.

### CORS Error
```
"Access to XMLHttpRequest at 'http://localhost:5000' from origin 'http://localhost:3000' 
has been blocked by CORS policy"
```

**Solution:**
- Pastikan `cors()` middleware sudah terpasang di `backend/server.js`.
- Pastikan `FRONTEND_URL` di `.env` backend sudah benar (misal: `http://localhost:8081` jika Expo Web berjalan di port itu).
- Restart backend server.

### Module Not Found (Frontend)
```
Cannot find module 'react-native-maps'
```

**Solution:**
- Pastikan Anda sudah menjalankan `npm install` dan `npx expo install --fix` setelah semua perubahan `package.json`.
- Jika error ini muncul di web, itu normal karena `react-native-maps` tidak mendukung web secara native. Kode sudah diperbaiki untuk menampilkan placeholder di web.

## Next Steps

1. ✅ Baca dokumentasi lengkap di `/docs`
2. ✅ Explore codebase structure
3. ✅ Review API documentation di `/docs/API.md`
4. ✅ Start coding!

## Need Help?

- 📖 Check documentation folder
- 🐛 Create an issue on GitHub
- 💬 Start a discussion

---

Happy coding! 🚀

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_ENV=development
```

### 3.4 Start Frontend Development Server
```bash
npm start
```

Aplikasi akan auto-open di `http://localhost:3000`

## Step 4: Verify Installation

### Check Backend
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Check Frontend
Buka browser ke `http://localhost:3000` - Anda seharusnya melihat homepage aplikasi.

## Using Docker (Alternative Setup)

### Prerequisites
- Docker >= 20.x
- Docker Compose >= 1.29.x

### Run with Docker Compose

```bash
# Dari root directory
docker-compose up -d
```

Services akan accessible di:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Useful Commands

### Backend
```bash
cd backend

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## Troubleshooting

### MongoDB Connection Error
```
"MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017"
```

**Solution:**
- Pastikan MongoDB service sudah berjalan
- Check MongoDB URI di file `.env`
- Jika pakai MongoDB Atlas, pastikan IP Anda di whitelist

### Port Already in Use
```
"listen EADDRINUSE: address already in use :::5000"
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Atau ganti PORT di .env
```

### CORS Error
```
"Access to XMLHttpRequest at 'http://localhost:5000' from origin 'http://localhost:3000' 
has been blocked by CORS policy"
```

**Solution:**
- Check CORS configuration di backend
- Pastikan FRONTEND_URL di `.env` backend benar
- Restart backend server

### Module Not Found
```
Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Baca dokumentasi lengkap di `/docs`
2. ✅ Explore codebase structure
3. ✅ Review API documentation di `/docs/API.md`
4. ✅ Start coding!

## Need Help?

- 📖 Check documentation folder
- 🐛 Create an issue on GitHub
- 💬 Start a discussion

---

Happy coding! 🚀

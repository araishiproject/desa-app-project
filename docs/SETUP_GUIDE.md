# Setup Guide - Desa App Project

## Prerequisites

Sebelum mulai development, pastikan Anda sudah install:

### Required Software
- **Node.js** >= 14.x ([Download](https://nodejs.org/))
- **npm** >= 6.x atau **yarn**
- **Git**
- **MongoDB** >= 4.4 ([Download](https://www.mongodb.com/try/download/community))
- **Redis** (optional, untuk development) ([Download](https://redis.io/download))

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
MONGODB_URI=mongodb://localhost:27017/desa_app
# Jika menggunakan MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/desa_app

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

Jika menggunakan MongoDB lokal, pastikan MongoDB service berjalan:

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

### 3.1 Open New Terminal, Navigate to Frontend Directory
```bash
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Create Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:

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

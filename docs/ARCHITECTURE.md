# Arsitektur Sistem Desa App

## Overview

Desa App adalah aplikasi e-commerce terdistribusi yang menghubungkan pembeli lokal dengan penjual di area tertentu melalui sistem pengiriman ojek atau kurir lokal.

## Arsitektur Umum

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  - User Interface untuk Pembeli, Penjual, dan Admin             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                    Backend API (Express.js)                      │
├──────────────────────────────────────────────────────────────────┤
│ • Authentication Service      • Product Service                  │
│ • Order Service              • Delivery Service                  │
│ • Payment Service            • User Service                      │
│ • Rating & Review Service    • Analytics Service                │
└────────────────────┬───────────────────┬───────────────────────┘
                     │                   │
    ┌────────────────▼───────┐  ┌──────────────▼──────┐
    │   MongoDB Database     │  │   Redis Cache       │
    │  - User Data          │  │  - Sessions         │
    │  - Products           │  │  - Real-time Data   │
    │  - Orders             │  │  - Queues           │
    │  - Transactions       │  │  - Notifications    │
    └───────────────────────┘  └─────────────────────┘
```

## Module Structure

### Backend Modules

#### 1. Authentication Module
- User registration & login
- JWT token generation
- Role-based access control (RBAC)
- Password reset

#### 2. User Module
- User profile management
- Address management
- Preference settings
- User verification

#### 3. Product Module
- Product listing
- Product categories
- Product search & filter
- Inventory management
- Image/media handling

#### 4. Order Module
- Order creation & management
- Order status tracking
- Order history
- Cart management

#### 5. Delivery Module
- Pengiriman dengan ojek/kurir
- Real-time location tracking
- Delivery status updates
- Cost calculation
- Area management

#### 6. Payment Module
- Multiple payment methods
- Transaction management
- Payment verification
- Refund handling

#### 7. Rating & Review Module
- Product ratings
- Seller ratings
- Review management
- Feedback system

#### 8. Notification Module
- Real-time notifications
- Email notifications
- SMS notifications (opsional)
- Push notifications

### Frontend Structure

#### Pages
- Home / Dashboard
- Product Listing
- Product Detail
- Cart
- Checkout
- Order History
- Order Tracking
- User Profile
- Seller Dashboard
- Admin Panel

#### Components
- Product Card
- Cart Item
- Order Status
- Map Component (Tracking)
- Rating Component
- Search & Filter

#### Services
- API Client
- Auth Service
- Storage Service
- Notification Service
- Location Service

## Data Model

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  phone: String,
  password: String (hashed),
  role: Enum ['buyer', 'seller', 'admin'],
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  addresses: [{
    label: String,
    street: String,
    city: String,
    coordinates: { lat, lng },
    isDefault: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  sellerId: ObjectId,
  name: String,
  description: String,
  category: String,
  price: Number,
  stock: Number,
  images: [String],
  rating: Number,
  reviews: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  buyerId: ObjectId,
  sellerId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  status: Enum ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: String,
  deliveryAddress: Object,
  deliveryLocation: { lat, lng },
  createdAt: Date,
  updatedAt: Date
}
```

### Delivery Collection
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,
  driverId: ObjectId,
  status: Enum ['pending', 'picked_up', 'in_transit', 'delivered'],
  currentLocation: { lat, lng },
  pickupLocation: { lat, lng },
  deliveryLocation: { lat, lng },
  estimatedTime: Number,
  actualTime: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Architecture

### Authentication Flow
1. User login dengan email/username + password
2. Server validate dan generate JWT token
3. Token disimpan di client (localStorage/sessionStorage)
4. Setiap request include token di Authorization header
5. Server verify token sebelum process request

### Authorization
- Role-based access control (RBAC)
- Buyer: hanya akses data pribadi mereka
- Seller: akses dashboard dan produk mereka
- Admin: full access

### Data Protection
- Password hashing dengan bcrypt
- HTTPS untuk semua komunikasi
- Input validation & sanitization
- CORS policy yang ketat
- Rate limiting untuk API endpoints

## Deployment Architecture

### Development
- Docker Compose untuk local development
- MongoDB local instance
- Redis untuk caching

### Production
- Docker containers di cloud (AWS/GCP/Azure)
- MongoDB Atlas atau managed service
- CDN untuk static files
- Load balancer
- CI/CD pipeline

## API Communication

### HTTP Methods
- GET: Retrieve data
- POST: Create data
- PATCH/PUT: Update data
- DELETE: Delete data

### Response Format
```json
{
  "success": true/false,
  "code": 200,
  "message": "Success message or error message",
  "data": { /* response data */ }
}
```

### WebSocket Events
- `order:created` - Order baru dibuat
- `order:updated` - Status order berubah
- `delivery:location_updated` - Lokasi delivery update
- `delivery:arrived` - Kurir tiba
- `notification:new` - Notifikasi baru

## Performance Optimization

### Caching Strategy
- Redis untuk session data
- Redis untuk frequently accessed data
- Client-side caching dengan React Query
- CDN untuk static assets

### Database Optimization
- Proper indexing pada frequently queried fields
- Query optimization
- Pagination untuk list endpoints

## Scalability Considerations

- Horizontal scaling dengan load balancer
- Microservices architecture (future)
- Message queue untuk async tasks
- Database sharding untuk large datasets

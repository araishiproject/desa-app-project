USE desa_app;

-- 1. Tambah User (Password untuk semua: password123)
-- Hash ini dibuat menggunakan bcrypt. Anda bisa login dengan nomor hp ini.
INSERT INTO users (username, phone, password, role) VALUES 
('Budi Pembeli', '08123456789', '$2a$10$76YmS5/4WvH9/KzK/f6z7.vL0G1mR9r0i9W7T8.r3I6U6S.f2YhU.', 'customer'),
('Agus Kurir', '08987654321', '$2a$10$76YmS5/4WvH9/KzK/f6z7.vL0G1mR9r0i9W7T8.r3I6U6S.f2YhU.', 'kurir'),
('Admin Desa', '08555555555', '$2a$10$76YmS5/4WvH9/KzK/f6z7.vL0G1mR9r0i9W7T8.r3I6U6S.f2YhU.', 'admin');

-- 2. Tambah Produk Dummy (Sesuaikan dengan kategori di HomeScreen.js)
INSERT INTO products (nama, harga, stok, category, image) VALUES 
('Nasi Goreng Spesial', 15000.00, 50, 'Makanan', 'nasi_goreng.jpg'),
('Ayam Bakar Madu', 25000.00, 30, 'Makanan', 'ayam_bakar.jpg'),
('Es Jeruk Peras', 5000.00, 100, 'Minuman', 'es_jeruk.jpg'),
('Kopi Tubruk', 4000.00, 100, 'Minuman', 'kopi.jpg'),
('Kaos Polos Desa', 45000.00, 20, 'Pakaian', 'kaos.jpg'),
('Lampu LED 10W', 15000.00, 15, 'Elektronik', 'lampu.jpg'),
('Sapu Lidi', 7000.00, 10, 'Lain-lain', 'sapu.jpg');

-- 3. Tambah Alamat Default untuk Budi (User ID 1)
INSERT INTO delivery_addresses (user_id, label, address, lat, lng, is_default) VALUES 
(1, 'Rumah', 'Jl. Mawar No. 12, Desa Maju Jaya', -6.200000, 106.816666, 1);

-- 4. Tambah Pesanan Dummy (Opsional, untuk melihat riwayat)
INSERT INTO orders (user_id, total_price, address, status, lat, lng) VALUES 
(1, 20000.00, 'Jl. Mawar No. 12, Desa Maju Jaya', 'Completed', -6.200000, 106.816666);

-- 5. Tambah Item Pesanan untuk Pesanan di atas
-- Asumsi order_id yang baru dibuat adalah 1
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 15000.00),
(1, 3, 1, 5000.00);
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'desa_app_db' // Nama database baru Anda
});

db.connect((err) => {
    if (err) {
        console.error('Database Error:', err.message);
        return;
    }
    console.log('Berhasil Terhubung ke Database: desa_app_db');
});

module.exports = db;
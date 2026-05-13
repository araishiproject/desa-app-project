const multer = require('multer');
const path = require('path');

// Pengaturan penyimpanan[cite: 1]
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Simpan di folder backend/uploads[cite: 1]
    },
    filename: (req, file, cb) => {
        // Format: tanggal-namafile.ext[cite: 1]
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filter hanya file gambar[cite: 1]
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diizinkan!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Limit 5MB[cite: 1]
});

module.exports = upload;
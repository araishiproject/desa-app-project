const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-sdk.json'); // Pastikan path ini benar

// Mencegah error "The default Firebase app already exists" saat hot-reloading (nodemon)
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

console.log('Firebase Admin SDK initialized.');

module.exports = admin;
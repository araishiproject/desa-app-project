// Konfigurasi API Base URL
// Ubah IP sesuai dengan IP komputer/laptop Anda
const BASE_URL = 'http://192.168.1.15:5000';

const API_ENDPOINTS = {
  AUTH_LOGIN: `${BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${BASE_URL}/api/auth/register`,
  PRODUCTS: `${BASE_URL}/api/products`,
  ORDERS: `${BASE_URL}/api/orders`,
};

module.exports = { BASE_URL, API_ENDPOINTS };

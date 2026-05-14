const { getDefaultConfig } = require('expo/metro-config'); // Menggunakan konfigurasi Expo

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = getDefaultConfig(__dirname);

module.exports = config;
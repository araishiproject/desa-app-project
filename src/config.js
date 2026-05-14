import { Platform } from 'react-native';

// Jika menggunakan emulator Android, gunakan 10.0.2.2
// Jika menggunakan HP fisik, gunakan alamat IP Laptop Anda (misal: 192.168.1.15)
let API_BASE_URL_DEV;
if (Platform.OS === 'android') {
    API_BASE_URL_DEV = 'http://10.0.2.2:5000'; // Emulator Android
} else if (Platform.OS === 'ios') {
    API_BASE_URL_DEV = 'http://localhost:5000'; // Simulator iOS
} else { // Web atau perangkat fisik
    API_BASE_URL_DEV = 'http://localhost:5000'; // Ganti dengan IP lokal Anda jika menggunakan HP fisik
}

export const API_BASE_URL = API_BASE_URL_DEV;

export const SOCKET_URL = API_BASE_URL; // Socket.io URL
export const API_URL = `${API_BASE_URL}/api`;
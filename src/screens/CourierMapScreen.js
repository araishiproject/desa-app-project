import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location'; // Import Location
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';
import { useAuth } from './AuthContext';

const LOCATION_TRACKING_TASK = 'location-tracking-task';

// Task harus didefinisikan di level global
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Location tracking task error:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        const { latitude, longitude } = locations[0].coords;
        try {
            // Untuk background task, kita perlu mendapatkan orderId dan kurir_id dari storage
            // atau dari parameter saat task dimulai. Untuk kesederhanaan, kita asumsikan
            // orderId dan kurir_id bisa diakses atau dikirim saat task dimulai.
            // Dalam implementasi nyata, ini akan lebih kompleks (misal: AsyncStorage)
            const orderId = await AsyncStorage.getItem('currentOrderId'); // Perlu AsyncStorage
            const kurir_id = await AsyncStorage.getItem('currentKurirId'); // Ambil kurir_id dari AsyncStorage

            if (!orderId || !kurir_id) return;

            const socket = io(SOCKET_URL); // Inisialisasi socket baru
            socket.emit('updateLocation', { orderId, latitude, longitude, kurir_id });
            setTimeout(() => socket.disconnect(), 1000); // Putuskan koneksi setelah mengirim
        } catch (e) {
            console.error('Background task socket error:', e);
        }
    }
});

const CourierMapScreen = ({ route }) => {
    const { orderId } = route.params;
    const { user, token } = useAuth();
    const [location, setLocation] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const socketRef = useRef(null);
    const statusCheckIntervalRef = useRef(null); // Ref untuk interval cek status
    const subscriptionRef = useRef(null);

    useEffect(() => {
        // Inisialisasi koneksi Socket ke backend
        socketRef.current = io(SOCKET_URL); // Tidak perlu kurir_id di query untuk koneksi utama
        
        // Bergabung ke room khusus pesanan ini agar data tidak bocor ke pesanan lain
        socketRef.current.emit('joinOrder', orderId);

        return () => {
            stopTracking();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (statusCheckIntervalRef.current) {
                clearInterval(statusCheckIntervalRef.current);
            }
        };
    }, [orderId]);

    // Fungsi untuk memeriksa status pesanan dari backend
    const checkOrderStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.status === 'Completed') {
                Alert.alert('Pesanan Selesai', `Pesanan #${orderId} telah diselesaikan. Pelacakan dihentikan.`);
                stopTracking();
                if (statusCheckIntervalRef.current) {
                    clearInterval(statusCheckIntervalRef.current);
                }
            }
        } catch (error) {
            console.error('Error checking order status:', error);
        }
    };

    const startTracking = async () => {
        // Meminta izin akses lokasi foreground
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin lokasi (foreground) untuk mengirim koordinat pelacakan.');
            return;
        }

        // Meminta izin akses lokasi background
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin lokasi (background) agar pelacakan tetap berjalan saat aplikasi ditutup.');
            return;
        }

        setIsTracking(true);
        
        // Daftarkan task untuk background location
        // Simpan orderId dan kurir_id ke AsyncStorage agar bisa diakses oleh background task
        await AsyncStorage.setItem('currentOrderId', orderId.toString());
        await AsyncStorage.setItem('currentKurirId', user.id.toString());

        // Mulai update lokasi di background
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Frekuensi update (setiap 5 detik)
            distanceInterval: 5, // Update jika kurir berpindah minimal 5 meter
            foregroundService: { // Penting untuk Android agar notifikasi muncul
                packageName: 'com.aris.desaapp', // Ganti dengan package name aplikasi Anda
                notificationTitle: 'Pelacakan Lokasi Aktif',
                notificationBody: `Kurir sedang mengantar pesanan #${orderId}`,
                notificationColor: '#ee4d2d',
            },
        });

        // Listener untuk update lokasi di foreground (untuk tampilan di layar kurir)
        subscriptionRef.current = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Lebih sering untuk UI
            distanceInterval: 1,
        }, (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setLocation(newLocation.coords);
            
            // Kirim lokasi ke server agar pelanggan bisa melihat secara real-time
            if (socketRef.current) {
                socketRef.current.emit('updateLocation', { 
                    orderId, 
                    latitude, 
                    longitude, 
                    kurir_id: user.id 
                });
            }
        });

        // Mulai interval untuk memeriksa status pesanan
        statusCheckIntervalRef.current = setInterval(checkOrderStatus, 15000); // Cek setiap 15 detik

        Alert.alert('Pelacakan Dimulai', 'Lokasi Anda akan dikirimkan secara real-time.');
    };

    const stopTracking = async () => {
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
        await AsyncStorage.removeItem('currentOrderId');
        await AsyncStorage.removeItem('currentKurirId');
        if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
        }
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        setIsTracking(false);
    };

    if (Platform.OS === 'web') {
        return <View style={styles.container}><Text style={styles.title}>Pelacakan Kurir tidak tersedia di Web.</Text></View>;
    }

    const handleCompleteOrder = async () => {
        Alert.alert(
            'Selesaikan Pesanan',
            `Apakah Anda yakin ingin menyelesaikan pesanan #${orderId} ini?`,
            [
                { text: 'Tidak', style: 'cancel' },
                {
                    text: 'Ya, Selesaikan',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/orders/complete/${orderId}`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const data = await response.json();
                            if (response.ok) {
                                Alert.alert('Sukses', data.message);
                                stopTracking(); // Hentikan pelacakan setelah selesai
                                navigation.goBack(); // Kembali ke dashboard kurir
                            } else {
                                Alert.alert('Gagal', data.message);
                            }
                        } catch (error) { Alert.alert('Error', 'Gagal menyelesaikan pesanan.'); }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel Kurir - Pelacakan #{orderId}</Text>
            
            <View style={styles.statusBox}>
                <Text style={styles.statusText}>Status: {isTracking ? '🟢 Sedang Melacak' : '🔴 Berhenti'}</Text>
                {location && (
                    <Text style={styles.coordsText}>
                        Posisi: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {!isTracking ? (
                    <Button title="Aktifkan Pelacakan (Mulai Antar)" onPress={startTracking} color="#28a745" />
                ) : (
                    <Button title="Matikan Pelacakan" onPress={stopTracking} color="#dc3545" />
                )}
                {isTracking && ( // Tampilkan tombol "Selesaikan" hanya jika sedang melacak
                    <Button title="Selesaikan Pesanan" onPress={handleCompleteOrder} color="#28a745" />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
    statusBox: { backgroundColor: '#fff', padding: 25, borderRadius: 15, elevation: 4, marginBottom: 40, alignItems: 'center' },
    statusText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    coordsText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
    buttonContainer: { gap: 15 }
});

export default CourierMapScreen;
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { io } from 'socket.io-client'; // Pastikan ini diimpor
import { API_URL, API_BASE_URL, SOCKET_URL } from '../config';
import { useAuth } from './AuthContext';

const OrderDetailScreen = ({ route }) => {
    const { orderId } = route.params;
    const { user, token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courierLocation, setCourierLocation] = useState(null);
    const socketRef = useRef(null); // Gunakan useRef untuk socket

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setOrder(data);
                    // Panggil inisialisasi socket setelah order data tersedia
                    if (data.status === 'On Delivery') {
                        socketRef.current = io(SOCKET_URL);
                        socketRef.current.emit('joinOrder', orderId);

                        socketRef.current.on('locationUpdate', (location) => {
                            setCourierLocation(location);
                        });

                        // Ambil riwayat rute jika ada
                        fetch(`${API_URL}/orders/route/${orderId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                        .then(res => res.json())
                        .then(routeData => {
                            if (routeData.length > 0) {
                                setCourierLocation(routeData[routeData.length - 1]);
                            }
                        })
                        .catch(err => console.error('Error fetching courier route history:', err));
                    }
                } else {
                    Alert.alert('Error', data.message);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [orderId]);

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color="#ee4d2d" />;
    if (!order) return <View style={styles.container}><Text>Pesanan tidak ditemukan.</Text></View>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>ID Pesanan: #{order.id}</Text>
                <Text style={styles.status}>Status: {order.status}</Text>
                <Text style={styles.text}>Alamat: {order.address}</Text>
                <Text style={styles.text}>Total: Rp {order.total_price.toLocaleString()}</Text>
            </View>

            {order.status === 'On Delivery' && (
                <View style={styles.mapContainer}>
                    <Text style={styles.sectionTitle}>Lokasi Kurir (Real-time):</Text>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: -6.200000, // Koordinat default desa
                            longitude: 106.816666,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        {courierLocation && (
                            <Marker 
                                coordinate={courierLocation} 
                                title="Kurir" 
                                description="Posisi kurir saat ini"
                            />
                        )}
                    </MapView>
                </View>
            )}

            <Text style={styles.sectionTitle}>Produk yang Dibeli:</Text>
            {JSON.parse(order.items).map((item, index) => (
                <View key={index} style={styles.itemRow}>
                    <View>
                        <Text style={styles.itemName}>{item.nama}</Text>
                        <Text style={styles.itemSub}>{item.qty} x Rp {item.harga.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.itemTotal}>Rp {(item.qty * item.harga).toLocaleString()}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3, marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    status: { fontSize: 16, color: '#ee4d2d', fontWeight: 'bold', marginBottom: 10 },
    text: { fontSize: 14, color: '#555', marginBottom: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    mapContainer: { marginBottom: 20 },
    map: { width: '100%', height: 250, borderRadius: 10 },
    itemRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 10,
        alignItems: 'center'
    },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemSub: { fontSize: 14, color: '#777' },
    itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});

export default OrderDetailScreen;
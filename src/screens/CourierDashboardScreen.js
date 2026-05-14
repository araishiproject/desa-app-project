import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Button } from 'react-native';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const CourierDashboardScreen = ({ navigation }) => {
    const { user, token } = useAuth();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'kurir') {
            Alert.alert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
            return;
        }
        fetchPendingOrders();
    }, [user]);

    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/orders/status?status=Pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setPendingOrders(data);
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            console.error('Fetch pending orders error:', error);
            Alert.alert('Error', 'Gagal mengambil data pesanan pending.');
        } finally {
            setLoading(false);
        }
    };

    const handleTakeOrder = async (orderId) => {
        try {
            const response = await fetch(`${API_URL}/orders/take/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ kurir_id: user.id })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukses', data.message);
                fetchPendingOrders(); // Refresh daftar pesanan
                navigation.navigate('CourierMap', { orderId }); // Arahkan ke layar pelacakan
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal mengambil pesanan.');
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text>Alamat: {item.address}</Text>
            <Text>Total: Rp {item.total_price.toLocaleString()}</Text>
            <Button title="Ambil Pesanan" onPress={() => handleTakeOrder(item.id)} color="#ee4d2d" />
        </View>
    );

    if (user?.role !== 'kurir') {
        return (
            <View style={styles.container}>
                <Text style={styles.accessDeniedText}>Akses Ditolak. Anda bukan Kurir.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pesanan Pending</Text>
            {loading ? <ActivityIndicator size="large" color="#ee4d2d" /> : (
                <FlatList
                    data={pendingOrders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada pesanan pending.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, gap: 10 },
    orderId: { fontWeight: 'bold', fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#666' },
    accessDeniedText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'red' }
});

export default CourierDashboardScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from './AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { user, token, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:5000/api/orders/user/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Fetch Orders Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
            <Text style={styles.orderDetail}>Total: Rp {item.total_price.toLocaleString()}</Text>
            <Text style={styles.orderDetail}>Alamat: {item.address}</Text>
            <View style={styles.itemsList}>
                {JSON.parse(item.items).map((prod, idx) => (
                    <Text key={idx} style={styles.itemText}>
                        • {prod.nama} ({prod.qty}x)
                    </Text>
                ))}
            </View>
        </View>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#28a745';
            case 'Pending': return '#ff8c00';
            case 'Cancelled': return '#dc3545';
            case 'On Delivery': return '#007bff';
            default: return '#666';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Text style={styles.userName}>{user?.username}</Text>
                <Text style={styles.userPhone}>{user?.phone}</Text>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); navigation.replace('Login'); }}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#ee4d2d" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>Belum ada pesanan.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    profileHeader: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 20, elevation: 3 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    userPhone: { fontSize: 16, color: '#666', marginVertical: 5 },
    logoutBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5, backgroundColor: '#f8d7da' },
    logoutText: { color: '#721c24', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    orderId: { fontWeight: 'bold', fontSize: 15 },
    status: { fontWeight: 'bold' },
    orderDetail: { color: '#555', fontSize: 14, marginTop: 2 },
    itemsList: { marginTop: 8, borderTopWidth: 0.5, borderColor: '#eee', paddingTop: 5 },
    itemText: { fontSize: 12, color: '#777' },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#999' }
});

export default ProfileScreen;
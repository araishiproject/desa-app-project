import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const AdminDashboardScreen = () => {
    const { user, token } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingEarnings, setLoadingEarnings] = useState(true);

    useEffect(() => {
        if (user?.role !== 'admin') {
            Alert.alert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
            return;
        }
        fetchAllOrders();
        fetchCourierEarnings();
    }, [user]);

    const fetchAllOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await fetch(`${API_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAllOrders(data);
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            console.error('Fetch all orders error:', error);
            Alert.alert('Error', 'Gagal mengambil data pesanan.');
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchCourierEarnings = async () => {
        setLoadingEarnings(true);
        try {
            const response = await fetch(`${API_URL}/admin/earnings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setEarnings(data);
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            console.error('Fetch earnings error:', error);
            Alert.alert('Error', 'Gagal mengambil data pendapatan kurir.');
        } finally {
            setLoadingEarnings(false);
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <Text style={styles.orderId}>Order #{item.id} - {item.status}</Text>
            <Text>Pelanggan: {item.customer_name}</Text>
            <Text>Kurir: {item.kurir_name || 'Belum Ditugaskan'}</Text>
            <Text>Total: Rp {item.total_price.toLocaleString()}</Text>
        </View>
    );

    const renderEarningItem = ({ item }) => (
        <View style={styles.earningCard}>
            <Text style={styles.earningName}>{item.kurir_name}</Text>
            <Text>Total Pendapatan: Rp {item.total_earnings.toLocaleString()}</Text>
            <Text>Total Pesanan: {item.total_orders}</Text>
        </View>
    );

    if (user?.role !== 'admin') {
        return (
            <View style={styles.container}>
                <Text style={styles.accessDeniedText}>Akses Ditolak. Anda bukan Admin.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>

            <Text style={styles.sectionTitle}>Semua Pesanan</Text>
            {loadingOrders ? <ActivityIndicator size="small" color="#ee4d2d" /> : (
                <FlatList data={allOrders} keyExtractor={item => item.id.toString()} renderItem={renderOrderItem} scrollEnabled={false} />
            )}

            <Text style={styles.sectionTitle}>Pendapatan Kurir</Text>
            {loadingEarnings ? <ActivityIndicator size="small" color="#ee4d2d" /> : (
                <FlatList data={earnings} keyExtractor={item => item.kurir_id.toString()} renderItem={renderEarningItem} scrollEnabled={false} />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
    orderId: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    earningCard: { backgroundColor: '#e6ffe6', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
    earningName: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    accessDeniedText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'red' }
});

export default AdminDashboardScreen;
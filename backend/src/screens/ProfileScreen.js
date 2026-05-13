import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Button, Platform, Image, Modal } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

// Konfigurasi cara notifikasi muncul saat aplikasi sedang terbuka
Notifications.setNotificationHandler({
    // ... (kode yang sudah ada)
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const ProfileScreen = ({ navigation }) => {
    const { user, token, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [newAddress, setNewAddress] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // State untuk filter status
    const [addresses, setAddresses] = useState([]); // State untuk alamat user
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(null); // Untuk edit alamat
    const [newAddressLabel, setNewAddressLabel] = useState('');
    const [newAddressText, setNewAddressText] = useState('');
    const [newAddressLat, setNewAddressLat] = useState(null);
    const [newAddressLng, setNewAddressLng] = useState(null);
    const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
    const lastOrdersRef = useRef([]);

    useEffect(() => {
        requestNotificationPermissions();
        registerForPushNotificationsAsync(); // Panggil fungsi untuk mendapatkan token FCM
        fetchOrders(); // Ambil pesanan awal
        fetchAddresses(); // Ambil alamat user

        // Polling: Cek pesanan setiap 30 detik untuk mendeteksi perubahan status
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 30000);

        // Listener untuk mendeteksi klik pada notifikasi
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const { orderId } = response.notification.request.content.data;
            if (orderId) {
                navigation.navigate('OrderDetail', { orderId });
            }
        });

        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [filterStatus]); // Re-fetch orders saat filterStatus berubah

    const requestNotificationPermissions = async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync(); // Perlu izin foreground
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') return;
    };

    const registerForPushNotificationsAsync = async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', { // Menggunakan setNotificationChannelAsync
                name: 'Default notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            Alert.alert('Peringatan', 'Gagal mendapatkan token push untuk notifikasi!');
            return;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const fcmToken = tokenData.data; // Ini adalah token FCM yang sebenarnya
        console.log('FCM Token:', fcmToken);

        // Kirim token ke backend untuk disimpan
        if (user && token && fcmToken) {
            await sendFcmTokenToBackend(fcmToken);
        }

        return fcmToken;
    };

    const fetchOrders = async (isPolling = false) => {
        try { // Menggunakan filterStatus
            let url = `${API_URL}/orders/user/${user.id}`; // Endpoint ini tidak mendukung filter status
            if (filterStatus) url += `?status=${filterStatus}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const newData = await response.json();

            if (isPolling) {
                checkStatusChanges(newData);
            }

            setOrders(newData);
            lastOrdersRef.current = newData;
        } catch (error) {
            console.error('Fetch Orders Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendFcmTokenToBackend = async (fcmToken) => {
        try {
            const response = await fetch(`${API_URL}/auth/update-fcm-token`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fcm_token: fcmToken })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to send FCM token to backend:', errorData.message);
            }
        } catch (error) {
            console.error('Error sending FCM token to backend:', error);
        }
    };

    // Hapus atau modifikasi fungsi checkStatusChanges jika FCM sudah menangani notifikasi "On Delivery"
    const checkStatusChanges = (newData) => {
        newData.forEach(newOrder => {
            const oldOrder = lastOrdersRef.current.find(o => o.id === newOrder.id);
            // Jika sebelumnya Pending dan sekarang On Delivery
            if (oldOrder && oldOrder.status === 'Pending' && newOrder.status === 'On Delivery') {
                triggerLocalNotification(newOrder.id);
            }
        });
    };

    const triggerLocalNotification = async (orderId) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Pesanan Dikirim! 🛵",
                body: `Pesanan #${orderId} sedang diantar oleh kurir ke alamatmu.`,
                data: { orderId },
            },
            trigger: null,
        });
    };

    // ===== FUNGSI UPLOAD FOTO PROFIL =====
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            await uploadProfileImage(result.assets[0].uri);
        }
    };

    const uploadProfileImage = async (uri) => {
        const formData = new FormData();
        formData.append('profile_image', {
            uri,
            name: `profile_${user.id}.jpg`,
            type: 'image/jpeg',
        });

        try {
            const response = await fetch(`${API_URL}/auth/update-profile-image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukses', data.message);
                // Update user context dengan gambar profil baru
                updateUser({ profile_image: `${API_BASE_URL}/uploads/${data.profile_image}` }); // Kirim URL lengkap
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            console.error('Upload profile image error:', error);
            Alert.alert('Error', 'Gagal mengunggah foto profil.');
        }
    };

    // ===== FUNGSI MANAJEMEN ALAMAT =====
    const fetchAddresses = async () => {
        try {
            const response = await fetch(`${API_URL}/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAddresses(data);
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            console.error('Fetch addresses error:', error);
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddressLabel.trim() || !newAddressText.trim() || !newAddressLat || !newAddressLng) {
            Alert.alert('Error', 'Semua field alamat wajib diisi dan lokasi harus dipilih di peta.');
            return;
        }
        const method = currentAddress ? 'PUT' : 'POST';
        const url = currentAddress ? `${API_URL}/addresses/${currentAddress.id}` : `${API_URL}/addresses`;
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    label: newAddressLabel,
                    address: newAddressText,
                    lat: newAddressLat,
                    lng: newAddressLng,
                    is_default: currentAddress ? currentAddress.is_default : false // Pertahankan status default jika edit
                })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukses', data.message);
                setIsAddressModalVisible(false);
                fetchAddresses();
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) { Alert.alert('Error', 'Gagal menyimpan alamat.'); }
    };

    const handleUpdateAddress = async (id) => {
        if (!newAddress.trim()) return Alert.alert('Error', 'Alamat tidak boleh kosong');
        try {
            const response = await fetch(`${API_URL}/orders/update-address/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ address: newAddress })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukses', data.message);
                setEditingOrderId(null);
                fetchOrders();
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Terjadi kesalahan pada server');
        }
    };

    const handleCancelOrder = (id) => {
        Alert.alert(
            'Konfirmasi Pembatalan',
            'Apakah Anda yakin ingin membatalkan pesanan ini?',
            [
                { text: 'Tidak', style: 'cancel' },
                { 
                    text: 'Ya, Batalkan', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/orders/cancel/${id}`, {
                                method: 'PUT',
                                headers: { 
                                    'Authorization': `Bearer ${token}` 
                                }
                            });
                            const data = await response.json();
                            if (response.ok) {
                                Alert.alert('Sukses', 'Pesanan berhasil dibatalkan');
                                fetchOrders();
                            } else {
                                Alert.alert('Gagal', data.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Terjadi kesalahan koneksi ke server');
                        }
                    }
                }
            ]
        );
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.id}</Text>
                    <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                <Text style={styles.orderDetail}>Total: Rp {item.total_price.toLocaleString()}</Text>
            </TouchableOpacity>
            {editingOrderId === item.id ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.input}
                        value={newAddress}
                        onChangeText={setNewAddress}
                        placeholder="Masukkan alamat baru"
                    />
                    <View style={styles.editActions}>
                        <Button title="Simpan" onPress={() => handleUpdateAddress(item.id)} color="#28a745" />
                        <Button title="Batal" onPress={() => setEditingOrderId(null)} color="#dc3545" />
                    </View>
                </View>
            ) : (
                <View>
                    <Text style={styles.orderDetail}>Alamat: {item.address}</Text>
                    {item.status === 'Pending' && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                style={styles.editBtn} 
                                onPress={() => {
                                    setEditingOrderId(item.id);
                                    setNewAddress(item.address);
                                }}
                            >
                                <Text style={styles.editText}>Ubah Alamat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.cancelBtn} 
                                onPress={() => handleCancelOrder(item.id)}
                            >
                                <Text style={styles.cancelText}>Batalkan Pesanan</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
                <View style={styles.itemsList}>
                    {JSON.parse(item.items).map((prod, idx) => (
                        <Text key={idx} style={styles.itemText}>
                            • {prod.nama} ({prod.qty}x)
                        </Text>
                    ))}
                </View>
            </TouchableOpacity>
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
            
            {/* Bagian Manajemen Alamat */}
            <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAddressItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Belum ada alamat tersimpan.</Text>}
                scrollEnabled={false} // Agar tidak konflik dengan ScrollView utama
            />
            <Button title="Tambah Alamat Baru" onPress={() => {
                setCurrentAddress(null);
                setNewAddressLabel('');
                setNewAddressText('');
                setNewAddressLat(null);
                setNewAddressLng(null);
                setIsAddressModalVisible(true);
            }} color="#007bff" />

            <Modal
                visible={isAddressModalVisible}
                onRequestClose={() => setIsAddressModalVisible(false)}
                animationType="slide"
            >
                <View style={styles.addressModalContainer}>
                    <Text style={styles.addressModalTitle}>{currentAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Label Alamat (contoh: Rumah, Kantor)"
                        value={newAddressLabel}
                        onChangeText={setNewAddressLabel}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Alamat Lengkap (Pilih di peta)"
                        value={newAddressText}
                        onChangeText={setNewAddressText}
                        editable={false}
                    />
                    <Button title="Pilih Lokasi di Peta" onPress={openAddressMapPicker} color="#007bff" />
                    {newAddressLat && newAddressLng && (
                        <Text style={styles.selectedAddressText}>Lat: {newAddressLat.toFixed(6)}, Lng: {newAddressLng.toFixed(6)}</Text>
                    )}
                    <View style={styles.addressModalActions}>
                        <Button title="Simpan Alamat" onPress={handleSaveAddress} color="#28a745" />
                        <Button title="Batal" onPress={() => setIsAddressModalVisible(false)} color="#dc3545" />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isMapPickerVisible}
                onRequestClose={() => setIsMapPickerVisible(false)}
                animationType="slide"
            >
                <View style={styles.mapModalContainer}>
                    <MapView
                        style={styles.mapModal}
                        initialRegion={{
                            latitude: newAddressLat || -6.200000,
                            longitude: newAddressLng || 106.816666,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        onPress={handleMapPickerSelect}
                    >
                        {newAddressLat && newAddressLng && (
                            <Marker
                                coordinate={{ latitude: newAddressLat, longitude: newAddressLng }}
                                title="Lokasi Pengiriman"
                                draggable
                                onDragEnd={handleMapPickerSelect}
                            />
                        )}
                    </MapView>
                    <View style={styles.mapModalButtons}>
                        <Button title="Konfirmasi Lokasi" onPress={confirmAddressLocation} color="#28a745" />
                        <Button title="Batal" onPress={() => setIsMapPickerVisible(false)} color="#dc3545" />
                    </View>
                    {newAddressText && (
                        <Text style={styles.selectedAddressText}>Terpilih: {newAddressText}</Text>
                    )}
                </View>
            </Modal>

            <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
            <View style={styles.filterContainer}>
                {statusFilters.map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterButton, filterStatus === status && styles.selectedFilterButton]}
                        onPress={() => setFilterStatus(status === 'All' ? '' : status)}
                    >
                        <Text style={[styles.filterButtonText, filterStatus === status && styles.selectedFilterButtonText]}>{status}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#ee4d2d" />
            ) : (
                <FlatList // Gunakan filteredOrders
                    data={filteredOrders}
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
    actionRow: { flexDirection: 'row', marginTop: 10, gap: 20 },
    editBtn: { alignSelf: 'flex-start' },
    editText: { color: '#007bff', fontWeight: 'bold', fontSize: 14 },
    cancelBtn: { alignSelf: 'flex-start' },
    cancelText: { color: '#dc3545', fontWeight: 'bold', fontSize: 14 },
    editContainer: { marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10, backgroundColor: '#fff' },
    editActions: { flexDirection: 'row', justifyContent: 'space-around' },
    itemsList: { marginTop: 8, borderTopWidth: 0.5, borderColor: '#eee', paddingTop: 5 },
    itemText: { fontSize: 12, color: '#777' },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#999' }
    ,
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 2, borderColor: '#ee4d2d' },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 10 },
    filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e0e0e0' },
    selectedFilterButton: { backgroundColor: '#ee4d2d' },
    filterButtonText: { color: '#333', fontSize: 12 },
    selectedFilterButtonText: { color: '#fff' },
    addressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    addressLabel: { fontSize: 16, fontWeight: 'bold' },
    addressActions: { flexDirection: 'row', gap: 10 },
    addressEditText: { color: '#007bff' },
    addressDeleteText: { color: '#dc3545' },
    addressText: { fontSize: 14, color: '#555' },
    addressCoords: { fontSize: 12, color: '#777', marginTop: 5 },
    addressModalContainer: { flex: 1, padding: 20, justifyContent: 'center' },
    addressModalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    addressModalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    mapModalContainer: { flex: 1, paddingTop: 50 },
    mapModal: { flex: 1 },
    mapModalButtons: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
    selectedAddressText: { padding: 10, textAlign: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
    reviewBtn: { marginTop: 10, alignSelf: 'flex-start' },
    reviewText: { color: '#28a745', fontWeight: 'bold', fontSize: 14 }
});

export default ProfileScreen;
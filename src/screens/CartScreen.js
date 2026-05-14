import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Tambahkan PROVIDER_GOOGLE
import * as Location from 'expo-location';
import { useCart } from '../context/CartContext';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const CartScreen = () => {
    const { cartItems, removeFromCart, getTotalPrice, clearCart, updateQuantity } = useCart();
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryLat, setDeliveryLat] = useState(null);
    const [deliveryLng, setDeliveryLng] = useState(null);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, token } = useAuth();

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        if (!deliveryAddress || !deliveryLat || !deliveryLng) {
            Alert.alert('Error', 'Harap isi alamat pengiriman');
            return;
        }

        // Menyiapkan payload sesuai ekspektasi orderController.js
        const payload = {
            user_id: user.id,
            total_price: getTotalPrice(),
            address: deliveryAddress,
            lat: deliveryLat,
            lng: deliveryLng,
            products: cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.harga
            }))
        };

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sukses', 'Pesanan Anda telah diterima!');
                clearCart();
                setDeliveryAddress('');
            } else {
                Alert.alert('Gagal', data.message || 'Terjadi kesalahan saat membuat pesanan');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Koneksi ke server gagal');
        }
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setDeliveryLat(latitude);
        setDeliveryLng(longitude);
        // Reverse geocoding untuk mendapatkan alamat dari koordinat
        Location.reverseGeocodeAsync({ latitude, longitude })
            .then(result => {
                if (result && result.length > 0) {
                    const { street, name, city, region } = result[0];
                    setDeliveryAddress(`${street || name}, ${city}, ${region}`);
                }
            })
            .catch(err => console.error("Reverse geocode error:", err));
    };

    const openMapPicker = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Lokasi', 'Aplikasi membutuhkan izin lokasi untuk memilih alamat di peta.');
            return;
        }
        setIsMapVisible(true);
    };

    const confirmLocation = () => {
        if (!deliveryLat || !deliveryLng) {
            Alert.alert('Peringatan', 'Harap pilih lokasi di peta terlebih dahulu.');
            return;
        }
        setIsMapVisible(false);
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Keranjang Belanja</Text>
            {cartItems.length === 0 ? (
                <Text style={styles.emptyText}>Keranjang Anda masih kosong.</Text>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.info}>
                                    <Text style={styles.name}>{item.nama}</Text>
                                    <Text style={styles.price}>Rp {item.harga}</Text>
                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
                                            <Text style={styles.qtyBtn}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.qtyText}>{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
                                            <Text style={styles.qtyBtn}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                                    <Text style={styles.removeText}>Hapus</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    <View style={styles.footer}>
                        <TextInput
                            placeholder="Alamat Pengiriman (Pilih di peta)"
                            value={deliveryAddress}
                            onChangeText={setDeliveryAddress}
                            style={styles.addressInput}
                            editable={false}
                        />
                        <Button title="Pilih Lokasi di Peta" onPress={openMapPicker} color="#007bff" />
                        <Modal
                            visible={isMapVisible}
                            onRequestClose={() => setIsMapVisible(false)}
                            animationType="slide"
                        >
                            <View style={styles.mapModalContainer}>
                                {Platform.OS === 'web' ? (
                                    <View style={styles.mapWebPlaceholder}>
                                        <Text>Peta tidak tersedia di web. Harap masukkan koordinat secara manual.</Text>
                                    </View>
                                ) : (
                                    <MapView
                                        style={styles.mapModal}
                                        initialRegion={{
                                            latitude: deliveryLat || -6.200000,
                                            longitude: deliveryLng || 106.816666,
                                            latitudeDelta: 0.0922,
                                            longitudeDelta: 0.0421,
                                        }}
                                        onPress={handleMapPress}
                                        provider={PROVIDER_GOOGLE} // Penting untuk Android/iOS
                                    >
                                        {deliveryLat && deliveryLng && (
                                            <Marker coordinate={{ latitude: deliveryLat, longitude: deliveryLng }} title="Lokasi Pengiriman" />
                                        )}
                                    </MapView>
                                )}
                                <View style={styles.mapModalButtons}>
                                    <Button title="Konfirmasi Lokasi" onPress={confirmLocation} color="#28a745" />
                                    <Button title="Batal" onPress={() => setIsMapVisible(false)} color="#dc3545" />
                                </View>
                                {deliveryAddress ? (
                                    <Text style={styles.selectedAddressText}>Terpilih: {deliveryAddress}</Text>
                                ) : null}
                            </View>
                        </Modal>
                        <Text style={styles.totalText}>Total Tagihan: Rp {getTotalPrice().toLocaleString()}</Text>
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#ee4d2d" />
                        ) : (
                            <Button title="Buat Pesanan Sekarang" onPress={handleCheckout} color="#ee4d2d" />
                        )}
                        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                            <Text style={styles.clearText}>Kosongkan Keranjang</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    emptyText: { textAlign: 'center', fontSize: 16, marginTop: 50, color: '#666' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    price: { color: '#666', fontSize: 14 },
    removeBtn: { padding: 5 },
    removeText: { color: '#dc3545', fontWeight: 'bold', fontSize: 12 },
    footer: { marginTop: 20, padding: 15, backgroundColor: '#fff', borderRadius: 8, borderTopWidth: 1, borderColor: '#eee' },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    qtyBtn: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ee4d2d',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ee4d2d',
        borderRadius: 5,
        textAlign: 'center',
    },
    qtyText: {
        fontSize: 16,
        marginHorizontal: 15,
        fontWeight: 'bold',
    },
    addressInput: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        padding: 10, 
        marginBottom: 15 
    },
    totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#ee4d2d' },
    clearButton: { marginTop: 15 },
    clearText: { color: '#666', textAlign: 'center', textDecorationLine: 'underline' }
    ,
    mapModalContainer: { flex: 1, paddingTop: 50 },
    mapModal: { flex: 1 },
    mapWebPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' },
    mapModalButtons: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
    selectedAddressText: { padding: 10, textAlign: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }
});

export default CartScreen;
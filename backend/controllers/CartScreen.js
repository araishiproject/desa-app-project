import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const CartScreen = () => {
    const { cartItems, removeFromCart, getTotalPrice, clearCart, updateQuantity } = useCart();
    const [address, setAddress] = useState('');
    const { user, token } = useAuth();

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        if (!address) {
            Alert.alert('Error', 'Harap isi alamat pengiriman');
            return;
        }

        // Menyiapkan payload sesuai ekspektasi orderController.js
        const payload = {
            user_id: user.id,
            total_price: getTotalPrice(),
            address: address,
            products: cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.harga
            }))
        };

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
                setAddress('');
            } else {
                Alert.alert('Gagal', data.message || 'Terjadi kesalahan saat membuat pesanan');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Koneksi ke server gagal');
        }
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
                                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                    <Text style={styles.removeText}>Hapus</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    <View style={styles.footer}>
                        <TextInput
                            placeholder="Alamat Pengiriman Lengkap"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.addressInput}
                        />
                        <Text style={styles.totalText}>Total Tagihan: Rp {getTotalPrice()}</Text>
                        <Button title="Buat Pesanan" onPress={handleCheckout} color="#ee4d2d" />
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
    removeText: { color: 'red', fontWeight: 'bold' },
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
});

export default CartScreen;
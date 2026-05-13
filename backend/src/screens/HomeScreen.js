import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Image } from 'react-native';
import { useCart } from '../context/CartContext';

const HomeScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        fetch('http://10.0.2.2:5000/api/products') // Port disesuaikan ke 5000 sesuai server.js
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Katalog Shopee Desa</Text>
                <Button title="Keranjang" onPress={() => navigation.navigate('Cart')} color="#ee4d2d" />
            </View>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image 
                            source={{ uri: `http://10.0.2.2:5000/uploads/${item.image}` }} 
                            style={styles.productImage} 
                        />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.nama}</Text>
                            <Text style={styles.price}>Rp {item.harga}</Text>
                            <Text>Stok: {item.stok}</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                            <Text style={styles.addButtonText}>Tambah</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#ee4d2d' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
    info: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold' },
    price: { color: '#ee4d2d', fontWeight: 'bold' },
    addButton: { backgroundColor: '#ee4d2d', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
    addButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default HomeScreen;
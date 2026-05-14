import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Image, TextInput, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useCart } from '../context/CartContext';
import { API_BASE_URL, API_URL } from '../config';

const HomeScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const categories = ['Makanan', 'Minuman', 'Pakaian', 'Elektronik', 'Lain-lain']; // Contoh kategori
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            
            const response = await fetch(`${API_URL}/products?${params.toString()}`);
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) { 
            console.error('Fetch products error:', err);
            setProducts([]);
        } finally { 
            setLoading(false); 
        }
    };

    const onRefresh = useCallback(() => {
        fetchProducts();
    }, [searchQuery, selectedCategory]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Katalog Shopee Desa</Text>
                <Button title="Keranjang" onPress={() => navigation.navigate('Cart')} color="#ee4d2d" />
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Cari produk..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <View style={styles.categoryFilter}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.categoryButton, selectedCategory === cat && styles.selectedCategoryButton]}
                        onPress={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    >
                        <Text style={[styles.categoryButtonText, selectedCategory === cat && styles.selectedCategoryButtonText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#ee4d2d" style={styles.loadingIndicator} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image 
                                source={{ uri: `${API_BASE_URL}/uploads/${item.image}` }} 
                                style={styles.productImage} 
                            />
                            <View style={styles.info}>
                                <Text style={styles.name}>{item.nama}</Text>
                                <Text style={styles.price}>Rp {item.harga}</Text>
                                <Text style={item.stok > 0 ? styles.stokText : styles.outOfStockText}>
                                    {item.stok > 0 ? `Stok: ${item.stok}` : 'Stok Habis'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.addButton, item.stok <= 0 && styles.disabledButton]} 
                                onPress={() => item.stok > 0 && addToCart(item)}
                                disabled={item.stok <= 0}
                            >
                                <Text style={styles.addButtonText}>{item.stok > 0 ? 'Tambah' : 'Habis'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Produk tidak ditemukan.</Text>
                    }
                />
            )}
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
    addButtonText: { color: '#fff', fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#ccc' },
    stokText: { color: '#666', fontSize: 12 },
    outOfStockText: { color: 'red', fontSize: 12, fontWeight: 'bold' },
    searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
    categoryFilter: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 10 },
    categoryButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e0e0e0' },
    selectedCategoryButton: { backgroundColor: '#ee4d2d' },
    categoryButtonText: { color: '#333', fontSize: 12 },
    selectedCategoryButtonText: { color: '#fff' },
    loadingIndicator: { marginTop: 50 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});

export default HomeScreen;
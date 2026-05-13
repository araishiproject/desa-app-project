import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';

const API_BASE_URL = 'http://192.168.1.15:5000';
const PRODUCTS_URL = `${API_BASE_URL}/api/products`;

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Produk Desa</Text>
      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => {
          const imageUri = item.image
            ? `${API_BASE_URL}/uploads/${item.image}`
            : 'https://via.placeholder.com/80';

          return (
            <View style={styles.card}>
              <Image source={{ uri: imageUri }} style={styles.image} onError={() => {}} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>Rp {item.price?.toLocaleString('id-ID') || '0'}</Text>
                <Text style={styles.stock}>Stok: {item.stock ?? '-'}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Tidak ada produk</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F2F6FF'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 2
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 5,
    backgroundColor: '#e0e0e0'
  },
  info: {
    marginLeft: 15,
    justifyContent: 'center',
    flex: 1
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  price: {
    color: 'green',
    fontSize: 16,
    marginTop: 4
  },
  stock: {
    color: '#666',
    fontSize: 14,
    marginTop: 2
  }
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { Rating } from 'react-native-ratings'; // Perlu instal react-native-ratings
import { API_URL, API_BASE_URL } from '../config';
import { useAuth } from '../screens/AuthContext';

const ReviewProductScreen = ({ route, navigation }) => {
    const { orderId, products } = route.params;
    const { token } = useAuth();
    const [reviews, setReviews] = useState({}); // { productId: { rating: 0, comment: '' } }
    const [productsToReview, setProductsToReview] = useState(products); // State untuk melacak produk yang belum diulas

    // Inisialisasi state reviews saat komponen dimuat
    useEffect(() => {
        const initialReviews = products.reduce((acc, prod) => ({ ...acc, [prod.id]: { rating: 0, comment: '' } }), {});
        setReviews(initialReviews);
    }, [products]);
    
    const handleRatingChange = (productId, rating) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], rating }
        }));
    };

    const handleCommentChange = (productId, comment) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], comment }
        }));
    };

    const submitReview = async (product) => {
        const reviewData = reviews[product.id];
        if (!reviewData || !reviewData.rating) {
            Alert.alert('Peringatan', `Harap berikan rating untuk ${product.nama}.`);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    order_id: orderId,
                    rating: reviewData.rating,
                    comment: reviewData.comment || ''
                })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukses', `Ulasan untuk ${product.nama} berhasil dikirim!`);
                // Hapus produk dari daftar yang perlu diulas
                setProductsToReview(prevProducts => prevProducts.filter(p => p.id !== product.id));

                // Reset review untuk produk yang sudah diulas
                setReviews(prev => ({ ...prev, [product.id]: { rating: 0, comment: '' } }));

                // Jika tidak ada lagi produk yang perlu diulas, kembali ke Profile
                if (productsToReview.length === 1) { // Hanya tersisa 1 produk yang baru saja diulas
                                                    // (karena productsToReview belum diupdate di sini)
                    navigation.goBack();
                }
            } else {
                Alert.alert('Gagal', data.message);
            }
        } catch (error) {
            console.error('Submit review error:', error);
            Alert.alert('Error', 'Gagal mengirim ulasan.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Beri Ulasan Pesanan #{orderId}</Text>
            <FlatList // Gunakan productsToReview agar hanya menampilkan yang belum diulas
                data={productsToReview}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        <Image source={{ uri: `${API_BASE_URL}/uploads/${item.image}` }} style={styles.productImage} />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.nama}</Text>
                            <Rating
                                type="star"
                                ratingCount={5}
                                imageSize={25}
                                startingValue={reviews[item.id]?.rating || 0}
                                onFinishRating={(rating) => handleRatingChange(item.id, rating)}
                                style={styles.rating}
                            />
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Tulis komentar Anda..."
                                multiline
                                value={reviews[item.id]?.comment || ''}
                                onChangeText={(text) => handleCommentChange(item.id, text)}
                            />
                            <Button title="Kirim Ulasan" onPress={() => submitReview(item)} color="#ee4d2d" />
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    productCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    rating: { paddingVertical: 10, alignSelf: 'flex-start' },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        minHeight: 60,
        textAlignVertical: 'top',
    },
});

export default ReviewProductScreen;
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Nomor HP dan Password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        Alert.alert('Sukses', 'Login berhasil');
        login(data.user, data.token);
        navigation.replace('Home');
      } else {
        Alert.alert('Error', data.message || 'Login gagal');
      }
    } catch (error) {
      console.log('Login Error:', error);
      Alert.alert('Error', 'Koneksi ke server gagal. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DESA APP</Text>
      <Text style={styles.subtitle}>Masuk dengan akun Anda</Text>

      <TextInput
        placeholder="Nomor HP"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        style={styles.input}
      />

      <Button 
        title={loading ? 'Loading...' : 'Login'} 
        onPress={handleLogin} 
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F2F6FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
});
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (kode yang sudah ada)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorage = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
            setLoading(false);
        };
        loadStorage();
    }, []);

    const login = async (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', userToken);
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
    };

    const updateUser = async (newUserData) => {
        setUser(prevUser => ({ ...prevUser, ...newUserData }));
        await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...newUserData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
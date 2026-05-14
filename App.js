import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Contexts
import { AuthProvider, useAuth } from './src/screens/AuthContext'; // Path diperbaiki
import { CartProvider } from './src/context/CartContext'; // Path diperbaiki

// Import Screens
import LoginScreen from './src/screens/LoginScreen'; // Path diperbaiki
import HomeScreen from './src/screens/HomeScreen'; // Path diperbaiki
import CartScreen from './src/screens/CartScreen'; // Path diperbaiki
import ProfileScreen from './src/screens/ProfileScreen'; // Path diperbaiki
import OrderDetailScreen from './src/screens/OrderDetailScreen'; // Path diperbaiki
import CourierMapScreen from './src/screens/CourierMapScreen'; // Path diperbaiki
import AdminDashboardScreen from './src/screens/AdminDashboardScreen'; // Path diperbaiki
import CourierDashboardScreen from './src/screens/CourierDashboardScreen'; // Path diperbaiki
import ReviewProductScreen from './src/screens/ReviewProductScreen'; // Path diperbaiki

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Main Tab Navigator ---
function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Courier') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ee4d2d',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Sembunyikan header default untuk tab screens
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {user?.role === 'kurir' && <Tab.Screen name="Courier" component={CourierDashboardScreen} />}
      {user?.role === 'admin' && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
    </Tab.Navigator>
  );
}

// --- Root Stack Navigator ---
function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Anda bisa menampilkan splash screen atau loading indicator di sini
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen name="CourierMap" component={CourierMapScreen} />
          <Stack.Screen name="ReviewProduct" component={ReviewProductScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
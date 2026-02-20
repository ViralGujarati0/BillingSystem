import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
} from 'react-native';

import useAuthViewModel from '../viewmodels/AuthViewModel';
import { createShopAndAssignToOwner } from '../services/firestore';

const HomeScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const { signOut } = useAuthViewModel();

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Login');
  };

  const handleCreateShop = async () => {
    try {
      const ownerId = user.uid;

      const shopData = {
        businessName: 'My First Shop',
        phone: '9999999999',
        address: 'Rajkot, Gujarat',
        gstNumber: '',
      };

      const shopId = await createShopAndAssignToOwner(ownerId, shopData);

      Alert.alert('Success', `Shop created!\nShop ID:\n${shopId}`);
    } catch (err) {
      console.error('Create shop error:', err);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Profile */}
      <View style={styles.profileCard}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>
              {user?.displayName?.[0] || 'U'}
            </Text>
          </View>
        )}

        <Text style={styles.name}>{user?.displayName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEmoji}>🎉</Text>
        <Text style={styles.welcomeTitle}>You're in!</Text>
        <Text style={styles.welcomeText}>
          Google login successful. Create your shop to continue.
        </Text>
      </View>

      {/* Create Shop */}
      <TouchableOpacity style={styles.createShopButton} onPress={handleCreateShop}>
        <Text style={styles.createShopText}>Create Shop</Text>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  profileCard: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#e94560',
  },

  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  avatarLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  email: {
    fontSize: 14,
    color: '#8892b0',
  },

  welcomeCard: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#0f3460',
  },

  welcomeEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },

  welcomeText: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 22,
  },

  createShopButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },

  createShopText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  signOutButton: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },

  signOutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default HomeScreen;
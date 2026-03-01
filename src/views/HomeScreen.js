import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSetAtom } from 'jotai';
import useAuthViewModel from '../viewmodels/AuthViewModel';
import { currentOwnerAtom } from '../atoms/owner';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({ navigation, route }) => {
  const userDoc = route.params?.userDoc;
  const { signOut } = useAuthViewModel();
  const setCurrentOwner = useSetAtom(currentOwnerAtom);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (userDoc?.role === 'OWNER') {
      setCurrentOwner(userDoc);
    }
  }, [userDoc, setCurrentOwner]);

  useEffect(() => {
    if (!userDoc?.shopId) return;

    const todayKey = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "_");

    const ref = firestore()
      .collection('billing_shops')
      .doc(userDoc.shopId)
      .collection('stats')
      .doc(`daily_${todayKey}`);

    const unsubscribe = ref.onSnapshot((doc) => {
      setStats(doc.exists ? doc.data() : null);
      setLoadingStats(false);
    });

    return unsubscribe;
  }, [userDoc?.shopId]);

  const handleSignOut = async () => {
    await signOut();
    navigation.getParent()?.replace('Login');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Welcome {userDoc?.name}</Text>

      {/* 🔹 Stats Section */}
      {userDoc?.shopId && (
        <View style={styles.statsContainer}>
          {loadingStats ? (
            <ActivityIndicator />
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today Sales</Text>
                <Text style={styles.statValue}>
                  ₹{Number(stats?.totalSales || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Today Profit</Text>
                <Text style={[styles.statValue, { color: 'green' }]}>
                  ₹{Number(stats?.totalProfit || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Bills</Text>
                <Text style={styles.statValue}>
                  {stats?.totalBills || 0}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Create Shop */}
      {!userDoc?.shopId && (
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.getParent()?.navigate('CreateShop', { userDoc })
          }
        >
          <Text style={styles.buttonText}>Create Shop</Text>
        </TouchableOpacity>
      )}

      {/* Buttons */}
      {userDoc?.shopId && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.getParent()?.navigate('AddStaff')}
          >
            <Text style={styles.buttonText}>Add Staff</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.getParent()?.navigate('StaffList')}
          >
            <Text style={styles.buttonText}>See Staffs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.getParent()?.navigate('BarcodeScanner')}
          >
            <Text style={styles.buttonText}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.getParent()?.navigate('BillingScanner', { userDoc })
            }
          >
            <Text style={styles.buttonText}>Create Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.getParent()?.navigate('BarcodeScanner', {
                mode: 'updateInventory',
              })
            }
          >
            <Text style={styles.buttonText}>Update Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.getParent()?.navigate('SupplierList')
            }
          >
            <Text style={styles.buttonText}>Suppliers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.getParent()?.navigate('PurchaseCreate')
            }
          >
            <Text style={styles.buttonText}>New Purchase</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  contentContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: '600',
  },

  statsContainer: {
    width: '90%',
    marginBottom: 30,
  },

  statCard: {
    backgroundColor: '#f2f6ff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 14,
    color: '#555',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },

  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 6,
    marginBottom: 16,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  logoutText: {
    color: 'red',
    marginTop: 20,
  },
});

export default HomeScreen;
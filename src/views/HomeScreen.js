import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSetAtom, useAtomValue } from 'jotai';
import useAuthViewModel from '../viewmodels/AuthViewModel';
import { currentOwnerAtom, scannedBarcodeAtom } from '../atoms/owner';

const HomeScreen = ({ navigation, route }) => {
  const userDoc = route.params?.userDoc;
  const { signOut } = useAuthViewModel();
  const setCurrentOwner = useSetAtom(currentOwnerAtom);
  const scannedBarcode = useAtomValue(scannedBarcodeAtom);

  useEffect(() => {
    if (userDoc?.role === 'OWNER') {
      setCurrentOwner(userDoc);
    }
  }, [userDoc, setCurrentOwner]);

  const handleSignOut = async () => {
    await signOut();
    navigation.getParent()?.replace('Login');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome {userDoc?.name}</Text>

      {/* CREATE SHOP IF NOT EXISTS */}
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

      {/* ADD STAFF + SEE STAFFS + SCAN (only after shop created) */}
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
          {scannedBarcode ? (
            <View style={styles.scanResult}>
              <Text style={styles.scanResultLabel}>Last scanned:</Text>
              <Text style={styles.scanResultValue}>{scannedBarcode}</Text>
            </View>
          ) : null}
        </>
      )}

      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 22,
    marginBottom: 40,
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 6,
    marginBottom: 20,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  scanResult: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  scanResultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scanResultValue: {
    fontSize: 18,
    fontWeight: '600',
  },

  logoutText: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeScreen;
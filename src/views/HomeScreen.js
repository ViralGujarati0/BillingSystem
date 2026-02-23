import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSetAtom } from 'jotai';
import useAuthViewModel from '../viewmodels/AuthViewModel';
import { currentOwnerAtom } from '../atoms/owner';

const HomeScreen = ({ navigation, route }) => {
  const userDoc = route.params?.userDoc;
  const { signOut } = useAuthViewModel();
  const setCurrentOwner = useSetAtom(currentOwnerAtom);

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
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.getParent()?.navigate('BillingScanner', { userDoc })}
          >
            <Text style={styles.buttonText}>Create Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.getParent()?.navigate('BarcodeScanner', { mode: 'updateInventory' })}
          >
            <Text style={styles.buttonText}>Update Inventory</Text>
          </TouchableOpacity>
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

  logoutText: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeScreen;
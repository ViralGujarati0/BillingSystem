import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useAuthViewModel from '../viewmodels/AuthViewModel';

const HomeScreen = ({ navigation, route }) => {
  const { userDoc } = route.params;
  const { signOut } = useAuthViewModel();

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Welcome {userDoc.name}
      </Text>

      {/* ADD STAFF */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('AddStaff')
        }
      >
        <Text style={styles.buttonText}>Add Staff</Text>
      </TouchableOpacity>

      {/* LOGOUT */}
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
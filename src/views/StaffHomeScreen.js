import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useAuthViewModel from '../viewmodels/AuthViewModel';

const StaffHomeScreen = ({ navigation, route }) => {
  const { userDoc } = route.params;
  const { signOut } = useAuthViewModel();

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome {userDoc.name}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
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

  text: {
    fontSize: 20,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default StaffHomeScreen;
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import useAuthViewModel from '../viewmodels/AuthViewModel';
import { getUser } from '../services/firestore'; 

const LoginScreen = ({ navigation }) => {
  const { loading, error, signInWithGoogle } = useAuthViewModel();

  const handleOwnerLogin = async () => {
    const firebaseUser = await signInWithGoogle();
    if (firebaseUser) {
      const userDoc = await getUser(firebaseUser.uid);
      navigation.replace('Home', { userDoc });
    }
  };

  return (
    <View style={styles.container}>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* OWNER LOGIN */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleOwnerLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Google</Text>
        )}
      </TouchableOpacity>

      {/* STAFF LOGIN */}
      <TouchableOpacity
        style={styles.staffButton}
        onPress={() => navigation.navigate('StaffLogin')}
      >
        <Text style={styles.staffText}>Staff Login</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 30,
  },

  button: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },

  staffButton: {
    borderWidth: 1,
    borderColor: '#1a73e8',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  staffText: {
    color: '#1a73e8',
    fontWeight: '600',
  },

  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;
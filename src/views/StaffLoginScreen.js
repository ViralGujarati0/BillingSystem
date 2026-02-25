import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useAtom } from 'jotai';
import useAuthViewModel from '../viewmodels/AuthViewModel';
import { staffLoginFormAtom } from '../atoms/forms';

const StaffLoginScreen = ({ navigation }) => {
  const { signInWithEmailPassword, loading, error } = useAuthViewModel();
  const [form, setForm] = useAtom(staffLoginFormAtom);

  const handleLogin = async () => {
    await signInWithEmailPassword(form.email, form.password);
    // AppNavigator handles routing
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Text style={styles.title}>Staff Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChangeText={(v) => setForm((prev) => ({ ...prev, email: v }))}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={form.password}
        onChangeText={(v) => setForm((prev) => ({ ...prev, password: v }))}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default StaffLoginScreen;
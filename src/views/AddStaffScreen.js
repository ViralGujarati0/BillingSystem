import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAtom } from 'jotai';
import { addStaffFormAtom } from '../atoms/forms';
import { createStaff } from '../services/createStaff';

const AddStaffScreen = ({ navigation }) => {
  const [form, setForm] = useAtom(addStaffFormAtom);

  const handleCreate = async () => {
    try {
      await createStaff({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      Alert.alert('Success', 'Staff created successfully');
      setForm({ name: '', email: '', password: '' });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Create Staff</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={form.name}
        onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Set Staff</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
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
    padding: 12,
    borderRadius: 6,
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
});

export default AddStaffScreen;
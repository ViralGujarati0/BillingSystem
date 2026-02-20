import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createShopAndAssignToOwner, getUser } from '../services/firestore';

const CreateShopScreen = ({ navigation, route }) => {
  const { userDoc } = route.params;
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const handleCreate = async () => {
    if (!businessName) {
      Alert.alert('Error', 'Business name is required');
      return;
    }
    try {
      await createShopAndAssignToOwner(userDoc.id, {
        businessName,
        phone,
        address,
        gstNumber,
      });
      const updatedUserDoc = await getUser(userDoc.id); // fetch fresh doc with shopId
      navigation.replace('Home', { userDoc: updatedUserDoc });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Your Shop</Text>

      <TextInput
        placeholder="Business Name *"
        style={styles.input}
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        placeholder="GST Number"
        style={styles.input}
        value={gstNumber}
        onChangeText={setGstNumber}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Shop</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12 },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default CreateShopScreen;
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAtom } from 'jotai';
import { createShopFormAtom } from '../atoms/forms';
import { createShopAndAssignToOwner, getUser } from '../services/firestore';

const CreateShopScreen = ({ navigation, route }) => {
  const { userDoc } = route.params;
  const [form, setForm] = useAtom(createShopFormAtom);

  const handleCreate = async () => {
    if (!form.businessName.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }
    try {
      await createShopAndAssignToOwner(userDoc.id, {
        businessName: form.businessName.trim(),
        phone: form.phone,
        address: form.address,
        gstNumber: form.gstNumber,
      });
      const updatedUserDoc = await getUser(userDoc.id); // fetch fresh doc with shopId
      navigation.replace('OwnerTabs', { userDoc: updatedUserDoc });
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
        value={form.businessName}
        onChangeText={(v) => setForm((prev) => ({ ...prev, businessName: v }))}
      />
      <TextInput
        placeholder="Phone"
        style={styles.input}
        value={form.phone}
        onChangeText={(v) => setForm((prev) => ({ ...prev, phone: v }))}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={form.address}
        onChangeText={(v) => setForm((prev) => ({ ...prev, address: v }))}
      />
      <TextInput
        placeholder="GST Number"
        style={styles.input}
        value={form.gstNumber}
        onChangeText={(v) => setForm((prev) => ({ ...prev, gstNumber: v }))}
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
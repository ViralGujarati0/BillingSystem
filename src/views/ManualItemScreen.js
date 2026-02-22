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
import { billingCartItemsAtom, manualItemFormAtom } from '../atoms/billing';

const ManualItemScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useAtom(billingCartItemsAtom);
  const [form, setForm] = useAtom(manualItemFormAtom);
  const name = form.name;
  const qty = form.qty;
  const rate = form.rate;

  const handleAdd = () => {
    const n = name.trim();
    const q = parseInt(qty, 10);
    const r = parseFloat(rate);
    if (!n) {
      Alert.alert('Error', 'Item name required.');
      return;
    }
    if (isNaN(q) || q < 1) {
      Alert.alert('Error', 'Valid quantity required.');
      return;
    }
    if (isNaN(r) || r < 0) {
      Alert.alert('Error', 'Valid rate required.');
      return;
    }
    const amount = q * r;
    setCartItems((prev) => [
      ...prev,
      { type: 'MANUAL', name: n, qty: q, rate: r, amount },
    ]);
    setForm({ name: '', qty: '1', rate: '' });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add manual item</Text>
      <Text style={styles.label}>Item name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))}
        placeholder="e.g. Service charge"
      />
      <Text style={styles.label}>Quantity *</Text>
      <TextInput
        style={styles.input}
        value={qty}
        onChangeText={(v) => setForm((prev) => ({ ...prev, qty: v }))}
        keyboardType="number-pad"
        placeholder="1"
      />
      <Text style={styles.label}>Rate (₹) *</Text>
      <TextInput
        style={styles.input}
        value={rate}
        onChangeText={(v) => setForm((prev) => ({ ...prev, rate: v }))}
        keyboardType="decimal-pad"
        placeholder="0"
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add to bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 56 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  backText: { color: '#1a73e8', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default ManualItemScreen;

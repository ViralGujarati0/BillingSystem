import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useSupplierViewModel from '../viewmodels/SupplierViewModel';

const SupplierCreateScreen = ({ navigation }) => {
  const vm = useSupplierViewModel();
  const owner = vm.owner;
  const shopId = vm.shopId;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!owner || owner.role !== 'OWNER' || !shopId) {
      Alert.alert('Error', 'Only owners can create suppliers.');
      return;
    }
    const ob = Number.parseFloat(String(openingBalance));
    if (!Number.isFinite(ob) || ob < 0) {
      Alert.alert('Error', 'Opening balance must be 0 or more.');
      return;
    }
    setSaving(true);
    try {
      await vm.createSupplier({
        name,
        phone,
        address,
        gstNumber,
        openingBalance: ob,
      });
      Alert.alert('Success', 'Supplier created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to create supplier.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Create Supplier</Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Supplier name" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone" />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />

      <Text style={styles.label}>GST Number</Text>
      <TextInput style={styles.input} value={gstNumber} onChangeText={setGstNumber} placeholder="GST Number" />

      <Text style={styles.label}>Opening balance (₹)</Text>
      <TextInput style={styles.input} value={openingBalance} onChangeText={setOpeningBalance} keyboardType="decimal-pad" placeholder="0" />

      <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Supplier'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#1a73e8', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default SupplierCreateScreen;


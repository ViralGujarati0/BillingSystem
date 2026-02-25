import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import useSupplierViewModel from '../viewmodels/SupplierViewModel';

const SupplierEditScreen = ({ navigation, route }) => {
  const { supplier } = route.params || {};
  const vm = useSupplierViewModel();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(supplier?.name || '');
    setPhone(supplier?.phone || '');
    setAddress(supplier?.address || '');
    setGstNumber(supplier?.gstNumber || '');
  }, [supplier]);

  if (!vm.owner || vm.owner.role !== 'OWNER') {
    return (
      <View style={styles.center}>
        <Text>Only owners can edit suppliers.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    if (!supplier?.id) return;
    if (!String(name).trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      await vm.updateSupplier(supplier.id, { name, phone, address, gstNumber });
      Alert.alert('Success', 'Supplier updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update supplier.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Edit Supplier</Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Supplier name" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone" />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />

      <Text style={styles.label}>GST Number</Text>
      <TextInput style={styles.input} value={gstNumber} onChangeText={setGstNumber} placeholder="GST Number" />

      <TouchableOpacity style={[styles.button, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#1a73e8', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default SupplierEditScreen;


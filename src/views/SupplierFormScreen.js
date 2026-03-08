import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import AppHeaderLayout from '../components/AppHeaderLayout';
import useSupplierViewModel from '../viewmodels/SupplierViewModel';

export default function SupplierFormScreen({ navigation, route }) {

  // if supplier is passed we are in edit mode
  const supplier = route.params?.supplier ?? null;
  const isEdit   = !!supplier;

  const vm = useSupplierViewModel();

  const [name,           setName]           = useState('');
  const [phone,          setPhone]          = useState('');
  const [address,        setAddress]        = useState('');
  const [gstNumber,      setGstNumber]      = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [saving,         setSaving]         = useState(false);

  // pre-fill form in edit mode
  useEffect(() => {
    if (supplier) {
      setName(supplier.name           ?? '');
      setPhone(supplier.phone         ?? '');
      setAddress(supplier.address     ?? '');
      setGstNumber(supplier.gstNumber ?? '');
      setOpeningBalance(String(supplier.openingBalance ?? '0'));
    }
  }, [supplier]);

  const handleSave = async () => {

    if (!String(name).trim()) {
      Alert.alert('Error', 'Supplier name is required');
      return;
    }

    if (!isEdit) {
      const ob = parseFloat(String(openingBalance));
      if (!Number.isFinite(ob) || ob < 0) {
        Alert.alert('Error', 'Opening balance must be 0 or more');
        return;
      }
    }

    setSaving(true);

    try {
      if (isEdit) {
        await vm.updateSupplier(supplier.id, { name, phone, address, gstNumber });
        Alert.alert('Success', 'Supplier updated', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await vm.createSupplier({
          name,
          phone,
          address,
          gstNumber,
          openingBalance: parseFloat(String(openingBalance)) || 0,
        });
        Alert.alert('Success', 'Supplier created', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppHeaderLayout title={isEdit ? 'Edit Supplier' : 'Add Supplier'}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Supplier name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>GST Number</Text>
        <TextInput
          style={styles.input}
          placeholder="GST Number"
          value={gstNumber}
          onChangeText={setGstNumber}
          autoCapitalize="characters"
        />

        {/* Opening balance only shown on create */}
        {!isEdit && (
          <>
            <Text style={styles.label}>Opening Balance (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              keyboardType="decimal-pad"
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Save Changes' : 'Add Supplier'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
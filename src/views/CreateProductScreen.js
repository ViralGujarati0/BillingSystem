import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAtomValue, useAtom } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { createProductFormAtom, defaultCreateProductForm } from '../atoms/forms';
import { createProduct, setInventoryItem } from '../services/firestore';

const UNITS = ['pcs', 'kg', 'litre'];

const CreateProductScreen = ({ navigation, route }) => {
  const { barcode } = route.params || {};
  const owner = useAtomValue(currentOwnerAtom);
  const [form, setForm] = useAtom(createProductFormAtom);

  useEffect(() => {
    setForm({ ...defaultCreateProductForm });
  }, [barcode, setForm]);

  const mrpNum = parseFloat(form.mrp) || 0;
  const handleMrpChange = (v) => {
    setForm((prev) => {
      const next = { ...prev, mrp: v };
      if (!prev.sellingPrice || prev.sellingPrice === String(parseFloat(prev.mrp) || 0)) next.sellingPrice = v;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!barcode || !owner?.shopId || !owner?.id) {
      Alert.alert('Error', 'Missing barcode or shop.');
      return;
    }
    if (!form.name.trim()) {
      Alert.alert('Error', 'Product name is required.');
      return;
    }
    const mrpVal = parseFloat(form.mrp) || 0;
    const gstVal = parseFloat(form.gstPercent) || 0;
    const sellVal = parseFloat(form.sellingPrice) || mrpVal;
    const purchaseVal = parseFloat(form.purchasePrice) || 0;
    const stockVal = parseInt(form.stock, 10) || 0;
    if (mrpVal < 0 || gstVal < 0) {
      Alert.alert('Error', 'MRP and GST % must be valid.');
      return;
    }
    setForm((prev) => ({ ...prev, saving: true }));
    try {
      await createProduct({
        barcode,
        name: form.name.trim(),
        category: form.category.trim(),
        brand: form.brand.trim(),
        unit: form.unit,
        mrp: mrpVal,
        gstPercent: gstVal,
        createdBy: owner.id,
      });
      await setInventoryItem(owner.shopId, {
        barcode,
        sellingPrice: sellVal,
        purchasePrice: purchaseVal,
        stock: stockVal,
        expiry: (form.expiry || '').trim(),
      });
      Alert.alert('Success', 'Product and inventory created.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setForm((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Create product</Text>
      <Text style={styles.barcode}>Barcode: {barcode}</Text>

      <Text style={styles.section}>Product (global)</Text>
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))} placeholder="e.g. Balaji Cream & Onion Wafer" />
      <Text style={styles.label}>Category *</Text>
      <TextInput style={styles.input} value={form.category} onChangeText={(v) => setForm((prev) => ({ ...prev, category: v }))} placeholder="e.g. Snacks" />
      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={form.brand} onChangeText={(v) => setForm((prev) => ({ ...prev, brand: v }))} placeholder="e.g. Balaji" />
      <Text style={styles.label}>Unit</Text>
      <View style={styles.unitRow}>
        {UNITS.map((u) => (
          <TouchableOpacity
            key={u}
            style={[styles.unitChip, form.unit === u && styles.unitChipActive]}
            onPress={() => setForm((prev) => ({ ...prev, unit: u }))}
          >
            <Text style={[styles.unitText, form.unit === u && styles.unitTextActive]}>{u}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>MRP (₹) *</Text>
      <TextInput style={styles.input} value={form.mrp} onChangeText={handleMrpChange} keyboardType="decimal-pad" placeholder="10" />
      <Text style={styles.label}>GST % *</Text>
      <TextInput style={styles.input} value={form.gstPercent} onChangeText={(v) => setForm((prev) => ({ ...prev, gstPercent: v }))} keyboardType="decimal-pad" placeholder="5" />

      <Text style={styles.section}>Inventory (this shop)</Text>
      <Text style={styles.label}>Selling price (₹) * (default = MRP)</Text>
      <TextInput style={styles.input} value={form.sellingPrice} onChangeText={(v) => setForm((prev) => ({ ...prev, sellingPrice: v }))} keyboardType="decimal-pad" placeholder={String(mrpNum) || '10'} />
      <Text style={styles.label}>Purchase price (₹) *</Text>
      <TextInput style={styles.input} value={form.purchasePrice} onChangeText={(v) => setForm((prev) => ({ ...prev, purchasePrice: v }))} keyboardType="decimal-pad" placeholder="8" />
      <Text style={styles.label}>Opening stock *</Text>
      <TextInput style={styles.input} value={form.stock} onChangeText={(v) => setForm((prev) => ({ ...prev, stock: v }))} keyboardType="number-pad" placeholder="50" />
      <Text style={styles.label}>Expiry (optional)</Text>
      <TextInput style={styles.input} value={form.expiry} onChangeText={(v) => setForm((prev) => ({ ...prev, expiry: v }))} placeholder="2026-05-01" />

      <TouchableOpacity
        style={[styles.button, form.saving && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={form.saving}
      >
        <Text style={styles.buttonText}>{form.saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#1a73e8', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  barcode: { fontSize: 14, color: '#666', marginBottom: 20 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 16 },
  unitRow: { flexDirection: 'row', marginBottom: 16 },
  unitChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  unitChipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  unitText: { fontSize: 14 },
  unitTextActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default CreateProductScreen;

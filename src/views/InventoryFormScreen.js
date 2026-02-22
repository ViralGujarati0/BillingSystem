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
import { inventoryFormAtom, defaultInventoryForm } from '../atoms/forms';
import { setInventoryItem } from '../services/firestore';

const InventoryFormScreen = ({ navigation, route }) => {
  const { barcode, product } = route.params || {};
  const owner = useAtomValue(currentOwnerAtom);
  const [form, setForm] = useAtom(inventoryFormAtom);
  const mrp = product?.mrp ?? 0;

  useEffect(() => {
    setForm({
      ...defaultInventoryForm,
      sellingPrice: mrp ? String(mrp) : '',
    });
  }, [barcode, mrp, setForm]);

  const handleSubmit = async () => {
    if (!owner?.shopId || !barcode) {
      Alert.alert('Error', 'Missing shop or barcode.');
      return;
    }
    const sell = parseFloat(form.sellingPrice);
    const purchase = parseFloat(form.purchasePrice);
    const stockNum = parseInt(form.stock, 10);
    if (isNaN(sell) || sell < 0) {
      Alert.alert('Error', 'Enter a valid selling price.');
      return;
    }
    if (isNaN(purchase) || purchase < 0) {
      Alert.alert('Error', 'Enter a valid purchase price.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'Enter a valid opening stock.');
      return;
    }
    setForm((prev) => ({ ...prev, saving: true }));
    try {
      await setInventoryItem(owner.shopId, {
        barcode,
        sellingPrice: sell,
        purchasePrice: purchase,
        stock: stockNum,
        expiry: (form.expiry || '').trim(),
      });
      Alert.alert('Success', 'Product successfully added to inventory.');
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
      <Text style={styles.title}>Add to inventory</Text>

      {/* Product info at top – so user knows which product they're entering inventory for */}
      <View style={styles.productCard}>
        <Text style={styles.productCardTitle}>This product</Text>
        <Text style={styles.productName}>{product?.name || '—'}</Text>
        <Text style={styles.productMeta}>Barcode: {barcode}</Text>
        {product?.category ? <Text style={styles.productMeta}>Category: {product.category}</Text> : null}
        {product?.brand ? <Text style={styles.productMeta}>Brand: {product.brand}</Text> : null}
        {product?.unit ? <Text style={styles.productMeta}>Unit: {product.unit}</Text> : null}
        <Text style={styles.productMeta}>MRP: ₹{product?.mrp ?? '—'}</Text>
        {product?.gstPercent != null ? <Text style={styles.productMeta}>GST: {product.gstPercent}%</Text> : null}
      </View>

      <Text style={styles.sectionLabel}>Enter inventory for this product</Text>
      <Text style={styles.label}>Selling price (₹) *</Text>
      <TextInput
        style={styles.input}
        value={form.sellingPrice}
        onChangeText={(v) => setForm((prev) => ({ ...prev, sellingPrice: v }))}
        keyboardType="decimal-pad"
        placeholder="e.g. 10"
      />
      <Text style={styles.label}>Purchase price (₹) *</Text>
      <TextInput
        style={styles.input}
        value={form.purchasePrice}
        onChangeText={(v) => setForm((prev) => ({ ...prev, purchasePrice: v }))}
        keyboardType="decimal-pad"
        placeholder="e.g. 8"
      />
      <Text style={styles.label}>Opening stock *</Text>
      <TextInput
        style={styles.input}
        value={form.stock}
        onChangeText={(v) => setForm((prev) => ({ ...prev, stock: v }))}
        keyboardType="number-pad"
        placeholder="e.g. 50"
      />
      <Text style={styles.label}>Expiry (optional)</Text>
      <TextInput
        style={styles.input}
        value={form.expiry}
        onChangeText={(v) => setForm((prev) => ({ ...prev, expiry: v }))}
        placeholder="YYYY-MM-DD e.g. 2026-05-01"
      />

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
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  productCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1a73e8',
  },
  productCardTitle: { fontSize: 12, fontWeight: '600', color: '#1a73e8', marginBottom: 8, letterSpacing: 0.5 },
  productName: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 8 },
  productMeta: { fontSize: 14, color: '#444', marginBottom: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default InventoryFormScreen;

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAtom } from 'jotai';
import { purchaseScannedBarcodeAtom } from '../atoms/purchase';
import usePurchaseViewModel from '../viewmodels/PurchaseViewModel';

const PAYMENT_TYPES = ['CASH', 'UPI', 'BANK'];

const PurchaseCreateScreen = ({ navigation }) => {
  const vm = usePurchaseViewModel();
  const owner = vm.owner;
  const [scannedPurchaseBarcode, setScannedPurchaseBarcode] = useAtom(purchaseScannedBarcodeAtom);

  const [suppliers, setSuppliers] = useState([]);

  // Add item modal-ish local state
  const [addBarcode, setAddBarcode] = useState('');
  const [addQty, setAddQty] = useState('1');
  const [addRate, setAddRate] = useState('');

  useEffect(() => {
    if (!scannedPurchaseBarcode) return;
    setAddBarcode(scannedPurchaseBarcode);
    setScannedPurchaseBarcode('');
  }, [scannedPurchaseBarcode, setScannedPurchaseBarcode]);

  useEffect(() => {
    const ownerRole = owner?.role;
    const shopId = vm.shopId;
    const loadShopAndSuppliers = vm.loadShopAndSuppliers;
    if (!ownerRole || ownerRole !== 'OWNER' || !shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const { suppliers: list } = await loadShopAndSuppliers();
        if (!cancelled) setSuppliers(list);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [owner?.role, vm.shopId, vm.loadShopAndSuppliers]);

  const subtotal = useMemo(
    () => vm.items.reduce((s, it) => s + (Number(it.amount) || 0), 0),
    [vm.items]
  );
  const paid = Number.parseFloat(String(vm.paidAmount)) || 0;
  const due = Math.max(0, subtotal - Math.max(0, paid));

  const handleAddItem = async () => {
    const barcode = String(addBarcode || '').trim();
    const qty = Number.parseInt(String(addQty), 10) || 0;
    const rate = Number.parseFloat(String(addRate)) || 0;
    if (!barcode) { Alert.alert('Error', 'Enter barcode'); return; }
    if (qty <= 0) { Alert.alert('Error', 'Qty must be 1 or more'); return; }
    if (rate < 0) { Alert.alert('Error', 'Rate must be 0 or more'); return; }

    try {
      await vm.addItemByBarcode({ barcode, qty, rate });
      setAddBarcode('');
      setAddQty('1');
      setAddRate('');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to add item');
    }
  };

  const updateQty = (index, v) => {
    vm.setItems((prev) => {
      const next = [...prev];
      const it = next[index];
      if (!it) return prev;
      const trimmed = String(v).trim();
      const n = trimmed === '' ? it.qty : Math.max(0, parseInt(trimmed, 10) || 0);
      if (n === 0) {
        next.splice(index, 1);
        return next;
      }
      next[index] = { ...it, qty: n, amount: n * (Number(it.purchasePrice) || 0) };
      return next;
    });
  };

  const updateRate = (index, v) => {
    vm.setItems((prev) => {
      const next = [...prev];
      const it = next[index];
      if (!it) return prev;
      const trimmed = String(v).trim();
      const r = trimmed === '' ? it.purchasePrice : Math.max(0, Number.parseFloat(trimmed) || 0);
      next[index] = { ...it, purchasePrice: r, amount: (Number(it.qty) || 0) * r };
      return next;
    });
  };

  const handleSavePurchase = async () => {
    try {
      await vm.savePurchase({ navigation });
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save purchase.');
    }
  };

  if (!owner || owner.role !== 'OWNER') {
    return (
      <View style={styles.center}>
        <Text>Only owners can create purchases.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>New Purchase</Text>

      <Text style={styles.label}>Supplier *</Text>
      <View style={styles.chipRow}>
        {suppliers.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.chip, vm.supplierId === s.id && styles.chipActive]}
            onPress={() => vm.setSupplierId(s.id)}
          >
            <Text style={[styles.chipText, vm.supplierId === s.id && styles.chipTextActive]}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!suppliers.length && (
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('SupplierCreate')}>
          <Text style={styles.linkText}>+ Create Supplier</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Invoice No</Text>
      <TextInput style={[styles.input, styles.inputDisabled]} value="Auto-generated on save" editable={false} />

      <Text style={styles.label}>Payment type</Text>
      <View style={styles.chipRow}>
        {PAYMENT_TYPES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, vm.paymentType === p && styles.chipActive]}
            onPress={() => vm.setPaymentType(p)}
          >
            <Text style={[styles.chipText, vm.paymentType === p && styles.chipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Paid amount</Text>
      <TextInput style={styles.input} value={vm.paidAmount} onChangeText={vm.setPaidAmount} keyboardType="decimal-pad" placeholder="0" />

      <Text style={styles.section}>Add item</Text>
      <TextInput style={styles.input} value={addBarcode} onChangeText={setAddBarcode} placeholder="Barcode" />
      <TouchableOpacity
        style={styles.grayBtn}
        onPress={() => navigation.navigate('BarcodeScanner', { mode: 'purchaseItem' })}
      >
        <Text style={styles.grayBtnText}>Scan Barcode</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.half]} value={addQty} onChangeText={setAddQty} keyboardType="number-pad" placeholder="Qty" />
        <TextInput style={[styles.input, styles.half]} value={addRate} onChangeText={setAddRate} keyboardType="decimal-pad" placeholder="Purchase price" />
      </View>
      <TouchableOpacity style={styles.grayBtn} onPress={handleAddItem}>
        <Text style={styles.grayBtnText}>Add to list</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Items</Text>
      {vm.items.length === 0 ? (
        <Text style={styles.muted}>No items added.</Text>
      ) : (
        vm.items.map((it, idx) => (
          <View key={`${it.barcode}_${idx}`} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{it.name || it.barcode}</Text>
              <Text style={styles.itemMeta}>Barcode: {it.barcode}</Text>
            </View>
            <TextInput
              style={styles.qtyInput}
              value={String(it.qty)}
              onChangeText={(v) => updateQty(idx, v)}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.rateInput}
              value={String(it.purchasePrice)}
              onChangeText={(v) => updateRate(idx, v)}
              keyboardType="decimal-pad"
            />
            <Text style={styles.amount}>₹{it.amount}</Text>
          </View>
        ))
      )}

      <View style={styles.totalBox}>
        <Text style={styles.totalLine}>Subtotal: ₹{subtotal}</Text>
        <Text style={styles.totalLine}>Paid: ₹{Math.max(0, paid)}</Text>
        <Text style={styles.totalLine}>Due: ₹{due}</Text>
      </View>

      <TouchableOpacity style={[styles.primaryBtn, vm.saving && styles.disabled]} onPress={handleSavePurchase} disabled={vm.saving}>
        <Text style={styles.primaryText}>{vm.saving ? 'Saving…' : 'Save Purchase'}</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12 },
  inputDisabled: { backgroundColor: '#f3f3f3', color: '#666' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  section: { marginTop: 12, marginBottom: 8, fontSize: 16, fontWeight: '700' },
  muted: { color: '#666', marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  chipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  chipText: { color: '#111' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  linkBtn: { marginBottom: 12 },
  linkText: { color: '#1a73e8', fontWeight: '600' },
  grayBtn: { backgroundColor: '#eee', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  grayBtnText: { fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  itemName: { fontSize: 14, fontWeight: '600' },
  itemMeta: { fontSize: 11, color: '#666' },
  qtyInput: { width: 44, borderWidth: 1, borderColor: '#eee', padding: 6, borderRadius: 6, textAlign: 'center' },
  rateInput: { width: 74, borderWidth: 1, borderColor: '#eee', padding: 6, borderRadius: 6, textAlign: 'center' },
  amount: { width: 70, textAlign: 'right', fontWeight: '700' },
  totalBox: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: '#eee' },
  totalLine: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  primaryBtn: { marginTop: 16, backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default PurchaseCreateScreen;


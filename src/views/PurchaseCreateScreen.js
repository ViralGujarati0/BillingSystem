import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout   from '../components/AppHeaderLayout';
import SupplierDropdown  from '../components/SupplierDropdown';
import PurchaseItemRow   from '../components/PurchaseItemRow';

import { purchaseScannedBarcodeAtom } from '../atoms/purchase';
import usePurchaseViewModel           from '../viewmodels/PurchaseViewModel';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

const PAYMENT_TYPES = ['CASH', 'UPI', 'BANK'];

export default function PurchaseCreateScreen({ navigation }) {
  const vm    = usePurchaseViewModel();
  const owner = vm.owner;

  const [scannedBarcode, setScannedBarcode] = useAtom(purchaseScannedBarcodeAtom);

  const [suppliers,  setSuppliers]  = useState([]);
  const [addBarcode, setAddBarcode] = useState('');
  const [addQty,     setAddQty]     = useState('1');
  const [addRate,    setAddRate]    = useState('');
  const [adding,     setAdding]     = useState(false);

  // Pre-fill barcode from scanner
  useEffect(() => {
    if (!scannedBarcode) return;
    setAddBarcode(scannedBarcode);
    setScannedBarcode('');
  }, [scannedBarcode]);

  // Load suppliers
  useEffect(() => {
    if (!owner?.shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const { suppliers: list } = await vm.loadShopAndSuppliers();
        if (!cancelled) setSuppliers(list);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [owner?.shopId]);

  const subtotal = useMemo(
    () => vm.items.reduce((s, it) => s + (Number(it.amount) || 0), 0),
    [vm.items]
  );
  const paid = parseFloat(String(vm.paidAmount)) || 0;
  const due  = Math.max(0, subtotal - Math.max(0, paid));

  const handleAddItem = async () => {
    const barcode = String(addBarcode || '').trim();
    const qty     = parseInt(String(addQty), 10) || 0;
    const rate    = parseFloat(String(addRate)) || 0;

    if (!barcode)  { Alert.alert('Error', 'Enter or scan a barcode'); return; }
    if (qty <= 0)  { Alert.alert('Error', 'Qty must be 1 or more'); return; }
    if (rate < 0)  { Alert.alert('Error', 'Rate must be 0 or more'); return; }

    setAdding(true);
    try {
      await vm.addItemByBarcode({ barcode, qty, rate });
      setAddBarcode('');
      setAddQty('1');
      setAddRate('');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleQtyChange = (index, v) => {
    vm.setItems((prev) => {
      const next = [...prev];
      const it   = next[index];
      if (!it) return prev;
      const n = parseInt(String(v).trim(), 10);
      if (!n || n <= 0) { next.splice(index, 1); return next; }
      next[index] = { ...it, qty: n, amount: n * (Number(it.purchasePrice) || 0) };
      return next;
    });
  };

  const handleRateChange = (index, v) => {
    vm.setItems((prev) => {
      const next = [...prev];
      const it   = next[index];
      if (!it) return prev;
      const r    = parseFloat(String(v).trim()) || 0;
      next[index] = { ...it, purchasePrice: r, amount: (Number(it.qty) || 0) * r };
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    vm.setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await vm.savePurchase({ navigation });
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save purchase.');
    }
  };

  return (
    <AppHeaderLayout title="New Purchase">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Supplier ── */}
        <SectionLabel icon="business-outline" label="SUPPLIER" />
        <SupplierDropdown
          suppliers={suppliers}
          selectedId={vm.supplierId}
          onSelect={vm.setSupplierId}
        />
        {suppliers.length === 0 && (
          <TouchableOpacity
            style={styles.createSupplierBtn}
            onPress={() => navigation.navigate('SupplierForm')}
          >
            <Icon name="add-circle-outline" size={rfs(14)} color="#16a34a" />
            <Text style={styles.createSupplierText}>Create Supplier</Text>
          </TouchableOpacity>
        )}

        {/* ── Payment type ── */}
        <SectionLabel icon="card-outline" label="PAYMENT TYPE" />
        <View style={styles.chipRow}>
          {PAYMENT_TYPES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, vm.paymentType === p && styles.chipActive]}
              onPress={() => vm.setPaymentType(p)}
            >
              <Text style={[styles.chipText, vm.paymentType === p && styles.chipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Paid amount ── */}
        <SectionLabel icon="wallet-outline" label="PAID AMOUNT" />
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={vm.paidAmount}
            onChangeText={vm.setPaidAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#ccc"
          />
        </View>

        {/* ── Add item ── */}
        <SectionLabel icon="add-circle-outline" label="ADD ITEM" />

        <View style={styles.addItemCard}>

          <View style={styles.barcodeRow}>
            <TextInput
              style={[styles.input, styles.barcodeInput]}
              value={addBarcode}
              onChangeText={setAddBarcode}
              placeholder="Enter barcode"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() =>
                navigation.navigate('BarcodeScanner', { mode: 'purchaseItem' })
              }
            >
              <Icon name="scan-outline" size={rfs(18)} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.qtyRateRow}>
            <View style={styles.qtyRateField}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={addQty}
                onChangeText={setAddQty}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#ccc"
              />
            </View>
            <View style={styles.qtyRateField}>
              <Text style={styles.fieldLabel}>Purchase Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={addRate}
                onChangeText={setAddRate}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#ccc"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, adding && styles.addBtnDisabled]}
            onPress={handleAddItem}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="add" size={rfs(16)} color="#fff" />
                <Text style={styles.addBtnText}>Add to List</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* ── Items list ── */}
        {vm.items.length > 0 && (
          <>
            <SectionLabel icon="list-outline" label={`ITEMS (${vm.items.length})`} />
            {vm.items.map((item, idx) => (
              <PurchaseItemRow
                key={`${item.barcode}_${idx}`}
                item={item}
                index={idx}
                onQtyChange={handleQtyChange}
                onRateChange={handleRateChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </>
        )}

        {/* ── Totals ── */}
        {vm.items.length > 0 && (
          <View style={styles.totalsCard}>
            <TotalRow label="Subtotal" value={`₹${subtotal}`} />
            <TotalRow label="Paid"     value={`₹${Math.max(0, paid)}`} color="#16a34a" />
            <View style={styles.totalsDivider} />
            <TotalRow label="Due"      value={`₹${due}`} color={due > 0 ? '#f59e0b' : '#16a34a'} large />
          </View>
        )}

        {/* ── Save button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, vm.saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={vm.saving}
        >
          {vm.saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="checkmark-outline" size={rfs(18)} color="#fff" />
              <Text style={styles.saveBtnText}>Save Purchase</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </AppHeaderLayout>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────
function SectionLabel({ icon, label }) {
  return (
    <View style={styles.sectionLabel}>
      <Icon name={icon} size={rfs(12)} color="#aaa" />
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

function TotalRow({ label, value, color, large }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, large && styles.totalLabelLarge]}>{label}</Text>
      <Text style={[styles.totalValue, large && styles.totalValueLarge, color && { color }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Section label ──────────────────────────────────────
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    marginTop: rvs(4),
  },
  sectionLabelText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 0.7,
  },

  // ── Payment chips ──────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    gap: rs(8),
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: rvs(8),
    paddingHorizontal: rs(16),
    borderRadius: rs(20),
    backgroundColor: '#fafafa',
  },
  chipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  chipText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
  },

  // ── Input card ─────────────────────────────────────────
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    fontSize: rfs(14),
    fontWeight: '500',
    color: '#111',
    paddingHorizontal: rs(14),
    paddingVertical: rvs(12),
  },

  // ── Add item card ──────────────────────────────────────
  addItemCard: {
    backgroundColor: '#fff',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: rs(14),
    gap: rvs(10),
  },
  barcodeRow: {
    flexDirection: 'row',
    gap: rs(10),
    alignItems: 'center',
  },
  barcodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(11),
    backgroundColor: '#fafafa',
  },
  scanBtn: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(10),
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRateRow: {
    flexDirection: 'row',
    gap: rs(10),
  },
  qtyRateField: {
    flex: 1,
    gap: rvs(4),
  },
  fieldLabel: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: '#888',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    backgroundColor: '#7c3aed',
    paddingVertical: rvs(11),
    borderRadius: rs(10),
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#fff',
  },

  // ── Create supplier link ───────────────────────────────
  createSupplierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    marginTop: rvs(-6),
  },
  createSupplierText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#16a34a',
  },

  // ── Totals card ────────────────────────────────────────
  totalsCard: {
    backgroundColor: '#fff',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: rs(14),
    gap: rvs(8),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#666',
  },
  totalLabelLarge: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: '#111',
  },
  totalValue: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#111',
  },
  totalValueLarge: {
    fontSize: rfs(17),
    fontWeight: '800',
  },

  // ── Save button ────────────────────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    backgroundColor: '#7c3aed',
    paddingVertical: rvs(15),
    borderRadius: rs(14),
    marginTop: rvs(8),
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
    shadowRadius: rs(12),
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
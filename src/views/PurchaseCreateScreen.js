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
import ConfirmActionModal from '../components/ConfirmActionModal';

import { purchaseScannedBarcodeAtom } from '../atoms/purchase';
import usePurchaseViewModel           from '../viewmodels/PurchaseViewModel';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const PAYMENT_TYPES = ['CASH', 'UPI', 'BANK'];

// ─── Back pill ────────────────────────────────────────────────────────────────
const BackPill = ({ onPress }) => (
  <TouchableOpacity style={styles.backPill} onPress={onPress} activeOpacity={0.75}>
    <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
    <Text style={styles.backPillText}>Back</Text>
  </TouchableOpacity>
);

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ icon, label }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionBar} />
    <Icon name={icon} size={rfs(12)} color={colors.accent} />
    <Text style={styles.sectionLabelText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ─── Total row ────────────────────────────────────────────────────────────────
const TotalRow = ({ label, value, color, large }) => (
  <View style={styles.totalRow}>
    <Text style={[styles.totalLabel, large && styles.totalLabelLarge]}>{label}</Text>
    <Text style={[styles.totalValue, large && styles.totalValueLarge, color && { color }]}>
      {value}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PurchaseCreateScreen({ navigation }) {
  const vm    = usePurchaseViewModel();
  const owner = vm.owner;

  const [scannedBarcode, setScannedBarcode] = useAtom(purchaseScannedBarcodeAtom);

  const [suppliers,    setSuppliers]    = useState([]);
  const [addBarcode,   setAddBarcode]   = useState('');
  const [addQty,       setAddQty]       = useState('1');
  const [addRate,      setAddRate]      = useState('');
  const [adding,       setAdding]       = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  // ── Pre-fill barcode from scanner ──
  useEffect(() => {
    if (!scannedBarcode) return;
    setAddBarcode(scannedBarcode);
    setScannedBarcode('');
  }, [scannedBarcode]);

  // ── Load suppliers ──
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

    if (!barcode) { Alert.alert('Error', 'Enter or scan a barcode'); return; }
    if (qty <= 0) { Alert.alert('Error', 'Qty must be 1 or more');   return; }
    if (rate < 0) { Alert.alert('Error', 'Rate must be 0 or more');  return; }

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
      const r = parseFloat(String(v).trim()) || 0;
      next[index] = { ...it, purchasePrice: r, amount: (Number(it.qty) || 0) * r };
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    vm.setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePress = () => {
    if (vm.items.length === 0) {
      Alert.alert('Error', 'Add at least one item');
      return;
    }
    setConfirmModal(true);
  };

  const handleSaveConfirm = async () => {
    setConfirmModal(false);
    try {
      await vm.savePurchase({ navigation });
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save purchase.');
    }
  };

  const headerLeft = <BackPill onPress={() => navigation.goBack()} />;

  return (
    <AppHeaderLayout
      title="New Purchase"
      subtitle={vm.items.length > 0
        ? `${vm.items.length} item${vm.items.length === 1 ? '' : 's'} · ₹${subtotal}`
        : 'Create purchase order'}
      leftComponent={headerLeft}
    >

      {/* ── Save confirm modal ── */}
      <ConfirmActionModal
        visible={confirmModal}
        variant="success"
        icon="checkmark-circle-outline"
        title="Save Purchase?"
        message={`This will record a purchase of ₹${subtotal} with ₹${Math.max(0, paid)} paid and ₹${due} due.`}
        confirmLabel="Yes, Save"
        confirmIcon="checkmark-outline"
        loading={vm.saving}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleSaveConfirm}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ════════════════════════
            SUPPLIER
        ════════════════════════ */}
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
            activeOpacity={0.8}
          >
            <View style={styles.createSupplierIconBox}>
              <Icon name="add-circle-outline" size={rfs(13)} color={colors.primary} />
            </View>
            <Text style={styles.createSupplierText}>Create Supplier</Text>
          </TouchableOpacity>
        )}

        {/* ════════════════════════
            PAYMENT TYPE
        ════════════════════════ */}
        <SectionLabel icon="card-outline" label="PAYMENT TYPE" />

        <View style={styles.chipRow}>
          {PAYMENT_TYPES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, vm.paymentType === p && styles.chipActive]}
              onPress={() => vm.setPaymentType(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, vm.paymentType === p && styles.chipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ════════════════════════
            PAID AMOUNT
        ════════════════════════ */}
        <SectionLabel icon="wallet-outline" label="PAID AMOUNT" />

        <View style={styles.inputCard}>
          <View style={styles.inputIconBox}>
            <Icon name="wallet-outline" size={rfs(15)} color={colors.textSecondary} />
          </View>
          <TextInput
            style={styles.input}
            value={vm.paidAmount}
            onChangeText={vm.setPaidAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* ════════════════════════
            ADD ITEM
        ════════════════════════ */}
        <SectionLabel icon="add-circle-outline" label="ADD ITEM" />

        <View style={styles.addItemCard}>

          {/* Barcode + scan */}
          <View style={styles.barcodeRow}>
            <View style={styles.barcodeInputWrap}>
              <Icon name="barcode-outline" size={rfs(15)} color={colors.textSecondary} style={styles.barcodeIcon} />
              <TextInput
                style={styles.barcodeInput}
                value={addBarcode}
                onChangeText={setAddBarcode}
                placeholder="Enter barcode"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => navigation.navigate('BarcodeScanner', { mode: 'purchaseItem' })}
              activeOpacity={0.85}
            >
              <Icon name="scan-outline" size={rfs(18)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Qty + Rate */}
          <View style={styles.qtyRateRow}>
            <View style={styles.qtyRateField}>
              <Text style={styles.fieldLabel}>QUANTITY</Text>
              <View style={styles.smallInputWrap}>
                <TextInput
                  style={styles.smallInput}
                  value={addQty}
                  onChangeText={setAddQty}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
            <View style={styles.qtyRateField}>
              <Text style={styles.fieldLabel}>PURCHASE PRICE (₹)</Text>
              <View style={styles.smallInputWrap}>
                <TextInput
                  style={styles.smallInput}
                  value={addRate}
                  onChangeText={setAddRate}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Add button */}
          <TouchableOpacity
            style={[styles.addBtn, adding && styles.addBtnDisabled]}
            onPress={handleAddItem}
            disabled={adding}
            activeOpacity={0.85}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.addBtnIconBox}>
                  <Icon name="add" size={rfs(14)} color={colors.primary} />
                </View>
                <Text style={styles.addBtnText}>Add to List</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* ════════════════════════
            ITEMS LIST
        ════════════════════════ */}
        {vm.items.length > 0 && (
          <>
            <SectionLabel
              icon="list-outline"
              label={`ITEMS (${vm.items.length})`}
            />
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

        {/* ════════════════════════
            TOTALS
        ════════════════════════ */}
        {vm.items.length > 0 && (
          <View style={styles.totalsCard}>
            <TotalRow label="Subtotal" value={`₹${subtotal}`} />
            <TotalRow
              label="Paid"
              value={`₹${Math.max(0, paid)}`}
              color="#5B9E6D"
            />
            <View style={styles.totalsDivider} />
            <TotalRow
              label="Due"
              value={`₹${due}`}
              color={due > 0 ? colors.accent : '#5B9E6D'}
              large
            />
          </View>
        )}

        {/* ── Save button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, vm.saving && styles.saveBtnDisabled]}
          onPress={handleSavePress}
          disabled={vm.saving}
          activeOpacity={0.85}
        >
          {vm.saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.saveIconBox}>
                <Icon name="checkmark-outline" size={rfs(15)} color={colors.primary} />
              </View>
              <Text style={styles.saveBtnText}>Save Purchase</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </AppHeaderLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Back pill ────────────────────────────────────────
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(7),
  },

  backPillText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Scroll ───────────────────────────────────────────
  scroll: { flex: 1 },

  content: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Section label ─────────────────────────────────────
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
    marginTop: rvs(2),
  },

  sectionBar: {
    width: rs(3),
    height: rvs(14),
    backgroundColor: colors.accent,
    borderRadius: rs(2),
    flexShrink: 0,
  },

  sectionLabelText: {
    fontSize: rfs(10),
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.9,
  },

  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },

  // ── Payment chips ─────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    gap: rs(8),
  },

  chip: {
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingVertical: rvs(8),
    paddingHorizontal: rs(16),
    borderRadius: rs(20),
    backgroundColor: '#FFFFFF',
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    fontSize: rfs(12),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  // ── Paid amount input ─────────────────────────────────
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
    overflow: 'hidden',
    height: rvs(48),
  },

  inputIconBox: {
    width: rs(44),
    height: '100%',
    backgroundColor: 'rgba(45,74,82,0.05)',
    borderRightWidth: 1,
    borderRightColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: rs(12),
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // ── Add item card ─────────────────────────────────────
  addItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    padding: rs(14),
    gap: rvs(10),
  },

  // Barcode row
  barcodeRow: {
    flexDirection: 'row',
    gap: rs(10),
    alignItems: 'center',
  },

  barcodeInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: colors.borderCard,
    height: rvs(44),
    overflow: 'hidden',
  },

  barcodeIcon: {
    marginLeft: rs(10),
    marginRight: rs(6),
  },

  barcodeInput: {
    flex: 1,
    height: '100%',
    paddingRight: rs(10),
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textPrimary,
  },

  scanBtn: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 0.25,
    shadowRadius: rs(6),
    elevation: 3,
    flexShrink: 0,
  },

  // Qty + Rate row
  qtyRateRow: {
    flexDirection: 'row',
    gap: rs(10),
  },

  qtyRateField: {
    flex: 1,
    gap: rvs(5),
  },

  fieldLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  smallInputWrap: {
    backgroundColor: colors.background,
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: colors.borderCard,
    height: rvs(42),
    justifyContent: 'center',
  },

  smallInput: {
    flex: 1,
    paddingHorizontal: rs(12),
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    backgroundColor: colors.primary,
    paddingVertical: rvs(12),
    borderRadius: rs(12),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 0.22,
    shadowRadius: rs(8),
    elevation: 3,
  },

  addBtnIconBox: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(6),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addBtnDisabled: { opacity: 0.6 },

  addBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Create supplier link ──────────────────────────────
  createSupplierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    marginTop: rvs(-4),
  },

  createSupplierIconBox: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(6),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createSupplierText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.primary,
  },

  // ── Totals card ───────────────────────────────────────
  totalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
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
    backgroundColor: colors.borderCard,
  },

  totalLabel: {
    fontSize: rfs(12),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  totalLabelLarge: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  totalValue: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  totalValueLarge: {
    fontSize: rfs(17),
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  // ── Save button ───────────────────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    paddingVertical: rvs(15),
    borderRadius: rs(14),
    marginTop: rvs(4),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.28,
    shadowRadius: rs(12),
    elevation: 5,
  },

  saveIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtnDisabled: { opacity: 0.6 },

  saveBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

});
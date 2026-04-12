import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import useInventoryViewModel from '../viewmodels/InventoryViewModel';
import AppHeaderLayout from '../components/AppHeaderLayout';
import HeaderBackButton from '../components/HeaderBackButton';
import ConfirmActionModal from '../components/ConfirmActionModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Field label ─────────────────────────────────────────────────────────────
const FieldLabel = ({ icon, label }) => (
  <View style={styles.fieldLabel}>
    <Icon name={icon} size={rfs(12)} color={colors.textSecondary} />
    <Text style={styles.fieldLabelText}>{label}</Text>
  </View>
);

// ─── Loading state ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
    <Text style={styles.stateTitle}>Loading inventory…</Text>
    <Text style={styles.stateSub}>Fetching product details</Text>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onBack }) => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <Icon name="cube-outline" size={rfs(34)} color={colors.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>Not in inventory</Text>
    <Text style={styles.stateSub}>This product has no inventory record.</Text>
    <TouchableOpacity style={styles.stateBtn} onPress={onBack} activeOpacity={0.8}>
      <Icon name="arrow-back-outline" size={rfs(15)} color="#FFFFFF" />
      <Text style={styles.stateBtnText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// ─── Delete button — passed as rightComponent ─────────────────────────────────
const DeleteButton = ({ onPress }) => (
  <TouchableOpacity style={styles.deleteHeaderBtn} onPress={onPress} activeOpacity={0.75}>
    <Icon name="trash-outline" size={rfs(16)} color="#E05252" />
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const UpdateInventoryScreen = ({ navigation, route }) => {
  const { barcode } = route.params || {};
  const vm = useInventoryViewModel();

  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [product, setProduct]             = useState(null);
  const [inventory, setInventory]         = useState(null);
  const [sellingPrice, setSellingPrice]   = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [stock, setStock]                 = useState('');
  const [expiry, setExpiry]               = useState('');

  // ── Modal state ──
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [saveModal, setSaveModal]     = useState(false);

  useEffect(() => {
    const owner  = vm.owner;
    const shopId = vm.shopId;

    if (!barcode || !owner || owner.role !== 'OWNER' || !shopId) {
      Alert.alert('Error', 'Only owners with a shop can update inventory.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { product: prod, inventory: inv } = await vm.loadInventoryForBarcode({ barcode });
        if (cancelled) return;

        if (!inv) {
          Alert.alert(
            'Not in inventory',
            'This product is not in your inventory.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }

        setProduct(prod);
        setInventory(inv);
        setSellingPrice(inv.sellingPrice != null ? String(inv.sellingPrice) : '');
        setPurchasePrice(inv.purchasePrice != null ? String(inv.purchasePrice) : '');
        setStock(inv.stock != null ? String(inv.stock) : '');
        setExpiry(inv.expiry || '');
      } catch (e) {
        if (!cancelled) {
          Alert.alert('Error', e?.message || 'Failed to load inventory.');
          navigation.goBack();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [barcode]);

  // ── Save flow: button → modal → confirm ──────────────────────────────────
  const handleSavePress = () => setSaveModal(true);

  const handleSaveConfirm = async () => {
    setSaveModal(false);
    setSaving(true);
    try {
      await vm.saveInventoryUpdate({ inventory, sellingPrice, purchasePrice, stock, expiry });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update inventory.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete flow ───────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await vm.deleteInventory({ barcode: inventory.barcode });
      setDeleteModal(false);
      navigation.goBack();
    } catch (e) {
      setDeleteModal(false);
      Alert.alert('Error', e?.message || 'Failed to delete inventory item.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived display values ──
  const effectiveProductName = product?.name || '—';
  const effectiveBarcode     = product?.barcode || inventory?.barcode || barcode;
  const mrp                  = product?.mrp != null ? `₹${product.mrp}` : '—';
  const currentStock         = inventory?.stock ?? 0;

  const stockStatus = (() => {
    const s = Number(currentStock);
    if (s === 0) return { color: '#E05252', label: 'Out of stock' };
    if (s <= 10) return { color: colors.accent, label: 'Low stock' };
    return            { color: '#5B9E6D',  label: 'In stock' };
  })();

  // ── Shared header props ──
  const headerLeft  = <HeaderBackButton onPress={() => navigation.goBack()} />;
  const headerRight = inventory
    ? <DeleteButton onPress={() => setDeleteModal(true)} />
    : null;

  // ── Loading ──
  if (loading) {
    return (
      <AppHeaderLayout title="Update Inventory" leftComponent={headerLeft}>
        <LoadingState />
      </AppHeaderLayout>
    );
  }

  // ── Empty ──
  if (!inventory) {
    return (
      <AppHeaderLayout title="Update Inventory" leftComponent={headerLeft}>
        <EmptyState onBack={() => navigation.goBack()} />
      </AppHeaderLayout>
    );
  }

  // ── Main ──
  return (
    <AppHeaderLayout
      title="Update Inventory"
      subtitle={effectiveProductName}
      leftComponent={headerLeft}
      rightComponent={headerRight}
    >

      {/* ── Save confirm modal ── */}
      <ConfirmActionModal
        visible={saveModal}
        variant="success"
        icon="checkmark-circle-outline"
        title="Save Changes?"
        message="This will update the selling price, purchase price, stock and expiry for this product."
        confirmLabel="Yes, Update"
        confirmIcon="checkmark-outline"
        itemPill={{ icon: 'cube-outline', label: effectiveProductName }}
        loading={saving}
        onCancel={() => setSaveModal(false)}
        onConfirm={handleSaveConfirm}
      />

      {/* ── Delete confirm modal ── */}
      <ConfirmActionModal
        visible={deleteModal}
        variant="danger"
        icon="trash-outline"
        title="Delete from Inventory?"
        message="This will permanently remove the product from your inventory. This action cannot be undone."
        confirmLabel="Yes, Delete"
        confirmIcon="trash-outline"
        item={inventory ? { ...inventory, name: effectiveProductName } : null}
        loading={deleting}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Product info card ── */}
        <View style={styles.sectionLabel}>
          <Icon name="information-circle-outline" size={rfs(13)} color={colors.textSecondary} />
          <Text style={styles.sectionLabelText}>PRODUCT INFO</Text>
        </View>

        <View style={styles.productCard}>
          <View style={styles.productStripe} />
          <View style={styles.productCardInner}>

            <View style={styles.productTopRow}>
              <View style={styles.productIconWrap}>
                <Icon name="cube-outline" size={rfs(20)} color={colors.primary} />
              </View>
              <View style={styles.productNameBlock}>
                <Text style={styles.productName} numberOfLines={2}>
                  {effectiveProductName}
                </Text>
                <Text style={styles.productBarcode}>{effectiveBarcode}</Text>
              </View>
            </View>

            <View style={styles.productDivider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>MRP</Text>
                <Text style={styles.infoValue}>{mrp}</Text>
              </View>
              <View style={styles.infoCellDivider} />
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>Stock</Text>
                <Text style={[styles.infoValue, { color: stockStatus.color }]}>
                  {currentStock}
                </Text>
              </View>
              <View style={styles.infoCellDivider} />
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, styles.infoValueSm, { color: stockStatus.color }]}>
                  {stockStatus.label}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* ── Edit section ── */}
        <View style={[styles.sectionLabel, { marginTop: rvs(18) }]}>
          <Icon name="create-outline" size={rfs(13)} color={colors.textSecondary} />
          <Text style={styles.sectionLabelText}>EDIT INVENTORY</Text>
        </View>

        {/* Selling price */}
        <View style={styles.inputCard}>
          <FieldLabel icon="pricetag-outline" label="Selling Price (₹)" />
          <TextInput
            style={styles.input}
            value={sellingPrice}
            onChangeText={setSellingPrice}
            keyboardType="decimal-pad"
            placeholder="Enter selling price"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Purchase price */}
        <View style={styles.inputCard}>
          <FieldLabel icon="cart-outline" label="Purchase Price (₹)" />
          <TextInput
            style={styles.input}
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="decimal-pad"
            placeholder="Enter purchase price"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Stock */}
        <View style={styles.inputCard}>
          <FieldLabel icon="layers-outline" label="Stock Quantity" />
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            placeholder="Enter stock quantity"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Expiry */}
        <View style={styles.inputCard}>
          <FieldLabel icon="calendar-outline" label="Expiry Date (optional)" />
          <TextInput
            style={styles.input}
            value={expiry}
            onChangeText={setExpiry}
            placeholder="YYYY-MM-DD  e.g. 2026-05-01"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* ── Save button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.saveIconBox}>
                <Icon name="checkmark-outline" size={rfs(15)} color={colors.primary} />
              </View>
              <Text style={styles.saveBtnText}>Update Inventory</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

    </AppHeaderLayout>
  );
};

export default UpdateInventoryScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Delete header button ─────────────────────────────────
  deleteHeaderBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: 'rgba(224,82,82,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll body ──────────────────────────────────────────
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(18),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Section label ────────────────────────────────────────
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    marginBottom: rvs(2),
  },

  sectionLabelText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },

  // ── Product info card ────────────────────────────────────
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  productStripe: {
    width: rs(3),
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  productCardInner: {
    flex: 1,
    padding: rs(14),
    gap: rvs(12),
  },

  productTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },

  productIconWrap: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  productNameBlock: {
    flex: 1,
    gap: rvs(3),
  },

  productName: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  productBarcode: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },

  productDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },

  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoCell: {
    flex: 1,
    alignItems: 'center',
    gap: rvs(3),
  },

  infoCellDivider: {
    width: StyleSheet.hairlineWidth,
    height: rvs(28),
    backgroundColor: colors.borderCard,
  },

  infoLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  infoValue: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  infoValueSm: {
    fontSize: rfs(11),
  },

  // ── Input cards ──────────────────────────────────────────
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
    paddingHorizontal: rs(14),
    paddingTop: rvs(12),
    paddingBottom: rvs(4),
  },

  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    marginBottom: rvs(6),
  },

  fieldLabelText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  input: {
    fontSize: rfs(15),
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: rvs(10),
    padding: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderCard,
  },

  // ── Save button ──────────────────────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    borderRadius: rs(14),
    paddingVertical: rvs(15),
    marginTop: rvs(6),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
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

  saveBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  saveBtnDisabled: {
    opacity: 0.6,
  },

  // ── Loading / empty states ───────────────────────────────
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(32),
    gap: rvs(10),
  },

  stateIconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(20),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },

  stateTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  stateSub: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 4,
  },

  stateBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});
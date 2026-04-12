import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtom } from 'jotai';
import { inventoryFormAtom } from '../atoms/forms';
import useInventoryViewModel from '../viewmodels/InventoryViewModel';
import { colors } from '../theme/colors';
import AppHeaderLayout from '../components/AppHeaderLayout';
import HeaderBackButton from '../components/HeaderBackButton';
import ConfirmActionModal from '../components/ConfirmActionModal';
import FormInputField from '../components/FormInputField';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Product hero card ────────────────────────────────────────────────────────
// Dark teal background — visually continues from the header, distinct from
// every other white card on every other screen.
const ProductHeroCard = ({ product, barcode }) => {
  const metaFields = [
    product?.category && { icon: 'grid-outline',     label: product.category },
    product?.brand    && { icon: 'business-outline',  label: product.brand },
    product?.unit     && { icon: 'scale-outline',     label: product.unit },
    product?.gstPercent != null && { icon: 'receipt-outline', label: `GST ${product.gstPercent}%` },
  ].filter(Boolean);

  return (
    <View style={styles.heroCard}>

      {/* Top row: icon + name + MRP */}
      <View style={styles.heroTop}>
        <View style={styles.heroIconBox}>
          <Icon name="cube-outline" size={rfs(22)} color="#FFFFFF" />
        </View>
        <View style={styles.heroNameBlock}>
          <Text style={styles.heroName} numberOfLines={2}>
            {product?.name || '—'}
          </Text>
          <View style={styles.heroBarcodeRow}>
            <Icon name="barcode-outline" size={rfs(11)} color="rgba(255,255,255,0.55)" />
            <Text style={styles.heroBarcode}>{barcode || '—'}</Text>
          </View>
        </View>
        {product?.mrp != null && (
          <View style={styles.heroMrpBox}>
            <Text style={styles.heroMrpLabel}>MRP</Text>
            <Text style={styles.heroMrpValue}>₹{product.mrp}</Text>
          </View>
        )}
      </View>

      {/* Meta chips row */}
      {metaFields.length > 0 && (
        <>
          <View style={styles.heroDivider} />
          <View style={styles.heroChipsRow}>
            {metaFields.map((m, i) => (
              <View key={i} style={styles.heroChip}>
                <Icon name={m.icon} size={rfs(11)} color="rgba(255,255,255,0.70)" />
                <Text style={styles.heroChipText}>{m.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

    </View>
  );
};

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ icon, label }) => (
  <View style={styles.sectionLabelRow}>
    <View style={styles.sectionAccentBar} />
    <Icon name={icon} size={rfs(12)} color={colors.accent} />
    <Text style={styles.sectionLabelText}>{label}</Text>
  </View>
);

// ─── Price row — two inputs side by side ──────────────────────────────────────
const PriceRow = ({ children }) => (
  <View style={styles.priceRow}>{children}</View>
);

// ─── Margin pill — live feedback ──────────────────────────────────────────────
const MarginPill = ({ sell, purchase }) => {
  const s = parseFloat(sell) || 0;
  const p = parseFloat(purchase) || 0;
  if (!s || !p) return null;

  const margin    = s - p;
  const pct       = ((margin / p) * 100).toFixed(1);
  const positive  = margin >= 0;
  const col       = positive ? '#5B9E6D' : '#E05252';
  const bg        = positive ? 'rgba(91,158,109,0.10)' : 'rgba(224,82,82,0.10)';
  const border    = positive ? 'rgba(91,158,109,0.25)' : 'rgba(224,82,82,0.25)';

  return (
    <View style={[styles.marginPill, { backgroundColor: bg, borderColor: border }]}>
      <Icon
        name={positive ? 'trending-up-outline' : 'trending-down-outline'}
        size={rfs(12)}
        color={col}
      />
      <Text style={[styles.marginPillText, { color: col }]}>
        Margin  ₹{margin.toFixed(2)}  ·  {pct}%
      </Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const InventoryFormScreen = ({ navigation, route }) => {
  const { barcode, product, returnToBillingScanner } = route.params || {};
  const vm  = useInventoryViewModel();
  const [form, setForm] = useAtom(inventoryFormAtom);
  const mrp = product?.mrp ?? 0;

  const [confirmModal, setConfirmModal] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});

  useEffect(() => {
    vm.initAddForm({ mrp });
    setFieldErrors({});
  }, [barcode, mrp]);

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!form.sellingPrice)  errs.sellingPrice  = 'Required';
    if (!form.purchasePrice) errs.purchasePrice = 'Required';
    if (!form.stock)         errs.stock         = 'Required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save press → modal ──
  const handleSavePress = () => {
    if (!validate()) return;
    setConfirmModal(true);
  };

  // ── Modal confirmed → actual save ──
  const handleSaveConfirm = async () => {
    setConfirmModal(false);
    setForm((prev) => ({ ...prev, saving: true }));
    try {
      await vm.saveNewInventory({ barcode });
      if (returnToBillingScanner) {
        Alert.alert(
          'Success',
          'Inventory updated. Scan this barcode again on the billing screen to add it to the bill.',
          [{ text: 'OK', onPress: () => navigation.pop(2) }]
        );
      } else {
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save inventory.');
    } finally {
      setForm((prev) => ({ ...prev, saving: false }));
    }
  };

  const headerLeft = <HeaderBackButton onPress={() => navigation.goBack()} />;

  return (
    <AppHeaderLayout
      title="Add to Inventory"
      subtitle={product?.name || 'New entry'}
      leftComponent={headerLeft}
    >

      {/* ── Confirm modal ── */}
      <ConfirmActionModal
        visible={confirmModal}
        variant="success"
        icon="layers-outline"
        title="Add to Inventory?"
        message="This will create a new inventory entry for this product in your shop."
        confirmLabel="Yes, Add"
        confirmIcon="add-circle-outline"
        itemPill={{ icon: 'cube-outline', label: product?.name || 'Product' }}
        loading={form.saving}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleSaveConfirm}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Product hero card ── */}
        <ProductHeroCard product={product} barcode={barcode} />

        {/* ════════════════════════════════════
            PRICING
        ════════════════════════════════════ */}
        <SectionLabel icon="pricetag-outline" label="PRICING" />

        <View style={styles.fieldsCard}>

          <PriceRow>
            <View style={styles.priceCol}>
              <FormInputField
                label="Selling Price (₹)"
                required
                icon="storefront-outline"
                value={form.sellingPrice}
                onChangeText={(v) => {
                  setForm((p) => ({ ...p, sellingPrice: v }));
                  if (fieldErrors.sellingPrice) setFieldErrors((e) => ({ ...e, sellingPrice: null }));
                }}
                keyboardType="decimal-pad"
                placeholder="10"
                error={fieldErrors.sellingPrice}
              />
            </View>
            <View style={styles.priceCol}>
              <FormInputField
                label="Purchase Price (₹)"
                required
                icon="cart-outline"
                value={form.purchasePrice}
                onChangeText={(v) => {
                  setForm((p) => ({ ...p, purchasePrice: v }));
                  if (fieldErrors.purchasePrice) setFieldErrors((e) => ({ ...e, purchasePrice: null }));
                }}
                keyboardType="decimal-pad"
                placeholder="8"
                error={fieldErrors.purchasePrice}
              />
            </View>
          </PriceRow>

          {/* Live margin pill */}
          <MarginPill sell={form.sellingPrice} purchase={form.purchasePrice} />

        </View>

        {/* ════════════════════════════════════
            STOCK
        ════════════════════════════════════ */}
        <SectionLabel icon="layers-outline" label="STOCK" />

        <View style={styles.fieldsCard}>

          <PriceRow>
            <View style={styles.priceCol}>
              <FormInputField
                label="Opening Stock"
                required
                icon="layers-outline"
                value={form.stock}
                onChangeText={(v) => {
                  setForm((p) => ({ ...p, stock: v }));
                  if (fieldErrors.stock) setFieldErrors((e) => ({ ...e, stock: null }));
                }}
                keyboardType="number-pad"
                placeholder="50"
                error={fieldErrors.stock}
              />
            </View>
            <View style={styles.priceCol}>
              <FormInputField
                label="Expiry (optional)"
                icon="calendar-outline"
                value={form.expiry}
                onChangeText={(v) => setForm((p) => ({ ...p, expiry: v }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </PriceRow>

        </View>

        {/* ── MRP reference strip ── */}
        {mrp > 0 && (
          <View style={styles.mrpStrip}>
            <Icon name="information-circle-outline" size={rfs(13)} color={colors.textSecondary} />
            <Text style={styles.mrpStripText}>
              MRP for this product is{' '}
              <Text style={styles.mrpStripBold}>₹{mrp}</Text>
              {' '}— selling price should not exceed it.
            </Text>
          </View>
        )}

        {/* ── Save button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, form.saving && styles.saveBtnDisabled]}
          onPress={handleSavePress}
          activeOpacity={0.85}
          disabled={form.saving}
        >
          {form.saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.saveIconBox}>
                <Icon name="add-circle-outline" size={rfs(16)} color={colors.primary} />
              </View>
              <Text style={styles.saveBtnText}>Add to Inventory</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

    </AppHeaderLayout>
  );
};

export default InventoryFormScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Scroll ───────────────────────────────────────────────
  scroll: { flex: 1 },

  scrollContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Product hero card ─────────────────────────────────────
  // Dark teal — distinct from every white card on the app.
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: rs(18),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(16),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(6) },
    shadowOpacity: 0.30,
    shadowRadius: rs(16),
    elevation: 6,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(12),
  },

  heroIconBox: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(14),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  heroNameBlock: {
    flex: 1,
    gap: rvs(4),
  },

  heroName: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
    lineHeight: rfs(22),
  },

  heroBarcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },

  heroBarcode: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },

  heroMrpBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: rs(10),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(6),
    flexShrink: 0,
  },

  heroMrpLabel: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.60)',
    letterSpacing: 0.8,
  },

  heroMrpValue: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: rvs(12),
  },

  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(6),
  },

  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(4),
  },

  heroChipText: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.80)',
  },

  // ── Section label ─────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
    marginTop: rvs(4),
  },

  sectionAccentBar: {
    width: rs(3),
    height: rvs(14),
    backgroundColor: colors.accent,
    borderRadius: rs(2),
  },

  sectionLabelText: {
    fontSize: rfs(10),
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.9,
  },

  // ── Fields card ───────────────────────────────────────────
  fieldsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(16),
    gap: rvs(10),
  },

  // ── Two-column price row ──────────────────────────────────
  priceRow: {
    flexDirection: 'row',
    gap: rs(10),
  },

  priceCol: {
    flex: 1,
  },

  // ── Live margin pill ──────────────────────────────────────
  marginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(5),
  },

  marginPillText: {
    fontSize: rfs(11),
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── MRP reference strip ───────────────────────────────────
  mrpStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(7),
    backgroundColor: 'rgba(45,74,82,0.05)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(10),
  },

  mrpStripText: {
    flex: 1,
    fontSize: rfs(12),
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: rfs(17),
  },

  mrpStripBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // ── Save button ───────────────────────────────────────────
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    borderRadius: rs(14),
    paddingVertical: rvs(15),
    marginTop: rvs(4),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
    shadowRadius: rs(12),
    elevation: 5,
  },

  saveIconBox: {
    width: rs(28),
    height: rs(28),
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

});
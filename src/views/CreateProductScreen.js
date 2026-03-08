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
import { useAtomValue, useAtom } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { createProductFormAtom, defaultCreateProductForm } from '../atoms/forms';
import { createProduct } from '../services/productService';
import { setInventoryItem } from '../services/inventoryService';
import { colors } from '../theme/colors';
import AppHeaderLayout from '../components/AppHeaderLayout';
import ConfirmActionModal from '../components/ConfirmActionModal';
import CategoryDropdown from '../components/CategoryDropdown';
import UnitDropdown from '../components/UnitDropdown';
import FormInputField from '../components/FormInputField';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Field icon map ───────────────────────────────────────────────────────────
const FIELD_ICONS = {
  name:          'cube-outline',
  brand:         'business-outline',
  mrp:           'pricetag-outline',
  gstPercent:    'receipt-outline',
  sellingPrice:  'storefront-outline',
  purchasePrice: 'cart-outline',
  stock:         'layers-outline',
  expiry:        'calendar-outline',
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, label, accent }) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIconBox, accent && styles.sectionIconBoxAccent]}>
      <Icon
        name={icon}
        size={rfs(14)}
        color={accent ? colors.accent : colors.primary}
      />
    </View>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ─── Back pill ────────────────────────────────────────────────────────────────
const BackPill = ({ onPress }) => (
  <TouchableOpacity style={styles.backPill} onPress={onPress} activeOpacity={0.75}>
    <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
    <Text style={styles.backPillText}>Back</Text>
  </TouchableOpacity>
);

// ─── Barcode badge ────────────────────────────────────────────────────────────
const BarcodeBadge = ({ barcode }) => (
  <View style={styles.barcodeBadge}>
    <View style={styles.barcodeIconBox}>
      <Icon name="barcode-outline" size={rfs(16)} color={colors.primary} />
    </View>
    <View style={styles.barcodeTextBlock}>
      <Text style={styles.barcodeLabel}>SCANNED BARCODE</Text>
      <Text style={styles.barcodeValue}>{barcode || '—'}</Text>
    </View>
    <View style={styles.barcodeStatusDot} />
  </View>
);

// ─── Dropdown row wrapper (label + dropdown in same gap system) ───────────────
const DropdownRow = ({ label, required, children, error }) => (
  <View style={styles.dropdownRowWrap}>
    <View style={styles.labelRow}>
      <Text style={[styles.dropLabel, error && styles.dropLabelError]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {error && (
        <View style={styles.errorPill}>
          <Icon name="alert-circle-outline" size={rfs(10)} color="#E05252" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CreateProductScreen = ({ navigation, route }) => {
  const { barcode } = route.params || {};
  const owner = useAtomValue(currentOwnerAtom);
  const [form, setForm] = useAtom(createProductFormAtom);
  const [confirmModal, setConfirmModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setForm({ ...defaultCreateProductForm });
    setFieldErrors({});
  }, [barcode]);

  const mrpNum = parseFloat(form.mrp) || 0;

  const handleMrpChange = (v) => {
    setForm((prev) => {
      const next = { ...prev, mrp: v };
      if (!prev.sellingPrice || prev.sellingPrice === String(parseFloat(prev.mrp) || 0)) {
        next.sellingPrice = v;
      }
      return next;
    });
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name = 'Required';
    if (!form.category)     errs.category = 'Required';
    if (!form.mrp)          errs.mrp = 'Required';
    if (!form.gstPercent && form.gstPercent !== '0') errs.gstPercent = 'Required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save button tapped → show confirm modal ──
  const handleSavePress = () => {
    if (!barcode || !owner?.shopId || !owner?.id) {
      Alert.alert('Error', 'Missing barcode or shop.');
      return;
    }
    if (!validate()) return;
    setConfirmModal(true);
  };

  // ── Modal confirmed → actual save ──
  const handleSaveConfirm = async () => {
    setConfirmModal(false);
    setForm((prev) => ({ ...prev, saving: true }));
    try {
      const mrpVal      = parseFloat(form.mrp) || 0;
      const gstVal      = parseFloat(form.gstPercent) || 0;
      const sellVal     = parseFloat(form.sellingPrice) || mrpVal;
      const purchaseVal = parseFloat(form.purchasePrice) || 0;
      const stockVal    = parseInt(form.stock, 10) || 0;

      await createProduct({
        barcode,
        name:       form.name.trim(),
        category:   form.category,
        brand:      form.brand.trim(),
        unit:       form.unit,
        mrp:        mrpVal,
        gstPercent: gstVal,
        createdBy:  owner.id,
      });

      await setInventoryItem(owner.shopId, {
        barcode,
        sellingPrice:  sellVal,
        purchasePrice: purchaseVal,
        stock:         stockVal,
        expiry:        (form.expiry || '').trim(),
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setForm((prev) => ({ ...prev, saving: false }));
    }
  };

  const headerLeft = <BackPill onPress={() => navigation.goBack()} />;

  return (
    <AppHeaderLayout
      title="Create Product"
      subtitle="New product + inventory"
      leftComponent={headerLeft}
    >

      {/* ── Confirm modal ── */}
      <ConfirmActionModal
        visible={confirmModal}
        variant="success"
        icon="checkmark-circle-outline"
        title="Create Product?"
        message="This will add the product to the global catalogue and set up inventory for your shop."
        confirmLabel="Yes, Create"
        confirmIcon="add-circle-outline"
        itemPill={{ icon: 'cube-outline', label: form.name.trim() || 'New Product' }}
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

        {/* ── Barcode badge ── */}
        <BarcodeBadge barcode={barcode} />

        {/* ══════════════════════════════════════════
            SECTION 1 — PRODUCT DETAILS (global)
        ══════════════════════════════════════════ */}
        <SectionHeader
          icon="cube-outline"
          label="PRODUCT DETAILS"
        />

        <View style={styles.card}>

          <FormInputField
            label="Product Name"
            required
            icon={FIELD_ICONS.name}
            value={form.name}
            onChangeText={(v) => {
              setForm((prev) => ({ ...prev, name: v }));
              if (fieldErrors.name) setFieldErrors((e) => ({ ...e, name: null }));
            }}
            placeholder="e.g. Balaji Cream & Onion Wafer"
            error={fieldErrors.name}
          />

          {/* Divider */}
          <View style={styles.fieldDivider} />

          <DropdownRow label="Category" required error={fieldErrors.category}>
            <CategoryDropdown
              value={form.category}
              onChange={(cat) => {
                setForm((prev) => ({ ...prev, category: cat }));
                if (fieldErrors.category) setFieldErrors((e) => ({ ...e, category: null }));
              }}
              error={fieldErrors.category}
            />
          </DropdownRow>

          <View style={styles.fieldDivider} />

          <FormInputField
            label="Brand"
            icon={FIELD_ICONS.brand}
            value={form.brand}
            onChangeText={(v) => setForm((prev) => ({ ...prev, brand: v }))}
            placeholder="e.g. Balaji"
          />

          <View style={styles.fieldDivider} />

          <DropdownRow label="Unit">
            <UnitDropdown
              value={form.unit}
              onChange={(unit) => setForm((prev) => ({ ...prev, unit }))}
            />
          </DropdownRow>

          <View style={styles.fieldDivider} />

          {/* MRP + GST side by side */}
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FormInputField
                label="MRP (₹)"
                required
                icon={FIELD_ICONS.mrp}
                value={form.mrp}
                onChangeText={(v) => {
                  handleMrpChange(v);
                  if (fieldErrors.mrp) setFieldErrors((e) => ({ ...e, mrp: null }));
                }}
                keyboardType="decimal-pad"
                placeholder="10"
                error={fieldErrors.mrp}
              />
            </View>
            <View style={styles.colHalf}>
              <FormInputField
                label="GST %"
                required
                icon={FIELD_ICONS.gstPercent}
                value={form.gstPercent}
                onChangeText={(v) => {
                  setForm((prev) => ({ ...prev, gstPercent: v }));
                  if (fieldErrors.gstPercent) setFieldErrors((e) => ({ ...e, gstPercent: null }));
                }}
                keyboardType="decimal-pad"
                placeholder="5"
                error={fieldErrors.gstPercent}
              />
            </View>
          </View>

        </View>

        {/* ══════════════════════════════════════════
            SECTION 2 — INVENTORY (this shop)
        ══════════════════════════════════════════ */}
        <SectionHeader
          icon="storefront-outline"
          label="INVENTORY FOR THIS SHOP"
          accent
        />

        <View style={styles.card}>

          {/* Selling + Purchase side by side */}
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FormInputField
                label="Selling Price (₹)"
                icon={FIELD_ICONS.sellingPrice}
                value={form.sellingPrice}
                onChangeText={(v) => setForm((prev) => ({ ...prev, sellingPrice: v }))}
                keyboardType="decimal-pad"
                placeholder={String(mrpNum)}
              />
            </View>
            <View style={styles.colHalf}>
              <FormInputField
                label="Purchase Price (₹)"
                icon={FIELD_ICONS.purchasePrice}
                value={form.purchasePrice}
                onChangeText={(v) => setForm((prev) => ({ ...prev, purchasePrice: v }))}
                keyboardType="decimal-pad"
                placeholder="8"
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          {/* Stock + Expiry side by side */}
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FormInputField
                label="Opening Stock"
                icon={FIELD_ICONS.stock}
                value={form.stock}
                onChangeText={(v) => setForm((prev) => ({ ...prev, stock: v }))}
                keyboardType="number-pad"
                placeholder="50"
              />
            </View>
            <View style={styles.colHalf}>
              <FormInputField
                label="Expiry (optional)"
                icon={FIELD_ICONS.expiry}
                value={form.expiry}
                onChangeText={(v) => setForm((prev) => ({ ...prev, expiry: v }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

        </View>

        {/* ── Margin hint ── */}
        {mrpNum > 0 && parseFloat(form.purchasePrice) > 0 && (
          <MarginHint mrp={mrpNum} purchase={parseFloat(form.purchasePrice)} sell={parseFloat(form.sellingPrice) || mrpNum} />
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
              <Text style={styles.saveBtnText}>Create Product</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

    </AppHeaderLayout>
  );
};

// ─── Margin hint card ─────────────────────────────────────────────────────────
const MarginHint = ({ mrp, purchase, sell }) => {
  const margin     = sell - purchase;
  const marginPct  = purchase > 0 ? ((margin / purchase) * 100).toFixed(1) : '0';
  const isPositive = margin >= 0;
  const col        = isPositive ? '#5B9E6D' : '#E05252';
  const icon       = isPositive ? 'trending-up-outline' : 'trending-down-outline';

  return (
    <View style={[styles.marginCard, { borderColor: isPositive ? 'rgba(91,158,109,0.25)' : 'rgba(224,82,82,0.25)' }]}>
      <View style={[styles.marginIconBox, { backgroundColor: isPositive ? 'rgba(91,158,109,0.10)' : 'rgba(224,82,82,0.10)' }]}>
        <Icon name={icon} size={rfs(15)} color={col} />
      </View>
      <View style={styles.marginTextBlock}>
        <Text style={styles.marginLabel}>MARGIN</Text>
        <Text style={[styles.marginValue, { color: col }]}>
          ₹{margin.toFixed(2)}  ·  {marginPct}%
        </Text>
      </View>
      <Text style={[styles.marginBadge, { color: col, backgroundColor: isPositive ? 'rgba(91,158,109,0.08)' : 'rgba(224,82,82,0.08)' }]}>
        {isPositive ? 'Profit' : 'Loss'}
      </Text>
    </View>
  );
};

export default CreateProductScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Back pill ────────────────────────────────────────────
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

  // ── Scroll ───────────────────────────────────────────────
  scroll: { flex: 1 },

  scrollContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(48),
    gap: rvs(12),
  },

  // ── Barcode badge ────────────────────────────────────────
  barcodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(12),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  barcodeIconBox: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(10),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  barcodeTextBlock: {
    flex: 1,
    gap: rvs(2),
  },

  barcodeLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },

  barcodeValue: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },

  barcodeStatusDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: '#5B9E6D',
    flexShrink: 0,
  },

  // ── Section header ───────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    marginTop: rvs(4),
  },

  sectionIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(7),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  sectionIconBoxAccent: {
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderColor: 'rgba(245,166,35,0.20)',
  },

  sectionLabel: {
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

  // ── Card container ───────────────────────────────────────
  card: {
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
    gap: rvs(0),
  },

  // ── Field divider ────────────────────────────────────────
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(14),
  },

  // ── Two column layout ────────────────────────────────────
  twoCol: {
    flexDirection: 'row',
    gap: rs(10),
  },

  colHalf: {
    flex: 1,
  },

  // ── Dropdown row wrapper ─────────────────────────────────
  dropdownRowWrap: {
    gap: rvs(6),
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropLabel: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  dropLabelError: {
    color: '#E05252',
  },

  required: {
    color: colors.accent,
    fontWeight: '800',
  },

  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(3),
  },

  errorText: {
    fontSize: rfs(10),
    color: '#E05252',
    fontWeight: '500',
  },

  // ── Margin hint card ─────────────────────────────────────
  marginCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(12),
  },

  marginIconBox: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  marginTextBlock: {
    flex: 1,
    gap: rvs(2),
  },

  marginLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },

  marginValue: {
    fontSize: rfs(13),
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  marginBadge: {
    fontSize: rfs(11),
    fontWeight: '700',
    paddingHorizontal: rs(10),
    paddingVertical: rvs(4),
    borderRadius: rs(8),
    overflow: 'hidden',
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
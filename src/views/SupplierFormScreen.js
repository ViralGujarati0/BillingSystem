import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import AppHeaderLayout    from '../components/AppHeaderLayout';
import ConfirmActionModal from '../components/ConfirmActionModal';
import FormInputField     from '../components/FormInputField';
import useSupplierViewModel from '../viewmodels/SupplierViewModel';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844; 
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

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
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupplierFormScreen({ navigation, route }) {
  const supplier = route.params?.supplier ?? null;
  const isEdit   = !!supplier;
  const vm       = useSupplierViewModel();

  const [name,           setName]           = useState('');
  const [phone,          setPhone]          = useState('');
  const [address,        setAddress]        = useState('');
  const [gstNumber,      setGstNumber]      = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [saving,         setSaving]         = useState(false);
  const [confirmModal,   setConfirmModal]   = useState(false);
  const [fieldErrors,    setFieldErrors]    = useState({});

  // ── Pre-fill in edit mode ──
  useEffect(() => {
    if (supplier) {
      setName(supplier.name           ?? '');
      setPhone(supplier.phone         ?? '');
      setAddress(supplier.address     ?? '');
      setGstNumber(supplier.gstNumber ?? '');
      setOpeningBalance(String(supplier.openingBalance ?? '0'));
    }
  }, [supplier]);

  // ── Validate → open confirm modal ──
  const handleSavePress = () => {
    const errs = {};
    if (!String(name).trim()) errs.name = 'Required';
    if (!isEdit) {
      const ob = parseFloat(String(openingBalance));
      if (!Number.isFinite(ob) || ob < 0) errs.openingBalance = 'Must be 0 or more';
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setConfirmModal(true);
  };

  // ── Confirmed → actual save ──
  const handleSaveConfirm = async () => {
    setConfirmModal(false);
    setSaving(true);
    try {
      if (isEdit) {
        await vm.updateSupplier(supplier.id, { name, phone, address, gstNumber });
      } else {
        await vm.createSupplier({
          name,
          phone,
          address,
          gstNumber,
          openingBalance: parseFloat(String(openingBalance)) || 0,
        });
      }
      navigation.goBack();
    } catch (err) {
      console.error('[SupplierFormScreen] save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const headerLeft = <BackPill onPress={() => navigation.goBack()} />;

  // ── Derive avatar initial for identity badge ──
  const initial = name.trim() ? name.trim()[0].toUpperCase()
    : supplier?.name ? supplier.name[0].toUpperCase()
    : '?';

  return (
    <AppHeaderLayout
      title={isEdit ? 'Edit Supplier' : 'Add Supplier'}
      subtitle={isEdit ? supplier.name : 'New supplier'}
      leftComponent={headerLeft}
    >

      {/* ── Confirm modal ── */}
      <ConfirmActionModal
        visible={confirmModal}
        variant="success"
        icon="checkmark-circle-outline"
        title={isEdit ? 'Save Changes?' : 'Add Supplier?'}
        message={isEdit
          ? 'This will update the supplier details.'
          : 'This will add a new supplier to your shop.'}
        confirmLabel={isEdit ? 'Yes, Save' : 'Yes, Add'}
        confirmIcon={isEdit ? 'checkmark-outline' : 'add-circle-outline'}
        itemPill={{ icon: 'business-outline', label: name.trim() || 'Supplier' }}
        loading={saving}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleSaveConfirm}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Supplier identity badge ── */}
        <View style={styles.identityBadge}>
          <View style={styles.identityAvatar}>
            <Text style={styles.identityAvatarLetter}>{initial}</Text>
          </View>
          <View style={styles.identityTextBlock}>
            <Text style={styles.identityLabel}>
              {isEdit ? 'EDITING SUPPLIER' : 'NEW SUPPLIER'}
            </Text>
            <Text style={styles.identityName} numberOfLines={1}>
              {name.trim() || (isEdit ? supplier.name : 'Fill in details below')}
            </Text>
          </View>
          {isEdit && (
            <View style={styles.editModeBadge}>
              <Icon name="create-outline" size={rfs(11)} color={colors.accent} />
              <Text style={styles.editModeText}>Edit Mode</Text>
            </View>
          )}
        </View>

        {/* ════════════════════════════
            SUPPLIER DETAILS
        ════════════════════════════ */}
        <SectionLabel icon="business-outline" label="SUPPLIER DETAILS" />

        <View style={styles.card}>

          <FormInputField
            label="Supplier Name"
            required
            icon="business-outline"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (fieldErrors.name) setFieldErrors((e) => ({ ...e, name: null }));
            }}
            placeholder="e.g. Raj Traders"
            error={fieldErrors.name}
          />

          <View style={styles.fieldDivider} />

          <FormInputField
            label="Phone"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
          />

          <View style={styles.fieldDivider} />

          <FormInputField
            label="Address"
            icon="location-outline"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 12, Ring Road, Surat"
          />

          <View style={styles.fieldDivider} />

          <FormInputField
            label="GST Number"
            icon="receipt-outline"
            value={gstNumber}
            onChangeText={setGstNumber}
            placeholder="e.g. 24ABCDE1234F1Z5"
          />

        </View>

        {/* ════════════════════════════
            FINANCIAL — create only
        ════════════════════════════ */}
        {!isEdit && (
          <>
            <SectionLabel icon="wallet-outline" label="FINANCIAL" />

            <View style={styles.card}>
              <FormInputField
                label="Opening Balance (₹)"
                icon="wallet-outline"
                value={openingBalance}
                onChangeText={(v) => {
                  setOpeningBalance(v);
                  if (fieldErrors.openingBalance)
                    setFieldErrors((e) => ({ ...e, openingBalance: null }));
                }}
                placeholder="0"
                keyboardType="decimal-pad"
                error={fieldErrors.openingBalance}
              />
            </View>
          </>
        )}

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
                <Icon
                  name={isEdit ? 'checkmark-outline' : 'add-circle-outline'}
                  size={rfs(15)}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.saveBtnText}>
                {isEdit ? 'Save Changes' : 'Add Supplier'}
              </Text>
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

  scrollContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Identity badge ────────────────────────────────────
  identityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    backgroundColor: colors.primary,
    borderRadius: rs(16),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(14),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.28,
    shadowRadius: rs(12),
    elevation: 5,
  },

  identityAvatar: {
    width: rs(46),
    height: rs(46),
    borderRadius: rs(13),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  identityAvatarLetter: {
    fontSize: rfs(20),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  identityTextBlock: {
    flex: 1,
    gap: rvs(2),
  },

  identityLabel: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.9,
  },

  identityName: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  editModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: rs(20),
    paddingHorizontal: rs(9),
    paddingVertical: rvs(4),
    flexShrink: 0,
  },

  editModeText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
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

  sectionText: {
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

  // ── Fields card ───────────────────────────────────────
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
  },

  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(12),
  },

  // ── Save button ───────────────────────────────────────
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
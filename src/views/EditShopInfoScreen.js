import React, { useEffect, useState } from 'react';
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
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import AppHeaderLayout from '../components/AppHeaderLayout';
import ConfirmActionModal from '../components/ConfirmActionModal';
import ShopForm from '../components/ShopForm';
import { currentOwnerAtom } from '../atoms/owner';
import {
  getShop,
  getShopSettings,
  updateShop,
  updateShopSettings,
} from '../services/shopService';

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

// ─── Loading state ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
    <Text style={styles.stateTitle}>Loading shop info…</Text>
    <Text style={styles.stateSub}>Fetching your shop details</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EditShopInfoScreen({ navigation }) {
  const { t }    = useTranslation();
  const [owner]  = useAtom(currentOwnerAtom);

  const [form, setForm] = useState({
    businessName: '',
    phone:        '',
    address:      '',
    gstNumber:    '',
    billMessage:  '',
    billTerms:    '',
  });

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  // ── Load ──
  useEffect(() => {
    async function load() {
      if (!owner?.shopId) { setLoading(false); return; }
      try {
        const [shop, settings] = await Promise.all([
          getShop(owner.shopId),
          getShopSettings(owner.shopId),
        ]);
        setForm({
          businessName: shop?.businessName    || '',
          phone:        shop?.phone           || '',
          address:      shop?.address         || '',
          gstNumber:    shop?.gstNumber       || '',
          billMessage:  settings?.billMessage || '',
          billTerms:    settings?.billTerms   || '',
        });
      } catch (e) {
        console.error('[EditShopInfoScreen] load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [owner]);

  // ── Save flow ──
  const handleSavePress   = () => setConfirmModal(true);

  const handleSaveConfirm = async () => {
    setConfirmModal(false);
    setSaving(true);
    try {
      await updateShop(owner.shopId, {
        businessName: form.businessName,
        phone:        form.phone,
        address:      form.address,
        gstNumber:    form.gstNumber,
      });
      await updateShopSettings(owner.shopId, {
        billMessage: form.billMessage,
        billTerms:   form.billTerms,
      });
      navigation.goBack();
    } catch (e) {
      console.error('[EditShopInfoScreen] save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const headerLeft = <BackPill onPress={() => navigation.goBack()} />;

  // ── Loading ──
  if (loading) {
    return (
      <AppHeaderLayout title="Edit Shop Info" leftComponent={headerLeft}>
        <LoadingState />
      </AppHeaderLayout>
    );
  }

  // ── Main ──
  return (
    <AppHeaderLayout
      title="Edit Shop Info"
      subtitle={form.businessName || 'Shop details'}
      leftComponent={headerLeft}
    >

      {/* ── Save confirm modal ── */}
      <ConfirmActionModal
        visible={confirmModal}
        variant="success"
        icon="checkmark-circle-outline"
        title="Save Changes?"
        message="This will update your shop details and bill settings."
        confirmLabel="Yes, Save"
        confirmIcon="checkmark-outline"
        itemPill={{ icon: 'storefront-outline', label: form.businessName || 'Shop' }}
        loading={saving}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleSaveConfirm}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Shop identity badge — dark teal, same as ShopInfoScreen ── */}
        <View style={styles.shopBadge}>
          <View style={styles.shopBadgeIconBox}>
            <Icon name="storefront-outline" size={rfs(22)} color="#FFFFFF" />
          </View>
          <View style={styles.shopBadgeTextBlock}>
            <Text style={styles.shopBadgeLabel}>EDITING</Text>
            <Text style={styles.shopBadgeName} numberOfLines={1}>
              {form.businessName || 'Your Shop'}
            </Text>
          </View>
          <View style={styles.editModeBadge}>
            <Icon name="create-outline" size={rfs(11)} color={colors.accent} />
            <Text style={styles.editModeText}>Edit Mode</Text>
          </View>
        </View>

        {/* ── ShopForm handles all fields with section labels built-in ── */}
        <ShopForm form={form} setForm={setForm} />

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
              <Text style={styles.saveBtnText}>Save Changes</Text>
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

  // ── Shop identity badge ──────────────────────────────
  shopBadge: {
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

  shopBadgeIconBox: {
    width: rs(46),
    height: rs(46),
    borderRadius: rs(13),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  shopBadgeTextBlock: {
    flex: 1,
    gap: rvs(2),
  },

  shopBadgeLabel: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.9,
  },

  shopBadgeName: {
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

  // ── Save button ──────────────────────────────────────
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

  // ── Loading / empty state ─────────────────────────────
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

});
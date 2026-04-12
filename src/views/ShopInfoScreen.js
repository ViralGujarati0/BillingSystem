import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import AppHeaderLayout from '../components/AppHeaderLayout';
import HeaderBackButton from '../components/HeaderBackButton';
import { currentOwnerAtom } from '../atoms/owner';
import { getShop, getShopSettings } from '../services/shopService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Field icon map ───────────────────────────────────────────────────────────
const FIELD_ICONS = {
  businessName: 'storefront-outline',
  phone:        'call-outline',
  address:      'location-outline',
  gstNumber:    'receipt-outline',
  billMessage:  'chatbubble-outline',
  billTerms:    'document-text-outline',
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, label }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionAccentBar} />
    <Icon name={icon} size={rfs(12)} color={colors.accent} />
    <Text style={styles.sectionHeaderText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ iconName, label, value, isLast }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <View style={styles.infoIconBox}>
      <Icon name={iconName} size={rfs(13)} color={colors.textSecondary} />
    </View>
    <View style={styles.infoTextBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
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

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onEdit }) => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <Icon name="storefront-outline" size={rfs(34)} color={colors.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>No shop info yet</Text>
    <Text style={styles.stateSub}>Set up your shop details to get started.</Text>
    <TouchableOpacity style={styles.stateBtn} onPress={onEdit} activeOpacity={0.85}>
      <Icon name="create-outline" size={rfs(15)} color="#FFFFFF" />
      <Text style={styles.stateBtnText}>Set Up Shop</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ShopInfoScreen({ navigation }) {
  const { t } = useTranslation();
  const [owner] = useAtom(currentOwnerAtom);

  const [shop,     setShop]     = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    if (!owner?.shopId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [shopData, settingsData] = await Promise.all([
        getShop(owner.shopId),
        getShopSettings(owner.shopId),
      ]);
      setShop(shopData);
      setSettings(settingsData);
    } catch (e) {
      console.error('[ShopInfoScreen] load error:', e);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const headerLeft = <HeaderBackButton onPress={() => navigation.goBack()} />;

  // ── Loading ──
  if (loading) {
    return (
      <AppHeaderLayout
        title={t('shop.title') || 'Shop Info'}
        leftComponent={headerLeft}
      >
        <LoadingState />
      </AppHeaderLayout>
    );
  }

  // ── Empty ──
  if (!shop) {
    return (
      <AppHeaderLayout
        title={t('shop.title') || 'Shop Info'}
        leftComponent={headerLeft}
      >
        <EmptyState onEdit={() => navigation.navigate('EditShopInfo')} />
      </AppHeaderLayout>
    );
  }

  // ── Main ──
  return (
    <AppHeaderLayout
      title={t('shop.title') || 'Shop Info'}
      subtitle={shop.businessName}
      leftComponent={headerLeft}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Shop identity badge ── */}
        <View style={styles.shopBadge}>
          <View style={styles.shopBadgeIconBox}>
            <Icon name="storefront-outline" size={rfs(26)} color="#FFFFFF" />
          </View>
          <View style={styles.shopBadgeTextBlock}>
            <Text style={styles.shopBadgeName} numberOfLines={1}>
              {shop.businessName || '—'}
            </Text>
            {shop.phone ? (
              <View style={styles.shopBadgeMeta}>
                <Icon name="call-outline" size={rfs(10)} color="rgba(255,255,255,0.55)" />
                <Text style={styles.shopBadgeMetaText}>{shop.phone}</Text>
              </View>
            ) : null}
          </View>
          {/* Edit shortcut */}
          <TouchableOpacity
            style={styles.editShortcut}
            onPress={() => navigation.navigate('EditShopInfo')}
            activeOpacity={0.8}
          >
            <Icon name="create-outline" size={rfs(14)} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════
            SECTION — BUSINESS DETAILS
        ══════════════════════════════ */}
        <SectionHeader icon="storefront-outline" label="BUSINESS DETAILS" />

        <View style={styles.card}>
          <InfoRow
            iconName={FIELD_ICONS.businessName}
            label={t('shop.businessName') || 'Business Name'}
            value={shop.businessName}
          />
          <InfoRow
            iconName={FIELD_ICONS.phone}
            label={t('shop.phone') || 'Phone'}
            value={shop.phone}
          />
          <InfoRow
            iconName={FIELD_ICONS.address}
            label={t('shop.address') || 'Address'}
            value={shop.address}
          />
          <InfoRow
            iconName={FIELD_ICONS.gstNumber}
            label={t('shop.gstNumber') || 'GST Number'}
            value={shop.gstNumber}
            isLast
          />
        </View>

        {/* ══════════════════════════════
            SECTION — BILL SETTINGS
        ══════════════════════════════ */}
        <SectionHeader icon="document-text-outline" label="BILL SETTINGS" />

        <View style={styles.card}>
          <InfoRow
            iconName={FIELD_ICONS.billMessage}
            label={t('shop.billMessage') || 'Bill Message'}
            value={settings?.billMessage}
          />
          <InfoRow
            iconName={FIELD_ICONS.billTerms}
            label={t('shop.billTerms') || 'Bill Terms'}
            value={settings?.billTerms}
            isLast
          />
        </View>

        {/* ── Edit button ── */}
        {/* <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditShopInfo')}
          activeOpacity={0.85}
        >
          <View style={styles.editBtnIconBox}>
            <Icon name="create-outline" size={rfs(15)} color={colors.primary} />
          </View>
          <Text style={styles.editBtnText}>Edit Shop Info</Text>
        </TouchableOpacity> */}

      </ScrollView>
    </AppHeaderLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Back pill ────────────────────────────────────────
  // ── Scroll ───────────────────────────────────────────
  scroll: { flex: 1 },

  scrollContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Shop identity badge ──────────────────────────────
  // Dark teal card — same pattern as InventoryFormScreen hero
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
    width: rs(50),
    height: rs(50),
    borderRadius: rs(14),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  shopBadgeTextBlock: {
    flex: 1,
    gap: rvs(4),
  },

  shopBadgeName: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  shopBadgeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },

  shopBadgeMetaText: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    fontVariant: ['tabular-nums'],
  },

  editShortcut: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Section header ───────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
    marginTop: rvs(2),
  },

  sectionAccentBar: {
    width: rs(3),
    height: rvs(14),
    backgroundColor: colors.accent,
    borderRadius: rs(2),
    flexShrink: 0,
  },

  sectionHeaderText: {
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

  // ── Info card ────────────────────────────────────────
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
    overflow: 'hidden',
  },

  // ── Info row ─────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(11),
  },

  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  infoIconBox: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(9),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  infoTextBlock: {
    flex: 1,
    gap: rvs(2),
  },

  infoLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  infoValue: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: rfs(19),
  },

  // ── Edit button ──────────────────────────────────────
  editBtn: {
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

  editBtnIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Loading / empty states ───────────────────────────
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
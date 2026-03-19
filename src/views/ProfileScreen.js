import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import AppHeaderLayout        from '../components/AppHeaderLayout';
import ProfileHeader          from '../components/ProfileHeader';
import ShopInfoCard           from '../components/ShopInfoCard';
import StaffManagementCard    from '../components/StaffManagementCard';
import SupplierManagementCard from '../components/SupplierManagementCard';
import PurchaseManagementCard from '../components/PurchaseManagementCard';
import LanguageCard           from '../components/LanguageCard';
import useAuthViewModel       from '../viewmodels/AuthViewModel';
import { localeAtom }         from '../atoms/locale';
import { currentOwnerAtom, staffListAtom } from '../atoms/owner';
import { subscribeSuppliers } from '../services/supplierService';
import { COLLECTIONS }        from '../constants/collections';
import { colors }             from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionBar} />
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ─── Grouped nav card ─────────────────────────────────────────────────────────
const NavCard = ({ children }) => (
  <View style={styles.navCard}>{children}</View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { t }       = useTranslation();
  const user        = auth().currentUser;
  const savedLocale = useAtomValue(localeAtom);
  const { signOut } = useAuthViewModel();

  const owner     = useAtomValue(currentOwnerAtom);
  const staffList = useAtomValue(staffListAtom);
  const shopId    = owner?.shopId;

  const [loggingOut,      setLoggingOut]      = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [billsCount,      setBillsCount]      = useState(null);
  const [suppliersCount,  setSuppliersCount]  = useState(null);

  // ── Bills count (realtime) ──
  useEffect(() => {
    if (!shopId) return;
    const unsub = firestore()
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.BILLS)
      .onSnapshot(snap => setBillsCount(snap.size));
    return unsub;
  }, [shopId]);

  // ── Suppliers count (realtime) ──
  useEffect(() => {
    if (!shopId) return;
    const unsub = subscribeSuppliers(shopId, list => setSuppliersCount(list.length));
    return unsub;
  }, [shopId]);

  const performSignOut = async () => {
    setShowConfirm(false);
    setLoggingOut(true);
    try {
      await signOut();
    } catch (e) {
      console.error('[ProfileScreen] signOut error:', e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AppHeaderLayout title={t('profile.title')}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Identity card ── */}
        <ProfileHeader
          photoURL={user?.photoURL}
          email={user?.email}
          displayName={user?.displayName}
          billsCount={billsCount}
          staffCount={staffList.length || null}
          suppliersCount={suppliersCount}
        />

        {/* ════════════════════════
            SETTINGS
        ════════════════════════ */}
        <SectionLabel label="Settings" />

        {/* LanguageCard stands alone — it has its own card style */}
        <LanguageCard currentLocale={savedLocale || 'en'} />

        {/* ════════════════════════
            SHOP & MANAGEMENT
        ════════════════════════ */}
        <SectionLabel label="Shop & Management" />

        {/* All 4 grouped in one card with hairline dividers */}
        <NavCard>
          <ShopInfoCard           navigation={navigation} />
          <StaffManagementCard    navigation={navigation} />
          <SupplierManagementCard navigation={navigation} />
          <PurchaseManagementCard navigation={navigation} />
        </NavCard>

        {/* ════════════════════════
            ACCOUNT
        ════════════════════════ */}
        <SectionLabel label="Account" />

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, loggingOut && styles.signOutBtnDisabled]}
          onPress={() => setShowConfirm(true)}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#E05252" />
          ) : (
            <>
              <View style={styles.signOutIconBox}>
                <Icon name="log-out-outline" size={rfs(15)} color="#E05252" />
              </View>
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>v1.0.0 · BillingSystem</Text>

      </ScrollView>

      {/* ── Sign out confirm modal ── */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalIconRing}>
              <Icon name="log-out-outline" size={rfs(28)} color="#E05252" />
            </View>

            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>

            <View style={styles.modalDivider} />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={performSignOut}
                activeOpacity={0.85}
              >
                <Icon name="log-out-outline" size={rfs(14)} color="#FFFFFF" />
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </AppHeaderLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  scroll: { flex: 1 },

  content: {
    paddingTop: rvs(12),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Section label ──────────────────────────────────────
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
    paddingHorizontal: rs(20),
    marginTop: rvs(4),
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
    textTransform: 'uppercase',
  },

  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },

  // ── Grouped nav card ───────────────────────────────────
  navCard: {
    marginHorizontal: rs(16),
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

  // ── Sign out button ─────────────────────────────────────
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(9),
    marginHorizontal: rs(16),
    paddingVertical: rvs(14),
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.28)',
    backgroundColor: 'rgba(224,82,82,0.06)',
  },

  signOutBtnDisabled: { opacity: 0.6 },

  signOutIconBox: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    backgroundColor: 'rgba(224,82,82,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signOutText: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: '#E05252',
    letterSpacing: 0.2,
  },

  // ── Version ─────────────────────────────────────────────
  version: {
    textAlign: 'center',
    fontSize: rfs(10),
    color: '#B8C4C8',
    fontWeight: '500',
    letterSpacing: 0.3,
    paddingBottom: rvs(4),
  },

  // ── Modal ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,46,51,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(24),
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingHorizontal: rs(20),
    paddingTop: rvs(28),
    paddingBottom: rvs(20),
    alignItems: 'center',
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 12,
  },

  modalIconRing: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    backgroundColor: 'rgba(224,82,82,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(14),
  },

  modalTitle: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: rvs(8),
    textAlign: 'center',
  },

  modalMessage: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
    marginBottom: rvs(18),
  },

  modalDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(16),
  },

  modalActions: {
    flexDirection: 'row',
    gap: rs(10),
    width: '100%',
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,74,82,0.04)',
  },

  modalCancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },

  modalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    backgroundColor: '#E05252',
    shadowColor: '#E05252',
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.30,
    shadowRadius: rs(8),
    elevation: 4,
  },

  modalConfirmText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});
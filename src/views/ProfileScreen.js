import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import AppHeaderLayout        from '../components/AppHeaderLayout';
import ProfileHeader          from '../components/ProfileHeader';
import ShopInfoCard           from '../components/ShopInfoCard';
import StaffManagementCard    from '../components/StaffManagementCard';
import SupplierManagementCard from '../components/SupplierManagementCard';
import PurchaseManagementCard from '../components/PurchaseManagementCard';
import SignOutCard             from '../components/SignOutCard';
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
  const { t } = useTranslation();
  const user  = auth().currentUser;

  const owner     = useAtomValue(currentOwnerAtom);
  const staffList = useAtomValue(staffListAtom);
  const shopId    = owner?.shopId;

  const [billsCount,     setBillsCount]     = useState(null);
  const [suppliersCount, setSuppliersCount] = useState(null);

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

  return (
    <AppHeaderLayout title={t('profile.title')} showLanguagePicker={true}>

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
            SHOP & MANAGEMENT
        ════════════════════════ */}
        <SectionLabel label="Shop & Management" />

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

        <NavCard>
          <SignOutCard />
        </NavCard>

        <Text style={styles.version}>v1.0.0 · BillingSystem</Text>

      </ScrollView>

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

  // ── Section label ─────────────────────────────────────
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

  // ── Grouped nav card ──────────────────────────────────
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

  // ── Version ───────────────────────────────────────────
  version: {
    textAlign: 'center',
    fontSize: rfs(10),
    color: '#B8C4C8',
    fontWeight: '500',
    letterSpacing: 0.3,
    paddingBottom: rvs(4),
  },

});
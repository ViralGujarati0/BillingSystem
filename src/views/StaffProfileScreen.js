import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtomValue } from 'jotai';

import AppHeaderLayout  from '../components/AppHeaderLayout';
import { currentStaffAtom } from '../atoms/staff';
import useAuthViewModel from '../viewmodels/AuthViewModel';
import { colors }       from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ── Permission summary row ────────────────────────────────────────────────────
const PermRow = ({ icon, label, enabled, color }) => (
  <View style={styles.permRow}>
    <View style={[styles.permIconBox, { backgroundColor: enabled ? color + '18' : '#f3f4f6' }]}>
      <Icon name={icon} size={rfs(14)} color={enabled ? color : '#9ca3af'} />
    </View>
    <Text style={[styles.permLabel, !enabled && styles.permLabelOff]}>{label}</Text>
    <Icon
      name={enabled ? 'checkmark-circle' : 'close-circle-outline'}
      size={rfs(18)}
      color={enabled ? '#16a34a' : '#d1d5db'}
    />
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const StaffProfileScreen = ({ navigation, route }) => {
  const staffFromRoute = route.params?.userDoc;
  const staffFromAtom  = useAtomValue(currentStaffAtom);
  const staff          = staffFromAtom || staffFromRoute;
  const { signOut }    = useAuthViewModel();

  const permissions = staff?.permissions || {};
  const salesPerms  = permissions.sales  || {};
  const stockPerms  = permissions.stock  || {};
  const homePerms   = permissions.home   || {};

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <AppHeaderLayout title="Profile">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Staff info card ── */}
        <View style={styles.infoCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(staff?.name || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoText}>
              <Text style={styles.staffName}>{staff?.name || '—'}</Text>
              <Text style={styles.staffEmail}>{staff?.email || '—'}</Text>
              <View style={styles.rolePill}>
                <Icon name="person-outline" size={rfs(11)} color={colors.primary} />
                <Text style={styles.roleText}>Staff Member</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Permissions overview ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Icon name="shield-checkmark-outline" size={rfs(16)} color={colors.primary} />
            <Text style={styles.cardTitle}>Your Permissions</Text>
          </View>

          <PermRow icon="receipt-outline"    label="Billing"          enabled={!!permissions.billing}           color="#f59e0b" />
          <View style={styles.divider} />
          <PermRow icon="bar-chart-outline"  label="Sales Summary"    enabled={!!salesPerms.summaryStrip}       color="#3b82f6" />
          <View style={styles.divider} />
          <PermRow icon="calendar-outline"   label="Sales Calendar"   enabled={!!salesPerms.calendar}           color="#3b82f6" />
          <View style={styles.divider} />
          <PermRow icon="list-outline"       label="Bills List"       enabled={!!salesPerms.recentBills}        color="#3b82f6" />
          <View style={styles.divider} />
          <PermRow icon="search-outline"     label="Inventory Search" enabled={!!stockPerms.searchBar}          color="#8b5cf6" />
          <View style={styles.divider} />
          <PermRow icon="stats-chart-outline" label="Stock Stats"     enabled={!!stockPerms.statsCards}         color="#8b5cf6" />
          <View style={styles.divider} />
          <PermRow icon="filter-outline"     label="Category Filter"  enabled={!!stockPerms.categoryFilter}     color="#8b5cf6" />
          <View style={styles.divider} />
          <PermRow icon="flash-outline"      label="Quick Actions"    enabled={!!stockPerms.quickActions}       color="#8b5cf6" />
          <View style={styles.divider} />
          <PermRow icon="cube-outline"       label="Inventory List"   enabled={!!stockPerms.inventoryList}      color="#8b5cf6" />
          <View style={styles.divider} />
          <PermRow icon="home-outline"       label="Home: Overview"  enabled={!!homePerms.overviewStats}       color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="bar-chart-outline"  label="Home: Revenue chart" enabled={!!homePerms.revenueChart}   color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="pie-chart-outline"   label="Home: Payments"   enabled={!!homePerms.paymentSplit}       color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="trophy-outline"      label="Home: Top products" enabled={!!homePerms.topProducts}    color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="analytics-outline"  label="Home: Comparison" enabled={!!homePerms.comparison}       color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="warning-outline"     label="Home: Low stock" enabled={!!homePerms.lowStock}           color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="cart-outline"       label="Home: Pending purchases" enabled={!!homePerms.pendingPurchases} color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="document-text-outline" label="Home: Recent bills" enabled={!!homePerms.recentBillsCard} color="#0d9488" />
          <View style={styles.divider} />
          <PermRow icon="print-outline"       label="Home: Daily report" enabled={!!homePerms.dailyReportFab}   color="#0d9488" />
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Icon name="log-out-outline" size={rfs(18)} color={colors.danger || '#ef4444'} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </AppHeaderLayout>
  );
};

export default StaffProfileScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(16), paddingTop: rvs(16), paddingBottom: rvs(40), gap: rvs(12) },

  // ── Info card ─────────────────────────────────────────
  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: rs(16),
    borderWidth: 1, borderColor: colors.borderCard,
    padding: rs(16),
    shadowColor: colors.shadowCard, shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1, shadowRadius: rs(8), elevation: 2,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: rs(14) },
  avatarCircle: {
    width: rs(56), height: rs(56), borderRadius: rs(28),
    backgroundColor: colors.primary + '18', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: rfs(22), fontWeight: '800', color: colors.primary },
  infoText: { flex: 1, gap: rvs(3) },
  staffName: { fontSize: rfs(17), fontWeight: '800', color: colors.textPrimary },
  staffEmail: { fontSize: rfs(12), color: colors.textSecondary, fontWeight: '400' },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: rs(4), alignSelf: 'flex-start',
    backgroundColor: colors.primary + '10', borderWidth: 1, borderColor: colors.primary + '25',
    borderRadius: rs(20), paddingHorizontal: rs(8), paddingVertical: rvs(3), marginTop: rvs(2),
  },
  roleText: { fontSize: rfs(10), fontWeight: '700', color: colors.primary },

  // ── Section card ──────────────────────────────────────
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: rs(16),
    borderWidth: 1, borderColor: colors.borderCard, overflow: 'hidden',
    shadowColor: colors.shadowCard, shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1, shadowRadius: rs(8), elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    paddingHorizontal: rs(16), paddingVertical: rvs(14),
    borderBottomWidth: 1, borderBottomColor: colors.borderCard,
  },
  cardTitle: { fontSize: rfs(14), fontWeight: '700', color: colors.textPrimary },

  // ── Permission row ────────────────────────────────────
  permRow: {
    flexDirection: 'row', alignItems: 'center', gap: rs(10),
    paddingHorizontal: rs(16), paddingVertical: rvs(11),
  },
  permIconBox: { width: rs(30), height: rs(30), borderRadius: rs(8), alignItems: 'center', justifyContent: 'center' },
  permLabel: { flex: 1, fontSize: rfs(13), fontWeight: '600', color: colors.textPrimary },
  permLabelOff: { color: '#9ca3af' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderCard, marginLeft: rs(56) },

  // ── Sign out ──────────────────────────────────────────
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(8), paddingVertical: rvs(14), borderRadius: rs(14),
    borderWidth: 1.5, borderColor: (colors.danger || '#ef4444') + '40',
    backgroundColor: (colors.danger || '#ef4444') + '08',
  },
  signOutText: { fontSize: rfs(15), fontWeight: '700', color: colors.danger || '#ef4444' },
});
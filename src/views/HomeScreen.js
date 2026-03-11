import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout  from '../components/AppHeaderLayout';
import useHomeViewModel from '../viewmodels/useHomeViewModel';
import { colors }       from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, valueColor }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconWrap}>
      <Icon name={icon} size={rfs(20)} color={colors.primary} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation, route }) => {
  const userDoc = route.params?.userDoc;
  const { stats, loadingStats, greeting, hasShop } = useHomeViewModel({ userDoc });

  return (
    <AppHeaderLayout
      title={userDoc?.name || 'Home'}
      subtitle={greeting}
    >
      <View style={styles.container}>

        {/* ── No shop yet ── */}
        {!userDoc?.shopId && (
          <View style={styles.createShopWrap}>
            <View style={styles.createShopIconWrap}>
              <Icon name="storefront-outline" size={rfs(40)} color={colors.primary} />
            </View>
            <Text style={styles.createShopTitle}>Set up your shop</Text>
            <Text style={styles.createShopSub}>
              Create your shop to start billing, managing inventory and staff.
            </Text>
            <TouchableOpacity
              style={styles.createShopBtn}
              onPress={() => navigation.getParent()?.navigate('CreateShop', { userDoc })}
              activeOpacity={0.85}
            >
              <Icon name="add-outline" size={rfs(18)} color="#fff" />
              <Text style={styles.createShopBtnText}>Create Shop</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stats cards ── */}
        {userDoc?.shopId && (
          <View style={styles.statsWrap}>

            <Text style={styles.sectionLabel}>TODAY'S OVERVIEW</Text>

            {loadingStats ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <StatCard
                  icon="cash-outline"
                  label="Total Sales"
                  value={`₹${Number(stats?.totalSales || 0).toFixed(2)}`}
                  valueColor={colors.primary}
                />
                <StatCard
                  icon="trending-up-outline"
                  label="Today Profit"
                  value={`₹${Number(stats?.totalProfit || 0).toFixed(2)}`}
                  valueColor="#16a34a"
                />
                <StatCard
                  icon="receipt-outline"
                  label="Bills"
                  value={String(stats?.totalBills || 0)}
                />
              </View>
            )}

          </View>
        )}

      </View>
    </AppHeaderLayout>
  );
};

export default HomeScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: rs(16),
    paddingTop: rvs(24),
  },

  // ── Create shop state ──────────────────────────────────
  createShopWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(24),
    gap: rvs(12),
  },

  createShopIconWrap: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(24),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },

  createShopTitle: {
    fontSize: rfs(20),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  createShopSub: {
    fontSize: rfs(13),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
  },

  createShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    backgroundColor: colors.primary,
    paddingVertical: rvs(13),
    paddingHorizontal: rs(28),
    borderRadius: rs(12),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.25,
    shadowRadius: rs(10),
    elevation: 4,
  },

  createShopBtnText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: '#fff',
  },

  // ── Stats section ──────────────────────────────────────
  statsWrap: {
    gap: rvs(14),
  },

  sectionLabel: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },

  loadingWrap: {
    paddingVertical: rvs(48),
    alignItems: 'center',
  },

  statsGrid: {
    gap: rvs(12),
  },

  statCard: {
    backgroundColor: '#fff',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  statIconWrap: {
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

  statLabel: {
    flex: 1,
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  statValue: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
  },

});
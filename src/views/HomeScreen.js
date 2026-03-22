// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useTranslation } from 'react-i18next';

// import AppHeaderLayout  from '../components/AppHeaderLayout';
// import useHomeViewModel from '../viewmodels/useHomeViewModel';
// import { colors }       from '../theme/colors';

// const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
// const scale = SCREEN_W / 390;
// const vs    = SCREEN_H / 844;
// const rs    = (n) => Math.round(n * scale);
// const rvs   = (n) => Math.round(n * vs);
// const rfs   = (n) => Math.round(n * scale);

// // ─── Search Button (right slot) ───────────────────────────────────────────────
// const SearchButton = ({ onPress }) => (
//   <TouchableOpacity style={styles.searchBtn} onPress={onPress} activeOpacity={0.75}>
//     <Icon name="search-outline" size={rfs(18)} color="#fff" />
//   </TouchableOpacity>
// );

// // ─── Stat Card ────────────────────────────────────────────────────────────────
// const StatCard = ({ icon, label, value, valueColor }) => (
//   <View style={styles.statCard}>
//     <View style={styles.statIconWrap}>
//       <Icon name={icon} size={rfs(20)} color={colors.primary} />
//     </View>
//     <Text style={styles.statLabel}>{label}</Text>
//     <Text style={[styles.statValue, valueColor && { color: valueColor }]}>
//       {value}
//     </Text>
//   </View>
// );

// // ─── Main Screen ──────────────────────────────────────────────────────────────
// const HomeScreen = ({ navigation, route }) => {
//   const { t } = useTranslation();
//   const userDoc = route.params?.userDoc;
//   const { stats, loadingStats, greeting, hasShop } = useHomeViewModel({ userDoc });

//   return (
//     <AppHeaderLayout
//       title={userDoc?.name || 'Home'}
//       subtitle={greeting}
//       rightComponent={
//         userDoc?.shopId ? (
//           <SearchButton
//             onPress={() =>
//               navigation.navigate('GlobalSearch', {
//                 shopId: userDoc.shopId,
//                 userDoc,
//               })
//             }
//           />
//         ) : null
//       }
//     >
//       <View style={styles.container}>

//         {/* ── No shop yet ── */}
//         {!userDoc?.shopId && (
//           <View style={styles.createShopWrap}>
//             <View style={styles.createShopIconWrap}>
//               <Icon name="storefront-outline" size={rfs(40)} color={colors.primary} />
//             </View>
//             <Text style={styles.createShopTitle}>{t('home.setUpShop')}</Text>
//             <Text style={styles.createShopSub}>{t('home.setUpShopSub')}</Text>
//             <TouchableOpacity
//               style={styles.createShopBtn}
//               onPress={() => navigation.getParent()?.navigate('CreateShop', { userDoc })}
//               activeOpacity={0.85}
//             >
//               <Icon name="add-outline" size={rfs(18)} color="#fff" />
//               <Text style={styles.createShopBtnText}>{t('home.createShop')}</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* ── Stats cards ── */}
//         {userDoc?.shopId && (
//           <View style={styles.statsWrap}>

//             <Text style={styles.sectionLabel}>{t('home.todaysOverview')}</Text>

//             {loadingStats ? (
//               <View style={styles.loadingWrap}>
//                 <ActivityIndicator size="large" color={colors.primary} />
//               </View>
//             ) : (
//               <View style={styles.statsGrid}>
//                 <StatCard
//                   icon="cash-outline"
//                   label={t('home.totalSales')}
//                   value={`₹${Number(stats?.totalSales || 0).toFixed(2)}`}
//                   valueColor={colors.primary}
//                 />
//                 <StatCard
//                   icon="trending-up-outline"
//                   label={t('home.todayProfit')}
//                   value={`₹${Number(stats?.totalProfit || 0).toFixed(2)}`}
//                   valueColor="#16a34a"
//                 />
//                 <StatCard
//                   icon="receipt-outline"
//                   label={t('home.bills')}
//                   value={String(stats?.totalBills || 0)}
//                 />
//               </View>
//             )}

//           </View>
//         )}

//       </View>
//     </AppHeaderLayout>
//   );
// };

// export default HomeScreen;

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({

//   // ── Search button ──────────────────────────────────────
//   searchBtn: {
//     width: rs(36),
//     height: rs(36),
//     borderRadius: rs(10),
//     backgroundColor: 'rgba(255,255,255,0.12)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.18)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     paddingHorizontal: rs(16),
//     paddingTop: rvs(24),
//   },

//   // ── Create shop state ──────────────────────────────────
//   createShopWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: rs(24),
//     gap: rvs(12),
//   },

//   createShopIconWrap: {
//     width: rs(80),
//     height: rs(80),
//     borderRadius: rs(24),
//     backgroundColor: 'rgba(45,74,82,0.07)',
//     borderWidth: 1,
//     borderColor: colors.borderCard,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: rvs(4),
//   },

//   createShopTitle: {
//     fontSize: rfs(20),
//     fontWeight: '800',
//     color: colors.textPrimary,
//     textAlign: 'center',
//   },

//   createShopSub: {
//     fontSize: rfs(13),
//     fontWeight: '400',
//     color: colors.textSecondary,
//     textAlign: 'center',
//     lineHeight: rfs(20),
//   },

//   createShopBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: rs(8),
//     backgroundColor: colors.primary,
//     paddingVertical: rvs(13),
//     paddingHorizontal: rs(28),
//     borderRadius: rs(12),
//     marginTop: rvs(8),
//     shadowColor: colors.primary,
//     shadowOffset: { width: 0, height: rvs(4) },
//     shadowOpacity: 0.25,
//     shadowRadius: rs(10),
//     elevation: 4,
//   },

//   createShopBtnText: {
//     fontSize: rfs(15),
//     fontWeight: '700',
//     color: '#fff',
//   },

//   // ── Stats section ──────────────────────────────────────
//   statsWrap: {
//     gap: rvs(14),
//   },

//   sectionLabel: {
//     fontSize: rfs(11),
//     fontWeight: '700',
//     color: colors.textSecondary,
//     letterSpacing: 0.8,
//   },

//   loadingWrap: {
//     paddingVertical: rvs(48),
//     alignItems: 'center',
//   },

//   statsGrid: {
//     gap: rvs(12),
//   },

//   statCard: {
//     backgroundColor: '#fff',
//     borderRadius: rs(14),
//     borderWidth: 1,
//     borderColor: colors.borderCard,
//     padding: rs(16),
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: rs(14),
//     shadowColor: colors.shadowCard,
//     shadowOffset: { width: 0, height: rvs(2) },
//     shadowOpacity: 1,
//     shadowRadius: rs(8),
//     elevation: 2,
//   },

//   statIconWrap: {
//     width: rs(44),
//     height: rs(44),
//     borderRadius: rs(12),
//     backgroundColor: 'rgba(45,74,82,0.07)',
//     borderWidth: 1,
//     borderColor: colors.borderCard,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//   },

//   statLabel: {
//     flex: 1,
//     fontSize: rfs(13),
//     fontWeight: '600',
//     color: colors.textSecondary,
//   },

//   statValue: {
//     fontSize: rfs(18),
//     fontWeight: '800',
//     color: colors.textPrimary,
//   },

// });
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout      from '../components/AppHeaderLayout';
import StatCard             from '../components/StatCard';
import RevenueBarChart      from '../components/RevenueBarChart';
import PaymentSplitCard     from '../components/PaymentSplitCard';
import TopProductsCard      from '../components/TopProductsCard';
import RecentBillsCard      from '../components/RecentBillsCard';
import LowStockCard         from '../components/LowStockCard';
import PendingPurchasesCard from '../components/PendingPurchasesCard';
import ComparisonCard       from '../components/ComparisonCard';
import useHomeViewModel     from '../viewmodels/useHomeViewModel';
import { formatCurrency }   from '../utils/statsUtils';
import { colors }           from '../theme/colors';
import DailyReportFab       from '../components/DailyReportFab';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Search button (right side of header) ─────────────────────────────────────
const SearchButton = ({ onPress }) => (
  <TouchableOpacity style={styles.searchBtn} onPress={onPress} activeOpacity={0.75}>
    <Icon name="search-outline" size={rfs(18)} color="#FFFFFF" />
  </TouchableOpacity>
);

// ─── Section label — amber bar + text + extending hairline ────────────────────
const SectionLabel = ({ label }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionBar} />
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

// ─── Avg bill value formatter ─────────────────────────────────────────────────
const fmtAvg = (sales, bills) => {
  if (!bills || bills === 0) return '—';
  return formatCurrency(sales / bills);
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation, route }) => {
  const { t }   = useTranslation();
  const userDoc = route.params?.userDoc;
  const vm      = useHomeViewModel({ userDoc });

  return (
    <AppHeaderLayout
      title={userDoc?.name || 'Home'}
      subtitle={vm.greeting}
      rightComponent={
        userDoc?.shopId ? (
          <SearchButton
            onPress={() =>
              navigation.navigate('GlobalSearch', {
                shopId: userDoc.shopId,
                userDoc,
              })
            }
          />
        ) : null
      }
    >

      {/* ════════════════════════════════
          NO SHOP STATE
      ════════════════════════════════ */}
      {!vm.hasShop && (
        <View style={styles.createShopWrap}>
          <View style={styles.createShopIconWrap}>
            <Icon
              name="storefront-outline"
              size={rfs(40)}
              color={colors.primary}
            />
          </View>
          <Text style={styles.createShopTitle}>{t('home.setUpShop')}</Text>
          <Text style={styles.createShopSub}>{t('home.setUpShopSub')}</Text>
          <TouchableOpacity
            style={styles.createShopBtn}
            onPress={() =>
              navigation.getParent()?.navigate('CreateShop', { userDoc })
            }
            activeOpacity={0.85}
          >
            <View style={styles.createShopIconBox}>
              <Icon name="add-outline" size={rfs(16)} color={colors.primary} />
            </View>
            <Text style={styles.createShopBtnText}>{t('home.createShop')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ════════════════════════════════
          DASHBOARD
      ════════════════════════════════ */}
      {vm.hasShop && (
        <View style={styles.dashRoot}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >

            {/* ── OVERVIEW ── */}
            <SectionLabel label="Overview" />

            <View style={styles.statRow}>
              <StatCard
                leftIcon={<Icon name="cash-outline" size={rfs(16)} color={colors.primary} />}
                label="Total Revenue"
                value={formatCurrency(vm.revenue.stats.totalSales)}
                valueColor={colors.primary}
                period={vm.revenue.period}
                onChangePeriod={vm.revenue.setPeriod}
                loading={vm.revenue.loading}
                accentColor={colors.primary}
              />
              <StatCard
                leftIcon={<Icon name="trending-up-outline" size={rfs(16)} color={colors.success} />}
                label="Total Profit"
                value={formatCurrency(vm.profit.stats.totalProfit)}
                valueColor={colors.success}
                period={vm.profit.period}
                onChangePeriod={vm.profit.setPeriod}
                loading={vm.profit.loading}
                accentColor={colors.success}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                leftIcon={<Icon name="receipt-outline" size={rfs(16)} color={colors.accent} />}
                label="Total Bills"
                value={String(vm.bills.stats.totalBills || 0)}
                period={vm.bills.period}
                onChangePeriod={vm.bills.setPeriod}
                loading={vm.bills.loading}
                accentColor={colors.accent}
              />
              <StatCard
                leftIcon={<Icon name="cube-outline" size={rfs(16)} color="#7C6AF5" />}
                label="Items Sold"
                value={String(vm.items.stats.totalItemsSold || 0)}
                period={vm.items.period}
                onChangePeriod={vm.items.setPeriod}
                loading={vm.items.loading}
                accentColor="#7C6AF5"
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                leftIcon={<Icon name="calculator-outline" size={rfs(16)} color="#E07B2A" />}
                label="Avg Bill Value"
                value={fmtAvg(
                  vm.avgBill.stats.totalSales,
                  vm.avgBill.stats.totalBills,
                )}
                period={vm.avgBill.period}
                onChangePeriod={vm.avgBill.setPeriod}
                loading={vm.avgBill.loading}
                accentColor="#E07B2A"
              />
              <StatCard
                leftIcon={<Icon name="cart-outline" size={rfs(16)} color={colors.danger} />}
                label="Purchases"
                value={formatCurrency(vm.purchase.stats.totalPurchaseAmount)}
                period={vm.purchase.period}
                onChangePeriod={vm.purchase.setPeriod}
                loading={vm.purchase.loading}
                accentColor={colors.danger}
              />
            </View>

            {/* ── CHARTS ── */}
            <SectionLabel label="Charts" />

            <RevenueBarChart
              dailyData={vm.chart.dailyData}
              period={vm.chart.period}
              onChangePeriod={vm.chart.setPeriod}
              loading={vm.chart.loading}
            />

            <PaymentSplitCard
              stats={vm.payment.stats}
              period={vm.payment.period}
              onChangePeriod={vm.payment.setPeriod}
              loading={vm.payment.loading}
            />

            {/* ── PRODUCTS ── */}
            <SectionLabel label="Products" />

            <TopProductsCard
              products={vm.topProducts.data}
              period={vm.topProducts.period}
              onChangePeriod={vm.topProducts.setPeriod}
              loading={vm.topProducts.loading}
            />

            {/* ── PERFORMANCE ── */}
            <SectionLabel label="Performance" />

            <ComparisonCard
              activeStats={vm.comparison.stats}
              prevStats={vm.comparison.prev}
              period={vm.comparison.period}
              onChangePeriod={vm.comparison.setPeriod}
              loading={vm.comparison.loading}
            />

            {/* ── ALERTS & ACTIVITY ── */}
            <SectionLabel label="Alerts & Activity" />

            <LowStockCard
              items={vm.lowStockItems}
              loading={vm.loadingLowStock}
              onViewAll={() =>
                navigation.navigate('GlobalSearch', {
                  shopId: userDoc?.shopId,
                  userDoc,
                })
              }
            />

            <PendingPurchasesCard
              purchases={vm.pendingPurchases}
              loading={vm.loadingPendingPurchases}
              onViewAll={() =>
                navigation.getParent()?.navigate('Purchases')
              }
            />

            <RecentBillsCard
              bills={vm.recentBills}
              loading={vm.loadingRecentBills}
              onViewAll={() =>
                navigation.getParent()?.navigate('Bills')
              }
            />

          </ScrollView>

          {/* ── FAB — floats over scroll ── */}
          <DailyReportFab
            navigation={navigation}
            shopName={userDoc?.shopName || userDoc?.name}
            shopAddress={userDoc?.shopAddress || ''}
            vm={vm}
            periodLabel={
              vm.chart.period === '7d'  ? 'Last 7 Days'
              : vm.chart.period === '30d' ? 'Last 30 Days'
              : 'Today'
            }
          />

        </View>
      )}

    </AppHeaderLayout>
  );
};

export default HomeScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Dashboard root ────────────────────────────────────
  dashRoot: {
    flex: 1,
  },

  // ── Scroll content ────────────────────────────────────
  scroll: {
    paddingTop: rvs(12),
    paddingHorizontal: rs(16),
    paddingBottom: rvs(80),  // clearance for FAB
    gap: rvs(10),
  },

  // ── Search button ─────────────────────────────────────
  searchBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── No shop state ─────────────────────────────────────
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
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
  },

  createShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    paddingVertical: rvs(14),
    paddingHorizontal: rs(28),
    borderRadius: rs(14),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.25,
    shadowRadius: rs(10),
    elevation: 4,
  },

  createShopIconBox: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(7),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  createShopBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Section label ─────────────────────────────────────
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
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

  // ── Stat row ──────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    gap: rs(10),
  },

});
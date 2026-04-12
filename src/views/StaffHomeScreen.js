import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout from '../components/AppHeaderLayout';
import StatCard from '../components/StatCard';
import RevenueBarChart from '../components/RevenueBarChart';
import PaymentSplitCard from '../components/PaymentSplitCard';
import TopProductsCard from '../components/TopProductsCard';
import ComparisonCard from '../components/ComparisonCard';
import LowStockCard from '../components/LowStockCard';
import PendingPurchasesCard from '../components/PendingPurchasesCard';
import RecentBillsCard from '../components/RecentBillsCard';
import DailyReportFab from '../components/DailyReportFab';

import { currentStaffAtom, DEFAULT_STAFF_PERMISSIONS } from '../atoms/staff';
import useHomeViewModel from '../viewmodels/useHomeViewModel';
import { formatCurrency } from '../utils/statsUtils';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const HOME_KEYS = Object.keys(DEFAULT_STAFF_PERMISSIONS.home);

// ── Quick actions (Sales = any of sales.* enabled) ───────────────────────────
const QUICK_ACTIONS = [
  {
    permKey:  'billing',
    permFlat: true,
    labelKey: 'staffHome.newBill',
    descKey:  'staffHome.newBillDesc',
    icon:     'receipt-outline',
    color:    '#f59e0b',
    navigate: (nav) => nav.getParent()?.navigate('BillingScanner'),
  },
  {
    permKey:    'sales',
    permAnySub: true,
    labelKey:   'staffHome.viewSales',
    descKey:    'staffHome.viewSalesDesc',
    icon:       'bar-chart-outline',
    color:      '#3b82f6',
    navigate:   (nav) => nav.navigate('StaffSalesTab'),
  },
  {
    permKey:     'stock',
    permSubKey:  'inventoryList',
    labelKey:    'staffHome.viewStock',
    descKey:     'staffHome.viewStockDesc',
    icon:        'cube-outline',
    color:       '#8b5cf6',
    navigate:    (nav) => nav.navigate('StaffStockTab'),
  },
];

function hasQuickActionAccess(permissions, action) {
  if (!permissions) return false;
  if (action.permFlat) return !!permissions.billing;
  if (action.permAnySub) {
    const o = permissions[action.permKey];
    if (!o || typeof o !== 'object') return false;
    return Object.values(o).some(Boolean);
  }
  if (action.permSubKey) return !!permissions[action.permKey]?.[action.permSubKey];
  return !!permissions[action.permKey];
}

function hasAnyHomeWidget(home) {
  if (!home || typeof home !== 'object') return false;
  return Object.values(home).some(Boolean);
}

const SectionLabel = ({ label }) => (
  <View style={sectionStyles.sectionLabel}>
    <View style={sectionStyles.sectionBar} />
    <Text style={sectionStyles.sectionText}>{label}</Text>
    <View style={sectionStyles.sectionLine} />
  </View>
);

const fmtAvg = (sales, bills) => {
  if (!bills || bills === 0) return '—';
  return formatCurrency(sales / bills);
};

// ── Quick action card ─────────────────────────────────────────────────────────
const ActionCard = ({ action, onPress, t }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}>
      <Icon name={action.icon} size={rfs(24)} color={action.color} />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionLabel}>{t(action.labelKey)}</Text>
      <Text style={styles.actionDesc}>{t(action.descKey)}</Text>
    </View>
    <Icon name="chevron-forward" size={rfs(16)} color={colors.textSecondary} />
  </TouchableOpacity>
);

const LockedCard = ({ action, t }) => (
  <View style={[styles.actionCard, styles.actionCardLocked]}>
    <View style={[styles.actionIconBox, { backgroundColor: '#f3f4f6' }]}>
      <Icon name="lock-closed-outline" size={rfs(20)} color="#9ca3af" />
    </View>
    <View style={styles.actionText}>
      <Text style={[styles.actionLabel, { color: '#9ca3af' }]}>{t(action.labelKey)}</Text>
      <Text style={[styles.actionDesc, { color: '#c4c9d4' }]}>{t('staffHome.lockedHint')}</Text>
    </View>
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const StaffHomeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const staffFromRoute = route.params?.userDoc;
  const staffFromAtom  = useAtomValue(currentStaffAtom);
  const staff          = staffFromAtom || staffFromRoute;
  const permissions    = staff?.permissions || {};

  const staffUserDoc = useMemo(
    () => ({
      shopId: staff?.shopId,
      name:   staff?.name,
      role:   'STAFF',
    }),
    [staff?.shopId, staff?.name]
  );

  const vm = useHomeViewModel({ userDoc: staffUserDoc });
  const homePerms = permissions.home || {};

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('staffHome.goodMorning');
    if (hour < 17) return t('staffHome.goodAfternoon');
    return t('staffHome.goodEvening');
  };

  const quickEnabled = QUICK_ACTIONS.filter((a) => hasQuickActionAccess(permissions, a)).length;
  const homeEnabled  = HOME_KEYS.filter((k) => homePerms[k]).length;
  const totalSlots   = QUICK_ACTIONS.length + HOME_KEYS.length;
  const enabledTotal = quickEnabled + homeEnabled;

  const showInsights = vm.hasShop && hasAnyHomeWidget(homePerms);

  return (
    <AppHeaderLayout title={t('staffHome.title')}>
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            homePerms.dailyReportFab && vm.hasShop && { paddingBottom: rvs(88) },
          ]}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.welcomeCard}>
            <View style={styles.welcomeRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(staff?.name || t('staffHome.staffFallback')).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.welcomeText}>
                <Text style={styles.greetingText}>{greeting()},</Text>
                <Text style={styles.nameText} numberOfLines={1}>
                  {staff?.name || t('staffHome.staffFallback')}
                </Text>
              </View>
            </View>
            <View style={styles.accessPill}>
              <Icon name="shield-checkmark-outline" size={rfs(12)} color={colors.primary} />
              <Text style={styles.accessPillText}>
                {t('staffHome.featuresEnabled', {
                  enabled: enabledTotal,
                  total: totalSlots,
                })}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>{t('staffHome.quickActions')}</Text>

          <View style={styles.actionsGroup}>
            {QUICK_ACTIONS.map((action) => {
              const allowed = hasQuickActionAccess(permissions, action);
              const key = `${action.permKey}-${action.permSubKey || (action.permAnySub ? 'any' : 'flat')}`;
              return allowed
                ? (
                  <ActionCard
                    key={key}
                    action={action}
                    t={t}
                    onPress={() => action.navigate(navigation)}
                  />
                )
                : <LockedCard key={key} action={action} t={t} />;
            })}
          </View>

          {showInsights && (
            <>
              <Text style={styles.sectionLabel}>{t('staffHome.dashboardSection')}</Text>

              {homePerms.overviewStats && (
                <>
                  <SectionLabel label={t('home.sectionOverview')} />
                  <View style={styles.statRow}>
                    <StatCard
                      leftIcon={<Icon name="cash-outline" size={rfs(16)} color={colors.primary} />}
                      label={t('home.totalRevenue')}
                      value={formatCurrency(vm.revenue.stats.totalSales)}
                      valueColor={colors.primary}
                      period={vm.revenue.period}
                      onChangePeriod={vm.revenue.setPeriod}
                      loading={vm.revenue.loading}
                      accentColor={colors.primary}
                      headerColor={colors.primary}
                    />
                    <StatCard
                      leftIcon={<Icon name="trending-up-outline" size={rfs(16)} color={colors.success} />}
                      label={t('home.totalProfit')}
                      value={formatCurrency(vm.profit.stats.totalProfit)}
                      valueColor={colors.success}
                      period={vm.profit.period}
                      onChangePeriod={vm.profit.setPeriod}
                      loading={vm.profit.loading}
                      accentColor={colors.success}
                      headerColor={colors.primary}
                    />
                  </View>
                  <View style={styles.statRow}>
                    <StatCard
                      leftIcon={<Icon name="receipt-outline" size={rfs(16)} color={colors.accent} />}
                      label={t('home.totalBillsStat')}
                      value={String(vm.bills.stats.totalBills || 0)}
                      period={vm.bills.period}
                      onChangePeriod={vm.bills.setPeriod}
                      loading={vm.bills.loading}
                      accentColor={colors.accent}
                      headerColor={colors.primary}
                    />
                    <StatCard
                      leftIcon={<Icon name="cube-outline" size={rfs(16)} color="#7C6AF5" />}
                      label={t('home.itemsSold')}
                      value={String(vm.items.stats.totalItemsSold || 0)}
                      period={vm.items.period}
                      onChangePeriod={vm.items.setPeriod}
                      loading={vm.items.loading}
                      accentColor="#7C6AF5"
                      headerColor={colors.primary}
                    />
                  </View>
                  <View style={styles.statRow}>
                    <StatCard
                      leftIcon={<Icon name="calculator-outline" size={rfs(16)} color="#E07B2A" />}
                      label={t('home.avgBillValue')}
                      value={fmtAvg(vm.avgBill.stats.totalSales, vm.avgBill.stats.totalBills)}
                      period={vm.avgBill.period}
                      onChangePeriod={vm.avgBill.setPeriod}
                      loading={vm.avgBill.loading}
                      accentColor="#E07B2A"
                      headerColor={colors.primary}
                    />
                    <StatCard
                      leftIcon={<Icon name="cart-outline" size={rfs(16)} color={colors.danger} />}
                      label={t('home.purchasesStat')}
                      value={formatCurrency(vm.purchase.stats.totalPurchaseAmount)}
                      period={vm.purchase.period}
                      onChangePeriod={vm.purchase.setPeriod}
                      loading={vm.purchase.loading}
                      accentColor={colors.danger}
                      headerColor={colors.primary}
                    />
                  </View>
                </>
              )}

              {(homePerms.revenueChart || homePerms.paymentSplit) && (
                <SectionLabel label={t('home.sectionCharts')} />
              )}
              {homePerms.revenueChart && (
                <RevenueBarChart
                  dailyData={vm.chart.dailyData}
                  period={vm.chart.period}
                  onChangePeriod={vm.chart.setPeriod}
                  loading={vm.chart.loading}
                />
              )}
              {homePerms.paymentSplit && (
                <PaymentSplitCard
                  stats={vm.payment.stats}
                  period={vm.payment.period}
                  onChangePeriod={vm.payment.setPeriod}
                  loading={vm.payment.loading}
                />
              )}

              {homePerms.topProducts && (
                <>
                  <SectionLabel label={t('home.sectionProducts')} />
                  <TopProductsCard
                    products={vm.topProducts.data}
                    period={vm.topProducts.period}
                    onChangePeriod={vm.topProducts.setPeriod}
                    loading={vm.topProducts.loading}
                  />
                </>
              )}

              {homePerms.comparison && (
                <>
                  <SectionLabel label={t('home.sectionPerformance')} />
                  <ComparisonCard
                    activeStats={vm.comparison.stats}
                    prevStats={vm.comparison.prev}
                    period={vm.comparison.period}
                    onChangePeriod={vm.comparison.setPeriod}
                    loading={vm.comparison.loading}
                  />
                </>
              )}

              {(homePerms.lowStock || homePerms.pendingPurchases || homePerms.recentBillsCard) && (
                <SectionLabel label={t('home.sectionAlerts')} />
              )}

              {homePerms.lowStock && (
                <LowStockCard
                  items={vm.lowStockItems}
                  loading={vm.loadingLowStock}
                  onViewAll={() =>
                    navigation.getParent()?.navigate('GlobalSearch', {
                      shopId: staff?.shopId,
                      userDoc: staffUserDoc,
                    })
                  }
                />
              )}

              {homePerms.pendingPurchases && (
                <PendingPurchasesCard
                  purchases={vm.pendingPurchases}
                  loading={vm.loadingPendingPurchases}
                  onViewAll={() =>
                    navigation.getParent()?.navigate('PurchaseManagement')
                  }
                />
              )}

              {homePerms.recentBillsCard && (
                <RecentBillsCard
                  bills={vm.recentBills}
                  loading={vm.loadingRecentBills}
                  onViewAll={() => navigation.navigate('StaffSalesTab')}
                />
              )}
            </>
          )}

        </ScrollView>

        {vm.hasShop && homePerms.dailyReportFab && (
          <DailyReportFab
            navigation={navigation}
            shopName={staff?.shopName || staff?.name}
            shopAddress=""
            vm={vm}
            periodLabel={
              vm.chart.period === '7d'
                ? t('home.periodLast7Days')
                : vm.chart.period === '30d'
                  ? t('home.periodLast30Days')
                  : t('home.periodToday')
            }
          />
        )}
      </View>
    </AppHeaderLayout>
  );
};

export default StaffHomeScreen;

const sectionStyles = StyleSheet.create({
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    marginTop: rvs(4),
    marginBottom: rvs(2),
  },
  sectionBar: {
    width: rs(3),
    height: rvs(14),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
  },
  sectionText: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(40),
    gap: rvs(10),
  },

  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: rs(16),
    gap: rvs(14),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: rs(12) },
  avatarCircle: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: rfs(20), fontWeight: '800', color: colors.primary },
  welcomeText: { flex: 1 },
  greetingText: { fontSize: rfs(12), color: colors.textSecondary, fontWeight: '500' },
  nameText: { fontSize: rfs(17), fontWeight: '800', color: colors.textPrimary, marginTop: rvs(2) },
  accessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '25',
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(5),
  },
  accessPillText: { fontSize: rfs(11), fontWeight: '600', color: colors.primary },

  sectionLabel: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    paddingHorizontal: rs(4),
    marginTop: rvs(4),
  },

  actionsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },
  actionCardLocked: { opacity: 0.55 },
  actionIconBox: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: rfs(14), fontWeight: '700', color: colors.textPrimary },
  actionDesc: { fontSize: rfs(11), color: colors.textSecondary, marginTop: rvs(2) },

  statRow: {
    flexDirection: 'row',
    gap: rs(10),
    alignItems: 'stretch',
  },
});

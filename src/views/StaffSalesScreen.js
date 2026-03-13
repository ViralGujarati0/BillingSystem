import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { useAtomValue } from 'jotai';

import AppHeaderLayout   from '../components/AppHeaderLayout';
import SalesSummaryStrip from '../components/SalesSummaryStrip';
import SalesCalendar     from '../components/SalesCalendar';
import RecentBillsList   from '../components/RecentBillsList';

import { listenMonthStats } from '../services/statsService';
import { currentStaffAtom } from '../atoms/staff';
import { colors }           from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }

// ── No access placeholder ─────────────────────────────────────────────────────
const NoAccessPlaceholder = ({ message }) => (
  <View style={styles.noAccess}>
    <Icon name="lock-closed-outline" size={rfs(28)} color={colors.textSecondary} />
    <Text style={styles.noAccessText}>{message}</Text>
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const StaffSalesScreen = ({ navigation, route }) => {
  const staffFromRoute = route.params?.userDoc;
  const staffFromAtom  = useAtomValue(currentStaffAtom);
  const staff          = staffFromAtom || staffFromRoute;

  const shopId      = staff?.shopId;
  const salesPerms  = staff?.permissions?.sales || {};

  // Check if staff has ANY sales permission at all
  const hasAnySalesAccess = Object.values(salesPerms).some(Boolean);

  const [stats,        setStats]        = useState([]);
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!shopId || !hasAnySalesAccess) return;
    const now   = new Date();
    const unsub = listenMonthStats(shopId, now.getFullYear(), now.getMonth(), (data) => setStats(data));
    return () => unsub();
  }, [shopId, hasAnySalesAccess]);

  useEffect(() => {
    if (!shopId || !salesPerms.recentBills) return;
    const start = startOfDay(selectedDate);
    const end   = endOfDay(selectedDate);
    const unsub = firestore()
      .collection('billing_shops').doc(shopId).collection('bills')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snap) => {
        setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    return () => unsub();
  }, [shopId, selectedDate, salesPerms.recentBills]);

  return (
    <AppHeaderLayout title="Sales">
      <View style={styles.screen}>

        {!hasAnySalesAccess ? (
          <NoAccessPlaceholder message="You don't have access to the Sales screen" />
        ) : (
          <>
            {salesPerms.summaryStrip && <SalesSummaryStrip stats={stats} />}

            {salesPerms.calendar && (
              <SalesCalendar
                stats={stats}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}

            {salesPerms.recentBills && (
              <>
                <View style={styles.divider} />
                <View style={styles.listWrap}>
                  <RecentBillsList
                    bills={bills || []}
                    loading={loading}
                    selectedDate={selectedDate}
                    onPressBill={(bill) =>
                      navigation.getParent()?.navigate('BillDetail', { bill })
                    }
                  />
                </View>
              </>
            )}

            {/* If only some sub-perms are off, show a subtle note */}
            {hasAnySalesAccess && !salesPerms.summaryStrip && !salesPerms.calendar && !salesPerms.recentBills && (
              <NoAccessPlaceholder message="No sales components are enabled" />
            )}
          </>
        )}

      </View>
    </AppHeaderLayout>
  );
};

export default StaffSalesScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: rvs(6) },
  divider: { height: 1, backgroundColor: colors.borderCard, marginHorizontal: rs(16), marginBottom: rvs(10) },
  listWrap: { flex: 1, paddingHorizontal: rs(16), paddingTop: rvs(4) },
  noAccess: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: rvs(10), paddingHorizontal: rs(40) },
  noAccessText: { fontSize: rfs(13), color: colors.textSecondary, textAlign: 'center', lineHeight: rfs(20) },
});
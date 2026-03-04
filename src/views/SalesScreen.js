import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAtomValue } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { colors } from '../theme/colors';
import RecentBillsList from '../components/RecentBillsList';
import AppHeaderLayout from '../components/AppHeaderLayout';

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0);         return x; }
function endOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999);    return x; }
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
}
function toDate(ts) {
  if (!ts) return null;
  return ts?.toDate ? ts.toDate() : new Date(ts);
}
function formatCurrency(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Number(n).toFixed(0);
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, count, topColor }) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: topColor }]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySub}>{count} bills</Text>
    </View>
  );
}

// ─── Calendar Day ─────────────────────────────────────────────────────────────
function CalDay({ date, isActive, isToday, hasBills, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.calDay, isActive && styles.calDayActive]}
      onPress={() => onPress(date)}
      activeOpacity={0.75}
    >
      <Text style={[styles.calDayName, isActive && styles.calTextActive]}>
        {DAY_NAMES[date.getDay()]}
      </Text>
      <Text style={[
        styles.calDayNum,
        isToday && !isActive && styles.calDayNumToday,
        isActive && styles.calTextActive,
      ]}>
        {date.getDate()}
      </Text>
      {hasBills
        ? <View style={[styles.calDot, isActive && styles.calDotActive]} />
        : <View style={styles.calDotPlaceholder} />
      }
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
const SalesScreen = ({ navigation }) => {
  const owner  = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  // now is computed fresh on every render so totals stay accurate
  const now = new Date();

  const [allBills,     setAllBills]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calMonth,     setCalMonth]     = useState(() => new Date().getMonth());
  const [calYear,      setCalYear]      = useState(() => new Date().getFullYear());

  useEffect(() => {
    if (!shopId) return;
    const unsub = firestore()
      .collection('billing_shops')
      .doc(shopId)
      .collection('bills')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .onSnapshot(snap => {
        setAllBills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    return unsub;
  }, [shopId]);

  // ── Filtered by selected date ──────────────────────────
  const filteredBills = allBills.filter(b => {
    const d = toDate(b.createdAt);
    return d && isSameDay(d, selectedDate);
  });

  // ── Summary stats ──────────────────────────────────────
  const sum = list => list.reduce((a, b) => a + Number(b.grandTotal || 0), 0);

  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);

  const weekStart  = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

  const todayBills = allBills.filter(b => {
    const d = toDate(b.createdAt);
    return d && d >= todayStart && d <= todayEnd;
  });

  const weekBills = allBills.filter(b => {
    const d = toDate(b.createdAt);
    return d && d >= weekStart && d <= todayEnd;
  });

  const monthBills = allBills.filter(b => {
    const d = toDate(b.createdAt);
    return d && d >= monthStart && d <= todayEnd;
  });

  // ── Calendar ───────────────────────────────────────────
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const billDaySet = new Set(
    allBills
      .map(b => toDate(b.createdAt))
      .filter(d => d && d.getMonth() === calMonth && d.getFullYear() === calYear)
      .map(d => d.getDate())
  );

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <AppHeaderLayout title="Sales" subtitle="Today">
      <View style={styles.screen}>

        {/* ── Summary Strip ──────────────────────────────── */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Today"      value={formatCurrency(sum(todayBills))} count={todayBills.length} topColor={colors.primary} />
          <SummaryCard label="This Week"  value={formatCurrency(sum(weekBills))}  count={weekBills.length}  topColor={colors.accent}  />
          <SummaryCard label="This Month" value={formatCurrency(sum(monthBills))} count={monthBills.length} topColor={colors.success} />
        </View>

        {/* ── Calendar ───────────────────────────────────── */}
        <View style={styles.calSection}>
          {/* Month header */}
          <View style={styles.calMonthRow}>
            <Text style={styles.calMonthLabel}>
              {MONTH_NAMES[calMonth]} {calYear}
            </Text>
            <View style={styles.calNavRow}>
              <TouchableOpacity style={styles.calNavBtn} onPress={prevMonth} activeOpacity={0.7}>
                <Text style={styles.calNavIcon}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.calNavBtn} onPress={nextMonth} activeOpacity={0.7}>
                <Text style={styles.calNavIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Day strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calStrip}
          >
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = new Date(calYear, calMonth, i + 1);
              return (
                <CalDay
                  key={i}
                  date={date}
                  isActive={isSameDay(date, selectedDate)}
                  isToday={isSameDay(date, now)}
                  hasBills={billDaySet.has(i + 1)}
                  onPress={setSelectedDate}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* ── Bills List ─────────────────────────────────── */}
        <View style={styles.listWrap}>
          <RecentBillsList
            bills={filteredBills}
            loading={loading}
            selectedDate={selectedDate}
            onPressBill={bill => console.log('Open bill:', bill.billNo)}
          />
        </View>

      </View>
    </AppHeaderLayout>
  );
};

export default SalesScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Summary ────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 9,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderTopWidth: 2.5,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  summarySub: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Calendar ───────────────────────────────────────────
  calSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  calMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  calMonthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  calNavRow: {
    flexDirection: 'row',
    gap: 6,
  },

  calNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },

  calNavIcon: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  calStrip: {
    gap: 6,
    paddingBottom: 2,
  },

  calDay: {
    width: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderCard,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },

  calDayActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.shadowPrimary,
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },

  calDayName: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  calTextActive: {
    color: '#FFFFFF',
  },

  calDayNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  calDayNumToday: {
    color: colors.accent,
  },

  // Dot row — keeps height consistent whether or not there's a dot
  calDot: {
    marginTop: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },

  calDotActive: {
    backgroundColor: 'rgba(245,166,35,0.85)',
  },

  calDotPlaceholder: {
    marginTop: 5,
    width: 4,
    height: 4,
  },

  // ── Bills list ─────────────────────────────────────────
  listWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";

import { currentOwnerAtom } from "../atoms/owner";
import { colors } from "../theme/colors";
import AppHeaderLayout    from "../components/AppHeaderLayout";
import SalesSummaryStrip  from "../components/SalesSummaryStrip";
import SalesCalendar      from "../components/SalesCalendar";
import RecentBillsList    from "../components/RecentBillsList";

import { listenMonthStats } from "../services/statsService";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

const SalesScreen = ({ navigation }) => {
  const { t }  = useTranslation();
  const owner  = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  const [stats,        setStats]        = useState([]);
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ── Listen to month stats (realtime) ─────────────────────────────────────
  useEffect(() => {
    if (!shopId) return;
    const now   = new Date();
    const unsub = listenMonthStats(shopId, now.getFullYear(), now.getMonth(), (data) => {
      console.log('[SalesScreen] stats count:', data.length);
      setStats(data);
    });
    return () => unsub();
  }, [shopId]);

  // ── Listen to bills for selected date (realtime) ──────────────────────────
  useEffect(() => {
    if (!shopId) {
      console.warn('[SalesScreen] no shopId yet, skipping bills query');
      return;
    }

    setLoading(true);

    const start = startOfDay(selectedDate);
    const end   = endOfDay(selectedDate);

    const startTs = firestore.Timestamp.fromDate(start);
    const endTs   = firestore.Timestamp.fromDate(end);

    // ── DEBUG: log exactly what we're querying ──
    console.log('[SalesScreen] ── BILLS QUERY ──────────────────');
    console.log('[SalesScreen] shopId           :', shopId);
    console.log('[SalesScreen] selectedDate      :', selectedDate.toISOString());
    console.log('[SalesScreen] startOfDay (local):', start.toString());
    console.log('[SalesScreen] endOfDay   (local):', end.toString());
    console.log('[SalesScreen] startTs.toDate()  :', startTs.toDate().toISOString());
    console.log('[SalesScreen] endTs.toDate()    :', endTs.toDate().toISOString());
    console.log('[SalesScreen] collection path   :', `billing_shops/${shopId}/bills`);
    console.log('[SalesScreen] ────────────────────────────────');

    const unsub = firestore()
      .collection("billing_shops")
      .doc(shopId)
      .collection("bills")
      .where("createdAt", ">=", startTs)
      .where("createdAt", "<=", endTs)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snap) => {
          console.log('[SalesScreen] snapshot received, doc count:', snap.docs.length);
          snap.docs.forEach((d, i) => {
            const data = d.data();
            console.log(
              `[SalesScreen] bill[${i}]`,
              '| id:', d.id,
              '| createdAt:', data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
              '| grandTotal:', data.grandTotal
            );
          });
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setBills(data);
          setLoading(false);
        },
        (error) => {
          console.error('[SalesScreen] bills query ERROR:', error.code, error.message);
          setLoading(false);
        }
      );

    return () => unsub();
  }, [shopId, selectedDate]);

  return (
    <AppHeaderLayout title={t('sales.title')}>
      <View style={styles.screen}>

        <SalesSummaryStrip stats={stats} />

        <SalesCalendar
          stats={stats}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

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

      </View>
    </AppHeaderLayout>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: rvs(6),
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderCard,
    marginHorizontal: rs(16),
    marginBottom: rvs(10),
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(4),
  },
});
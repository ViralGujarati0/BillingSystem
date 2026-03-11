import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";

import { currentOwnerAtom } from "../atoms/owner";
import { colors } from "../theme/colors";

import AppHeaderLayout   from "../components/AppHeaderLayout";
import SalesSummaryStrip from "../components/SalesSummaryStrip";
import SalesCalendar     from "../components/SalesCalendar";
import RecentBillsList   from "../components/RecentBillsList";

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

  const owner  = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  const [stats,        setStats]        = useState([]);
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!shopId) return;
    const now   = new Date();
    const unsub = listenMonthStats(shopId, now.getFullYear(), now.getMonth(), (data) => {
      setStats(data);
    });
    return () => unsub();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    const start = startOfDay(selectedDate);
    const end   = endOfDay(selectedDate);
    const unsub = firestore()
      .collection("billing_shops")
      .doc(shopId)
      .collection("bills")
      .where("createdAt", ">=", start)
      .where("createdAt", "<=", end)
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBills(data);
        setLoading(false);
      });
    return () => unsub();
  }, [shopId, selectedDate]);

  return (
    <AppHeaderLayout title="Sales">
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
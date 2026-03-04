import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";

import { currentOwnerAtom } from "../atoms/owner";
import { colors } from "../theme/colors";

import AppHeaderLayout from "../components/AppHeaderLayout";
import SalesSummaryStrip from "../components/SalesSummaryStrip";
import SalesCalendar from "../components/SalesCalendar";
import RecentBillsList from "../components/RecentBillsList";

import { listenMonthStats } from "../services/statsService";

/* ───────── DATE HELPERS ───────── */

function startOfDay(d){
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}

function endOfDay(d){
  const x = new Date(d);
  x.setHours(23,59,59,999);
  return x;
}

const SalesScreen = () => {

  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  const [stats,setStats] = useState([]);
  const [bills,setBills] = useState([]);
  const [loading,setLoading] = useState(true);

  const [selectedDate,setSelectedDate] =
    useState(new Date());

  /* ───────── STATS LISTENER ───────── */

  useEffect(()=>{

    if(!shopId) return;

    const now = new Date();

    const unsub = listenMonthStats(
      shopId,
      now.getFullYear(),
      now.getMonth(),
      (data)=>{

        setStats(data);

      }
    );

    return ()=>unsub();

  },[shopId]);

  /* ───────── BILLS LISTENER ───────── */

  useEffect(()=>{

    if(!shopId) return;

    const start = startOfDay(selectedDate);
    const end   = endOfDay(selectedDate);

    const unsub = firestore()
      .collection("billing_shops")
      .doc(shopId)
      .collection("bills")
      .where("createdAt",">=",start)
      .where("createdAt","<=",end)
      .orderBy("createdAt","desc")
      .onSnapshot((snap)=>{

        const data = snap.docs.map(d=>({
          id:d.id,
          ...d.data()
        }));

        setBills(data);
        setLoading(false);

      });

    return ()=>unsub();

  },[shopId,selectedDate]);

  return (

    <AppHeaderLayout
      title="Sales"
      subtitle="Dashboard"
    >

      <View style={styles.screen}>

        <SalesSummaryStrip stats={stats} />

        <SalesCalendar
          stats={stats}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <View style={styles.listWrap}>

          <RecentBillsList
            bills={bills || []}
            loading={loading}
            selectedDate={selectedDate}
            onPressBill={(bill)=>{
              console.log("Open bill:",bill.billNo);
            }}
          />

        </View>

      </View>

    </AppHeaderLayout>

  );

};

export default SalesScreen;

const styles = StyleSheet.create({

  screen:{
    flex:1,
    backgroundColor:colors.background
  },

  listWrap:{
    flex:1,
    paddingHorizontal:16
  }

});
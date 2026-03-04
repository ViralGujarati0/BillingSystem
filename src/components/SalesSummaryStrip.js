import React from "react";
import { View, StyleSheet } from "react-native";

import SummaryCard from "./SummaryCard";

import {
  getTodayKey,
  sumStats,
  filterWeekStats,
  formatCurrency
} from "../utils/statsUtils";

import { colors } from "../theme/colors";

const SalesSummaryStrip = ({ stats }) => {

  const todayKey = getTodayKey();

  const todayStats =
    stats.find((s) => s.id === todayKey) || {};

  const weekStats =
    filterWeekStats(stats);

  const monthStats =
    stats;

  return (

    <View style={styles.row}>

      <SummaryCard
        label="Today"
        value={formatCurrency(todayStats?.totalSales || 0)}
        count={todayStats?.totalBills || 0}
        topColor={colors.primary}
      />

      <SummaryCard
        label="This Week"
        value={formatCurrency(sumStats(weekStats,"totalSales"))}
        count={sumStats(weekStats,"totalBills")}
        topColor={colors.accent}
      />

      <SummaryCard
        label="This Month"
        value={formatCurrency(sumStats(monthStats,"totalSales"))}
        count={sumStats(monthStats,"totalBills")}
        topColor={colors.success}
      />

    </View>

  );

};

export default SalesSummaryStrip;

const styles = StyleSheet.create({

  row:{
    flexDirection:"row",
    gap:8,
    paddingHorizontal:16,
    paddingTop:14
  }

});
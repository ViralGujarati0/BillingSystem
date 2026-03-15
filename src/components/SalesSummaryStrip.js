import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";

import SummaryCard from "./SummaryCard";

import {
  getTodayKey,
  sumStats,
  filterWeekStats,
  formatCurrency
} from "../utils/statsUtils";

import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);

// ─── Component ────────────────────────────────────────────────────────────────
const SalesSummaryStrip = ({ stats }) => {
  const { t } = useTranslation();

  // Logic unchanged
  const todayKey   = getTodayKey();
  const todayStats = stats.find((s) => s.id === todayKey) || {};
  const weekStats  = filterWeekStats(stats);
  const monthStats = stats;

  return (
    <View style={styles.row}>

      <SummaryCard
        label={t("sales.today")}
        value={formatCurrency(todayStats?.totalSales || 0)}
        count={todayStats?.totalBills || 0}
        topColor={colors.primary}
      />

      <SummaryCard
        label={t("sales.thisWeek")}
        value={formatCurrency(sumStats(weekStats, "totalSales"))}
        count={sumStats(weekStats, "totalBills")}
        topColor={colors.accent}
      />

      <SummaryCard
        label={t("sales.thisMonth")}
        value={formatCurrency(sumStats(monthStats, "totalSales"))}
        count={sumStats(monthStats, "totalBills")}
        topColor={colors.success}
      />

    </View>
  );
};

export default SalesSummaryStrip;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: rs(8),
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(10),
  },
});
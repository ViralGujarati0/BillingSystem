import React from 'react';
import {
  View, Text, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../theme/colors';
import PeriodToggle from './PeriodToggle';


const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const DONUT_SIZE   = rs(110);
const STROKE_WIDTH = rs(14);
const RADIUS       = (DONUT_SIZE / 2) - (STROKE_WIDTH / 2);
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PAYMENT_COLORS = {
  CASH: colors.primary,
  UPI:  colors.accent,
  CARD: colors.success,
};

/**
 * PaymentSplitCard
 * Props: stats, period, onChangePeriod, loading
 */
const PaymentSplitCard = ({ stats, period, onChangePeriod, loading }) => {

  const cash = stats?.cashSales  || 0;
  const upi  = stats?.upiSales   || 0;
  const card = stats?.cardSales  || 0;
  const total = cash + upi + card;

  const segments = [
    { key: 'CASH', label: 'Cash', value: cash, bills: stats?.cashBills || 0 },
    { key: 'UPI',  label: 'UPI',  value: upi,  bills: stats?.upiBills  || 0 },
    { key: 'CARD', label: 'Card', value: card, bills: stats?.cardBills || 0 },
  ];

  // Build donut arcs
  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct  = total > 0 ? seg.value / total : 0;
    const dash = pct * CIRCUMFERENCE;
    const gap  = CIRCUMFERENCE - dash;
    const arc  = { ...seg, dash, gap, offset };
    offset += dash;
    return arc;
  });

  const formatVal = (v) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K`
    : `₹${v.toFixed(0)}`;

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment Split</Text>
        <PeriodToggle period={period} onChangePeriod={onChangePeriod} />
      </View>

      <View style={styles.body}>

        {/* Donut */}
        <View style={styles.donutWrap}>
          <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
            <G rotation="-90" origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}>
              {/* Track */}
              <Circle
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={RADIUS}
                stroke="rgba(45,74,82,0.07)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              {/* Segments */}
              {!loading && total > 0 && arcs.map((arc) => (
                <Circle
                  key={arc.key}
                  cx={DONUT_SIZE / 2}
                  cy={DONUT_SIZE / 2}
                  r={RADIUS}
                  stroke={PAYMENT_COLORS[arc.key]}
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${arc.dash} ${arc.gap}`}
                  strokeDashoffset={-arc.offset}
                  strokeLinecap="round"
                />
              ))}
            </G>
          </Svg>
          {/* Center label */}
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotal}>{formatVal(total)}</Text>
            <Text style={styles.donutLabel}>Total</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {segments.map((seg) => {
            const pct = total > 0 ? ((seg.value / total) * 100).toFixed(0) : 0;
            return (
              <View key={seg.key} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: PAYMENT_COLORS[seg.key] }]} />
                <View style={styles.legendInfo}>
                  <Text style={styles.legendLabel}>{seg.label}</Text>
                  <Text style={styles.legendBills}>{seg.bills} bills</Text>
                </View>
                <View style={styles.legendRight}>
                  <Text style={styles.legendValue}>{formatVal(seg.value)}</Text>
                  <Text style={styles.legendPct}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>

      </View>
    </View>
  );
};

export default PaymentSplitCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: rs(16),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    gap: rvs(14),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(16),
  },
  donutWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotal: {
    fontSize: rfs(12),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  donutLabel: {
    fontSize: rfs(8),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  legend: {
    flex: 1,
    gap: rvs(10),
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  legendDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    flexShrink: 0,
  },
  legendInfo: {
    flex: 1,
    gap: rvs(1),
  },
  legendLabel: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  legendBills: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legendRight: {
    alignItems: 'flex-end',
    gap: rvs(1),
  },
  legendValue: {
    fontSize: rfs(11),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  legendPct: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
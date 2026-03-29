import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import PeriodToggle from './PeriodToggle';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * StatCard
 * Props:
 *   leftIcon      (ReactNode)  — icon shown in body icon wrap
 *   label         (string)     — shown in colored header
 *   value         (string)     — main metric value
 *   valueColor    (string)     — override value text color
 *   subLabel      (string)     — optional sub row label
 *   subValue      (string)     — optional sub row value
 *   period        (string)     — 'today' | '7d' | '30d'
 *   onChangePeriod(fn)         — period change handler
 *   loading       (bool)
 *   accentColor   (string)     — drives header bg + icon + value colors
 */
const StatCard = ({
  leftIcon,
  label,
  value,
  valueColor,
  subLabel,
  subValue,
  period,
  onChangePeriod,
  loading,
  accentColor,
}) => {
  const accent = accentColor || colors.primary;

  const PERIODS = [
    { key: 'today', label: 'Today' },
    { key: '7d',    label: 'Last 7 Days' },
    { key: '30d',   label: 'Last 30 Days' },
  ];
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? 'Today';

  return (
    <View style={styles.card}>

      {/* ── Colored header strip ── */}
      <View style={[styles.header, { backgroundColor: accent }]}>
        <Text style={styles.headerLabel} numberOfLines={1}>{label}</Text>

        {onChangePeriod ? (
          <PeriodToggle
            period={period}
            onChangePeriod={onChangePeriod}
            loading={loading}
            accentColor={accent}
            label={label}
          />
        ) : null}
      </View>

      {/* ── Card body ── */}
      <View style={styles.body}>

        <View style={styles.iconValueRow}>

          {leftIcon ? (
            <View style={[styles.iconWrap, {
              backgroundColor: `${accent}14`,
              borderColor: `${accent}22`,
            }]}>
              {leftIcon}
            </View>
          ) : null}

          <View style={styles.valueBlock}>
            {loading ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color={accent} />
                <View style={styles.skeleton} />
              </View>
            ) : (
              <Text
                style={[styles.value, { color: valueColor || accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {value ?? '—'}
              </Text>
            )}

            {onChangePeriod && !loading ? (
              <View style={styles.periodTag}>
                <Text style={styles.periodTagText}>{periodLabel}</Text>
              </View>
            ) : null}
          </View>

        </View>

        {subLabel && subValue && !loading ? (
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>{subLabel}</Text>
            <Text style={styles.subValue}>{subValue}</Text>
          </View>
        ) : null}

      </View>

    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(12),
    paddingVertical: rvs(3),
    borderTopLeftRadius: rs(15),
    borderTopRightRadius: rs(15),
  },
  headerLabel: {
    flex: 1,
    fontSize: rfs(12),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  /* ── Body ── */
  body: {
    padding: rs(12),
    gap: rvs(5),
  },
  iconValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  iconWrap: {
    width: rs(34),
    height: rs(34),
    borderRadius: rs(9),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueBlock: {
    flex: 1,
    gap: rvs(2),
  },
  value: {
    fontSize: rfs(22),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    height: rvs(30),
  },
  skeleton: {
    height: rvs(20),
    width: rs(70),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(6),
  },

  /* ── Period tag ── */
  periodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(3),
    marginTop: rvs(1),
  },
  periodTagText: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '500',
  },

  /* ── Sub row ── */
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    marginTop: rvs(1),
  },
  subLabel: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  subValue: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
  },

});
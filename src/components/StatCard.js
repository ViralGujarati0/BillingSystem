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
 *   accentColor   (string)     — drives value color fallback
 *   headerColor   (string)     — drives header + floating icon color
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
  headerColor,
}) => {
  const accent = accentColor || colors.primary;
  const headerAccent = headerColor || accent;

  const PERIODS = [
    { key: 'today', label: 'Today' },
    { key: '7d',    label: 'Last 7 Days' },
    { key: '30d',   label: 'Last 30 Days' },
  ];
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? 'Today';

  return (
    <View style={styles.card}>

      {/* ── Colored header strip ── */}
      <View style={[styles.header, { backgroundColor: headerAccent }]}>
        <Text style={styles.headerLabel} numberOfLines={1}>{label}</Text>

        {onChangePeriod ? (
          <View style={styles.toggleWrap}>
            <PeriodToggle
              period={period}
              onChangePeriod={onChangePeriod}
              loading={loading}
              accentColor={headerAccent}
              label={label}
            />
          </View>
        ) : null}

        <View pointerEvents="none" style={styles.decoBigCircle} />
        <View pointerEvents="none" style={styles.decoSmallCircle} />
      </View>

      {/* ── Floating icon ── */}
      {leftIcon ? (
        <View style={[styles.floatingIcon, { backgroundColor: headerAccent }]}>
          {React.isValidElement(leftIcon)
            ? React.cloneElement(leftIcon, {
                color: 'rgba(255,255,255,0.95)',
                size: rfs(13),
              })
            : leftIcon}
        </View>
      ) : null}

      {/* ── Card body ── */}
      <View style={styles.body}>
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

        {subLabel && subValue && !loading ? (
          <View style={styles.subRow}>
            <Text style={styles.subText}>{subLabel}</Text>
            <Text style={styles.subText}>{subValue}</Text>
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
    overflow: 'hidden',
  },

  /* ── Header ── */
  header: {
    paddingHorizontal: rs(12),
    paddingTop: rvs(11),
    paddingBottom: rvs(18),
    overflow: 'hidden',
  },
  toggleWrap: {
    position: 'absolute',
    top: rvs(6),
    right: rs(6),
    zIndex: 3,
    elevation: 3,
  },
  headerLabel: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    paddingRight: rs(40),
  },
  decoBigCircle: {
    position: 'absolute',
    top: rvs(-10),
    right: rs(-10),
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decoSmallCircle: {
    position: 'absolute',
    top: rvs(3),
    right: rs(4),
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  /* ── Body ── */
  body: {
    paddingHorizontal: rs(12),
    paddingTop: rvs(6),
    paddingBottom: rvs(13),
    gap: rvs(2),
  },
  floatingIcon: {
    marginTop: rvs(-14),
    marginLeft: rs(12),
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  value: {
    fontSize: rfs(20),
    fontWeight: '900',
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
  subText: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '600',
  },

});
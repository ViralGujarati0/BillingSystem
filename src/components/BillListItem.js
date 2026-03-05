import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Payment config ───────────────────────────────────────────────────────────
const PAY_CONFIG = {
  CASH: {
    stripe:     '#5B9E6D',
    iconBg:     'rgba(91,158,109,0.10)',
    badgeBg:    'rgba(91,158,109,0.12)',
    badgeColor: '#5B9E6D',
  },
  UPI: {
    stripe:     colors.primary,
    iconBg:     'rgba(45,74,82,0.08)',
    badgeBg:    'rgba(45,74,82,0.10)',
    badgeColor: colors.primary,
  },
  CARD: {
    stripe:     colors.accent,
    iconBg:     'rgba(245,166,35,0.10)',
    badgeBg:    'rgba(245,166,35,0.12)',
    badgeColor: '#c47c0a',
  },
};

const DEFAULT_PAY = {
  stripe:     colors.border,
  iconBg:     'rgba(138,155,163,0.08)',
  badgeBg:    'rgba(138,155,163,0.10)',
  badgeColor: colors.textSecondary,
};

// ─── Format time ──────────────────────────────────────────────────────────────
function formatTime(timestamp) {
  if (!timestamp) return null;
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
const BillListItem = ({ bill, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const payKey = (bill?.paymentType || '').toUpperCase();
  const pay    = PAY_CONFIG[payKey] ?? DEFAULT_PAY;
  const time   = formatTime(bill?.createdAt);

  const onPressIn  = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 200 }).start();

  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 200 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: rvs(10) }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {/* Left colored stripe */}
        <View style={[styles.stripe, { backgroundColor: pay.stripe }]} />

        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: pay.iconBg }]}>
          <Icon name="receipt-outline" size={rfs(18)} color={pay.stripe} />
        </View>

        {/* Bill info */}
        <View style={styles.info}>
          <Text style={styles.billNo} numberOfLines={1}>
            Bill #{bill?.billNo}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.customer} numberOfLines={1}>
              {bill?.customerName || 'Walk-in'}
            </Text>
            {!!time && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.time}>{time}</Text>
              </>
            )}
          </View>
        </View>

        {/* Amount + payment badge */}
        <View style={styles.right}>
          <Text style={styles.amount}>
            ₹{Number(bill?.grandTotal || 0).toFixed(2)}
          </Text>
          <View style={[styles.badge, { backgroundColor: pay.badgeBg }]}>
            <Text style={[styles.badgeText, { color: pay.badgeColor }]}>
              {bill?.paymentType?.toUpperCase() || 'N/A'}
            </Text>
          </View>
        </View>

      </TouchableOpacity>
    </Animated.View>
  );
};

export default BillListItem;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
  },

  stripe: {
    width: rs(3),
    alignSelf: 'stretch',
  },

  iconCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: rs(12),
    flexShrink: 0,
  },

  info: {
    flex: 1,
    paddingVertical: rvs(14),
    paddingLeft: rs(10),
    minWidth: 0,
  },
  billNo: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: rvs(3),
    gap: rs(5),
  },
  customer: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  metaDot: {
    width: rs(3),
    height: rs(3),
    borderRadius: rs(2),
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  time: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    flexShrink: 0,
  },

  right: {
    alignItems: 'flex-end',
    paddingRight: rs(14),
    paddingVertical: rvs(14),
    gap: rvs(5),
    flexShrink: 0,
  },
  amount: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: rs(8),
    paddingVertical: rvs(2),
    borderRadius: rs(8),
  },
  badgeText: {
    fontSize: rfs(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
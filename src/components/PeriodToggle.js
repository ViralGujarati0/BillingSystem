import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const OPTIONS = [
  { key: 'today', label: 'Today',       icon: 'today-outline'    },
  { key: '7d',    label: 'Last 7 Days', icon: 'calendar-outline' },
  { key: '30d',   label: 'Last 30 Days',icon: 'calendar-outline' },
];

const PERIOD_LABEL = { today: 'Today', '7d': '7D', '30d': '30D' };

/**
 * PeriodToggle
 * Props: period, onChangePeriod, loading
 * Per-card period selector — does NOT affect other cards
 */
const PeriodToggle = ({ period, onChangePeriod, loading }) => {
  const [open, setOpen] = useState(false);

  const select = (key) => {
    setOpen(false);
    if (key !== period) onChangePeriod(key);
  };

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        style={styles.pill}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        {loading ? (
          <View style={styles.loadingDot} />
        ) : (
          <>
            <Text style={styles.pillLabel}>{PERIOD_LABEL[period] || 'Today'}</Text>
            <Icon name="chevron-down" size={rfs(10)} color={colors.primary} />
          </>
        )}
      </TouchableOpacity>

      {/* Dropdown */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Select Period</Text>
            <View style={styles.divider} />
            {OPTIONS.map((opt, i) => {
              const active = opt.key === period;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.menuItem,
                    active && styles.menuItemActive,
                    i < OPTIONS.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => select(opt.key)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIcon, active && styles.menuIconActive]}>
                    <Icon
                      name={opt.icon}
                      size={rfs(14)}
                      color={active ? '#fff' : colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                    {opt.label}
                  </Text>
                  {active && (
                    <Icon name="checkmark" size={rfs(14)} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PeriodToggle;

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(4),
    minWidth: rs(52),
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  loadingDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,43,48,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(48),
  },
  menu: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(8),
    shadowColor: 'rgba(26,43,48,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(20),
    elevation: 10,
  },
  menuTitle: {
    fontSize: rfs(11),
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: rs(16),
    marginBottom: rvs(8),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(4),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(12),
  },
  menuItemActive: {
    backgroundColor: 'rgba(45,74,82,0.04)',
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },
  menuIcon: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    backgroundColor: 'rgba(45,74,82,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconActive: {
    backgroundColor: colors.primary,
  },
  menuLabel: {
    flex: 1,
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuLabelActive: {
    fontWeight: '800',
    color: colors.primary,
  },
});
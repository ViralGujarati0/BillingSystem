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
  { key: 'today', label: 'Today',        icon: 'today-outline'         },
  { key: '7d',    label: 'Last 7 Days',  icon: 'calendar-outline'      },
  { key: '30d',   label: 'Last 30 Days', icon: 'calendar-clear-outline' },
];

/**
 * PeriodToggle
 * Props: period, onChangePeriod, loading, accentColor, label
 * Per-card period selector — does NOT affect other cards
 * Trigger: funnel icon (use anywhere in a card header)
 */
const PeriodToggle = ({ period, onChangePeriod, loading, accentColor, label }) => {
  const [open, setOpen] = useState(false);
  const accent = accentColor || colors.primary;

  const select = (key) => {
    setOpen(false);
    if (key !== period) onChangePeriod(key);
  };

  return (
    <View>
      {/* Trigger — funnel icon only */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingDot} />
        ) : (
          <Icon name="funnel-outline" size={rfs(16)} color="rgba(255,255,255,0.90)" />
        )}
      </TouchableOpacity>

      {/* Modal popup */}
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
          {/* Card — stopPropagation so tapping inside doesn't close */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.card}
            onPress={(e) => e.stopPropagation()}
          >

            {/* Popup header */}
            <View style={styles.popupHeader}>
              <View style={[styles.popupIconBox, { backgroundColor: accent }]}>
                <Icon name="funnel-outline" size={rfs(18)} color="#FFFFFF" />
              </View>
              <View style={styles.popupHeaderText}>
                <Text style={styles.popupTitle}>Filter Period</Text>
                {label ? <Text style={styles.popupSubtitle}>{label}</Text> : null}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Options */}
            {OPTIONS.map((opt, i) => {
              const active = opt.key === period;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.option,
                    active && styles.optionActive,
                    i < OPTIONS.length - 1 && styles.optionBorder,
                  ]}
                  onPress={() => select(opt.key)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.optionIconBox,
                    active && { backgroundColor: `${accent}15`, borderColor: `${accent}30` },
                  ]}>
                    <Icon
                      name={opt.icon}
                      size={rfs(16)}
                      color={active ? accent : colors.textSecondary}
                    />
                  </View>

                  <Text style={[
                    styles.optionLabel,
                    active && { color: accent, fontWeight: '700' },
                  ]}>
                    {opt.label}
                  </Text>

                  {active && (
                    <Icon name="checkmark" size={rfs(16)} color={accent} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default PeriodToggle;

const styles = StyleSheet.create({

  /* ── Trigger ── */
  iconBtn: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: 'rgba(255,255,255,0.60)',
  },

  /* ── Overlay ── */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,43,48,0.50)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(24),
  },

  /* ── Popup card ── */
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingHorizontal: rs(20),
    paddingTop: rvs(22),
    paddingBottom: rvs(18),
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 14,
  },

  /* Popup header */
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    marginBottom: rvs(16),
  },
  popupIconBox: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  popupHeaderText: { flex: 1 },
  popupTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  popupSubtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    marginTop: rvs(2),
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(4),
  },

  /* Options */
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingVertical: rvs(13),
    paddingHorizontal: rs(4),
    borderRadius: rs(10),
  },
  optionActive: {
    backgroundColor: 'rgba(45,74,82,0.05)',
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },
  optionIconBox: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLabel: {
    flex: 1,
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  /* Cancel */
  cancelBtn: {
    marginTop: rvs(12),
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    backgroundColor: 'rgba(45,74,82,0.04)',
  },
  cancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },
}); 
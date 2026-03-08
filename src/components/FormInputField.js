import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * FormInputField
 *
 * Props:
 *   label         string   — field label (uppercase displayed)
 *   value         string
 *   onChangeText  fn
 *   placeholder   string
 *   keyboardType  string   default: 'default'
 *   icon          string   — Ionicons name (optional)
 *   error         string   — inline error text (optional)
 *   required      bool     — shows * marker (optional)
 *   editable      bool     default: true
 */
const FormInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  icon,
  error,
  required = false,
  editable = true,
}) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#E05252'
    : focused
    ? colors.primary
    : colors.borderCard;

  const iconColor = focused
    ? colors.primary
    : value
    ? colors.textSecondary
    : colors.textSecondary;

  return (
    <View style={styles.wrap}>

      {/* Label row */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {error && (
          <View style={styles.errorPill}>
            <Icon name="alert-circle-outline" size={rfs(10)} color="#E05252" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Input row */}
      <View style={[styles.inputRow, { borderColor }]}>

        {/* Left icon (if provided) */}
        {icon && (
          <View style={[styles.iconBox, { borderRightColor: borderColor }]}>
            <Icon name={icon} size={rfs(15)} color={iconColor} />
          </View>
        )}

        <TextInput
          style={[styles.input, !icon && styles.inputNoIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

      </View>

    </View>
  );
};

export default FormInputField;

const styles = StyleSheet.create({
  wrap: {
    gap: rvs(6),
  },

  // ── Label row ────────────────────────────────────────────
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  labelError: {
    color: '#E05252',
  },

  required: {
    color: colors.accent,
    fontWeight: '800',
  },

  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(3),
  },

  errorText: {
    fontSize: rfs(10),
    color: '#E05252',
    fontWeight: '500',
  },

  // ── Input row ────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: rs(12),
    height: rvs(48),
    overflow: 'hidden',
  },

  iconBox: {
    width: rs(44),
    height: '100%',
    backgroundColor: 'rgba(45,74,82,0.05)',
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: rs(12),
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  inputNoIcon: {
    paddingHorizontal: rs(14),
  },
});
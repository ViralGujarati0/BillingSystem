import React from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const SectionLabel = ({ icon, label }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionBar} />
    <Icon name={icon} size={rfs(12)} color={colors.accent} />
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const Field = ({ label, icon, required = false, multiline = false, ...props }) => (
  <View style={styles.fieldWrap}>
    <View style={styles.fieldLabelRow}>
      <Icon name={icon} size={rfs(14)} color={colors.primary} />
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
    </View>

    <TextInput
      placeholderTextColor={colors.textSecondary}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.input, multiline && styles.inputMultiline]}
      {...props}
    />
  </View>
);

export default function ShopForm({ form, setForm }) {
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.root}>
      <SectionLabel icon="storefront-outline" label="SHOP DETAILS" />

      <View style={styles.card}>
        <Field
          label="Business Name"
          icon="business-outline"
          required
          value={form.businessName}
          onChangeText={(v) => update('businessName', v)}
          placeholder="e.g. Shree Ganesh Mart"
        />

        <View style={styles.fieldDivider} />

        <Field
          label="Phone"
          icon="call-outline"
          value={form.phone}
          onChangeText={(v) => update('phone', v)}
          placeholder="e.g. 9876543210"
          keyboardType="phone-pad"
        />

        <View style={styles.fieldDivider} />

        <Field
          label="Address"
          icon="location-outline"
          value={form.address}
          onChangeText={(v) => update('address', v)}
          placeholder="e.g. 12 Market Road, Ahmedabad"
          multiline
        />

        <View style={styles.fieldDivider} />

        <Field
          label="GST Number"
          icon="receipt-outline"
          value={form.gstNumber}
          onChangeText={(v) => update('gstNumber', v)}
          placeholder="e.g. 24ABCDE1234F1Z5"
          autoCapitalize="characters"
        />
      </View>

      <SectionLabel icon="document-text-outline" label="BILL SETTINGS" />

      <View style={styles.card}>
        <Field
          label="Bill Message"
          icon="chatbubble-ellipses-outline"
          value={form.billMessage}
          onChangeText={(v) => update('billMessage', v)}
          placeholder="e.g. Thank you for shopping with us"
          multiline
        />

        <View style={styles.fieldDivider} />

        <Field
          label="Bill Terms"
          icon="reader-outline"
          value={form.billTerms}
          onChangeText={(v) => update('billTerms', v)}
          placeholder="e.g. Goods once sold will not be taken back"
          multiline
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: rvs(10),
  },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
    marginTop: rvs(2),
  },

  sectionBar: {
    width: rs(3),
    height: rvs(14),
    backgroundColor: colors.accent,
    borderRadius: rs(2),
    flexShrink: 0,
  },

  sectionText: {
    fontSize: rfs(10),
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.9,
  },

  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(16),
  },

  fieldWrap: {
    gap: rvs(8),
  },

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
  },

  fieldLabel: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  required: {
    color: colors.danger,
  },

  input: {
    minHeight: rvs(48),
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(12),
    backgroundColor: colors.background,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(12),
    fontSize: rfs(14),
    color: colors.textPrimary,
  },

  inputMultiline: {
    minHeight: rvs(88),
  },

  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(12),
  },
});
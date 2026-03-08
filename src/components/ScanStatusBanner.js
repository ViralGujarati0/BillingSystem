import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const VARIANTS = {
  success: {
    bg:   '#f0fdf4',
    border: '#16a34a',
    icon: 'checkmark-circle',
    iconColor: '#16a34a',
    textColor: '#15803d',
  },
  warning: {
    bg:   '#fffbeb',
    border: '#d97706',
    icon: 'warning-outline',
    iconColor: '#d97706',
    textColor: '#b45309',
  },
  info: {
    bg:   '#eff6ff',
    border: '#1a73e8',
    icon: 'information-circle-outline',
    iconColor: '#1a73e8',
    textColor: '#1d4ed8',
  },
};

export default function ScanStatusBanner({ type = 'info', message }) {
  const v = VARIANTS[type] ?? VARIANTS.info;
  return (
    <View style={[styles.banner, { backgroundColor: v.bg, borderLeftColor: v.border }]}>
      <Icon name={v.icon} size={18} color={v.iconColor} style={styles.icon} />
      <Text style={[styles.text, { color: v.textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
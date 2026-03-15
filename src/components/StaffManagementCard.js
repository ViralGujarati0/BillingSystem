import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

export default function StaffManagementCard({ navigation }) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('StaffManagement')}
      activeOpacity={0.8}
    >
      <View style={styles.iconBox}>
        <Icon name="people-outline" size={rfs(16)} color="#4078C8" />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('staff.management')}</Text>
        <Text style={styles.subtitle}>{t('staff.managementSub')}</Text>
      </View>

      <Icon name="chevron-forward" size={rfs(14)} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(13),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F4F5',
  },

  iconBox: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(10),
    backgroundColor: 'rgba(64,120,200,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(64,120,200,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  textWrap: { flex: 1 },

  title: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    marginTop: rvs(1),
  },

});
import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * DailyReportFab
 * Props: navigation, shopName, shopAddress, vm, periodLabel
 */
const DailyReportFab = ({ navigation, shopName, shopAddress, vm, periodLabel = 'Today' }) => {

  const handlePress = () => {
    const reportData = {
      shopName:      shopName     || 'My Shop',
      shopAddress:   shopAddress  || '',
      periodLabel,
      stats:         vm?.revenue?.stats      || {},
      prevStats:     vm?.comparison?.prev    || null,
      topProducts:   vm?.topProducts?.data   || [],
      recentBills:   vm?.recentBills         || [],
      lowStockItems: vm?.lowStockItems       || [],
      dailyData:     vm?.chart?.dailyData    || [],
      generatedAt:   new Date(),
    };
    navigation.navigate('DailyReportPreview', { reportData });
  };

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Icon name="document-text-outline" size={rfs(18)} color="#fff" />
      <Text style={styles.label}>Print Report</Text>
    </TouchableOpacity>
  );
};

export default DailyReportFab;

const styles = StyleSheet.create({
  fab: {
    position:          'absolute',
    bottom:            rvs(28),
    right:             rs(20),
    flexDirection:     'row',
    alignItems:        'center',
    gap:               rs(8),
    backgroundColor:   colors.primary,
    paddingVertical:   rvs(13),
    paddingHorizontal: rs(20),
    borderRadius:      rs(30),
    shadowColor:       colors.shadowPrimary,
    shadowOffset:      { width: 0, height: rvs(4) },
    shadowOpacity:     1,
    shadowRadius:      rs(14),
    elevation:         8,
    zIndex:            999,
  },
  label: {
    fontSize:      rfs(13),
    fontWeight:    '800',
    color:         '#fff',
    letterSpacing: 0.2,
  },
});
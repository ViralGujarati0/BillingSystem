import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
    import { colors } from '../../theme/colors';

const TodaySummaryCard = ({ stats }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today Summary</Text>

      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.label}>Sales</Text>
          <Text style={styles.value}>
            ₹{Number(stats?.totalSales || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Profit</Text>
          <Text style={[styles.value, { color: colors.success }]}>
            ₹{Number(stats?.totalProfit || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Bills</Text>
          <Text style={styles.value}>
            {stats?.totalBills || 0}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    color: colors.textPrimary,
  },
});

export default TodaySummaryCard;
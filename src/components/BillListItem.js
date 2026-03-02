import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const BillListItem = ({ bill, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.billNo}>Bill #{bill.billNo}</Text>
        <Text style={styles.customer}>
          {bill.customerName || 'Walk-in'}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>
          ₹{Number(bill.grandTotal || 0).toFixed(2)}
        </Text>
        <Text style={styles.payment}>{bill.paymentType}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  billNo: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  customer: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  amount: {
    fontWeight: '700',
    color: colors.primary,
  },
  payment: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default BillListItem;
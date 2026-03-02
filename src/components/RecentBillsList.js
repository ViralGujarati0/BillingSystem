import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import BillListItem from './BillListItem';
import { colors } from '../theme/colors';

const RecentBillsList = ({ bills, loading, onPressBill }) => {
  if (loading) {
    return <ActivityIndicator color={colors.primary} />;
  }

  if (!bills.length) {
    return (
      <Text style={{ color: colors.textSecondary }}>
        No sales yet.
      </Text>
    );
  }

  return (
    <FlatList
      data={bills}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BillListItem
          bill={item}
          onPress={() => onPressBill(item)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
};

export default RecentBillsList;
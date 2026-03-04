import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import BillListItem from './BillListItem';
import { colors } from '../theme/colors';

/* ─── Section Header ───────────────────────────────────── */

function SectionHeader({ count }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Recent Bills</Text>

      {count > 0 && (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {count} bills
          </Text>
        </View>
      )}

    </View>
  );
}

/* ─── Empty State ─────────────────────────────────────── */

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🧾</Text>

      <Text style={styles.emptyTitle}>
        No bills yet
      </Text>

      <Text style={styles.emptySubtitle}>
        Tap <Text style={styles.emptyAccent}>
          New Bill
        </Text> to create your first sale
      </Text>
    </View>
  );
}

/* ─── Main Component ───────────────────────────────────── */

const RecentBillsList = ({
  bills = [],
  loading,
  onPressBill
}) => {

  if (loading) {
    return (
      <View>

        <SectionHeader count={0} />

        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: 32 }}
        />

      </View>
    );
  }

  return (

    <FlatList
      data={bills || []}

      keyExtractor={(item, index) =>
        item.id ?? String(index)
      }

      ListHeaderComponent={
        <SectionHeader count={bills?.length || 0} />
      }

      ListEmptyComponent={<EmptyState />}

      renderItem={({ item }) => (
        <BillListItem
          bill={item}
          onPress={() => onPressBill(item)}
        />
      )}

      contentContainerStyle={styles.listContent}

      initialNumToRender={12}
      windowSize={7}

      showsVerticalScrollIndicator={false}
    />

  );

};

export default RecentBillsList;

/* ─── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({

  listContent: {
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  headerBadge: {
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  emptyAccent: {
    color: colors.accent,
    fontWeight: '700',
  },

});
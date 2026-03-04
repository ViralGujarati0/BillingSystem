import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

import BillListItem from './BillListItem';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/* ─── Section Header ─────────────────────────────────────────────────────── */

function SectionHeader({ count }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Recent Bills</Text>
      {count > 0 && (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{count} bills</Text>
        </View>
      )}
    </View>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🧾</Text>
      <Text style={styles.emptyTitle}>No bills yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap <Text style={styles.emptyAccent}>New Bill</Text> to create your first sale
      </Text>
    </View>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

const RecentBillsList = ({ bills = [], loading, onPressBill }) => {

  if (loading) {
    return (
      <View>
        <SectionHeader count={0} />
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: rvs(32) }}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={bills || []}
      keyExtractor={(item, index) => item.id ?? String(index)}
      ListHeaderComponent={<SectionHeader count={bills?.length || 0} />}
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

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({

  listContent: {
    paddingBottom: rvs(120),
  },

  // ── Section header ──────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rvs(12),
  },

  headerTitle: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  headerBadge: {
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(3),
  },

  headerBadgeText: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: colors.primary,
  },

  // ── Empty state ─────────────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    paddingTop: rvs(48),
    gap: rvs(8),
  },

  emptyIcon: {
    fontSize: rfs(40),
    marginBottom: rvs(4),
  },

  emptyTitle: {
    fontSize: rfs(16),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptySubtitle: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
  },

  emptyAccent: {
    color: colors.accent,
    fontWeight: '700',
  },
});
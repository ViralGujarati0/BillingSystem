import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAtomValue } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout   from '../components/AppHeaderLayout';
import HeaderBackButton  from '../components/HeaderBackButton';
import PurchaseCard      from '../components/PurchaseCard';
import { currentOwnerAtom } from '../atoms/owner';
import { subscribePurchases } from '../services/purchaseService';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Loading state ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
    <Text style={styles.stateTitle}>Loading purchases…</Text>
    <Text style={styles.stateSub}>Fetching your purchase records</Text>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <Icon name="cart-outline" size={rfs(34)} color={colors.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>No purchases yet</Text>
    <Text style={styles.stateSub}>
      Record your first purchase to get started.
    </Text>
    <TouchableOpacity style={styles.stateBtn} onPress={onAdd} activeOpacity={0.85}>
      <Icon name="add-circle-outline" size={rfs(15)} color="#FFFFFF" />
      <Text style={styles.stateBtnText}>New Purchase</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PurchaseManagementScreen({ navigation }) {
  const { t }   = useTranslation();
  const owner   = useAtomValue(currentOwnerAtom);

  const [purchases, setPurchases] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!owner?.shopId) return;
    setLoading(true);
    const unsubscribe = subscribePurchases(owner.shopId, (list) => {
      setPurchases(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [owner?.shopId]);

  const handleAdd = () => navigation.navigate('PurchaseCreate');

  const headerLeft = (
    <HeaderBackButton onPress={() => navigation.goBack()} />
  );

  return (
    <AppHeaderLayout
      title="Purchase Management"
      subtitle={purchases.length > 0
        ? `${purchases.length} record${purchases.length === 1 ? '' : 's'}`
        : undefined}
      leftComponent={headerLeft}
    >

      <View style={styles.container}>

        {loading && purchases.length === 0 ? (
          <LoadingState />
        ) : (
          <FlatList
            data={purchases}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('PurchaseDetail', { purchase: item })}
              >
                <PurchaseCard purchase={item} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyState onAdd={handleAdd} />}
            contentContainerStyle={[
              styles.listContent,
              purchases.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAdd}
        activeOpacity={0.85}
      >
        <View style={styles.fabIconBox}>
          <Icon name="add-circle-outline" size={rfs(16)} color={colors.primary} />
        </View>
        <Text style={styles.fabText}>New Purchase</Text>
      </TouchableOpacity>

    </AppHeaderLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Container ────────────────────────────────────────
  container: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
  },

  // ── List ─────────────────────────────────────────────
  listContent: {
    paddingBottom: rvs(110),
    gap: rvs(10),
  },

  listContentEmpty: {
    flex: 1,
  },

  // ── FAB ──────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: rvs(24),
    right: rs(16),
    left: rs(16),
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    paddingVertical: rvs(15),
    borderRadius: rs(14),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
    shadowRadius: rs(12),
    elevation: 5,
  },

  fabIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fabText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Loading / empty states ───────────────────────────
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(32),
    gap: rvs(10),
  },

  stateIconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(20),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },

  stateTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  stateSub: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(19),
  },

  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 4,
  },

  stateBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});
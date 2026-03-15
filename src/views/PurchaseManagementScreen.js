import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useAtomValue } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout   from '../components/AppHeaderLayout';
import PurchaseCard      from '../components/PurchaseCard';
import Loader            from '../components/Loader';
import { currentOwnerAtom } from '../atoms/owner';
import { subscribePurchases } from '../services/purchaseService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

export default function PurchaseManagementScreen({ navigation }) {
  const { t } = useTranslation();
  const owner = useAtomValue(currentOwnerAtom);

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

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIconWrap}>
          <Icon name="cart-outline" size={rfs(36)} color="#ccc" />
        </View>
        <Text style={styles.emptyTitle}>{t('purchase.emptyTitle')}</Text>
        <Text style={styles.emptySub}>
          {t('purchase.emptySubtitle')}
        </Text>
      </View>
    );
  };

  return (
    <AppHeaderLayout title={t('purchase.management')}>

      <View style={styles.container}>

        {/* Count badge */}
        {purchases.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {t('purchase.countLabel', { count: purchases.length })}
            </Text>
          </View>
        )}

        {loading && purchases.length === 0 ? (
          <Loader />
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
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PurchaseCreate')}
        activeOpacity={0.85}
      >
        <Icon name="add" size={rfs(22)} color="#fff" />
        <Text style={styles.fabText}>{t('purchase.newPurchase')}</Text>
      </TouchableOpacity>

    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f3ff',
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(4),
    marginBottom: rvs(14),
  },
  countText: {
    fontSize: rfs(12),
    fontWeight: '600',
    color: '#7c3aed',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: rvs(100),
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: rvs(80),
    gap: rvs(10),
  },
  emptyIconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(20),
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },
  emptyTitle: {
    fontSize: rfs(17),
    fontWeight: '700',
    color: '#333',
  },
  emptySub: {
    fontSize: rfs(13),
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: rs(32),
  },
  fab: {
    position: 'absolute',
    bottom: rvs(24),
    right: rs(20),
    left: rs(20),
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rvs(14),
    borderRadius: rs(12),
    gap: rs(8),
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.35,
    shadowRadius: rs(10),
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: rfs(15),
  },
});
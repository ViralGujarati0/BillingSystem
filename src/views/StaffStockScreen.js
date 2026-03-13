import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout         from '../components/AppHeaderLayout';
import InventorySearchBar      from '../components/InventorySearchBar';
import InventoryStatsCards     from '../components/InventoryStatsCards';
import InventoryStockHealth    from '../components/InventoryStockHealth';
import InventoryCategoryFilter from '../components/InventoryCategoryFilter';
import InventoryQuickActions   from '../components/InventoryQuickActions';
import InventoryList           from '../components/InventoryList';

import useStockViewModel    from '../viewmodels/useStockViewModel';
import { useAtomValue }     from 'jotai';
import { currentStaffAtom } from '../atoms/staff';
import { colors }           from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const NoAccessPlaceholder = ({ message }) => (
  <View style={styles.noAccess}>
    <Icon name="lock-closed-outline" size={rfs(28)} color={colors.textSecondary} />
    <Text style={styles.noAccessText}>{message}</Text>
  </View>
);

const StaffStockScreen = ({ navigation, route }) => {
  const staffFromRoute = route.params?.userDoc;
  const staffFromAtom  = useAtomValue(currentStaffAtom);
  const staff          = staffFromAtom || staffFromRoute;
  const stockPerms     = staff?.permissions?.stock || {};

  const hasAnyStockAccess = Object.values(stockPerms).some(Boolean);

  const {
    inventory,
    filteredInventory,
    refreshing,
    refreshInventory,
    searchInventory,
  } = useStockViewModel();

  const [selectedCategory, setSelectedCategory] = useState('All');

  const displayInventory = useMemo(() => {
    if (selectedCategory === 'All') return filteredInventory;
    return filteredInventory.filter((i) => i.category === selectedCategory);
  }, [filteredInventory, selectedCategory]);

  return (
    <AppHeaderLayout
      title="Inventory"
      subtitle={stockPerms.inventoryList ? `${inventory.length} products` : undefined}
      rightComponent={stockPerms.quickActions ? <InventoryQuickActions navigation={navigation} /> : null}
    >
      <View style={styles.container}>

        {!hasAnyStockAccess ? (
          <NoAccessPlaceholder message="You don't have access to the Stock screen" />
        ) : (
          <>
            {stockPerms.searchBar && (
              <View style={styles.searchWrap}>
                <InventorySearchBar navigation={navigation} onSearch={searchInventory} />
              </View>
            )}

            {stockPerms.categoryFilter && (
              <View style={styles.categoryWrap}>
                <InventoryCategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
              </View>
            )}

            {stockPerms.inventoryList ? (
              <InventoryList
                inventory={displayInventory}
                navigation={navigation}
                listHeaderContent={
                  <View style={styles.scrollHeaderContent}>
                    {stockPerms.statsCards  && <InventoryStatsCards inventory={inventory} />}
                    {stockPerms.stockHealth && <InventoryStockHealth inventory={filteredInventory} />}
                  </View>
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshInventory}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
              />
            ) : (
              // Has some stock access but not the list — show only allowed header components
              <View style={styles.headerOnlyWrap}>
                {stockPerms.statsCards  && <InventoryStatsCards inventory={inventory} />}
                {stockPerms.stockHealth && <InventoryStockHealth inventory={filteredInventory} />}
                <NoAccessPlaceholder message="Inventory list access is not enabled" />
              </View>
            )}
          </>
        )}

      </View>
    </AppHeaderLayout>
  );
};

export default StaffStockScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: rs(16), paddingTop: rvs(14), paddingBottom: rvs(10) },
  categoryWrap: { paddingLeft: rs(16), paddingBottom: rvs(12) },
  scrollHeaderContent: { gap: rvs(10) },
  headerOnlyWrap: { flex: 1, gap: rvs(10), paddingTop: rvs(10) },
  noAccess: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: rvs(10), paddingHorizontal: rs(40) },
  noAccessText: { fontSize: rfs(13), color: colors.textSecondary, textAlign: 'center', lineHeight: rfs(20) },
});
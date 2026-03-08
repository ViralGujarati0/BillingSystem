import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";

import AppHeaderLayout          from "../components/AppHeaderLayout";
import InventorySearchBar       from "../components/InventorySearchBar";
import InventoryStatsCards      from "../components/InventoryStatsCards";
import InventoryStockHealth     from "../components/InventoryStockHealth";
import InventoryCategoryFilter  from "../components/InventoryCategoryFilter";
import InventoryQuickActions    from "../components/InventoryQuickActions";
import InventoryList            from "../components/InventoryList";

import useStockViewModel from "../viewmodels/useStockViewModel";

import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Component ────────────────────────────────────────────────────────────────
const StockScreen = ({ navigation }) => {

  const {
    inventory,
    filteredInventory,
    refreshing,
    refreshInventory,
    searchInventory,
  } = useStockViewModel();

  const [selectedCategory, setSelectedCategory] = useState("All");

  /* Filter by selected category on top of search-filtered inventory */
  const displayInventory = useMemo(() => {
    if (selectedCategory === "All") return filteredInventory;
    return filteredInventory.filter((i) => i.category === selectedCategory);
  }, [filteredInventory, selectedCategory]);

  return (
    <AppHeaderLayout
      title="Inventory"
      subtitle={`${inventory.length} products`}
      rightComponent={
        <InventoryQuickActions navigation={navigation} />
      }
    >

      <View style={styles.container}>

        {/* ── FIXED: Search bar ── */}
        <View style={styles.searchWrap}>
          <InventorySearchBar
            navigation={navigation}
            onSearch={searchInventory}
          />
        </View>

        {/* ── FIXED: Category filter chips ── */}
        <View style={styles.categoryWrap}>
          <InventoryCategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        {/* ── SCROLLABLE: stats + health bar + product list ── */}
        <InventoryList
          inventory={displayInventory}
          navigation={navigation}
          listHeaderContent={
            <View style={styles.scrollHeaderContent}>
              <InventoryStatsCards inventory={inventory} />
              <InventoryStockHealth inventory={filteredInventory} />
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

      </View>

    </AppHeaderLayout>
  );
};

export default StockScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Search bar — owns its own horizontal padding + top gap
  searchWrap: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(10),
  },

  // Category chips — full width scroll, left padding only (chips have own padding)
  categoryWrap: {
    paddingLeft: rs(16),
    paddingBottom: rvs(12),
  },

  // Wraps StatsCards + StockHealth inside FlatList header
  // Horizontal padding matches card edges; gap between the two cards
  scrollHeaderContent: {
    gap: rvs(10),
  },

});
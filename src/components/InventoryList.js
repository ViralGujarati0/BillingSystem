import React, { useCallback, useState } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import InventoryItemCard from "./InventoryItemCard";
import { colors }        from "../theme/colors";
import { useTranslation } from "react-i18next";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="cube-outline" size={rfs(36)} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{t("inventory.emptyTitle")}</Text>
      <Text style={styles.emptySub}>{t("inventory.emptySubtitle")}</Text>
    </View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ count }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.secHdr}>
      <Text style={styles.secTitle}>{t("inventory.allProducts")}</Text>
      <View style={styles.secBadge}>
        <Text style={styles.secBadgeText}>
          {t("inventory.itemsCount", { count })}
        </Text>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InventoryList = ({
  inventory,
  navigation,
  refreshControl,
  listHeaderContent,
}) => {
  const [expandedBarcode, setExpandedBarcode] = useState(null);

  const handleExpand = useCallback((barcode) => {
    setExpandedBarcode((prev) => (prev === barcode ? null : barcode));
  }, []);

  const handleUpdate = useCallback(
    (item) => navigation.navigate("UpdateInventory", { barcode: item.barcode }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <InventoryItemCard
        item={item}
        onPress={handleUpdate}
        expanded={expandedBarcode === item.barcode}
        onExpand={() => handleExpand(item.barcode)}
      />
    ),
    [handleUpdate, expandedBarcode, handleExpand]
  );

  const ListHeaderComponent = () => (
    <View style={styles.listHeader}>
      {listHeaderContent}
      <SectionHeader count={inventory.length} />
    </View>
  );

  return (
    <FlatList
      data={inventory}
      keyExtractor={(item) => item.barcode}
      renderItem={renderItem}
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={styles.listContent}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
    />
  );
};

export default InventoryList;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  listContent: {
    paddingHorizontal: rs(16),
    paddingBottom: rvs(100),
    gap: rvs(10),
  },

  listHeader: {
    gap: rvs(10),
    marginBottom: rvs(4),
  },

  // ── Section Header ──────────────────────────────────
  secHdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  secTitle: {
    fontSize: rfs(11),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  secBadge: {
    backgroundColor: "rgba(45,74,82,0.08)",
    borderRadius: rs(8),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(2),
  },

  secBadgeText: {
    fontSize: rfs(11),
    fontWeight: "700",
    color: colors.primary,
  },

  // ── Empty State ─────────────────────────────────────
  emptyWrap: {
    alignItems: "center",
    paddingVertical: rvs(48),
    gap: rvs(10),
  },

  emptyIconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(20),
    backgroundColor: "rgba(45,74,82,0.06)",
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(4),
  },

  emptyTitle: {
    fontSize: rfs(16),
    fontWeight: "700",
    color: colors.textPrimary,
  },

  emptySub: {
    fontSize: rfs(13),
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },

});
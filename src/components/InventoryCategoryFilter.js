import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Fixed category list ──────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  "All",
  "Grocery & Staples",
  "Spices & Masala",
  "Packaged Food",
  "Snacks & Namkeen",
  "Beverages",
  "Dairy & Bakery",
  "Confectionery",
  "Personal Care",
  "Household Cleaning",
  "Baby Care",
  "Health & OTC",
  "Stationery",
];

// ─── Component ────────────────────────────────────────────────────────────────
const InventoryCategoryFilter = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {ALL_CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default InventoryCategoryFilter;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  scroll: {
    flexGrow: 0,
  },

  content: {
    gap: rs(8),
    paddingRight: rs(16),
    paddingVertical: rvs(2),
  },

  chip: {
    paddingHorizontal: rs(14),
    paddingVertical: rvs(6),
    borderRadius: rs(20),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(1) },
    shadowOpacity: 1,
    shadowRadius: rs(4),
    elevation: 1,
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 3,
  },

  chipText: {
    fontSize: rfs(12),
    fontWeight: "600",
    color: colors.textSecondary,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

});
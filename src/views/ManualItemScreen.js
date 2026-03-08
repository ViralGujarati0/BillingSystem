import React, { useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useAtom } from "jotai";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

import { manualItemFormAtom } from "../atoms/billing";
import useBillingViewModel    from "../viewmodels/BillingViewModel";
import ManualItemForm         from "../components/ManualItemForm";
import { colors }             from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

const STATUS_H = Platform.OS === "android"
  ? (StatusBar.currentHeight ?? rvs(24))
  : rvs(44);

// ─── Component ────────────────────────────────────────────────────────────────
const ManualItemScreen = ({ navigation }) => {

  const vm = useBillingViewModel();
  const [form, setForm] = useAtom(manualItemFormAtom);
  const { name, category, unit, qty, mrp, rate } = form;

  const scaleAdd = useRef(new Animated.Value(1)).current;
  const press   = () => Animated.spring(scaleAdd, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 200 }).start();
  const release = () => Animated.spring(scaleAdd, { toValue: 1,    useNativeDriver: true, friction: 8, tension: 200 }).start();

  /* ── LIVE AMOUNT ── */
  const quantity = parseInt(qty, 10) || 0;
  const price    = parseFloat(rate)  || 0;
  const amount   = quantity * price;

  /* ── HANDLE ADD ── */
  const handleAdd = () => {
    const n = name.trim();
    const c = category;
    const u = unit;
    const q = parseInt(qty, 10);
    const r = parseFloat(rate);
    const m = parseFloat(mrp);

    if (!n)             { Alert.alert("Error", "Item name required.");     return; }
    if (!c)             { Alert.alert("Error", "Category required.");      return; }
    if (isNaN(q) || q < 1) { Alert.alert("Error", "Valid quantity required."); return; }
    if (isNaN(r) || r < 0) { Alert.alert("Error", "Valid rate required.");     return; }

    try {
      vm.addManualItem({ name: n, category: c, unit: u, qty: q, rate: r, mrp: isNaN(m) ? r : m });
      setForm({ name: "", category: "", unit: "pcs", qty: "1", mrp: "", rate: "" });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to add item.");
    }
  };

  /* ── RENDER ── */
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Header ── */}
        <LinearGradient
          colors={["#2D4A52", "#1E3A42"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Decorative orbs */}
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          {/* Back pill */}
          <TouchableOpacity
            style={styles.backPill}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="chevron-back" size={rfs(14)} color="rgba(255,255,255,0.85)" />
            <Text style={styles.backPillText}>Back</Text>
          </TouchableOpacity>

          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={styles.titleAccent} />
            <View>
              <Text style={styles.titleText}>Add Manual Item</Text>
              <Text style={styles.titleSub}>Enter item details to add to bill</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Form ── */}
        <View style={styles.formWrap}>
          <ManualItemForm
            name={name}
            category={category}
            unit={unit}
            qty={qty}
            mrp={mrp}
            rate={rate}
            amount={amount}
            onChangeName={(v)     => setForm(p => ({ ...p, name: v }))}
            onChangeCategory={(v) => setForm(p => ({ ...p, category: v }))}
            onChangeUnit={(v)     => setForm(p => ({ ...p, unit: v }))}
            onChangeQty={(v)      => setForm(p => ({ ...p, qty: v }))}
            onChangeMrp={(v)      => setForm(p => ({ ...p, mrp: v }))}
            onChangeRate={(v)     => setForm(p => ({ ...p, rate: v }))}
          />
        </View>

        {/* ── Add to bill button ── */}
        <View style={styles.btnWrap}>
          <Animated.View style={{ transform: [{ scale: scaleAdd }] }}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAdd}
              onPressIn={press}
              onPressOut={release}
              activeOpacity={1}
            >
              <View style={styles.addIconWrap}>
                <Icon name="add" size={rfs(16)} color={colors.accent} />
              </View>
              <Text style={styles.addBtnText}>Add to Bill</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

      </ScrollView>
    </View>
  );
};

export default ManualItemScreen;

/* ───────── STYLES ───────── */
const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: colors.background ?? "#F2F4F5",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: rvs(40),
  },

  // ── Header ────────────────────────────────────────────
  header: {
    paddingTop: STATUS_H + rvs(16),
    paddingBottom: rvs(28),
    paddingHorizontal: rs(20),
    position: "relative",
    overflow: "hidden",
  },

  orbTopRight: {
    position: "absolute",
    top: -rs(40), right: -rs(40),
    width: rs(160), height: rs(160),
    borderRadius: rs(80),
    backgroundColor: "rgba(245,166,35,0.08)",
  },

  orbBottomLeft: {
    position: "absolute",
    bottom: -rvs(20), left: -rs(20),
    width: rs(100), height: rs(100),
    borderRadius: rs(50),
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  backPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: rs(4),
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: rs(20),
    paddingVertical: rvs(6),
    paddingHorizontal: rs(14),
    marginBottom: rvs(18),
    position: "relative",
    zIndex: 1,
  },

  backPillText: {
    fontSize: rfs(14),
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
    position: "relative",
    zIndex: 1,
  },

  titleAccent: {
    width: rs(3),
    height: rvs(36),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
    flexShrink: 0,
  },

  titleText: {
    fontSize: rfs(24),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  titleSub: {
    fontSize: rfs(13),
    color: "rgba(255,255,255,0.50)",
    fontWeight: "500",
    marginTop: rvs(3),
  },

  // ── Form ──────────────────────────────────────────────
  formWrap: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
  },

  // ── Add to bill button ────────────────────────────────
  btnWrap: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(10),
    backgroundColor: colors.primary,
    borderRadius: rs(14),
    paddingVertical: rvs(16),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(5) },
    shadowOpacity: 0.35,
    shadowRadius: rs(12),
    elevation: 6,
  },

  addIconWrap: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: "rgba(245,166,35,0.20)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  addBtnText: {
    fontSize: rfs(16),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
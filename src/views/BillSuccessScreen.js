import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

import { billSuccessDataAtom } from "../atoms/billing";
import { generateBillPdf }     from "../services/pdfService";

import ReceiptHeader  from "../components/ReceiptHeader";
import ReceiptInfo    from "../components/ReceiptInfo";
import ReceiptTable   from "../components/ReceiptTable";
import ReceiptTotals  from "../components/ReceiptTotals";
import ReceiptActions from "../components/ReceiptActions";

import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const STATUS_H = Platform.OS === "android"
  ? (StatusBar.currentHeight ?? rvs(24))
  : rvs(44);

// ─── Component ────────────────────────────────────────────────────────────────
const BillSuccessScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const data = useAtomValue(billSuccessDataAtom);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { backScreen = "OwnerTabs", backParams = {} } = route.params || {};

  /* ───────── BACK TO HOME ───────── */
  const handleBackToHome = () => {
    navigation.replace(backScreen, backParams);
  };

  /* ───────── CREATE PDF ───────── */
  const handleConvertToPdf = async () => {
    if (!data) return;
    try {
      setPdfLoading(true);
      await generateBillPdf(data);
    } catch (e) {
      Alert.alert("Error", e?.message || "Could not create PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  /* ───────── NO BILL DATA ───────── */
  if (!data) {
    return (
      <View style={styles.errorCenter}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.errorCard}>
          <Icon name="receipt-outline" size={rfs(36)} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>{t('billing.noBillData')}</Text>
          <Text style={styles.errorSub}>{t('billing.noBillDataSub')}</Text>
          <TouchableOpacity
            style={styles.errorBackBtn}
            onPress={handleBackToHome}
            activeOpacity={0.8}
          >
            <Icon name="home-outline" size={rfs(14)} color="#FFFFFF" />
            <Text style={styles.errorBackText}>{t('billing.backToHome')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ───────── MAIN UI ───────── */
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Success banner ── */}
        <LinearGradient
          colors={["#2D4A52", "#1E3A42"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          {/* Decorative orbs */}
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          {/* Success ring */}
          <View style={styles.successRing}>
            <Icon name="checkmark" size={rfs(32)} color="#5B9E6D" />
          </View>

          <Text style={styles.bannerTitle}>{t('billing.billGenerated')}</Text>
          <Text style={styles.bannerSub}>{t('billing.billSavedSuccess')}</Text>

          {/* Bill no pill */}
          {!!data.billNo && (
            <View style={styles.billNoPill}>
              <View style={styles.billNoDot} />
              <Text style={styles.billNoText}>BILL #{data.billNo}</Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Receipt card ── */}
        <View style={styles.receiptCard}>
          <ReceiptHeader
            shopName={data.shopName}
            shopAddress={data.shopAddress}
          />
          <ReceiptInfo data={data} />
          <ReceiptTable items={data.items} />
          <ReceiptTotals data={data} />

          {/* Thank you message */}
          <View style={styles.thanksRow}>
            <Text style={styles.thanks}>
              {data.thankYouMessage || "Thank you for visiting!"}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <ReceiptActions
          loading={pdfLoading}
          onPdf={handleConvertToPdf}
          onBack={handleBackToHome}
        />

      </ScrollView>
    </View>
  );
};

export default BillSuccessScreen;

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

  // ── Success banner ────────────────────────────────────
  banner: {
    paddingTop: STATUS_H + rvs(20),
    paddingBottom: rvs(28),
    paddingHorizontal: rs(20),
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  orbTopRight: {
    position: "absolute",
    top: -rs(40),
    right: -rs(40),
    width: rs(160),
    height: rs(160),
    borderRadius: rs(80),
    backgroundColor: "rgba(245,166,35,0.08)",
  },

  orbBottomLeft: {
    position: "absolute",
    bottom: -rvs(20),
    left: -rs(20),
    width: rs(100),
    height: rs(100),
    borderRadius: rs(50),
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  successRing: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(36),
    backgroundColor: "rgba(91,158,109,0.15)",
    borderWidth: 1,
    borderColor: "rgba(91,158,109,0.40)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(14),
  },

  bannerTitle: {
    fontSize: rfs(20),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  bannerSub: {
    fontSize: rfs(12),
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
    marginTop: rvs(4),
  },

  billNoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    marginTop: rvs(14),
    backgroundColor: "rgba(245,166,35,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.30)",
    borderRadius: rs(20),
    paddingVertical: rvs(5),
    paddingHorizontal: rs(14),
  },

  billNoDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  billNoText: {
    fontSize: rfs(11),
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 0.5,
  },

  // ── Receipt card ──────────────────────────────────────
  receiptCard: {
    marginHorizontal: rs(16),
    marginTop: rvs(14),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    overflow: "hidden",
  },

  // ── Thank you ─────────────────────────────────────────
  thanksRow: {
    paddingVertical: rvs(14),
    paddingHorizontal: rs(18),
    alignItems: "center",
  },

  thanks: {
    fontSize: rfs(12),
    fontStyle: "italic",
    color: colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },

  // ── Error state ───────────────────────────────────────
  errorCenter: {
    flex: 1,
    backgroundColor: colors.background ?? "#F2F4F5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(32),
  },

  errorCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
    paddingVertical: rvs(36),
    paddingHorizontal: rs(24),
    gap: rvs(8),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 1,
    shadowRadius: rs(16),
    elevation: 4,
  },

  errorTitle: {
    fontSize: rfs(17),
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: rvs(8),
  },

  errorSub: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: rfs(20),
  },

  errorBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingVertical: rvs(10),
    paddingHorizontal: rs(20),
    marginTop: rvs(12),
  },

  errorBackText: {
    fontSize: rfs(13),
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
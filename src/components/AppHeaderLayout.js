import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Platform,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { colors } from "../theme/colors";
import { setAppLocale } from "../locale/i18n";
import { localeAtom } from "../atoms/locale";
import { APP_LANGUAGES } from "../constants/languages";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Language button in header ────────────────────────────────────────────────
function LanguageButton({ onPress, currentLocale }) {
  const { t } = useTranslation();
  const lang  = APP_LANGUAGES.find((l) => l.code === currentLocale);
  const label = lang ? t(lang.labelKey) : "Language";

  return (
    <TouchableOpacity
      style={langStyles.btn}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name="language-outline" size={rfs(18)} color="rgba(245,166,35,0.90)" />
      <Text style={langStyles.btnText} numberOfLines={1}>{label}</Text>
      <Icon name="chevron-down" size={rfs(11)} color="rgba(255,255,255,0.55)" />
    </TouchableOpacity>
  );
}

// ─── Language picker modal ────────────────────────────────────────────────────
function LanguagePicker({ visible, onClose, currentLocale, onSelect }) {
  const { t, i18n } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <TouchableOpacity
        style={langStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={langStyles.pickerCard}
          onPress={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <View style={langStyles.pickerHeader}>
            <View style={langStyles.pickerIconBox}>
              <Icon name="language-outline" size={rfs(18)} color={colors.accent} />
            </View>
            <View style={langStyles.pickerHeaderText}>
              <Text style={langStyles.pickerTitle}>{t("language.title")}</Text>
              <Text style={langStyles.pickerSubtitle}>{t("language.subtitle")}</Text>
            </View>
          </View>

          <View style={langStyles.pickerDivider} />

          {/* Options */}
          {APP_LANGUAGES.map((lang, idx) => {
            const selected = i18n.language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  langStyles.option,
                  idx < APP_LANGUAGES.length - 1 && langStyles.optionBorder,
                ]}
                onPress={() => onSelect(lang.code)}
                activeOpacity={0.8}
              >
                <View style={langStyles.optionIconBox}>
                  <Text style={langStyles.optionShort}>{lang.short}</Text>
                </View>

                {/* Label */}
                <Text style={[
                  langStyles.optionText,
                  selected && langStyles.optionTextSelected,
                ]}>
                  {t(lang.labelKey)}
                </Text>

                {selected ? (
                  <Icon
                    name="checkmark-circle"
                    size={rfs(22)}
                    color={colors.primary}
                  />
                ) : (
                  <View style={langStyles.checkPlaceholder} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Cancel */}
          <TouchableOpacity
            style={langStyles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={langStyles.cancelText}>{t("common.cancel")}</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Subtitle pill ────────────────────────────────────────────────────────────
// showBg=true  → original amber pill with dot  (default, all other screens)
// showBg=false → plain text only, no bg, no dot (HomeScreen)
function AccentPill({ subtitle, showBg = true }) {
  if (showBg) {
    return (
      <View style={styles.pill}>
        <View style={styles.pillDot} />
        <Text style={styles.pillText}>{subtitle}</Text>
      </View>
    );
  }

  // Plain mode — just the text, no pill background, no dot
  return (
    <Text style={styles.pillTextPlain} numberOfLines={1}>
      {subtitle}
    </Text>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AppHeaderLayout({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  children,
  showLanguagePicker = false,
  showAccentBar      = true,  // NEW — set false on HomeScreen to hide vertical orange line
  showSubtitlePill   = true,  // NEW — set false on HomeScreen to hide pill bg + dot
}) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(10)).current;

  const [langModal, setLangModal] = useState(false);
  const currentLocale = useAtomValue(localeAtom);
  const setLocale     = useSetAtom(localeAtom);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelectLang = async (code) => {
    await setAppLocale(code);
    setLocale(code);
    setLangModal(false);
  };

  return (
    <View style={styles.container}>

      {/* ── Status Bar ── */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── Language picker modal ── */}
      <LanguagePicker
        visible={langModal}
        onClose={() => setLangModal(false)}
        currentLocale={currentLocale || "en"}
        onSelect={handleSelectLang}
      />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#1E3A42", "#2D4A52", "#354E58"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Subtle teal orb */}
        <View style={styles.orbBottomLeft} />

        {/* Mesh lines */}
        <View style={styles.meshOverlay} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.meshLine, { top: rvs(8) + i * rvs(18) }]}
            />
          ))}
        </View>

        {/* ── Header row ── */}
        <Animated.View
          style={[
            styles.headerRow,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          {/* Left slot */}
          {leftComponent ? (
            <View style={styles.leftSlot}>{leftComponent}</View>
          ) : null}

          {/* Title + subtitle */}
          <View style={styles.titleBlock}>

            {/* Vertical accent bar — hidden with left slot (e.g. back) or showAccentBar=false */}
            {showAccentBar && !leftComponent && <View style={styles.accentBar} />}

            <View style={styles.titleInner}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <AccentPill subtitle={subtitle} showBg={showSubtitlePill} />
              ) : null}
            </View>
          </View>

          {/* Right slot */}
          <View style={styles.rightSlot}>
            {rightComponent ? (
              rightComponent
            ) : showLanguagePicker ? (
              <LanguageButton
                currentLocale={currentLocale || "en"}
                onPress={() => setLangModal(true)}
              />
            ) : null}
          </View>
        </Animated.View>

        {/* Bottom glow line */}
        <View style={styles.glowBorder} />
      </LinearGradient>

      {/* ── Body ── */}
      <View style={styles.body}>{children}</View>

    </View>
  );
}

// ─── Header styles ────────────────────────────────────────────────────────────
const HEADER_PADDING_BOTTOM = rvs(35);
const BODY_OVERLAP          = rvs(18);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingTop: Platform.OS === "android"
      ? (StatusBar.currentHeight ?? rvs(24)) + rvs(12)
      : rvs(20),
    paddingHorizontal: rs(20),
    paddingBottom: HEADER_PADDING_BOTTOM,
    overflow: "hidden",
    position: "relative",
  },

  orbBottomLeft: {
    position: "absolute",
    width: rs(80),
    height: rs(80),
    borderRadius: 999,
    bottom: -rvs(28),
    left: rs(8),
    backgroundColor: "#5BBCD4",
    opacity: 0.10,
  },

  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  meshLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },

  leftSlot: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },

  accentBar: {
    width: rs(3),
    height: rvs(36),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: rs(8),
  },

  titleInner: {
    flex: 1,
    gap: rvs(4),
  },

  title: {
    fontSize: rfs(20),
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    flexShrink: 0,
  },

  // ── Subtitle pill (default — with bg + dot) ───────────
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    backgroundColor: "rgba(245,166,35,0.14)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.30)",
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(3),
  },

  pillDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  pillText: {
    fontSize: rfs(11),
    fontWeight: "500",
    color: "rgba(245,166,35,0.90)",
    letterSpacing: 0.4,
  },

  // ── Subtitle plain (no bg, no dot — HomeScreen) ───────
  pillTextPlain: {
    fontSize: rfs(16),
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3,
  },

  // ── Bottom glow ───────────────────────────────────────
  glowBorder: {
    position: "absolute",
    bottom: 0,
    left: rs(20),
    right: rs(20),
    height: rvs(2),
    borderRadius: rs(2),
    backgroundColor: "rgba(245,166,35,0.22)",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: rs(6),
  },

  // ── Body ──────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    marginTop: -BODY_OVERLAP,
    paddingTop: BODY_OVERLAP,
    overflow: "hidden",
  },

});

// ─── Language button styles ───────────────────────────────────────────────────
const langStyles = StyleSheet.create({

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: rs(20),
    paddingHorizontal: rs(11),
    paddingVertical: rvs(7),
    maxWidth: rs(120),
  },

  btnText: {
    fontSize: rfs(15),
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,46,51,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(20),
    paddingVertical: rvs(24),
  },

  pickerCard: {
    width: "100%",
    maxWidth: rs(400),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    paddingHorizontal: rs(20),
    paddingTop: rvs(20),
    paddingBottom: rvs(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    shadowColor: "rgba(26,46,51,0.2)",
    shadowOffset: { width: 0, height: rvs(6) },
    shadowOpacity: 1,
    shadowRadius: rs(20),
    elevation: 14,
  },

  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    marginBottom: rvs(16),
  },

  pickerIconBox: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: "rgba(245,166,35,0.10)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.20)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  pickerHeaderText: { flex: 1 },

  pickerTitle: {
    fontSize: rfs(17),
    fontWeight: "800",
    color: colors.textPrimary,
  },

  pickerSubtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    marginTop: rvs(2),
  },

  pickerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(4),
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    paddingVertical: rvs(13),
    paddingHorizontal: rs(4),
    borderRadius: rs(10),
  },

  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  optionIconBox: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  optionShort: {
    fontSize: rfs(13),
    fontWeight: "800",
    color: colors.textLight,
    letterSpacing: 0.6,
  },

  checkPlaceholder: {
    width: rfs(22),
    height: rfs(22),
  },

  optionText: {
    flex: 1,
    fontSize: rfs(14),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  optionTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: rvs(12),
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
    backgroundColor: "rgba(45,74,82,0.04)",
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: "700",
    color: colors.textSecondary,
  },

});
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { colors } from '../theme/colors';
import { setAppLocale } from '../locale/i18n';
import { localeAtom } from '../atoms/locale';
import { APP_LANGUAGES } from '../constants/languages';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

export default function LanguageCard({ currentLocale = 'en' }) {
  const { t, i18n } = useTranslation();
  const setLocale   = useSetAtom(localeAtom);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = async (code) => {
    await setAppLocale(code);
    setLocale(code);
    setModalVisible(false);
  };

  const currentLang = APP_LANGUAGES.find((l) => l.code === currentLocale);
  const currentLabel = currentLang
    ? t(currentLang.labelKey)
    : t('language.english');

  return (
    <>
      {/* ── Card row ── */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        {/* Icon box */}
        <View style={styles.iconBox}>
          <Icon name="language-outline" size={rfs(16)} color={colors.accent} />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{t('profile.language')}</Text>
          <Text style={styles.subtitle}>{t('profile.languageSubtitle')}</Text>
        </View>

        {/* Right: current + chevron */}
        <View style={styles.rightRow}>
          <View style={styles.valueBadge}>
            <Text style={styles.valueText} numberOfLines={1}>{currentLabel}</Text>
          </View>
          <Icon name="chevron-forward" size={rfs(14)} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* ── Language picker modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Icon name="language-outline" size={rfs(18)} color={colors.accent} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>{t('language.title')}</Text>
                <Text style={styles.modalSubtitle}>{t('language.subtitle')}</Text>
              </View>
            </View>

            <View style={styles.modalDivider} />

            {/* Language options — row: code circle | name | check (theme colors) */}
            <View>
              {APP_LANGUAGES.map((lang, idx) => {
                const selected = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langRow,
                      idx < APP_LANGUAGES.length - 1 && styles.langRowBorder,
                    ]}
                    onPress={() => handleSelect(lang.code)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.codeCircle}>
                      <Text style={styles.codeCircleText}>{lang.short}</Text>
                    </View>
                    <Text
                      style={[
                        styles.langPickerLabel,
                        selected && styles.langPickerLabelSelected,
                      ]}
                    >
                      {t(lang.labelKey)}
                    </Text>
                    {selected ? (
                      <Icon
                        name="checkmark-circle"
                        size={rfs(22)}
                        color={colors.primary}
                      />
                    ) : (
                      <View style={styles.checkPlaceholder} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({

  // ── Card ─────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: rs(16),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(13),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    gap: rs(12),
  },

  iconBox: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(10),
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  textWrap: { flex: 1 },

  title: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    marginTop: rvs(1),
  },

  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    flexShrink: 0,
  },

  valueBadge: {
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(7),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(2),
  },

  valueText: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.primary,
    maxWidth: rs(80),
  },

  // ── Modal ─────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,46,51,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rvs(24),
  },

  modalCard: {
    width: '100%',
    maxWidth: rs(400),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    paddingHorizontal: rs(20),
    paddingTop: rvs(20),
    paddingBottom: rvs(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    shadowColor: 'rgba(26,46,51,0.2)',
    shadowOffset: { width: 0, height: rvs(6) },
    shadowOpacity: 1,
    shadowRadius: rs(20),
    elevation: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    marginBottom: rvs(16),
  },

  modalIconBox: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  modalHeaderText: { flex: 1 },

  modalTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  modalSubtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    marginTop: rvs(2),
  },

  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(4),
  },

  // ── Language options (row: circle | name | check) ───────
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rvs(12),
    paddingHorizontal: rs(4),
    gap: rs(12),
  },

  langRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },

  codeCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  codeCircleText: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.6,
  },

  langPickerLabel: {
    flex: 1,
    fontSize: rfs(15),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  langPickerLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  checkPlaceholder: {
    width: rfs(22),
    height: rfs(22),
  },

  // ── Cancel button ─────────────────────────────────────
  cancelBtn: {
    marginTop: rvs(12),
    paddingVertical: rvs(12),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    backgroundColor: 'rgba(45,74,82,0.04)',
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },

});
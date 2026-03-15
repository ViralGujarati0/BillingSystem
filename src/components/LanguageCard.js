import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { colors } from '../theme/colors';
import { setAppLocale } from '../locale/i18n';
import { localeAtom } from '../atoms/locale';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english',  flag: '🇬🇧' },
  { code: 'hi', labelKey: 'language.hindi',    flag: '🇮🇳' },
  { code: 'gu', labelKey: 'language.gujarati', flag: '🇮🇳' },
];

export default function LanguageCard({ currentLocale = 'en' }) {
  const { t, i18n } = useTranslation();
  const setLocale   = useSetAtom(localeAtom);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = async (code) => {
    await setAppLocale(code);
    setLocale(code);
    setModalVisible(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === currentLocale);
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
        onRequestClose={() => setModalVisible(false)}
      >
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

            {/* Language options */}
            {LANGUAGES.map((lang, idx) => {
              const selected = i18n.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langOption,
                    selected && styles.langOptionSelected,
                    idx < LANGUAGES.length - 1 && styles.langOptionBorder,
                  ]}
                  onPress={() => handleSelect(lang.code)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.langText,
                    selected && styles.langTextSelected,
                  ]}>
                    {t(lang.labelKey)}
                  </Text>
                  {selected && (
                    <Icon
                      name="checkmark-circle"
                      size={rfs(20)}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}

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
    paddingHorizontal: rs(24),
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingHorizontal: rs(20),
    paddingTop: rvs(22),
    paddingBottom: rvs(18),
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
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

  // ── Language options ──────────────────────────────────
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingVertical: rvs(14),
    paddingHorizontal: rs(4),
    borderRadius: rs(10),
  },

  langOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  langOptionSelected: {
    backgroundColor: 'rgba(45,74,82,0.05)',
  },

  langFlag: {
    fontSize: rfs(20),
  },

  langText: {
    flex: 1,
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  langTextSelected: {
    color: colors.primary,
    fontWeight: '700',
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
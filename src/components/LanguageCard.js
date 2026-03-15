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

const { width: SCREEN_W } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const rfs = (n) => Math.round(n * scale);
const rs = (n) => Math.round(n * scale);
const rvs = (n) => Math.round(n * (Dimensions.get('window').height / 844));

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english' },
  { code: 'hi', labelKey: 'language.hindi' },
  { code: 'gu', labelKey: 'language.gujarati' },
];

export default function LanguageCard({ currentLocale = 'en' }) {
  const { t, i18n } = useTranslation();
  const setLocale = useSetAtom(localeAtom);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = async (code) => {
    await setAppLocale(code);
    setLocale(code);
    setModalVisible(false);
  };

  const currentLabel = LANGUAGES.find((l) => l.code === currentLocale)
    ? t(LANGUAGES.find((l) => l.code === currentLocale).labelKey)
    : t('language.english');

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrap}>
          <Icon name="language-outline" size={22} color={colors.accent} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{t('profile.language')}</Text>
          <Text style={styles.subtitle}>{t('profile.languageSubtitle')}</Text>
        </View>
        <View style={styles.rightRow}>
          <Text style={styles.currentLabel} numberOfLines={1}>
            {currentLabel}
          </Text>
          <Icon name="chevron-forward" size={18} color="#bbb" />
        </View>
      </TouchableOpacity>

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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language.title')}</Text>
              <Text style={styles.modalSubtitle}>{t('language.subtitle')}</Text>
            </View>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  i18n.language === lang.code && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    i18n.language === lang.code && styles.modalOptionTextSelected,
                  ]}
                >
                  {t(lang.labelKey)}
                </Text>
                {i18n.language === lang.code && (
                  <Icon
                    name="checkmark-circle"
                    size={rfs(22)}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  currentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(24),
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    padding: rs(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 0.15,
    shadowRadius: rs(20),
    elevation: 10,
  },
  modalHeader: {
    marginBottom: rvs(20),
  },
  modalTitle: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: rvs(4),
  },
  modalSubtitle: {
    fontSize: rfs(13),
    color: colors.textSecondary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rvs(14),
    paddingHorizontal: rs(16),
    borderRadius: rs(12),
    marginBottom: rvs(8),
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accentLight,
  },
  modalOptionText: {
    flex: 1,
    fontSize: rfs(15),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalOptionTextSelected: {
    color: colors.primary,
  },
  modalCloseBtn: {
    marginTop: rvs(16),
    paddingVertical: rvs(12),
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

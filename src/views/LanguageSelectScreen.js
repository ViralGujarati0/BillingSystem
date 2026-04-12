import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '../theme/colors';
import { setAppLocale } from '../locale/i18n';
import { localeAtom } from '../atoms/locale';
import { useSetAtom } from 'jotai';
import { APP_LANGUAGES } from '../constants/languages';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs = SCREEN_H / 844;
const rs = (n) => Math.round(n * scale);
const rvs = (n) => Math.round(n * vs);
const rfs = (n) => Math.round(n * scale);

export default function LanguageSelectScreen({ navigation }) {
  const { t } = useTranslation();
  const setLocale = useSetAtom(localeAtom);
  const [selected, setSelected] = useState(null);

  const handleContinue = async () => {
    if (!selected) return;
    await setAppLocale(selected);
    setLocale(selected);
    navigation.replace('Login');
  };

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Icon name="language-outline" size={rfs(20)} color={colors.accent} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.title}>{t('language.title')}</Text>
                <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
              </View>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.langList}>
              {APP_LANGUAGES.map((lang, idx) => {
                const isOn = selected === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langRow,
                      idx < APP_LANGUAGES.length - 1 && styles.langRowBorder,
                    ]}
                    onPress={() => setSelected(lang.code)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.codeCircle}>
                      <Text style={styles.codeCircleText}>{lang.short}</Text>
                    </View>
                    <Text
                      style={[styles.langName, isOn && styles.langNameSelected]}
                    >
                      {t(lang.labelKey)}
                    </Text>
                    {isOn ? (
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

            <TouchableOpacity
              style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
              onPress={handleContinue}
              disabled={!selected}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>{t('language.continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(26,46,51,0.55)',
  },
  modalBackdrop: {
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
    marginBottom: rvs(14),
  },
  modalHeaderText: {
    flex: 1,
  },
  modalIconBox: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    marginTop: rvs(3),
    lineHeight: rfs(17),
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginBottom: rvs(4),
  },
  langList: {
    marginBottom: rvs(4),
  },
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
  langName: {
    flex: 1,
    fontSize: rfs(15),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  langNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkPlaceholder: {
    width: rfs(22),
    height: rfs(22),
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: rvs(15),
    borderRadius: rs(14),
    alignItems: 'center',
    marginTop: rvs(16),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.28,
    shadowRadius: rs(10),
    elevation: 4,
  },
  continueBtnDisabled: {
    opacity: 0.45,
  },
  continueBtnText: {
    fontSize: rfs(16),
    fontWeight: '700',
    color: colors.textLight,
  },
});

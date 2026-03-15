import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '../theme/colors';
import { setAppLocale } from '../locale/i18n';
import { localeAtom } from '../atoms/locale';
import { useSetAtom } from 'jotai';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs = SCREEN_H / 844;
const rs = (n) => Math.round(n * scale);
const rvs = (n) => Math.round(n * vs);
const rfs = (n) => Math.round(n * scale);

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english', flag: '🇬🇧' },
  { code: 'hi', labelKey: 'language.hindi', flag: '🇮🇳' },
  { code: 'gu', labelKey: 'language.gujarati', flag: '🇮🇳' },
];

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
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.darkSurface]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconWrap}>
            <Icon name="language-outline" size={rfs(40)} color={colors.accent} />
          </View>
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.option,
              selected === lang.code && styles.optionSelected,
            ]}
            onPress={() => setSelected(lang.code)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionFlag}>{lang.flag}</Text>
            <Text
              style={[
                styles.optionLabel,
                selected === lang.code && styles.optionLabelSelected,
              ]}
            >
              {t(lang.labelKey)}
            </Text>
            {selected === lang.code && (
              <Icon
                name="checkmark-circle"
                size={rfs(22)}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selected && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>{t('language.continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? rvs(24)) + rvs(20)
      : rvs(48),
    paddingBottom: rvs(28),
    paddingHorizontal: rs(24),
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  iconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(36),
    backgroundColor: colors.glassWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(16),
  },
  title: {
    fontSize: rfs(24),
    fontWeight: '800',
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: rvs(8),
  },
  subtitle: {
    fontSize: rfs(14),
    color: colors.darkTextMuted,
    textAlign: 'center',
    lineHeight: rfs(20),
  },
  card: {
    marginHorizontal: rs(20),
    marginTop: -rvs(16),
    backgroundColor: colors.card,
    borderRadius: rs(20),
    padding: rs(20),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.12,
    shadowRadius: rs(16),
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rvs(16),
    paddingHorizontal: rs(16),
    borderRadius: rs(14),
    marginBottom: rvs(10),
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accentLight,
  },
  optionFlag: {
    fontSize: rfs(24),
    marginRight: rs(14),
  },
  optionLabel: {
    flex: 1,
    fontSize: rfs(16),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: rvs(16),
    borderRadius: rs(14),
    alignItems: 'center',
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.3,
    shadowRadius: rs(10),
    elevation: 4,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: rfs(16),
    fontWeight: '700',
    color: colors.textLight,
  },
});

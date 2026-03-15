import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { en } from './strings/en';
import { hi } from './strings/hi';
import { gu } from './strings/gu';
import { LOCALE_STORAGE_KEY } from '../atoms/locale';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

/**
 * Load saved locale from AsyncStorage and apply it.
 * Returns the saved locale code or null if none saved.
 */
export async function loadSavedLocale() {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && resources[saved]) {
      await i18n.changeLanguage(saved);
      return saved;
    }
  } catch (e) {
    console.warn('[i18n] loadSavedLocale failed', e);
  }
  return null;
}

/**
 * Set app language and persist to AsyncStorage.
 */
export async function setAppLocale(localeCode) {
  if (!resources[localeCode]) return;
  await i18n.changeLanguage(localeCode);
  try {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, localeCode);
  } catch (e) {
    console.warn('[i18n] setAppLocale persist failed', e);
  }
}

export default i18n;

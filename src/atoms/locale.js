import { atom } from 'jotai';

const LOCALE_STORAGE_KEY = 'app_locale';

/** Persisted locale code: 'en' | 'hi' | 'gu'. null = not yet chosen (first install). */
export const localeAtom = atom(null);

/** True after we've read locale from storage (so navigator can decide LanguageSelect vs Login). */
export const localeLoadedAtom = atom(false);

export { LOCALE_STORAGE_KEY };

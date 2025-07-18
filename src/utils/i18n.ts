import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslations from '@/translations/en.json';
import arTranslations from '@/translations/ar.json';

// Merge translations with proper structure
const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('preferred-language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
      prefix: '{',
      suffix: '}'
    },
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true,
    debug: process.env.NODE_ENV === 'development',
    defaultNS: 'translation',
    ns: ['translation']
  });

export default i18n;
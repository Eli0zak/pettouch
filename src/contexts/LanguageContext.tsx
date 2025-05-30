import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import i18n from 'i18next';
import { logger } from '@/utils/logger';

type Language = 'en' | 'ar';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  dir: () => "ltr" | "rtl";
  isRTL: boolean;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  missingKeys: Record<string, boolean>;
  clearMissingKeys: () => void;
};

// Import translations from JSON files
import enTranslations from '@/translations/en.json';
import arTranslations from '@/translations/ar.json';

const translations = {
  en: enTranslations,
  ar: arTranslations
};

// Global collection of missing keys for monitoring
const globalMissingKeys: Record<string, boolean> = {};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get initial language from localStorage or default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    return (savedLanguage === 'en' || savedLanguage === 'ar') ? savedLanguage as Language : 'en';
  });
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [isDebugMode, setIsDebugMode] = useState(() => {
    return process.env.NODE_ENV === 'development' && localStorage.getItem('i18n-debug') === 'true';
  });
  const [missingKeys, setMissingKeys] = useState<Record<string, boolean>>({});
  
  // Use a ref to track newly found missing keys between renders
  const pendingMissingKeysRef = useRef<Record<string, boolean>>({});

  // Set language function that updates both our state and i18next
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    i18n.changeLanguage(newLang); // This updates i18next's current language
  };

  useEffect(() => {
    // Persist language preference
    localStorage.setItem('preferred-language', language);
    
    // Update document direction and language
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    setIsRTL(language === 'ar');
  }, [language]);

  // Store debug mode preference
  useEffect(() => {
    if (isDebugMode) {
      localStorage.setItem('i18n-debug', 'true');
    } else {
      localStorage.setItem('i18n-debug', 'false');
    }
  }, [isDebugMode]);

  // Process any pending missing keys
  useEffect(() => {
    const pendingKeys = pendingMissingKeysRef.current;
    if (Object.keys(pendingKeys).length > 0) {
      setMissingKeys(prev => ({...prev, ...pendingKeys}));
      pendingMissingKeysRef.current = {};
    }
  });

  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
  };

  const clearMissingKeys = () => {
    setMissingKeys({});
    Object.keys(globalMissingKeys).forEach(key => {
      delete globalMissingKeys[key];
    });
  };

  const t = (key: string): string => {
    try {
      // Check if translation exists in current language
      const translation = translations[language][key];
      
      // If translation exists, return it
      if (translation) return translation;
      
      // If not found in current language, try English as fallback
      const fallbackTranslation = language !== 'en' ? translations['en'][key] : null;
      
      // If not found in any language, mark as missing
      if (!fallbackTranslation) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Translation missing for key: ${key}`, { key, language });
          
          // Track missing key without causing state update during render
          if (!globalMissingKeys[key]) {
            globalMissingKeys[key] = true;
            pendingMissingKeysRef.current[key] = true;
          }
        }
        
        // In debug mode, return a highlighted version of the key
        if (isDebugMode) {
          return `[${key}]`;
        }
        
        // Otherwise just return the key as fallback
        return key;
      }
      
      // If debug mode is on and we're using fallback, highlight it
      if (isDebugMode && language !== 'en' && fallbackTranslation) {
        return `[${fallbackTranslation}]`;
      }
      
      return fallbackTranslation || key;
    } catch (error) {
      logger.warn(`Error getting translation for key: ${key}`, { error, key, language });
      
      // In debug mode, return a highlighted version of the key
      if (isDebugMode) {
        return `[${key}]`;
      }
      
      return key;
    }
  };

  const dir = (): "ltr" | "rtl" => {
    return language === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      dir, 
      isRTL,
      isDebugMode,
      toggleDebugMode,
      missingKeys,
      clearMissingKeys
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// This is kept for backwards compatibility but components should start using react-i18next directly
export const useTranslation = useLanguage;

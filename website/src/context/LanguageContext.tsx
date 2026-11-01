'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

export type Language = 'en' | 'te';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, te: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kurnool_one_language');
      if (saved === 'en' || saved === 'te') {
        setLang(saved);
      }
    } catch {
      // ignore SSR or storage exceptions
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    try {
      localStorage.setItem('kurnool_one_language', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const t = (en: string, te: string) => {
    return language === 'te' ? te : en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (en: string, te: string) => en,
    };
  }
  return context;
};


import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'te';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>('te');

  useEffect(() => {
    // Load saved preference
    const loadLang = async () => {
      const saved = await AsyncStorage.getItem('user_language');
      if (saved) setLang(saved as Language);
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLang(lang);
    await AsyncStorage.setItem('user_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

import "./global.css";
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        mobileAds().initialize().catch((e: any) => console.log('AdMob init warning:', e));
      } catch (err) {
        console.log('Mobile ads not available on current target:', err);
      }
    }
  }, []);

  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
}


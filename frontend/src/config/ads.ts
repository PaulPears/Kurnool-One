import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Set to true during development to avoid policy strikes on self-clicks
export const IS_TEST_ADS = __DEV__;

/**
 * AdMob Production Ad Unit IDs
 * App ID: ca-app-pub-6894923761807901~1249968686 (configured in app.json)
 */
export const ADMOB_PRODUCTION_UNITS = {
  BANNER_HOME: 'ca-app-pub-6894923761807901/6288303254',
  BANNER_DIRECTORY: 'ca-app-pub-6894923761807901/6288303254',
  BANNER_OFFERS: 'ca-app-pub-6894923761807901/6288303254',
  INTERSTITIAL_SUBMIT: 'ca-app-pub-6894923761807901/6288303254', // Replace with live ID once generated
  REWARDED_MULTI_IMAGE: 'ca-app-pub-6894923761807901/6288303254', // Replace with live ID once generated
  REWARDED_NOTIFICATION: 'ca-app-pub-6894923761807901/6288303254', // Replace with live ID once generated
};

export type AdSlotType = keyof typeof ADMOB_PRODUCTION_UNITS;

export const getAdUnitId = (slot: AdSlotType): string => {
  if (Platform.OS === 'web') {
    return '';
  }
  if (IS_TEST_ADS) {
    if (slot.startsWith('BANNER')) {
      return TestIds.BANNER;
    }
    if (slot.startsWith('INTERSTITIAL')) {
      return TestIds.INTERSTITIAL;
    }
    if (slot.startsWith('REWARDED')) {
      return TestIds.REWARDED;
    }
  }
  return ADMOB_PRODUCTION_UNITS[slot] || TestIds.BANNER;
};

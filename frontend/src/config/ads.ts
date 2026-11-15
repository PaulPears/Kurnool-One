import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Set to true during development to avoid policy strikes on self-clicks
export const IS_TEST_ADS = __DEV__;

/**
 * AdMob Production Configuration
 * Google Mobile Ads App ID: ca-app-pub-6894923761807901~1249968686
 */
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-6894923761807901~1249968686',
  UNITS: {
    // 1. Adaptive Banner Ad (Sticky bottom on Home, Directory, Offers)
    BANNER: 'ca-app-pub-6894923761807901/6222488522',
    BANNER_HOME: 'ca-app-pub-6894923761807901/6222488522',
    BANNER_DIRECTORY: 'ca-app-pub-6894923761807901/6222488522',
    BANNER_OFFERS: 'ca-app-pub-6894923761807901/6222488522',

    // 2. Interstitial Ad (Triggered on screen transitions, submitting registrations, claiming deals)
    INTERSTITIAL: 'ca-app-pub-6894923761807901/1773760321',
    INTERSTITIAL_SUBMIT: 'ca-app-pub-6894923761807901/1773760321',

    // 3. App Open Ad (Seamlessly shown when opening or resuming Kurnool One app)
    APP_OPEN: 'ca-app-pub-6894923761807901/2088445936',

    // 4. Native Advanced Ad (Blended organically inside business feeds, search results & news)
    NATIVE_ADVANCED: 'ca-app-pub-6894923761807901/6615023461',

    // 5. Rewarded Video Ad (Unlocks extra photo slots #2 to #5 on Rentals & Classifieds)
    REWARDED: 'ca-app-pub-6894923761807901/9693728932',
    REWARDED_PHOTO_UNLOCK: 'ca-app-pub-6894923761807901/9693728932',
  },
};

export const ADMOB_PRODUCTION_UNITS = ADMOB_CONFIG.UNITS;

export type AdSlotType = keyof typeof ADMOB_CONFIG.UNITS;

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
    if (slot.startsWith('APP_OPEN')) {
      return TestIds.APP_OPEN;
    }
    if (slot.startsWith('REWARDED')) {
      return TestIds.REWARDED;
    }
  }
  return ADMOB_CONFIG.UNITS[slot] || ADMOB_CONFIG.UNITS.BANNER;
};

import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export const AD_TEST_ID = TestIds.BANNER;

export function SafeBannerAd({ unitId }: { unitId: string }) {
  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}

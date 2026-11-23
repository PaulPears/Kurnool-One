import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG, IS_TEST_ADS } from '../config/ads';

export function SafeNativeAd({ unitId }: { unitId?: string }) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  const targetUnitId =
    unitId ||
    (IS_TEST_ADS
      ? TestIds.BANNER
      : ADMOB_CONFIG.UNITS.NATIVE_ADVANCED || ADMOB_CONFIG.UNITS.BANNER);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      {!adFailed && (
        <View style={[styles.adWrapper, !adLoaded && { height: 0, overflow: 'hidden' }]}>
          <BannerAd
            unitId={targetUnitId}
            size={BannerAdSize.MEDIUM_RECTANGLE}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdLoaded={() => {
              setAdLoaded(true);
              setAdFailed(false);
            }}
            onAdFailedToLoad={() => {
              setAdFailed(true);
            }}
          />
        </View>
      )}

      {(!adLoaded || adFailed) && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => Linking.openURL('https://wa.me/917780533086?text=Hello%20Kurnool%20One%20Advertising').catch(() => {})}
          style={styles.card}
        >
          <View style={styles.header}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>SPONSORED PARTNER</Text>
            </View>
            <Ionicons name="sparkles" size={14} color="#D97706" />
          </View>
          <View style={styles.body}>
            <View style={styles.iconBox}>
              <Ionicons name="megaphone" size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Promote Your Business Across Kurnool</Text>
              <Text style={styles.desc}>Reach 10,000+ local citizens daily. Tap to feature your brand on Kurnool One.</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    alignItems: 'center',
    width: '100%',
  },
  adWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  adBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  body: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  desc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});

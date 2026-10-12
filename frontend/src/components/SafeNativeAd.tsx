import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TestIds } from 'react-native-google-mobile-ads';

export const NATIVE_AD_TEST_ID = TestIds ? TestIds.GAM_BANNER || 'ca-app-pub-3940256099942544/2247696110' : 'test-id';

export function SafeNativeAd({ unitId }: { unitId?: string }) {
  // Graceful advanced native banner placeholder when in dev/testing
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>SPONSORED</Text>
        </View>
        <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
      </View>
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Ionicons name="megaphone" size={24} color="#2563EB" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Promote Your Business Across Kurnool</Text>
          <Text style={styles.desc}>Reach 10,000+ local citizens daily. Tap to feature your brand on Kurnool One.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
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

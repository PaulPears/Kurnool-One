import React from 'react';
import { View, Text } from 'react-native';

export const AD_TEST_ID = 'test-id';

export function SafeBannerAd({ unitId }: { unitId: string }) {
  return (
    <View style={{ width: 320, height: 50, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#9ca3af', fontSize: 12 }}>Ad Placeholder (Web)</Text>
    </View>
  );
}

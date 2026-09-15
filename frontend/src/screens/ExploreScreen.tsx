import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, Linking, ActivityIndicator, StatusBar, Share, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { fetchPlaces, fetchWorshipPlaces, PlaceItem } from '../services/directoryService';

export default function ExploreScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tourist' | 'worship'>('tourist');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPlaces();
  }, [activeTab]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tourist') {
        const data = await fetchPlaces();
        setPlaces(data);
      } else {
        const data = await fetchWorshipPlaces();
        setPlaces(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = (place: PlaceItem) => {
    if (place.latitude && place.longitude) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`).catch(() => {});
    } else {
      const q = encodeURIComponent(`${place.name_en}, Kurnool`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
    }
  };

  const handleShare = async (place: PlaceItem) => {
    try {
      await Share.share({
        message: `Explore ${place.name_en} in Kurnool!\n${place.address}\nTimings: ${place.timings}\nDiscovered via Kurnool One.`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Explore Kurnool' : 'కర్నూలు దర్శనీయ స్థలాలు'}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'Heritage, Tourism & Places of Worship' : 'చారిత్రక, పర్యాటక & ఆధ్యాత్మిక క్షేత్రాలు'}
          </Text>
        </View>
      </View>

      {/* Segment Selector */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('tourist')}
          style={[styles.segmentBtn, activeTab === 'tourist' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="compass"
            size={16}
            color={activeTab === 'tourist' ? '#2563EB' : '#6B7280'}
          />
          <Text style={[styles.segmentText, activeTab === 'tourist' && styles.segmentTextActive]}>
            {language === 'en' ? 'Tourist & Heritage' : 'పర్యాటక స్థలాలు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('worship')}
          style={[styles.segmentBtn, activeTab === 'worship' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="sparkles"
            size={16}
            color={activeTab === 'worship' ? '#2563EB' : '#6B7280'}
          />
          <Text style={[styles.segmentText, activeTab === 'worship' && styles.segmentTextActive]}>
            {language === 'en' ? 'Places of Worship' : 'పుణ్యక్షేత్రాలు & మసీదులు'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photos && item.photos.length > 0 ? (
                <Image source={{ uri: item.photos[0] }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                </View>
              )}

              <View style={styles.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.placeName}>{item.name_en}</Text>
                    {item.name_te ? <Text style={styles.placeNameTe}>{item.name_te}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareIconBtn}>
                    <Ionicons name="share-social-outline" size={18} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.placeAddress}>
                  <Ionicons name="location-outline" size={13} color="#6B7280" /> {item.address}
                </Text>

                <View style={styles.metaBadgeRow}>
                  {item.timings ? (
                    <View style={styles.metaBadge}>
                      <Ionicons name="time-outline" size={12} color="#1E40AF" />
                      <Text style={styles.metaBadgeText}>{item.timings}</Text>
                    </View>
                  ) : null}

                  {item.entryFee ? (
                    <View style={[styles.metaBadge, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                      <Ionicons name="ticket-outline" size={12} color="#15803D" />
                      <Text style={[styles.metaBadgeText, { color: '#15803D' }]}>{item.entryFee}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.description} numberOfLines={3}>
                  {language === 'en' ? item.description_en : (item.description_te || item.description_en)}
                </Text>

                <TouchableOpacity
                  onPress={() => handleDirections(item)}
                  style={styles.directionsBtn}
                >
                  <Ionicons name="navigate" size={16} color="#FFFFFF" />
                  <Text style={styles.directionsBtnText}>
                    {language === 'en' ? 'Get Directions on Google Maps' : 'గూగుల్ మ్యాప్స్ రూట్'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1D4ED8', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  segmentContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 6,
    backgroundColor: '#E5E7EB', borderRadius: 14, padding: 4,
  },
  segmentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  segmentBtnActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  segmentTextActive: { color: '#2563EB', fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 16 },
  placeName: { fontSize: 18, fontWeight: '900', color: '#111827' },
  placeNameTe: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 1 },
  shareIconBtn: { padding: 6, backgroundColor: '#F3F4F6', borderRadius: 10 },
  placeAddress: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  metaBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE',
  },
  metaBadgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  description: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 10 },
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2563EB', paddingVertical: 12,
    borderRadius: 12, marginTop: 14,
  },
  directionsBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});

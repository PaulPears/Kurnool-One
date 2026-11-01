import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, Linking, ActivityIndicator, StatusBar, Share, StyleSheet, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchPlaces,
  fetchWorshipPlaces,
  fetchEvents,
  PlaceItem,
  EventItem,
  SEED_PLACES,
  SEED_WORSHIP_PLACES,
  SEED_EVENTS,
} from '../services/directoryService';

export default function ExploreScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tourist' | 'worship' | 'events'>('tourist');
  const [worshipFilter, setWorshipFilter] = useState<'all' | 'temple' | 'masjid' | 'church'>('all');
  const [places, setPlaces] = useState<PlaceItem[]>(SEED_PLACES);
  const [events, setEvents] = useState<EventItem[]>(SEED_EVENTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);

  useEffect(() => {
    loadPlaces();
  }, [activeTab]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tourist') {
        const data = await fetchPlaces().catch(() => SEED_PLACES);
        setPlaces(data && data.length > 0 ? data : SEED_PLACES);
      } else if (activeTab === 'worship') {
        const data = await fetchWorshipPlaces().catch(() => SEED_WORSHIP_PLACES);
        setPlaces(data && data.length > 0 ? data : SEED_WORSHIP_PLACES);
      } else {
        const data = await fetchEvents().catch(() => SEED_EVENTS);
        setEvents(data && data.length > 0 ? data : SEED_EVENTS);
      }
    } catch (e) {
      console.warn('Explore load error, using fallbacks:', e);
      if (activeTab === 'tourist') setPlaces(SEED_PLACES);
      else if (activeTab === 'worship') setPlaces(SEED_WORSHIP_PLACES);
      else setEvents(SEED_EVENTS);
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
        message: `Explore ${place.name_en} in Kurnool!\n${place.address}\nTimings: ${place.timings}\nDiscovered via Kurnool One app.`,
      });
    } catch {}
  };

  const displayedPlaces = activeTab === 'worship'
    ? places.filter(p => {
        if (worshipFilter === 'all') return true;
        return p.type === worshipFilter;
      })
    : places;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              {language === 'en' ? 'Explore Kurnool' : 'కర్నూలు దర్శనీయ స్థలాలు'}
            </Text>
            <Text style={styles.headerSub}>
              {language === 'en' ? 'Heritage, Tourism & Worship Places' : 'చారిత్రక, పర్యాటక & ఆధ్యాత్మిక క్షేత్రాలు'}
            </Text>
          </View>
        </View>
      </View>

      {/* Segment Selector Tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('tourist')}
          style={[styles.segmentBtn, activeTab === 'tourist' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="compass"
            size={15}
            color={activeTab === 'tourist' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.segmentText, activeTab === 'tourist' && styles.segmentTextActive]}>
            {language === 'en' ? 'Heritage & Tourism' : 'పర్యాటక స్థలాలు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('worship')}
          style={[styles.segmentBtn, activeTab === 'worship' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="sparkles"
            size={15}
            color={activeTab === 'worship' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.segmentText, activeTab === 'worship' && styles.segmentTextActive]}>
            {language === 'en' ? 'Places of Worship' : 'పుణ్యక్షేత్రాలు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('events')}
          style={[styles.segmentBtn, activeTab === 'events' && styles.segmentBtnActive]}
        >
          <Ionicons
            name="calendar"
            size={15}
            color={activeTab === 'events' ? '#2563EB' : '#64748B'}
          />
          <Text style={[styles.segmentText, activeTab === 'events' && styles.segmentTextActive]}>
            {language === 'en' ? 'City Events' : 'నగర ఈవెంట్లు'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Filters for Places of Worship */}
      {activeTab === 'worship' && (
        <View style={styles.subFilterRow}>
          {[
            { id: 'all', label: language === 'en' ? 'All Places' : 'అన్నీ', icon: 'sparkles' },
            { id: 'temple', label: language === 'en' ? 'Temples' : 'ఆలయాలు', icon: 'flame' },
            { id: 'masjid', label: language === 'en' ? 'Masjids' : 'మసీదులు', icon: 'moon' },
            { id: 'church', label: language === 'en' ? 'Churches' : 'చర్చిలు', icon: 'sunny' },
          ].map(f => {
            const isSelected = worshipFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setWorshipFilter(f.id as any)}
                style={[styles.subFilterChip, isSelected && styles.subFilterChipActive]}
              >
                <Ionicons name={f.icon as any} size={12} color={isSelected ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.subFilterText, isSelected && styles.subFilterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Main List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'events' ? (
        <FlatList
          data={events}
          keyExtractor={(item, index) => item?.id || String(index)}
          contentContainerStyle={{ padding: 14, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No Upcoming Events' : 'రాబోయే ఈవెంట్లు ఏవీ లేవు'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en' ? 'Cultural events and exhibitions will be posted here.' : 'నగర సాంస్కృతిక కార్యక్రమాలు ఇక్కడ పోస్ట్ చేయబడతాయి.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={styles.eventPoster} resizeMode="cover" />
              ) : null}
              <View style={styles.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={styles.datePill}>
                    <Text style={styles.datePillText}>📅 {item.dateStr || 'This Month'} • {item.timeStr || 'Evening'}</Text>
                  </View>
                  <View style={styles.entryPill}>
                    <Text style={styles.entryPillText}>{item.entryType || 'FREE'}</Text>
                  </View>
                </View>
                <Text style={styles.placeName}>{item.title_en}</Text>
                {item.title_te ? <Text style={styles.placeNameTe}>{item.title_te}</Text> : null}
                <Text style={styles.placeAddress}>
                  <Ionicons name="location-outline" size={13} color="#6B7280" /> {item.venue || 'Kurnool'}
                </Text>
                <View style={styles.eventFooter}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>By {item.organizerName || 'Kurnool One'}</Text>
                  {item.contactPhone ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${item.contactPhone}`)}
                      style={styles.callBtn}
                    >
                      <Ionicons name="call" size={12} color="#FFFFFF" />
                      <Text style={styles.callBtnText}>Contact</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={displayedPlaces}
          keyExtractor={(item, index) => item?.id || String(index)}
          contentContainerStyle={{ padding: 14, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="compass-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No places found' : 'దర్శనీయ స్థలాలు ఏవీ లేవు'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en' ? 'Try selecting a different filter above.' : 'పై వర్గాలలో వేరేదాన్ని ఎంచుకోండి.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const itemPhotos = Array.isArray(item.photos) ? item.photos : [];
            return (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setSelectedPlace(item)}
                style={styles.compactCard}
              >
                {itemPhotos.length > 0 ? (
                  <Image source={{ uri: itemPhotos[0] }} style={styles.compactImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.compactImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}

                <View style={styles.compactBody}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <Text style={styles.compactName} numberOfLines={1}>{item.name_en}</Text>
                      {item.name_te ? (
                        <Text style={styles.compactNameTe} numberOfLines={1}>{item.name_te}</Text>
                      ) : null}
                    </View>
                    <View style={styles.compactTypePill}>
                      <Text style={styles.compactTypePillText}>{item.type.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.compactAddress} numberOfLines={1}>
                    <Ionicons name="location-outline" size={11} color="#6B7280" /> {item.address}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={styles.compactTimingText} numberOfLines={1}>
                      ⏱️ {item.timings || 'Daily Open'}
                    </Text>
                    <View style={styles.compactViewBadge}>
                      <Text style={styles.compactViewBadgeText}>{language === 'en' ? 'View Details' : 'వివరాలు'}</Text>
                      <Ionicons name="chevron-forward" size={12} color="#2563EB" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Place Full View Details Modal */}
      <Modal
        visible={!!selectedPlace}
        animationType="slide"
        onRequestClose={() => setSelectedPlace(null)}
      >
        {selectedPlace && (
          <SafeAreaView style={styles.modalContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedPlace.name_en}</Text>
                <Text style={styles.modalHeaderSub}>
                  {language === 'en' ? 'Heritage & Cultural Guide' : 'చారిత్రక & ఆధ్యాత్మిక మార్గదర్శి'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPlace(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Photo */}
              {selectedPlace.photos && selectedPlace.photos.length > 0 ? (
                <View style={styles.modalPhotoWrap}>
                  <Image source={{ uri: selectedPlace.photos[0] }} style={styles.modalPhoto} resizeMode="cover" />
                </View>
              ) : null}

              {/* Title & Type */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalPlaceTitle}>{selectedPlace.name_en}</Text>
                  {selectedPlace.name_te ? (
                    <Text style={styles.modalPlaceTitleTe}>{selectedPlace.name_te}</Text>
                  ) : null}
                </View>
                <View style={styles.typeBadgeLarge}>
                  <Text style={styles.typeBadgeLargeText}>{selectedPlace.type.toUpperCase()}</Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.addressBox}>
                <Ionicons name="location" size={16} color="#2563EB" style={{ marginTop: 2 }} />
                <Text style={styles.addressBoxText}>{selectedPlace.address}</Text>
              </View>

              {/* Timings & Entry Fee */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                {selectedPlace.timings ? (
                  <View style={styles.infoPill}>
                    <Ionicons name="time-outline" size={14} color="#1D4ED8" />
                    <Text style={styles.infoPillText}>{selectedPlace.timings}</Text>
                  </View>
                ) : null}

                {selectedPlace.entryFee ? (
                  <View style={[styles.infoPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Ionicons name="ticket-outline" size={14} color="#059669" />
                    <Text style={[styles.infoPillText, { color: '#065F46' }]}>{selectedPlace.entryFee}</Text>
                  </View>
                ) : null}
              </View>

              {/* Description */}
              <View style={{ marginTop: 18 }}>
                <Text style={styles.sectionHeading}>{language === 'en' ? 'About & History' : 'చరిత్ర మరియు ప్రాముఖ్యత'}</Text>
                <Text style={styles.descriptionLong}>
                  {language === 'en' ? selectedPlace.description_en : (selectedPlace.description_te || selectedPlace.description_en)}
                </Text>
              </View>

              {/* Native Advanced Ad Container */}
              <View style={styles.nativeAdBox}>
                <View style={styles.nativeAdPill}>
                  <Text style={styles.nativeAdPillText}>SPONSORED</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="car" size={24} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nativeAdTitle}>Kurnool City Cabs & Pilgrimage Tours</Text>
                    <Text style={styles.nativeAdDesc}>Safe, verified AC cabs for Yaganti, Mahanandi, Ahobilam & Srisailam.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={styles.stickyActionRow}>
              <TouchableOpacity
                onPress={() => handleDirections(selectedPlace)}
                style={styles.directionsStickyBtn}
              >
                <Ionicons name="navigate" size={18} color="#FFFFFF" />
                <Text style={styles.directionsStickyText}>
                  {language === 'en' ? 'Google Maps Route' : 'గూగుల్ మ్యాప్స్ రూట్'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShare(selectedPlace)}
                style={styles.shareStickyBtn}
              >
                <Ionicons name="share-social-outline" size={18} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentBtnActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  segmentTextActive: { color: '#2563EB', fontWeight: '800' },
  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subFilterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // Compact Cards
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  compactImage: {
    width: '100%',
    height: 120,
  },
  compactBody: {
    padding: 12,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  compactNameTe: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
  },
  compactTypePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compactTypePillText: {
    color: '#1D4ED8',
    fontSize: 9,
    fontWeight: '800',
  },
  compactAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  compactTimingText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  compactViewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactViewBadgeText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '800',
  },
  // Events
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eventPoster: { width: '100%', height: 140 },
  cardBody: { padding: 12 },
  datePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  datePillText: {
    color: '#1E40AF',
    fontWeight: '800',
    fontSize: 10,
  },
  entryPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  entryPillText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 10,
  },
  placeName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  placeNameTe: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 1 },
  placeAddress: { fontSize: 11, color: '#64748B', marginTop: 4 },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  callBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  modalHeaderSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  modalCloseBtn: { padding: 4 },
  modalPhotoWrap: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  modalPhoto: { width: '100%', height: '100%' },
  modalPlaceTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  modalPlaceTitleTe: { fontSize: 15, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  typeBadgeLarge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  typeBadgeLargeText: { color: '#1D4ED8', fontSize: 11, fontWeight: '800' },
  addressBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressBoxText: { flex: 1, fontSize: 12, color: '#334155', lineHeight: 18 },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoPillText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionLong: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
  },
  // Native Ad Box
  nativeAdBox: {
    marginTop: 22,
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  nativeAdPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nativeAdPillText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  nativeAdTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  nativeAdDesc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  // Sticky Bottom
  stickyActionRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  directionsStickyBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  directionsStickyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  shareStickyBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

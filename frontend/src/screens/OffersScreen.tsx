import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, Linking, ActivityIndicator, StatusBar, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { fetchOffers, fetchEvents, OfferItem, EventItem } from '../services/directoryService';

export default function OffersScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'offers' | 'events'>('offers');
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'offers') {
        const data = await fetchOffers();
        setOffers(data);
      } else {
        const data = await fetchEvents();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Offers & Events' : 'ఆఫర్లు & నగర ఈవెంట్లు'}
        </Text>
        <Text style={styles.headerSub}>
          {language === 'en' ? 'Exclusive Local Discounts and City Happenings' : 'ప్రత్యేక డిస్కౌంట్లు మరియు కార్యక్రమాలు'}
        </Text>
      </View>

      {/* Mode Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('offers')}
          style={[styles.tabBtn, activeTab === 'offers' && styles.tabBtnActive]}
        >
          <Ionicons name="pricetag" size={16} color={activeTab === 'offers' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
            {language === 'en' ? 'Deals & Offers' : 'డిస్కౌంట్లు & ఆఫర్లు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('events')}
          style={[styles.tabBtn, activeTab === 'events' && styles.tabBtnActive]}
        >
          <Ionicons name="calendar" size={16} color={activeTab === 'events' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            {language === 'en' ? 'City Events' : 'నగర ఈవెంట్లు'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'offers' ? (
        <FlatList
          data={offers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discountText}</Text>
                </View>
                <Text style={styles.validUntil}>{item.validUntil}</Text>
              </View>

              <Text style={styles.offerTitle}>
                {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
              </Text>

              <Text style={styles.bizName}>
                <Ionicons name="storefront-outline" size={13} color="#2563EB" /> {item.businessName}
              </Text>

              <Text style={styles.offerDesc}>
                {language === 'en' ? item.description_en : (item.description_te || item.description_en)}
              </Text>

              {item.phone && (
                <TouchableOpacity
                  onPress={() => handleCall(item.phone)}
                  style={styles.claimBtn}
                >
                  <Ionicons name="call" size={14} color="#FFFFFF" />
                  <Text style={styles.claimBtnText}>Call Merchant</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={styles.eventPoster} resizeMode="cover" />
              ) : null}

              <View style={styles.eventBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={styles.eventDatePill}>
                    <Ionicons name="calendar-outline" size={13} color="#1E40AF" />
                    <Text style={styles.eventDateText}>{item.dateStr}</Text>
                  </View>
                  <View style={styles.entryPill}>
                    <Text style={styles.entryText}>{item.entryType.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>
                  {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                </Text>

                <View style={styles.eventInfoRow}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.eventInfoText}>{item.timeStr}</Text>
                </View>

                <View style={styles.eventInfoRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.eventInfoText} numberOfLines={1}>{item.venue}</Text>
                </View>

                <View style={styles.organizerRow}>
                  <Text style={styles.organizerText}>Organizer: {item.organizerName}</Text>
                  {item.contactPhone ? (
                    <TouchableOpacity
                      onPress={() => handleCall(item.contactPhone)}
                      style={styles.contactOrgBtn}
                    >
                      <Ionicons name="call" size={12} color="#FFFFFF" />
                      <Text style={styles.contactOrgText}>Contact</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
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
  tabContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 6,
    backgroundColor: '#E5E7EB', borderRadius: 14, padding: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#2563EB', fontWeight: '800' },
  offerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  discountBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0',
  },
  discountText: { fontSize: 12, fontWeight: '900', color: '#15803D' },
  validUntil: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  offerTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 4 },
  bizName: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 4 },
  offerDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginTop: 6 },
  claimBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 10, marginTop: 12,
  },
  claimBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  eventCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eventPoster: { width: '100%', height: 160 },
  eventBody: { padding: 16 },
  eventDatePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  eventDateText: { fontSize: 11, fontWeight: '800', color: '#1E40AF' },
  entryPill: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  entryText: { fontSize: 10, fontWeight: '800', color: '#4B5563' },
  eventTitle: { fontSize: 17, fontWeight: '900', color: '#111827', marginTop: 8 },
  eventInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  eventInfoText: { fontSize: 12, color: '#4B5563', flex: 1 },
  organizerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
  },
  organizerText: { fontSize: 12, color: '#6B7280', flex: 1 },
  contactOrgBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2563EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  contactOrgText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
});

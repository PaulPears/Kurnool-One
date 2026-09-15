import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Image, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchBusinesses, fetchProfessionals, fetchPlaces, fetchWorshipPlaces,
  BusinessItem, ProfessionalItem, PlaceItem,
} from '../services/directoryService';

type SearchResultItem = {
  id: string;
  type: 'business' | 'professional' | 'place' | 'worship';
  title: string;
  subtitle: string;
  image?: string;
  raw: any;
};

export default function SearchScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'businesses' | 'services' | 'places'>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery, activeFilter]);

  const performSearch = async (text: string) => {
    setLoading(true);
    try {
      const qLower = text.toLowerCase();
      const combined: SearchResultItem[] = [];

      if (activeFilter === 'all' || activeFilter === 'businesses') {
        const bizs = await fetchBusinesses('all', text);
        bizs.forEach(b => {
          combined.push({
            id: `biz_${b.id}`,
            type: 'business',
            title: language === 'en' ? b.name_en : (b.name_te || b.name_en),
            subtitle: `${b.address} • Rating ${b.ratingAvg.toFixed(1)} ★`,
            image: b.images?.[0],
            raw: b,
          });
        });
      }

      if (activeFilter === 'all' || activeFilter === 'services') {
        const pros = await fetchProfessionals();
        const matchedPros = pros.filter(p =>
          p.fullName.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower) ||
          p.serviceAreas.some(a => a.toLowerCase().includes(qLower))
        );
        matchedPros.forEach(p => {
          combined.push({
            id: `pro_${p.id}`,
            type: 'professional',
            title: p.fullName,
            subtitle: `${p.category} • ${p.experienceYears} yrs exp • Areas: ${p.serviceAreas.slice(0, 2).join(', ')}`,
            raw: p,
          });
        });
      }

      if (activeFilter === 'all' || activeFilter === 'places') {
        const [places, worship] = await Promise.all([
          fetchPlaces(),
          fetchWorshipPlaces(),
        ]);
        const allPlaces = [...places, ...worship];
        const matchedPlaces = allPlaces.filter(pl =>
          pl.name_en.toLowerCase().includes(qLower) ||
          pl.name_te?.includes(text) ||
          pl.description_en.toLowerCase().includes(qLower)
        );
        matchedPlaces.forEach(pl => {
          combined.push({
            id: `place_${pl.id}`,
            type: pl.type === 'temple' || pl.type === 'church' || pl.type === 'masjid' ? 'worship' : 'place',
            title: language === 'en' ? pl.name_en : (pl.name_te || pl.name_en),
            subtitle: `${pl.address} • ${pl.timings}`,
            image: pl.photos?.[0],
            raw: pl,
          });
        });
      }

      setResults(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.type === 'business') {
      navigation.navigate('BusinessDetail', { businessId: item.raw.id });
    } else if (item.type === 'professional') {
      navigation.navigate('ProfessionalDetail', { pro: item.raw });
    } else {
      navigation.navigate('Explore');
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'business': return { bg: '#EFF6FF', text: '#2563EB', label: 'BUSINESS' };
      case 'professional': return { bg: '#FEF3C7', text: '#B45309', label: 'SERVICE PRO' };
      case 'worship': return { bg: '#FDF2F8', text: '#BE185D', label: 'WORSHIP' };
      default: return { bg: '#F0FDF4', text: '#15803D', label: 'PLACE' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Search Input */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={language === 'en' ? 'Search Kurnool shops, services, places...' : 'షాపులు, సేవలు, స్థలాలు శోధించండి...'}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: language === 'en' ? 'All' : 'అన్నీ' },
          { key: 'businesses', label: language === 'en' ? 'Shops' : 'దుకాణాలు' },
          { key: 'services', label: language === 'en' ? 'Services' : 'సేవలు' },
          { key: 'places', label: language === 'en' ? 'Places' : 'స్థలాలు' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveFilter(tab.key as any)}
            style={[styles.filterChip, activeFilter === tab.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, activeFilter === tab.key && styles.filterChipTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const badge = getBadgeStyle(item.type);
            return (
              <TouchableOpacity
                onPress={() => handleSelectResult(item)}
                style={styles.resultCard}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.resultImg} />
                ) : (
                  <View style={[styles.resultImg, { backgroundColor: badge.bg, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons
                      name={item.type === 'business' ? 'storefront' : item.type === 'professional' ? 'hammer' : 'compass'}
                      size={24}
                      color={badge.text}
                    />
                  </View>
                )}

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.typeBadgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.resultSub} numberOfLines={2}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            searchQuery.length >= 2 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={56} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No matching results in Kurnool</Text>
                <Text style={styles.emptySub}>Try searching for "Plumber", "Restaurant", "Fort", "Silks"...</Text>
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <Ionicons name="compass-outline" size={56} color="#DBEAFE" />
                <Text style={styles.emptyTitle}>Search Anything in Kurnool</Text>
                <Text style={styles.emptySub}>Find businesses, skilled technicians, events, and historical places.</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10,
  },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111827' },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6',
  },
  filterChipActive: { backgroundColor: '#2563EB' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  filterChipTextActive: { color: '#FFFFFF' },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1,
    borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  resultImg: { width: 56, height: 56, borderRadius: 12 },
  resultTitle: { fontSize: 15, fontWeight: '800', color: '#111827', flex: 1, marginRight: 8 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  resultSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  Image, TextInput, ActivityIndicator, StatusBar, Linking, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  MASTER_CATEGORIES, SEED_BUSINESSES, SEED_PROFESSIONALS,
  SEED_PLACES, SEED_WORSHIP_PLACES, SEED_OFFERS,
  fetchBusinesses, fetchProfessionals, BusinessItem, ProfessionalItem, OfferItem,
} from '../services/directoryService';
import { fetchPromotionBanners } from '../services/firestoreService';
import { SafeBannerAd, AD_TEST_ID } from '../components/SafeBannerAd';

const BANNER_AD_UNIT = __DEV__ ? AD_TEST_ID : 'ca-app-pub-6894923761807901/6288303254';

export default function HomeScreen({ navigation }: any) {
  const { language, toggleLanguage } = useLanguage();

  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessItem[]>(SEED_BUSINESSES);
  const [topPros, setTopPros] = useState<ProfessionalItem[]>(SEED_PROFESSIONALS);
  const [offers, setOffers] = useState<OfferItem[]>(SEED_OFFERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [banners, bizs, pros] = await Promise.all([
        fetchPromotionBanners().catch(() => []),
        fetchBusinesses().catch(() => SEED_BUSINESSES),
        fetchProfessionals().catch(() => SEED_PROFESSIONALS),
      ]);
      if (banners && banners.length > 0) {
        setHeroBanners(banners.filter((b: any) => b.active));
      }
      if (bizs && bizs.length > 0) {
        setFeaturedBusinesses(bizs);
      }
      if (pros && pros.length > 0) {
        setTopPros(pros);
      }
    } catch (e) {
      console.error('loadHomeData error:', e);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>
              {language === 'en' ? 'Kurnool One' : 'కర్నూలు వన్'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location" size={11} color="#2563EB" />
              <Text style={styles.cityText}>Kurnool City, AP</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.langBadge}
          >
            <Text style={styles.langText}>{language === 'en' ? 'తెలుగు' : 'ENG'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={22} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Global Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
          style={styles.searchBar}
        >
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {language === 'en'
              ? 'Search shops, plumbers, doctors, fort...'
              : 'దుకాణాలు, ప్లంబర్లు, వైద్యులు, కోట శోధించండి...'}
          </Text>
          <View style={styles.searchBtnInner}>
            <Text style={styles.searchBtnInnerText}>Search</Text>
          </View>
        </TouchableOpacity>

        {/* Hero Banners Carousel (if active) */}
        {heroBanners.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.heroScroll}
          >
            {heroBanners.map(banner => (
              <TouchableOpacity
                key={banner.id}
                activeOpacity={0.9}
                onPress={() => {
                  if (banner.redirectUrl) Linking.openURL(banner.redirectUrl).catch(() => {});
                }}
                style={styles.heroCard}
              >
                <Image source={{ uri: banner.imageUrl }} style={styles.heroImg} resizeMode="cover" />
                {banner.title ? (
                  <View style={styles.heroOverlay}>
                    <Text style={styles.heroTitle}>{banner.title}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Quick Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Explore Kurnool Categories' : 'కర్నూలు వర్గాలు'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Directory')}>
            <Text style={styles.viewAllText}>{language === 'en' ? 'View All' : 'అన్నీ'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {MASTER_CATEGORIES.slice(0, 8).map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => navigation.navigate('Directory', { initialCategory: cat.id })}
              style={styles.categoryCard}
            >
              <View style={styles.categoryIconCircle}>
                <Ionicons name={cat.icon as any} size={22} color="#2563EB" />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {language === 'en' ? cat.name_en : cat.name_te}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Near Me Quick Services Strip */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="flash" size={18} color="#EAB308" />
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Need a Service? (Near You)' : 'త్వరిత గృహ సేవలు'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Directory', { initialTab: 'professionals' })}>
            <Text style={styles.viewAllText}>{language === 'en' ? 'All Pros' : 'అందరూ'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prosScroll}>
          {topPros.map(pro => (
            <TouchableOpacity
              key={pro.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProfessionalDetail', { pro })}
              style={styles.proCard}
            >
              <View style={styles.proAvatar}>
                <Text style={styles.proAvatarText}>{pro.fullName.charAt(0)}</Text>
              </View>
              <Text style={styles.proName} numberOfLines={1}>{pro.fullName}</Text>
              <Text style={styles.proCategory}>{pro.category}</Text>
              <View style={styles.proRatingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.proRatingText}>{pro.ratingAvg.toFixed(1)}</Text>
                <Text style={{ fontSize: 10, color: '#9CA3AF' }}>({pro.ratingCount})</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleCall(pro.phone)}
                style={styles.proCallBtn}
              >
                <Ionicons name="call" size={12} color="#FFFFFF" />
                <Text style={styles.proCallText}>Call</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Businesses Carousel */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="ribbon" size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Featured in Kurnool' : 'ప్రముఖ వ్యాపారాలు'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Directory')}>
            <Text style={styles.viewAllText}>{language === 'en' ? 'Directory' : 'డైరెక్టరీ'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
          {featuredBusinesses.map(biz => (
            <TouchableOpacity
              key={biz.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: biz.id })}
              style={styles.featuredCard}
            >
              {biz.images && biz.images.length > 0 ? (
                <Image source={{ uri: biz.images[0] }} style={styles.featuredImg} resizeMode="cover" />
              ) : (
                <View style={[styles.featuredImg, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="storefront-outline" size={32} color="#2563EB" />
                </View>
              )}
              <View style={styles.featuredBody}>
                <Text style={styles.featuredName} numberOfLines={1}>
                  {language === 'en' ? biz.name_en : (biz.name_te || biz.name_en)}
                </Text>
                <Text style={styles.featuredAddr} numberOfLines={1}>{biz.address}</Text>

                <View style={styles.featuredBtm}>
                  <View style={styles.featuredRating}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.featuredRatingScore}>{biz.ratingAvg.toFixed(1)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCall(biz.phone)}
                    style={styles.featuredCall}
                  >
                    <Ionicons name="call" size={12} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tourist Highlights */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="compass" size={18} color="#0D9488" />
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Explore Kurnool Tourism' : 'దర్శనీయ స్థలాలు'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.viewAllText}>{language === 'en' ? 'Explore' : 'చూడండి'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
          {SEED_PLACES.slice(0, 3).map(place => (
            <TouchableOpacity
              key={place.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Explore')}
              style={styles.tourismCard}
            >
              <Image source={{ uri: place.photos[0] }} style={styles.tourismImg} resizeMode="cover" />
              <View style={styles.tourismBody}>
                <Text style={styles.tourismName} numberOfLines={1}>
                  {language === 'en' ? place.name_en : place.name_te}
                </Text>
                <Text style={styles.tourismTime}>
                  <Ionicons name="time-outline" size={11} color="#6B7280" /> {place.timings}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Places of Worship */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="sparkles" size={18} color="#D97706" />
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Temples, Masjids & Churches' : 'పుణ్యక్షేత్రాలు & ప్రార్థనా మందిరాలు'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.viewAllText}>{language === 'en' ? 'View All' : 'అన్నీ'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
          {SEED_WORSHIP_PLACES.map(worship => (
            <TouchableOpacity
              key={worship.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Explore')}
              style={styles.worshipCard}
            >
              <Image source={{ uri: worship.photos[0] }} style={styles.worshipImg} resizeMode="cover" />
              <View style={styles.worshipBody}>
                <Text style={styles.worshipName} numberOfLines={1}>
                  {language === 'en' ? worship.name_en : worship.name_te}
                </Text>
                <Text style={styles.worshipType}>{worship.type.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sponsor Ad Slot */}
        <View style={styles.adBannerSlot}>
          <Text style={styles.adLabel}>SPONSORED</Text>
          <SafeBannerAd unitId={BANNER_AD_UNIT} />
        </View>

        {/* Business Registration Banner */}
        <View style={styles.regBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.regTitle}>
              {language === 'en' ? 'Own a Shop or Service in Kurnool?' : 'మీకు కర్నూలులో వ్యాపారం ఉందా?'}
            </Text>
            <Text style={styles.regSub}>
              {language === 'en'
                ? 'Register your business on Kurnool One for free and reach thousands of local customers.'
                : 'ఉచితంగా నమోదు చేసుకుని ఎక్కువ మంది వినియోగదారులను చేరుకోండి.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterBusiness')}
            style={styles.regBtn}
          >
            <Text style={styles.regBtnText}>
              {language === 'en' ? 'Register Now' : 'నమోదు చేయండి'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 38, height: 38, borderRadius: 10 },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#1D4ED8', letterSpacing: -0.5 },
  cityText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  langText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  iconBtn: { padding: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    marginHorizontal: 16, marginTop: 12, marginBottom: 8, paddingLeft: 14, paddingRight: 6,
    paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchPlaceholder: { flex: 1, marginLeft: 8, fontSize: 13, color: '#6B7280' },
  searchBtnInner: {
    backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  searchBtnInnerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  heroScroll: { marginTop: 8 },
  heroCard: {
    width: 320, height: 160, marginHorizontal: 8, borderRadius: 18,
    overflow: 'hidden', backgroundColor: '#1E3A8A',
  },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 12,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 22, marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  viewAllText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  categoriesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12,
  },
  categoryCard: {
    width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4,
  },
  categoryIconCircle: {
    width: 52, height: 52, borderRadius: 18, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
    borderWidth: 1, borderColor: '#DBEAFE',
  },
  categoryLabel: {
    fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center', lineHeight: 14,
  },
  prosScroll: { paddingHorizontal: 16, gap: 12 },
  proCard: {
    width: 140, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  proAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  proAvatarText: { fontSize: 18, fontWeight: '900', color: '#2563EB' },
  proName: { fontSize: 13, fontWeight: '800', color: '#111827', textAlign: 'center' },
  proCategory: { fontSize: 11, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  proRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  proRatingText: { fontSize: 11, fontWeight: '800', color: '#111827' },
  proCallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: '#2563EB', width: '100%', paddingVertical: 6,
    borderRadius: 8, marginTop: 10,
  },
  proCallText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  featuredScroll: { paddingHorizontal: 16, gap: 12 },
  featuredCard: {
    width: 200, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  featuredImg: { width: '100%', height: 110 },
  featuredBody: { padding: 10 },
  featuredName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  featuredAddr: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  featuredBtm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  featuredRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredRatingScore: { fontSize: 11, fontWeight: '800', color: '#111827' },
  featuredCall: {
    backgroundColor: '#EFF6FF', padding: 6, borderRadius: 8,
  },
  tourismCard: {
    width: 220, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  tourismImg: { width: '100%', height: 120 },
  tourismBody: { padding: 10 },
  tourismName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  tourismTime: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  worshipCard: {
    width: 170, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  worshipImg: { width: '100%', height: 100 },
  worshipBody: { padding: 10 },
  worshipName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  worshipType: { fontSize: 9, fontWeight: '800', color: '#D97706', marginTop: 2, letterSpacing: 0.5 },
  adBannerSlot: {
    alignItems: 'center', marginVertical: 16, backgroundColor: '#F9FAFB',
    paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  adLabel: {
    fontSize: 9, color: '#9CA3AF', fontWeight: '800', letterSpacing: 1.5, marginBottom: 2,
  },
  regBanner: {
    marginHorizontal: 16, marginTop: 6, backgroundColor: '#1E3A8A', borderRadius: 20,
    padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  regTitle: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  regSub: { fontSize: 11, color: '#BFDBFE', marginTop: 4, lineHeight: 16 },
  regBtn: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
  },
  regBtnText: { color: '#1E3A8A', fontWeight: '800', fontSize: 12 },
});

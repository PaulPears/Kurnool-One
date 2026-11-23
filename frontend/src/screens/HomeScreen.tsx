import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, TextInput, ActivityIndicator, StatusBar, Linking, StyleSheet, Modal,
  Alert, BackHandler, ToastAndroid, Platform, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import {
  MASTER_CATEGORIES,
  fetchBusinesses, fetchProfessionals, fetchOffers, fetchMarketplaceItems,
  BusinessItem, ProfessionalItem, OfferItem, MarketplaceItem,
} from '../services/directoryService';
import { SafeBannerAd, AD_TEST_ID } from '../components/SafeBannerAd';
import { SafeNativeAd } from '../components/SafeNativeAd';

const BANNER_AD_UNIT = __DEV__ ? AD_TEST_ID : 'ca-app-pub-6894923761807901/6222488522';

export default function HomeScreen({ navigation }: any) {
  const { language, toggleLanguage } = useLanguage();

  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessItem[]>([]);
  const [topPros, setTopPros] = useState<ProfessionalItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [bazaarItems, setBazaarItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showRegisterChooser, setShowRegisterChooser] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(auth.currentUser?.photoURL || null);

  const featuredScrollRef = useRef<ScrollView>(null);
  const featuredIndexRef = useRef(0);
  const isUserDraggingRef = useRef(false);

  const prosScrollRef = useRef<ScrollView>(null);
  const prosIndexRef = useRef(0);
  const isProsDraggingRef = useRef(false);

  // Double-tap hardware back button to exit ONLY when on root Home screen
  useFocusEffect(
    useCallback(() => {
      let lastBackPressed = 0;
      const backAction = () => {
        if (showMenuDrawer) {
          setShowMenuDrawer(false);
          return true;
        }
        if (showRegisterChooser) {
          setShowRegisterChooser(false);
          return true;
        }
        const now = Date.now();
        if (lastBackPressed && now - lastBackPressed < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressed = now;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Press back again to exit Kurnool One', ToastAndroid.SHORT);
        }
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [showMenuDrawer, showRegisterChooser])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  // Auto-scroll Featured Businesses every 3.0s
  useEffect(() => {
    if (!featuredBusinesses || featuredBusinesses.length <= 1) return;
    const interval = setInterval(() => {
      if (isUserDraggingRef.current) return;
      featuredIndexRef.current = (featuredIndexRef.current + 1) % featuredBusinesses.length;
      featuredScrollRef.current?.scrollTo({
        x: featuredIndexRef.current * 212,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredBusinesses]);

  // Auto-scroll Skilled Professionals every 3.2s
  useEffect(() => {
    if (!topPros || topPros.length <= 1) return;
    const interval = setInterval(() => {
      if (isProsDraggingRef.current) return;
      prosIndexRef.current = (prosIndexRef.current + 1) % topPros.length;
      prosScrollRef.current?.scrollTo({
        x: prosIndexRef.current * 152,
        animated: true,
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [topPros]);

  const loadUserPhoto = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.photoURL || parsed.avatarUrl || parsed.profileImage) {
          setUserPhoto(parsed.photoURL || parsed.avatarUrl || parsed.profileImage);
          return;
        }
      }
      if (auth.currentUser?.photoURL) {
        setUserPhoto(auth.currentUser.photoURL);
      }
    } catch {}
  };

  useEffect(() => {
    loadUserPhoto();
    const unsub = auth.onAuthStateChanged(() => {
      loadUserPhoto();
    });
    return unsub;
  }, []);

  // Instant refresh whenever home screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    try {
      loadUserPhoto();
      const [bizs, pros, offs, mkt] = await Promise.all([
        fetchBusinesses().catch(() => []),
        fetchProfessionals().catch(() => []),
        fetchOffers().catch(() => []),
        fetchMarketplaceItems().catch(() => []),
      ]);
      if (offs && offs.length > 0) {
        setOffers(offs.slice(0, 5));
      } else {
        setOffers([]);
      }
      if (mkt && mkt.length > 0) {
        setBazaarItems(mkt.slice(0, 16));
      } else {
        setBazaarItems([]);
      }
      if (bizs && bizs.length > 0) {
        // Strictly filter to Featured and paid merchant listings (exclude free basic listings from Home carousel)
        const paidOnly = bizs.filter((b: BusinessItem) =>
          b.tier === 'featured' ||
          b.tier === 'premium' ||
          b.paymentStatus === 'paid' ||
          b.planId === 'yearly' ||
          b.planId === 'premium' ||
          (b.planId as any) === 'biz_premium' ||
          (b.planId as any) === 'biz_standard'
        );
        const sortedBizs = paidOnly.sort((a: BusinessItem, b: BusinessItem) => {
          const aPriority = (a.planId === 'yearly' || a.planId === 'premium' || a.tier === 'featured') ? 2 : 1;
          const bPriority = (b.planId === 'yearly' || b.planId === 'premium' || b.tier === 'featured') ? 2 : 1;
          return bPriority - aPriority;
        });
        setFeaturedBusinesses(sortedBizs);
      } else {
        setFeaturedBusinesses([]);
      }
      if (pros && pros.length > 0) {
        // Strictly filter to paid and elite professionals
        const paidPros = pros.filter((p: ProfessionalItem) =>
          p.paymentStatus === 'paid' ||
          p.tier === 'featured' ||
          p.planId === 'yearly' ||
          p.planId === 'elite' ||
          p.planId === 'premium' ||
          (p.planId as any) === 'pro_elite' ||
          (p.planId as any) === 'pro_standard'
        );
        const sortedPros = paidPros.sort((a: ProfessionalItem, b: ProfessionalItem) => {
          const aPriority = (a.planId === 'yearly' || a.planId === 'elite' || a.planId === 'premium') ? 2 : 1;
          const bPriority = (b.planId === 'yearly' || b.planId === 'elite' || b.planId === 'premium') ? 2 : 1;
          return bPriority - aPriority;
        });
        setTopPros(sortedPros);
      } else {
        setTopPros([]);
      }
      if (offs && offs.length > 0) {
        setOffers(offs.slice(0, 6));
      } else {
        setOffers([]);
      }
    } catch (e) {
      console.error('loadHomeData error:', e);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => { });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <TouchableOpacity
            onPress={() => setShowMenuDrawer(true)}
            style={{ padding: 6, backgroundColor: '#EFF6FF', borderRadius: 10, borderWidth: 1, borderColor: '#BFDBFE', marginRight: 4 }}
          >
            <Ionicons name="menu-outline" size={22} color="#1D4ED8" />
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle} numberOfLines={1}>
            {language === 'en' ? 'Kurnool One' : 'కర్నూలు వన్'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.langBadge}
          >
            <Text style={styles.langText}>{language === 'en' ? 'తెలుగు' : 'ENG'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileAvatarBtn}
          >
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.profileAvatarImg} />
            ) : (
              <Ionicons name="person-circle-outline" size={24} color="#475569" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
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

        {/* Quick Highlights Row (News, Deals, Tourism, Emergency Blood) */}
        <View style={styles.quickHighlightsRow}>
          <TouchableOpacity
            style={[styles.highlightPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
            onPress={() => navigation.navigate('News')}
          >
            <Ionicons name="newspaper" size={15} color="#2563EB" />
            <Text style={[styles.highlightPillText, { color: '#1D4ED8' }]}>
              {language === 'en' ? 'City News' : 'నగర వార్తలు'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.highlightPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
            onPress={() => navigation.navigate('HouseRent')}
          >
            <Ionicons name="home" size={15} color="#2563EB" />
            <Text style={[styles.highlightPillText, { color: '#1D4ED8' }]}>
              {language === 'en' ? 'Rent Houses' : 'ఇళ్లు అద్దెకు'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.highlightPill, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
            onPress={() => navigation.navigate('BloodDonors')}
          >
            <Ionicons name="water" size={15} color="#DC2626" />
            <Text style={[styles.highlightPillText, { color: '#B91C1C' }]}>
              {language === 'en' ? 'Blood Donors' : 'రక్తదాతలు'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Categories Horizontal Strip */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Explore Kurnool Categories' : 'కర్నూలు వర్గాలు'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Directory', { initialTab: 'businesses', initialCategory: 'all', timestamp: Date.now() })}>
            <Text style={styles.viewAllText}>{language === 'en' ? 'View All' : 'అన్నీ'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesHorizontalScroll}
        >
          {MASTER_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => navigation.navigate('Directory', { initialTab: 'businesses', initialCategory: cat.id, timestamp: Date.now() })}
              style={styles.categoryHorizontalCard}
            >
              <View
                style={[
                  styles.categoryIconCircleSmall,
                  {
                    backgroundColor: `${cat.color || '#2563EB'}15`,
                    borderColor: `${cat.color || '#2563EB'}33`,
                  },
                ]}
              >
                {cat.id === 'chicken_mutton_center' ? (
                  <MaterialCommunityIcons name="food-drumstick" size={20} color={cat.color || '#DC2626'} />
                ) : (
                  <Ionicons name={cat.icon as any} size={20} color={cat.color || '#2563EB'} />
                )}
              </View>
              <Text style={styles.categoryHorizontalLabel} numberOfLines={1}>
                {language === 'en' ? cat.name_en : cat.name_te}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

        <ScrollView
          ref={prosScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prosScroll}
          onScrollBeginDrag={() => {
            isProsDraggingRef.current = true;
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isProsDraggingRef.current = false;
            }, 2000);
          }}
        >
          {topPros.map(pro => (
            <TouchableOpacity
              key={pro.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProfessionalDetail', { pro })}
              style={styles.proCard}
            >
              <View style={styles.proAvatar}>
                <Text style={styles.proAvatarText}>{(pro.fullName || 'P').charAt(0)}</Text>
              </View>
              <Text style={styles.proName} numberOfLines={1}>{pro.fullName || 'Professional'}</Text>
              <Text style={styles.proCategory}>{pro.category || 'Expert'}</Text>
              <View style={styles.proRatingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.proRatingText}>{Number(pro.ratingAvg || 5.0).toFixed(1)}</Text>
                <Text style={{ fontSize: 10, color: '#9CA3AF' }}>({pro.ratingCount || 1})</Text>
              </View>

              <View style={styles.proCallBtn}>
                <Text style={styles.proCallText}>
                  {language === 'en' ? 'View Profile' : 'వివరాలు'}
                </Text>
                <Ionicons name="arrow-forward" size={11} color="#FFFFFF" />
              </View>
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

        <ScrollView
          ref={featuredScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
          onScrollBeginDrag={() => {
            isUserDraggingRef.current = true;
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isUserDraggingRef.current = false;
            }, 3000);
          }}
          onMomentumScrollEnd={(e) => {
            featuredIndexRef.current = Math.round(e.nativeEvent.contentOffset.x / 212);
          }}
        >
          {featuredBusinesses.map(biz => (
            <TouchableOpacity
              key={biz.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: biz.id })}
              style={styles.featuredCard}
            >
              {biz.coverImage || biz.bannerUrl || (biz.images && biz.images.length > 0) ? (
                <Image source={{ uri: biz.coverImage || biz.bannerUrl || biz.images[0] }} style={styles.featuredImg} resizeMode="cover" />
              ) : (
                <View style={[styles.featuredImg, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="storefront-outline" size={32} color="#2563EB" />
                </View>
              )}
              <View style={styles.featuredBody}>
                <Text style={styles.featuredName} numberOfLines={1}>
                  {language === 'en' ? biz.name_en : (biz.name_te || biz.name_en)}
                </Text>
                {(() => {
                  const bizCat = MASTER_CATEGORIES.find(c => c.id === biz.categoryId);
                  const catColor = bizCat?.color || '#2563EB';
                  const catBg = bizCat?.bgLight || '#EFF6FF';
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: catBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 3, marginBottom: 2, borderWidth: 1, borderColor: `${catColor}30` }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: catColor }} numberOfLines={1}>
                        {language === 'en' ? (bizCat?.name_en || 'Business') : (bizCat?.name_te || 'వ్యాపారం')}
                      </Text>
                    </View>
                  );
                })()}
                <Text style={styles.featuredAddr} numberOfLines={1}>{biz.address}</Text>

                <View style={styles.featuredBtm}>
                  <View style={styles.featuredRating}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.featuredRatingScore}>{Number(biz.ratingAvg || 5.0).toFixed(1)}</Text>
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

        {/* Native Sponsor / AdMob Ad Card */}
        <View style={{ marginHorizontal: 14, marginVertical: 6 }}>
          <SafeNativeAd />
        </View>

        {/* ─── FRESH OFFERS & DEALS SECTION (3-5 RECENT OFFERS) ─── */}
        <View style={{ marginTop: 18, marginHorizontal: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flame" size={20} color="#DC2626" />
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                {language === 'en' ? 'Fresh Deals & Discounts' : 'తాజా హాట్ ఆఫర్లు'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Offers', { initialTab: 'offers' })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#DC2626' }}>
                {language === 'en' ? 'Explore All →' : 'అన్నీ చూడండి →'}
              </Text>
            </TouchableOpacity>
          </View>

          {offers.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 6 }}>
              {offers.slice(0, 5).map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('Offers', { initialTab: 'offers' })}
                  style={{
                    width: 220,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View style={{ height: 100, backgroundColor: '#FEF2F2', position: 'relative' }}>
                    {deal.bannerUrl ? (
                      <Image source={{ uri: deal.bannerUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="pricetag" size={28} color="#DC2626" />
                      </View>
                    )}
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>{deal.discountText || 'OFFER'}</Text>
                    </View>
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#111827' }} numberOfLines={1}>
                      {language === 'en' ? deal.title_en : (deal.title_te || deal.title_en)}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626', marginTop: 2 }} numberOfLines={1}>
                      📍 {deal.businessName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ fontSize: 10, color: '#64748B' }}>
                        ⏰ {deal.validUntil || 'Active'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                        <Text style={{ fontSize: 10, color: '#94A3B8' }}>{deal.viewCount || 0}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Offers', { initialTab: 'offers' })}
              style={{
                backgroundColor: '#FFF5F5',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#FED7D7',
                borderStyle: 'dashed',
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#9B2C2C' }}>
                  {language === 'en' ? 'Special City Offers' : 'ప్రత్యేక నగర ఆఫర్లు'}
                </Text>
                <Text style={{ fontSize: 11, color: '#742A2A', marginTop: 2 }}>
                  {language === 'en'
                    ? 'No active offers today. Local businesses, post your discounts!'
                    : 'ఈరోజు తాజా ఆఫర్లు లేవు. వ్యాపారస్తులు మీ ఆఫర్లను పోస్ట్ చేయండి!'}
                </Text>
              </View>
              <View style={{ backgroundColor: '#E53E3E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                  {language === 'en' ? '+ Post Offer' : '+ పోస్ట్ చేయండి'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── NATIVE ADVANCED AD 1 ─── */}
        <View style={{ marginHorizontal: 14, marginTop: 14 }}>
          <SafeNativeAd />
        </View>

        {/* ─── KURNOOL BAZAAR FEED WITH NATIVE ADS AFTER EVERY 4 ITEMS ─── */}
        {bazaarItems.length > 0 && (
          <View style={{ marginTop: 18, marginHorizontal: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="cart" size={20} color="#059669" />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                  {language === 'en' ? 'Kurnool Bazaar • Buy & Sell' : 'కర్నూలు బజార్ • అమ్మకాలు'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Offers', { initialTab: 'marketplace' })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#059669' }}>
                  {language === 'en' ? 'View All →' : 'అన్నీ చూడండి →'}
                </Text>
              </TouchableOpacity>
            </View>

            {Array.from({ length: Math.ceil(bazaarItems.length / 4) }).map((_, chunkIdx) => {
              const chunk = bazaarItems.slice(chunkIdx * 4, chunkIdx * 4 + 4);
              return (
                <View key={`bazaar_chunk_${chunkIdx}`}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {chunk.map((item) => {
                      const itemImages = item.images && item.images.length > 0 ? item.images : item.imageUrl ? [item.imageUrl] : [];
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.88}
                          onPress={() => navigation.navigate('Offers', { initialTab: 'marketplace' })}
                          style={{
                            width: '48.5%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 14,
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            overflow: 'hidden',
                          }}
                        >
                          <View style={{ height: 100, backgroundColor: '#F1F5F9' }}>
                            {itemImages.length > 0 ? (
                              <Image source={{ uri: itemImages[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            ) : (
                              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="cart-outline" size={28} color="#94A3B8" />
                              </View>
                            )}
                          </View>
                          <View style={{ padding: 8 }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#059669' }}>{item.price}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B', marginTop: 2 }} numberOfLines={1}>
                              {item.title_en}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                              <Text style={{ fontSize: 10, color: '#64748B' }} numberOfLines={1}>
                                📍 {item.area || 'Kurnool'}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Ionicons name="eye-outline" size={11} color="#94A3B8" />
                                <Text style={{ fontSize: 10, color: '#94A3B8' }}>{item.viewCount || 0}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={{ marginVertical: 8 }}>
                    <SafeNativeAd />
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              onPress={() => navigation.navigate('Offers', { initialTab: 'marketplace' })}
              style={{
                backgroundColor: '#ECFDF5',
                borderWidth: 1,
                borderColor: '#A7F3D0',
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
                marginTop: 4,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: '#065F46', fontWeight: '800', fontSize: 13 }}>
                {language === 'en' ? 'Explore 100+ Items in Kurnool Bazaar →' : 'కర్నూలు బజార్‌లో మరిన్ని వస్తువులు చూడండి →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sponsor Ad Slot */}
        <View style={styles.adBannerSlot}>
          <View style={styles.adBadgeContainer}>
            <Text style={styles.adLabel}>AD</Text>
          </View>
          <SafeBannerAd unitId={BANNER_AD_UNIT} />
        </View>

        {/* Business & Pro Registration Banner */}
        <View style={styles.regBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.regTitle}>
              {language === 'en' ? 'Own a Shop or Service in Kurnool?' : 'మీకు కర్నూలులో వ్యాపారం లేదా వృత్తి ఉందా?'}
            </Text>
            <Text style={styles.regSub}>
              {language === 'en'
                ? 'Register your business or professional service on Kurnool One to reach local customers across the city.'
                : 'కర్నూలు వన్‌లో మీ షాప్ లేదా సర్వీస్‌ను నమోదు చేసుకుని కస్టమర్లను చేరుకోండి.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowRegisterChooser(true)}
            style={styles.regBtn}
          >
            <Text style={styles.regBtnText}>
              {language === 'en' ? 'Register Now' : 'నమోదు చేయండి'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Registration Chooser Modal */}
      <Modal
        visible={showRegisterChooser}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegisterChooser(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {language === 'en' ? 'Choose Registration Type' : 'నమోదు రకాన్ని ఎంచుకోండి'}
                </Text>
                <Text style={styles.modalSub}>
                  {language === 'en' ? 'Select how you want to list on Kurnool One' : 'మీరు ఏ వర్గంలో నమోదు చేసుకోవాలనుకుంటున్నారు?'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowRegisterChooser(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.chooserCard, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}
              onPress={() => {
                setShowRegisterChooser(false);
                navigation.navigate('RegisterBusiness');
              }}
            >
              <View style={[styles.chooserIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="storefront" size={24} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chooserTitle}>
                  {language === 'en' ? 'Shop, Store & Business' : 'దుకాణం / వ్యాపారం / స్టోర్'}
                </Text>
                <Text style={styles.chooserDesc}>
                  {language === 'en'
                    ? 'Retail shops, supermarkets, restaurants, clinics, showrooms & commercial stores.'
                    : 'కిరాణా, రెస్టారెంట్లు, షోరూమ్‌లు మరియు వాణిజ్య వ్యాపారాలు.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.chooserCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}
              onPress={() => {
                setShowRegisterChooser(false);
                navigation.navigate('RegisterProfessional');
              }}
            >
              <View style={[styles.chooserIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="construct" size={24} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chooserTitle}>
                  {language === 'en' ? 'Service Professional & Freelancer' : 'వృత్తి నిపుణులు & సేవాదాతలు'}
                </Text>
                <Text style={styles.chooserDesc}>
                  {language === 'en'
                    ? 'Electricians, plumbers, painters, teachers, tutors, maids, photographers, influencers.'
                    : 'ఎలక్ట్రీషియన్లు, ప్లంబర్లు, టీచర్లు, పని మనుషులు మరియు నిపుణులు.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#16A34A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowRegisterChooser(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>{language === 'en' ? 'Cancel' : 'రద్దు చేయండి'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── HAMBURGER SIDE DRAWER MODAL ─── */}
      <Modal visible={showMenuDrawer} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMenuDrawer(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ width: '80%', backgroundColor: '#FFFFFF', height: '100%', padding: 20, paddingTop: 50 }}
          >
            {/* Drawer Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={require('../../assets/logo.png')} style={{ width: 36, height: 36, borderRadius: 8 }} />
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1D4ED8' }}>Kurnool One</Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>Smart City Directory</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowMenuDrawer(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { icon: 'home-outline', label: language === 'en' ? 'Home' : 'హోమ్', screen: 'Main' },
                { icon: 'storefront-outline', label: language === 'en' ? 'Business Directory' : 'దుకాణాల డైరెక్టరీ', screen: 'Directory', params: { initialTab: 'businesses' } },
                { icon: 'construct-outline', label: language === 'en' ? 'Skilled Professionals' : 'వృత్తి నిపుణులు', screen: 'Directory', params: { initialTab: 'professionals' } },
                { icon: 'flame-outline', label: language === 'en' ? 'Hot Deals & Offers' : 'హాట్ డీల్స్ & ఆఫర్లు', screen: 'Offers', params: { initialTab: 'offers' } },
                { icon: 'cart-outline', label: language === 'en' ? 'Kurnool Bazaar (Buy & Sell)' : 'కర్నూలు బజార్', screen: 'Offers', params: { initialTab: 'marketplace' } },
                { icon: 'key-outline', label: language === 'en' ? 'House Rentals (TO-LET)' : 'ఇంటి అద్దెలు (TO-LET)', screen: 'HouseRent' },
                { icon: 'water-outline', label: language === 'en' ? 'Emergency Blood Donors' : 'రక్తదాతల నెట్‌వర్క్', screen: 'BloodDonors' },
                { icon: 'compass-outline', label: language === 'en' ? 'Explore & Heritage Spots' : 'దర్శనీయ స్థలాలు', screen: 'Explore' },
                { icon: 'sparkles-outline', label: language === 'en' ? '🤝 Kurnool One Partner (Earn Money)' : '🤝 కర్నూలు వన్ పార్ట్‌నర్ (ఆదాయం)', screen: 'PartnerProgram' },
                { icon: 'newspaper-outline', label: language === 'en' ? 'City News & Updates' : 'నగర వార్తలు', screen: 'News' },
                { icon: 'business-outline', label: language === 'en' ? 'Merchant Portal (My Shop)' : 'వ్యాపార పోర్టల్', screen: 'ManageBusiness' },
                { icon: 'construct-outline', label: language === 'en' ? 'Professional Portal (My Services)' : 'వృత్తి నిపుణుల పోర్టల్', screen: 'ManageProfessional' },
                { icon: 'settings-outline', label: language === 'en' ? 'Settings & Legal' : 'సెట్టింగులు & చట్టపరమైన', screen: 'Settings' },
                { icon: 'person-outline', label: language === 'en' ? 'My Profile' : 'నా ప్రొఫైల్', screen: 'Profile' },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    navigation.navigate(item.screen, item.params);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}
                >
                  <Ionicons name={item.icon as any} size={20} color="#2563EB" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, marginRight: 8 },
  logoImg: { width: 34, height: 34, borderRadius: 10 },
  brandTitle: { fontSize: 18, fontWeight: '900', color: '#1D4ED8', letterSpacing: -0.5, flexShrink: 1 },
  cityText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  langText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  iconBtn: { padding: 4 },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    marginHorizontal: 16, marginTop: 6, marginBottom: 4, paddingLeft: 12, paddingRight: 5,
    paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchPlaceholder: { flex: 1, marginLeft: 8, fontSize: 13, color: '#6B7280' },
  searchBtnInner: {
    backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  searchBtnInnerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 12, marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#111827' },
  viewAllText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  categoriesHorizontalScroll: {
    paddingHorizontal: 14,
    gap: 12,
    paddingBottom: 4,
  },
  categoryHorizontalCard: {
    alignItems: 'center',
    width: 68,
  },
  categoryIconCircleSmall: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
  },
  categoryHorizontalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
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
    fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center', lineHeight: 16, paddingBottom: 2,
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
  proName: { fontSize: 13, fontWeight: '800', color: '#111827', textAlign: 'center', lineHeight: 18 },
  proCategory: { fontSize: 11, fontWeight: '700', color: '#2563EB', marginTop: 2, lineHeight: 16 },
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
    alignItems: 'center', marginVertical: 12, backgroundColor: '#F8FAFC',
    paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9',
  },
  adBadgeContainer: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginBottom: 4,
  },
  adLabel: {
    fontSize: 9, color: '#64748B', fontWeight: '800', letterSpacing: 1,
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
  quickHighlightsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  highlightPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  highlightPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  newsBannerCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  newsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  newsLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  newsLiveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  newsReadMore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  newsBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  chooserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  chooserIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooserTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  chooserDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  /* Blood Section Styles */
  bloodSectionWrap: {
    marginHorizontal: 16, marginTop: 14, marginBottom: 8, padding: 14,
    backgroundColor: '#FFF5F5', borderRadius: 20, borderWidth: 1, borderColor: '#FED7D7',
  },
  bloodHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  bloodDropIconCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
  },
  bloodSectionTitle: { fontSize: 15, fontWeight: '900', color: '#991B1B' },
  bloodSectionSub: { fontSize: 11, color: '#B91C1C', marginTop: 1 },
  registerDonorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DC2626',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  registerDonorBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  bloodFilterScroll: { gap: 6, paddingBottom: 10 },
  bloodChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA',
  },
  bloodChipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  bloodChipText: { fontSize: 12, fontWeight: '700', color: '#991B1B' },
  bloodChipTextActive: { color: '#FFFFFF' },
  donorsScroll: { gap: 10, paddingBottom: 10 },
  donorCard: {
    width: 170, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  donorCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  bloodGroupBadge: {
    backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  bloodGroupBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  availabilityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 9, fontWeight: '700' },
  donorName: { fontSize: 13, fontWeight: '800', color: '#1F2937', marginBottom: 2 },
  donorAreaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  donorAreaText: { fontSize: 11, color: '#6B7280', flex: 1 },
  donorNotes: { fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 8 },
  donorCallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#DC2626', paddingVertical: 6, borderRadius: 8, marginTop: 4,
  },
  donorCallText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  donorCallBtnDisabled: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#F3F4F6', paddingVertical: 6, borderRadius: 8, marginTop: 4,
  },
  donorCallTextDisabled: { color: '#6B7280', fontWeight: '700', fontSize: 10 },
  bloodDisclaimerBox: {
    flexDirection: 'row', gap: 6, backgroundColor: '#FEF2F2', padding: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#FECACA', marginTop: 4,
  },
  bloodDisclaimerText: { flex: 1, fontSize: 10, color: '#991B1B', lineHeight: 14 },

  /* Donor Modal Styles */
  donorModalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  bloodCtaCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  bloodCtaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloodCtaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  bloodCtaTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#991B1B',
  },
  bloodLivePill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bloodLiveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bloodCtaSub: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    marginTop: 2,
  },
  bloodCtaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  bloodGroupMiniRow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bloodGroupMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  bloodCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bloodCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

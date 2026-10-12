import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Share,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getUser } from '../services/firestoreService';

export default function ProfileScreen({ route, navigation }: any) {
  const { userId: paramUserId } = route.params || {};
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(true);
  const { language } = useLanguage();

  // Dynamic real counts from Firestore
  const [bizCount, setBizCount] = useState<number>(0);
  const [proCount, setProCount] = useState<number>(0);
  const [placeCount, setPlaceCount] = useState<number>(0);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile(user !== null);
    }, [paramUserId])
  );

  const loadProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('user');
      const cUser = storedData ? JSON.parse(storedData) : null;
      setCurrentUser(cUser);

      const targetUid = paramUserId || cUser?.uid || auth.currentUser?.uid;
      setIsSelf(!paramUserId || paramUserId === cUser?.uid || paramUserId === auth.currentUser?.uid);

      if (targetUid) {
        const userInfo = await getUser(targetUid);
        setUser(userInfo);

        if (isSelf && userInfo && cUser) {
          const updatedLocalUser = { ...cUser, ...userInfo };
          await AsyncStorage.setItem('user', JSON.stringify(updatedLocalUser));
          setCurrentUser(updatedLocalUser);
        }
      }

      // Load real live counts from Firestore
      try {
        const [bizSnap, proSnap, placeSnap] = await Promise.all([
          getDocs(collection(db, 'businesses')),
          getDocs(collection(db, 'professionals')),
          getDocs(collection(db, 'places')),
        ]);
        setBizCount(bizSnap.size);
        setProCount(proSnap.size);
        setPlaceCount(placeSnap.size);
      } catch (countErr) {
        console.warn('Count fetch non-fatal:', countErr);
      }
    } catch (error) {
      console.error('Load Profile Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Discover Kurnool One — Everything in One App! Explore local shops, skilled pros, deals & tourism in Kurnool city: https://kurnool-kaburlu.web.app`,
      });
    } catch (error) {
      console.error('Share Error:', error);
    }
  };

  const displayName =
    user?.name ||
    user?.displayName ||
    currentUser?.name ||
    currentUser?.displayName ||
    (auth.currentUser?.isAnonymous
      ? (language === 'en' ? 'Guest Citizen' : 'అతిథి పౌరుడు')
      : (language === 'en' ? 'Kurnool Resident' : 'కర్నూలు పౌరుడు'));

  const contactText =
    user?.phone ||
    user?.phoneNumber ||
    currentUser?.phone ||
    auth.currentUser?.phoneNumber ||
    user?.email ||
    currentUser?.email ||
    auth.currentUser?.email ||
    '';

  const isMerchant = currentUser?.role === 'business' || user?.role === 'business';
  const isProfessional = currentUser?.role === 'professional' || user?.role === 'professional';

  if (loading && !user && !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProfile} colors={['#2563EB']} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{language === 'en' ? 'Profile & Portals' : 'ప్రొఫైల్ & పోర్టల్స్'}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {user?.photoURL || currentUser?.photoURL ? (
                <Image source={{ uri: user?.photoURL || currentUser?.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={42} color="#2563EB" />
                </View>
              )}
              {isSelf && (
                <TouchableOpacity style={styles.cameraIcon} onPress={() => navigation.navigate('EditProfile')}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.username}>{displayName}</Text>

            {contactText ? (
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={13} color="#64748B" />
                <Text style={styles.phoneNumber}>{contactText}</Text>
              </View>
            ) : null}
          </View>

          {/* Directory Stats / Real Live Counts */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statColumn} onPress={() => navigation.navigate('Directory')}>
              <Ionicons name="storefront-outline" size={22} color="#2563EB" />
              <Text style={styles.statCount}>{bizCount}</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Shops' : 'దుకాణాలు'}</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statColumn}
              onPress={() => navigation.navigate('Directory', { initialTab: 'professionals' })}
            >
              <Ionicons name="construct-outline" size={22} color="#0D9488" />
              <Text style={styles.statCount}>{proCount}</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Skilled Pros' : 'నిపుణులు'}</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity style={styles.statColumn} onPress={() => navigation.navigate('Explore')}>
              <Ionicons name="compass-outline" size={22} color="#EA580C" />
              <Text style={styles.statCount}>{placeCount}</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Heritage Spots' : 'దర్శనీయ స్థలాలు'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── MANAGE LISTINGS & GROWTH (PROMINENT ON PROFILE) ───────────────────── */}
        <View style={styles.menuContainer}>
          <Text style={styles.portalSectionHeader}>
            {language === 'en' ? 'Manage Listings & Growth' : 'వ్యాపార & వృత్తి నిర్వహణ'}
          </Text>

          {/* Business Action Card */}
          <TouchableOpacity
            style={[styles.menuCard, { borderColor: '#BFDBFE', backgroundColor: '#F8FAFC' }]}
            onPress={() => {
              if (isMerchant) {
                navigation.navigate('ManageBusiness');
              } else {
                navigation.navigate('RegisterBusiness');
              }
            }}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="storefront" size={24} color="#2563EB" />
            </View>
            <View style={styles.menuContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.menuTitle}>
                  {language === 'en' ? 'My Business Listings & Leads' : 'నా వ్యాపారం & లీడ్స్'}
                </Text>
                {isMerchant && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuSubtitle}>
                {isMerchant
                  ? (language === 'en' ? 'View calls, customer inquiries & edit hours' : 'కాల్స్, కస్టమర్ లీడ్స్ మరియు సమయాల నిర్వహణ')
                  : (language === 'en' ? 'Register your shop, get verified & receive calls' : 'మీ దుకాణాన్ని నమోదు చేసుకోండి')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#2563EB" />
          </TouchableOpacity>

          {/* Professional Action Card */}
          <TouchableOpacity
            style={[styles.menuCard, { borderColor: '#99F6E4', backgroundColor: '#F8FAFC' }]}
            onPress={() => {
              if (isProfessional) {
                navigation.navigate('ManageProfessional');
              } else {
                navigation.navigate('RegisterProfessional');
              }
            }}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#F0FDFA' }]}>
              <Ionicons name="briefcase" size={24} color="#0D9488" />
            </View>
            <View style={styles.menuContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.menuTitle, { color: '#0F766E' }]}>
                  {language === 'en' ? 'My Professional Services & Clients' : 'నా వృత్తి సేవలు & క్లయింట్లు'}
                </Text>
                {isProfessional && (
                  <View style={[styles.activeBadge, { backgroundColor: '#CCFBF1' }]}>
                    <Text style={[styles.activeBadgeText, { color: '#0F766E' }]}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuSubtitle}>
                {isProfessional
                  ? (language === 'en' ? 'Manage service rates, areas & client calls' : 'సర్వీస్ ఛార్జీలు, ప్రాంతాలు & క్లయింట్ కాల్స్')
                  : (language === 'en' ? 'List your skill (Plumber, Electrician, CA, etc.)' : 'మీ నైపుణ్యాన్ని నమోదు చేసుకోండి')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* ─── CONNECT & SUPPORT ──────────────────────────────────────────────── */}
        <View style={styles.menuContainer}>
          <Text style={[styles.portalSectionHeader, { color: '#1E293B' }]}>
            {language === 'en' ? 'Connect with Kurnool One' : 'కర్నూలు వన్ తో అనుసంధానం'}
          </Text>

          {/* WhatsApp Support */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => Linking.openURL('https://wa.me/919494300000?text=Hello%20Kurnool%20One%20Team').catch(() => {})}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>24/7 WhatsApp Helpline</Text>
              <Text style={styles.menuSubtitle}>Chat directly with our Kurnool city desk</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Share App */}
          <TouchableOpacity style={styles.menuCard} onPress={handleShareProfile}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="share-social-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{language === 'en' ? 'Share Kurnool One' : 'కర్నూలు వన్ పంచుకోండి'}</Text>
              <Text style={styles.menuSubtitle}>
                {language === 'en' ? 'Spread the word with family & friends' : 'యాప్‌ను స్నేహితులతో పంచుకోండి'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => Linking.openURL('https://instagram.com/kurnoolone').catch(() => {})}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="logo-instagram" size={22} color="#E11D48" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Instagram Page</Text>
              <Text style={styles.menuSubtitle}>@kurnoolone • Updates & photos</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => Linking.openURL('https://facebook.com/kurnoolone').catch(() => {})}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="logo-facebook" size={22} color="#1D4ED8" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Facebook Page</Text>
              <Text style={styles.menuSubtitle}>Follow Kurnool One on Facebook</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Official YouTube Channel */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => Linking.openURL('https://youtube.com/@kurnoolone').catch(() => {})}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="logo-youtube" size={22} color="#DC2626" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Official YouTube Channel</Text>
              <Text style={styles.menuSubtitle}>@kurnoolone • City tours, news & events</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Admin Dashboard (Visible only if admin) */}
          {user && (user.role === 'admin' || user.role === 'super_admin') && isSelf && (
            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('AdminDashboard')}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="shield-checkmark" size={22} color="#DC2626" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{language === 'en' ? 'Admin Dashboard' : 'అడ్మిన్ డాష్బోర్డ్'}</Text>
                <Text style={styles.menuSubtitle}>
                  {language === 'en' ? 'Manage verified listings & banners' : 'లిస్టింగులు మరియు బ్యానర్ల నిర్వహణ'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* DPDP Trust Notice */}
        <View style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
            <Text style={styles.trustTitle}>
              {language === 'en' ? 'Official Kurnool City Platform' : 'అధికారిక కర్నూలు సిటీ వేదిక'}
            </Text>
          </View>
          <Text style={styles.trustDesc}>
            {language === 'en'
              ? 'Connecting verified businesses, skilled professionals, and local citizens under one transparent directory.'
              : 'ధృవీకరించబడిన వ్యాపారాలు, నిపుణులు మరియు పౌరులను ఒకే వేదికపై అనుసంధానించే విశ్వసనీయ వేదిక.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  phoneNumber: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginTop: 8,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  statCount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  portalSectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  activeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  trustCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  trustDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});

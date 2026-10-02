import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Share,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { getUser } from '../services/firestoreService';

export default function ProfileScreen({ route, navigation }: any) {
  const { userId: paramUserId } = route.params || {};
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(true);
  const { language } = useLanguage();

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
    } catch (error) {
      console.error('Load Profile Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Discover Kurnool One — Everything in One Place! Explore local businesses, skilled pros, deals & tourism in Kurnool city: https://kurnoolone.com`,
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

          {/* Edit Profile Button */}
          {isSelf && (
            <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="pencil" size={16} color="#fff" />
              <Text style={styles.editProfileButtonText}>
                {language === 'en' ? 'Edit Profile' : 'ప్రొఫైల్ సవరించు'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Directory Stats / City Hub Badges */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statColumn} onPress={() => navigation.navigate('Directory')}>
              <Ionicons name="storefront-outline" size={22} color="#2563EB" />
              <Text style={styles.statCount}>50+</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Shops' : 'దుకాణాలు'}</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statColumn}
              onPress={() => navigation.navigate('Directory', { initialTab: 'professionals' })}
            >
              <Ionicons name="construct-outline" size={22} color="#0D9488" />
              <Text style={styles.statCount}>30+</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Skilled Pros' : 'నిపుణులు'}</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity style={styles.statColumn} onPress={() => navigation.navigate('Explore')}>
              <Ionicons name="compass-outline" size={22} color="#EA580C" />
              <Text style={styles.statCount}>15+</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Heritage Spots' : 'దర్శనీయ స్థలాలు'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portals & Merchant Controls */}
        <View style={styles.menuContainer}>
          {isSelf && (
            <>
              {/* Commercial Business Portal Section */}
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.portalSectionHeader}>
                  {language === 'en' ? 'Commercial Business Portal' : 'వాణిజ్య వ్యాపార పోర్టల్'}
                </Text>

                <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('ManageBusiness')}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="storefront" size={22} color="#2563EB" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>
                      {language === 'en' ? 'Business Dashboard' : 'వ్యాపార డాష్‌బోర్డ్'}
                    </Text>
                    <Text style={styles.menuSubtitle}>
                      {language === 'en' ? 'Shop hours, analytics & post offers' : 'సమయాలు, అనలిటిక్స్ మరియు ఆఫర్లు'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('RegisterBusiness')}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="add-circle" size={22} color="#2563EB" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>
                      {language === 'en' ? 'Register Business' : 'వ్యాపారం నమోదు చేయండి'}
                    </Text>
                    <Text style={styles.menuSubtitle}>
                      {language === 'en' ? 'Get verified & receive customer calls' : 'ధృవీకరణ & కస్టమర్ కాల్స్ పొందండి'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Professional & Creator Portal Section */}
              <View style={{ marginBottom: 8 }}>
                <Text style={[styles.portalSectionHeader, { color: '#0D9488' }]}>
                  {language === 'en' ? 'Professional & Creator Portal' : 'నైపుణ్య నిపుణుల పోర్టల్'}
                </Text>

                <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('ManageProfessional')}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#F0FDFA' }]}>
                    <Ionicons name="briefcase" size={22} color="#0D9488" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>
                      {language === 'en' ? 'Professional Dashboard' : 'ప్రొఫెషనల్ డాష్‌బోర్డ్'}
                    </Text>
                    <Text style={styles.menuSubtitle}>
                      {language === 'en' ? 'Manage rates, leads & social links' : 'ధరలు, లీడ్స్ & సోషల్ లింకులు'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('RegisterProfessional')}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#F0FDFA' }]}>
                    <Ionicons name="person-add" size={22} color="#0D9488" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>
                      {language === 'en' ? 'List Pro Profile' : 'వ్యక్తిగత ప్రొఫైల్ నమోదు'}
                    </Text>
                    <Text style={styles.menuSubtitle}>
                      {language === 'en'
                        ? 'Doctor, Influencer, Tech & Freelancer'
                        : 'డాక్టర్, ఇన్‌ఫ్లుయెన్సర్, టెక్నీషియన్ & ఫ్రీలాన్సర్'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </>
          )}

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

          {/* Share App */}
          <TouchableOpacity style={styles.menuCard} onPress={handleShareProfile}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="share-social-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{language === 'en' ? 'Share Kurnool One' : 'కర్నూలు వన్ పంచుకోండి'}</Text>
              <Text style={styles.menuSubtitle}>
                {language === 'en' ? 'Share app with family & friends' : 'యాప్‌ను స్నేహితులతో పంచుకోండి'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Digital City Trust Card */}
        <View style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <Ionicons name="shield-checkmark" size={22} color="#2563EB" />
            <Text style={styles.trustTitle}>
              {language === 'en' ? 'Kurnool One Digital City Platform' : 'కర్నూలు వన్ డిజిటల్ సిటీ వేదిక'}
            </Text>
          </View>
          <Text style={styles.trustDesc}>
            {language === 'en'
              ? 'Dedicated city directory connecting citizens, businesses, skilled technicians, exclusive offers, and heritage in Kurnool.'
              : 'కర్నూలు పౌరులకు ధృవీకరించబడిన దుకాణాలు, నిపుణుల సేవలు, ఆఫర్లు మరియు దర్శనీయ స్థలాలను అనుసంధానించే సమగ్ర వేదిక.'}
          </Text>
          <Text style={styles.disclaimerText}>
            {language === 'en'
              ? 'Kurnool One is an independent private platform and is not affiliated with the Kurnool Municipal Corporation or Government of AP.'
              : 'కర్నూలు వన్ ఒక స్వతంత్ర ప్రైవేట్ వేదిక, కర్నూలు మునిసిపల్ కార్పొరేషన్ లేదా ప్రభుత్వంతో అనుబంధించబడలేదు.'}
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
    backgroundColor: '#FFFFFF',
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
    marginTop: 12,
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
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 16,
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
    gap: 10,
    marginBottom: 16,
  },
  portalSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
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
    width: 42,
    height: 42,
    borderRadius: 10,
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
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
    fontStyle: 'italic',
  },
});

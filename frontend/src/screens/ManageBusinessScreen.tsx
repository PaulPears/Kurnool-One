import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, Modal, Linking, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchMyBusinesses,
  updateBusinessProfile,
  createBusinessOffer,
  uploadBusinessLogo,
  uploadBusinessCover,
  uploadOfferImage,
  fetchMyLeads,
  deleteBusiness,
  BusinessItem,
  LeadItem,
} from '../services/directoryService';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayModal from '../components/RazorpayModal';
import BusinessHoursSelector, { OperatingHoursSchedule } from '../components/BusinessHoursSelector';
import { pickImageWithFreeStyleCrop } from '../utils/imageUploadHelper';

export default function ManageBusinessScreen({ navigation, route }: any) {
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<BusinessItem[]>([]);
  const [showShopPicker, setShowShopPicker] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<'biz_standard' | 'biz_premium'>('biz_standard');
  const [leads, setLeads] = useState<LeadItem[]>([]);

  // Edit fields
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [timing, setTiming] = useState('');
  const [operatingHours, setOperatingHours] = useState<any>({
    monday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    tuesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    wednesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    thursday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    friday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    saturday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    sunday: { closed: false, open: '10:00 AM', close: '08:00 PM' },
  });
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleDeleteBusinessListing = () => {
    Alert.alert(
      language === 'en' ? 'Delete Business Listing?' : 'వ్యాపార జాబితాను తొలగించాలా?',
      language === 'en'
        ? `Are you sure you want to permanently delete "${business?.name_en}"? All offers, ratings, and customer leads will be removed.`
        : `"${business?.name_en}" వివరాలను శాశ్వతంగా తొలగించాలనుకుంటున్నారా?`,
      [
        { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
        {
          text: language === 'en' ? 'Yes, Delete' : 'అవును, తొలగించు',
          style: 'destructive',
          onPress: async () => {
            try {
              if (business?.id) {
                await deleteBusiness(business.id);
                Alert.alert(
                  language === 'en' ? 'Deleted' : 'తొలగించబడింది',
                  language === 'en' ? 'Your business listing has been removed.' : 'మీ వ్యాపార జాబితా తొలగించబడింది.',
                  [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
                );
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete business');
            }
          },
        },
      ]
    );
  };

  // Offer Modal
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [discountTag, setDiscountTag] = useState('FLAT 20% OFF');
  const [validUntil, setValidUntil] = useState('Valid for next 15 days');
  const [publishingOffer, setPublishingOffer] = useState(false);
  const [offerImages, setOfferImages] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let uid = auth.currentUser?.uid;
      let userPhone = '';
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!uid) uid = parsed.uid || parsed.id;
          userPhone = parsed.phone || '';
        } catch {}
      }

      let b: BusinessItem | null = null;
      const targetBizId = route?.params?.businessId;
      if (targetBizId) {
        try {
          const docSnap = await getDoc(doc(db, 'businesses', targetBizId));
          if (docSnap.exists()) {
            b = { id: docSnap.id, ...docSnap.data() } as BusinessItem;
          }
        } catch (fetchErr) {
          console.warn('Direct fetch error:', fetchErr);
        }
      }

      const list = await fetchMyBusinesses(uid, userPhone);
      setAllBusinesses(list);

      if (!b && list && list.length > 0) {
        b = list[0];
      }

      if (b) {
        populateBusinessFields(b, uid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const populateBusinessFields = async (b: BusinessItem, uid?: string) => {
    setBusiness(b);
    setPhone(b.phone || '');
    setWhatsapp(b.whatsapp || '');
    setTiming(b.timing || '');
    if (b.operatingHours) {
      setOperatingHours(b.operatingHours);
    }
    setAddress(b.address || '');
    setLandmark(b.landmark || '');
    setWebsite(b.website || '');
    setGoogleMapsUrl(b.googleMapsUrl || '');
    setFacebook(b.socialLinks?.facebook || '');
    setInstagram(b.socialLinks?.instagram || '');
    setTwitter(b.socialLinks?.twitter || '');
    setYoutube(b.socialLinks?.youtube || '');
    setLinkedin(b.socialLinks?.linkedin || '');
    setDescription(b.description_en || '');
    setLogoUrl(b.logoUrl || '');
    setCoverImageUrl(b.coverImage || b.bannerUrl || (b.images && b.images[0]) || '');
    setSelectedAmenities(Array.isArray(b.amenities) ? b.amenities : []);

    const leadsList = await fetchMyLeads(b.ownerUid || uid, b.id);
    setLeads(leadsList);
  };

  const pickAndUploadLogo = async () => {
    if (!business) return;
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setUploadingLogo(true);
      try {
        const url = await uploadBusinessLogo(res.uri);
        await updateBusinessProfile(business.id, { logoUrl: url });
        setLogoUrl(url);
        setBusiness(prev => (prev ? { ...prev, logoUrl: url } : null));
        Alert.alert('Success', 'Business logo updated successfully!');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to upload business logo');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const pickAndUploadCover = async () => {
    if (!business) return;
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setUploadingCover(true);
      try {
        const url = await uploadBusinessCover(res.uri);
        await updateBusinessProfile(business.id, { coverImage: url, bannerUrl: url });
        setCoverImageUrl(url);
        setBusiness(prev => (prev ? { ...prev, coverImage: url, bannerUrl: url } : null));
        Alert.alert('Success', 'Storefront cover image updated successfully!');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to upload cover image');
      } finally {
        setUploadingCover(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!business) return;
    setSaving(true);
    try {
      let cleanWebsite = website.trim();
      if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
        cleanWebsite = `https://${cleanWebsite}`;
      }

      await updateBusinessProfile(business.id, {
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        timing: timing.trim(),
        operatingHours: operatingHours,
        address: address.trim(),
        landmark: landmark.trim(),
        website: cleanWebsite,
        googleMapsUrl: googleMapsUrl.trim(),
        socialLinks: {
          facebook: facebook.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          youtube: youtube.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        description_en: description.trim(),
        amenities: selectedAmenities,
      });

      Alert.alert('Success', 'Business details updated live on Kurnool One!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  const handlePickOfferImage = async () => {
    if (offerImages.length >= 2) {
      Alert.alert('Limit Reached', 'You can attach up to 2 photos per deal.');
      return;
    }

    if (offerImages.length === 1) {
      Alert.alert(
        'Add 2nd Photo',
        '1st photo is 100% Free! You can attach a 2nd photo to highlight extra products, menus, or service details.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Choose Photo #2',
            onPress: () => launchOfferPicker(),
          },
        ]
      );
      return;
    }

    launchOfferPicker();
  };

  const launchOfferPicker = async () => {
    try {
      const res = await pickImageWithFreeStyleCrop();
      if (res?.uri) {
        setOfferImages(prev => [...prev, res.uri]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not pick image');
    }
  };

  const handleRemoveOfferImage = (index: number) => {
    setOfferImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublishOffer = async () => {
    if (!business || !offerTitle.trim()) {
      Alert.alert('Required', 'Please enter an offer headline');
      return;
    }

    setPublishingOffer(true);
    try {
      let uploadedUrls: string[] = [];
      if (offerImages.length > 0) {
        for (const localUri of offerImages) {
          const remoteUrl = await uploadOfferImage(localUri);
          uploadedUrls.push(remoteUrl);
        }
      } else if (business.images && business.images.length > 0) {
        uploadedUrls.push(business.images[0]);
      }

      await createBusinessOffer({
        title_en: offerTitle.trim(),
        description_en: `Exclusive offer from ${business.name_en}. Call or visit to redeem.`,
        discountText: discountTag.trim(),
        businessId: business.id,
        businessName: business.name_en,
        validUntil: validUntil.trim(),
        bannerUrl: uploadedUrls[0] || '',
        images: uploadedUrls,
        phone: business.phone,
        category: business.categoryId,
      });

      Alert.alert('Offer Published!', 'Your deal is now visible on the Offers tab across Kurnool.');
      setOfferTitle('');
      setOfferImages([]);
      setOfferModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to publish offer');
    } finally {
      setPublishingOffer(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      language === 'en' ? 'Log Out' : 'లాగ్ అవుట్',
      language === 'en' ? 'Do you want to log out from this Business account?' : 'మీరు ఈ వ్యాపార ఖాతా నుండి లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
      [
        { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
        {
          text: language === 'en' ? 'Log Out' : 'లాగ్ అవుట్',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
            } catch {}
            await AsyncStorage.multiRemove(['user', 'token']);
            navigation.replace('MobileFirebaseLogin');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Main');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {language === 'en' ? 'Business Portal' : 'వ్యాపార పోర్టల్'}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={[styles.centerContainer, { flex: 1 }]}>
          <Ionicons name="business-outline" size={60} color="#9CA3AF" />
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 12 }}>
            No Business Registered
          </Text>
          <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 6, marginHorizontal: 30 }}>
            You have not registered any business listing on Kurnool One yet.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterBusiness')}
            style={[styles.saveBtn, { marginTop: 20, paddingHorizontal: 24 }]}
          >
            <Text style={styles.saveBtnText}>+ Register Business Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {language === 'en' ? 'My Business Portal' : 'నా వ్యాపార నిర్వహణ'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('BusinessDetail', { businessId: business.id })}>
            <Ionicons name="eye-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Business Hero Card */}
        <View style={styles.heroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={styles.tierPill}>
              <Text style={styles.tierPillText}>
                {business.tier === 'featured' ? '👑 PREMIUM LISTING' : 'STORE LISTING'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#DBEAFE', fontWeight: 'bold' }}>
              {business.planExpiresAt ? `Expires: ${business.planExpiresAt}` : '365 Days Active'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>{business.name_en}</Text>
          <Text style={styles.heroSub}>{business.address}</Text>
        </View>

        {/* Plan Status & Upgrade Banner */}
        <View style={styles.planStatusCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons
                name={business.tier === 'featured' ? 'ribbon' : business.paymentStatus === 'paid' ? 'checkmark-circle' : 'information-circle'}
                size={16}
                color={business.tier === 'featured' ? '#D97706' : business.paymentStatus === 'paid' ? '#059669' : '#2563EB'}
              />
              <Text style={styles.planStatusTitle}>
                {business.tier === 'featured'
                  ? '👑 Premium Featured Listing (1 Year)'
                  : business.paymentStatus === 'paid'
                  ? '🛡️ Standard Verified Listing (6 Months)'
                  : '🆓 Free Basic Listing'}
              </Text>
            </View>
            <Text style={styles.planStatusDesc}>
              {business.tier === 'featured'
                ? 'Full featured ranking & unlimited Hot Deals active across Kurnool.'
                : business.paymentStatus === 'paid'
                ? 'Upgrade to Premium for #1 Featured homepage spot & Hot Deals privileges.'
                : 'Upgrade to Standard Verified or Premium for verified badge, WhatsApp leads & Hot Deals.'}
            </Text>
          </View>
          {business.tier !== 'featured' && (
            <TouchableOpacity
              onPress={() => setShowUpgradeModal(true)}
              style={styles.upgradeBtn}
            >
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Action: Add Another Business */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterBusiness')}
            style={{
              flex: 1,
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="add-circle" size={18} color="#2563EB" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#2563EB' }}>
              {language === 'en' ? '+ Register Another Business' : '+ మరొక దుకాణాన్ని నమోదు చేయండి'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Store Switcher */}
        {allBusinesses.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowShopPicker(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="swap-horizontal" size={18} color="#2563EB" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E40AF' }}>
                {language === 'en' ? `Managing: ${business.name_en}` : `నిర్వహణ: ${business.name_en}`}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#2563EB' }}>
              {language === 'en' ? 'Switch Shop ▼' : 'మార్చు ▼'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Payment Verification Wall */}
        {business.paymentStatus === 'unpaid' && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="card" size={20} color="#DC2626" />
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#991B1B' }}>
                {language === 'en' ? 'Subscription Payment Pending' : 'సభ్యత్వ చెల్లింపు పెండింగ్‌లో ఉంది'}
              </Text>
            </View>
            <Text style={{ fontSize: 12.5, color: '#7F1D1D', lineHeight: 18, marginBottom: 12 }}>
              {language === 'en'
                ? 'Your storefront listing is currently unpaid. Complete payment via Razorpay to activate your public verified listing across Kurnool and unlock direct customer inquiries.'
                : 'మీ దుకాణం ఇంకా చెల్లింపు పూర్తి కాలేదు. రేజర్‌పే ద్వారా చెల్లింపు పూర్తి చేసి మీ లిస్టింగ్‌ను యాక్టివేట్ చేయండి.'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowRazorpayModal(true)}
              style={{
                backgroundColor: '#DC2626',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                {language === 'en' ? 'Complete Subscription via Razorpay' : 'రేజర్‌పే ద్వారా చెల్లించండి'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── LEAD ANALYTICS CARDS ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Customer Leads & Engagement</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Ionicons name="eye" size={22} color="#2563EB" />
            <Text style={styles.kpiValue}>{business.viewCount || 148}</Text>
            <Text style={styles.kpiLabel}>Profile Views</Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="call" size={22} color="#10B981" />
            <Text style={styles.kpiValue}>{business.callCount || 42}</Text>
            <Text style={styles.kpiLabel}>Phone Calls</Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
            <Text style={styles.kpiValue}>{business.whatsappCount || 68}</Text>
            <Text style={styles.kpiLabel}>WhatsApp Leads</Text>
          </View>

          <View style={styles.kpiCard}>
            <Ionicons name="star" size={22} color="#F59E0B" />
            <Text style={styles.kpiValue}>{Number(business.ratingAvg || 5.0).toFixed(1)} ★</Text>
            <Text style={styles.kpiLabel}>Rating Score</Text>
          </View>
        </View>

        {/* ─── LIVE CUSTOMER LEADS SECTION (JUSTDIAL-STYLE) ─────────────── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 }}>
          <Text style={styles.sectionHeader}>
            {language === 'en' ? 'Live Customer Leads' : 'కస్టమర్ లీడ్స్'} ({leads.length})
          </Text>
          <TouchableOpacity onPress={loadData} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="refresh" size={14} color="#2563EB" />
            <Text style={{ fontSize: 12, color: '#2563EB', fontWeight: '700' }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {leads.length === 0 ? (
          <View style={styles.emptyLeadsBox}>
            <Ionicons name="notifications-outline" size={26} color="#94A3B8" />
            <Text style={styles.emptyLeadsTitle}>No Leads Yet</Text>
            <Text style={styles.emptyLeadsSub}>
              When citizens in Kurnool view your storefront or initiate a call/WhatsApp inquiry, their lead details will appear here instantly.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginBottom: 16 }}>
            {leads.slice(0, 10).map((item, idx) => (
              <View key={item.id || idx} style={styles.leadCard}>
                <View style={[
                  styles.leadIconWrap,
                  { backgroundColor: item.actionType === 'call' ? '#ECFDF5' : item.actionType === 'whatsapp' ? '#F0FDF4' : '#EFF6FF' }
                ]}>
                  <Ionicons
                    name={item.actionType === 'call' ? 'call' : item.actionType === 'whatsapp' ? 'logo-whatsapp' : 'eye'}
                    size={16}
                    color={item.actionType === 'call' ? '#059669' : item.actionType === 'whatsapp' ? '#16A34A' : '#2563EB'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.leadCitizenName}>{item.citizenName || 'Kurnool Resident'}</Text>
                    <View style={[
                      styles.leadBadge,
                      { backgroundColor: item.actionType === 'call' ? '#ECFDF5' : item.actionType === 'whatsapp' ? '#F0FDF4' : '#EFF6FF' }
                    ]}>
                      <Text style={[
                        styles.leadBadgeText,
                        { color: item.actionType === 'call' ? '#059669' : item.actionType === 'whatsapp' ? '#16A34A' : '#2563EB' }
                      ]}>
                        {item.actionType === 'call' ? 'CALL' : item.actionType === 'whatsapp' ? 'WHATSAPP' : 'VIEWED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leadAreaText}>
                    📍 {item.citizenArea || 'Kurnool City'} {item.citizenGender ? `• ${item.citizenGender}` : ''}
                  </Text>
                  {item.citizenPhone ? (
                    <Text style={styles.leadPhoneText}>📞 +91 {item.citizenPhone}</Text>
                  ) : null}
                </View>
                {item.citizenPhone ? (
                  <View style={{ flexDirection: 'row', gap: 6, marginLeft: 8 }}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${item.citizenPhone}`).catch(() => {})}
                      style={styles.leadCallBtn}
                    >
                      <Ionicons name="call" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`https://wa.me/91${item.citizenPhone?.replace(/\D/g, '')}?text=Hello, thank you for checking out ${business.name_en} on Kurnool One! How can we assist you?`).catch(() => {})}
                      style={styles.leadWaBtn}
                    >
                      <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Festival Offer CTA */}
        <TouchableOpacity
          onPress={() => {
            const isEligible = business.paymentStatus === 'paid' && (
              business.tier === 'featured' ||
              business.tier === 'premium' ||
              business.planId === 'premium' ||
              business.planId === 'verified' ||
              business.planId === 'yearly' ||
              (business.planId as any) === 'biz_premium' ||
              (business.planId as any) === 'biz_standard'
            );
            if (!isEligible) {
              Alert.alert(
                language === 'en' ? 'Verified Merchant Feature' : 'వెరిఫైడ్ వ్యాపార ఫీచర్',
                language === 'en'
                  ? 'Publishing Hot Deals and Festival Offers is exclusively available to Standard Verified and Premium Featured merchants. Upgrade your store listing to broadcast discounts to all Kurnool citizens.'
                  : 'హాట్ డీల్స్ మరియు పండుగ ఆఫర్లను పోస్ట్ చేయడానికి మీ వ్యాపారాన్ని స్టాండర్డ్ లేదా ప్రీమియంకు అప్‌గ్రేడ్ చేయండి.',
                [
                  { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
                  { text: language === 'en' ? 'Upgrade Plan' : 'అప్‌గ్రేడ్ చేయండి', onPress: () => setShowUpgradeModal(true) },
                ]
              );
              return;
            }
            setOfferModalVisible(true);
          }}
          style={styles.offerCtaCard}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.offerCtaTitle}>🎁 Post a Festival Discount / Deal</Text>
              {business.paymentStatus !== 'paid' && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>🔒 UPGRADE REQUIRED</Text>
                </View>
              )}
            </View>
            <Text style={styles.offerCtaSub}>Broadcast special offers to thousands of Kurnool residents</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* ─── EDIT PROFILE FORM ────────────────────────────────────────── */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Edit Listing Information</Text>

        {/* Visual Branding Section: Logo & Cover Image */}
        <View style={styles.brandingBox}>
          <Text style={styles.brandingBoxTitle}>Business Logo & Storefront Cover</Text>
          <Text style={styles.brandingBoxSub}>Tap below to update your official logo or cover banner</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            {/* Logo Column */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={pickAndUploadLogo}
                disabled={uploadingLogo}
                style={styles.logoPickerBtn}
              >
                {logoUrl ? (
                  <Image source={{ uri: logoUrl }} style={styles.logoPreviewImg} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="camera-outline" size={26} color="#2563EB" />
                    <Text style={styles.pickerHintText}>Add Logo</Text>
                  </View>
                )}
                {uploadingLogo && (
                  <View style={styles.pickerOverlayLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.pickerLabel}>1:1 Business Logo</Text>
            </View>

            {/* Cover Column */}
            <View style={{ flex: 1.6, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={pickAndUploadCover}
                disabled={uploadingCover}
                style={styles.coverPickerBtn}
              >
                {coverImageUrl ? (
                  <Image source={{ uri: coverImageUrl }} style={styles.coverPreviewImg} />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Ionicons name="image-outline" size={26} color="#2563EB" />
                    <Text style={styles.pickerHintText}>Add Cover Image</Text>
                  </View>
                )}
                {uploadingCover && (
                  <View style={styles.pickerOverlayLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.pickerLabel}>16:9 Cover Banner</Text>
            </View>
          </View>
        </View>

        <Text style={styles.label}>Customer Call Phone Number *</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>WhatsApp Chat Number *</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />

        <BusinessHoursSelector
          value={operatingHours}
          onChange={(newSchedule, summary) => {
            setOperatingHours(newSchedule);
            setTiming(summary);
          }}
          title={language === 'en' ? 'Operating / Working Hours' : 'పనివేళలు'}
        />

        <Text style={styles.label}>Amenities & Features</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {[
            { id: 'AC', label: '❄️ AC' },
            { id: 'Wi-Fi', label: '📶 Free Wi-Fi' },
            { id: 'UPI', label: '📱 UPI / QR Accepted' },
            { id: 'Cards', label: '💳 Cards Accepted' },
            { id: 'Parking', label: '🚗 Parking' },
            { id: 'Delivery', label: '🛵 Home Delivery' },
            { id: 'Wheelchair', label: '♿ Wheelchair Access' },
          ].map(amenity => {
            const isSelected = selectedAmenities.includes(amenity.id);
            return (
              <TouchableOpacity
                key={amenity.id}
                onPress={() => toggleAmenity(amenity.id)}
                style={{
                  backgroundColor: isSelected ? '#ECFDF5' : '#F8FAFC',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isSelected ? '#059669' : '#CBD5E1',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#065F46' : '#64748B' }}>
                  {amenity.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Full Address in Kurnool *</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Landmark</Text>
        <TextInput
          style={styles.input}
          value={landmark}
          onChangeText={setLandmark}
        />

        <Text style={styles.label}>Official Website (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          autoCapitalize="none"
          keyboardType="url"
          value={website}
          onChangeText={setWebsite}
        />

        <Text style={styles.label}>Google Maps Location Share Link</Text>
        <TextInput
          style={styles.input}
          placeholder="https://maps.app.goo.gl/..."
          autoCapitalize="none"
          keyboardType="url"
          value={googleMapsUrl}
          onChangeText={setGoogleMapsUrl}
        />

        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Social Media & Online Links (All Optional)</Text>

        <Text style={styles.label}>Instagram Handle / URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://instagram.com/your_shop"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={instagram}
          onChangeText={setInstagram}
        />

        <Text style={styles.label}>Facebook Page URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://facebook.com/your_shop"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={facebook}
          onChangeText={setFacebook}
        />

        <Text style={styles.label}>Twitter / X URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://x.com/your_shop"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={twitter}
          onChangeText={setTwitter}
        />

        <Text style={styles.label}>YouTube Channel URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://youtube.com/@your_channel"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={youtube}
          onChangeText={setYoutube}
        />

        <Text style={styles.label}>LinkedIn Company Page URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://linkedin.com/company/your_company"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={linkedin}
          onChangeText={setLinkedin}
        />

        <Text style={styles.label}>Business Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 90 }]}
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          onPress={handleSaveProfile}
          disabled={saving}
          style={styles.saveBtn}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Updates</Text>
          )}
        </TouchableOpacity>

        {/* ─── DANGER ZONE: DELETE BUSINESS ─── */}
        <View style={{ marginTop: 32, padding: 16, backgroundColor: '#FEF2F2', borderRadius: 16, borderWidth: 1, borderColor: '#FEE2E2' }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626', marginBottom: 4 }}>
            {language === 'en' ? 'Delete Business Listing' : 'వ్యాపార జాబితాను తొలగించండి'}
          </Text>
          <Text style={{ fontSize: 12, color: '#991B1B', lineHeight: 18, marginBottom: 14 }}>
            {language === 'en'
              ? 'Permanently delete your business listing and storefront from Kurnool One. This action cannot be undone.'
              : 'కర్నూలు వన్ నుండి మీ వ్యాపార వివరాలను శాశ్వతంగా తొలగిస్తుంది. ఈ చర్యను రద్దు చేయలేరు.'}
          </Text>
          <TouchableOpacity
            onPress={handleDeleteBusinessListing}
            style={{ backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
              {language === 'en' ? '🗑️ Permanently Delete My Business' : '🗑️ నా వ్యాపారాన్ని తొలగించు'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── OFFER MODAL ────────────────────────────────────────────────── */}
      <Modal visible={offerModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Post Festival Deal</Text>
              <TouchableOpacity onPress={() => setOfferModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Offer Headline *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Festival Special 25% Off on Dinner"
              value={offerTitle}
              onChangeText={setOfferTitle}
            />

            <Text style={styles.label}>Discount Tag *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. FLAT 25% OFF"
              value={discountTag}
              onChangeText={setDiscountTag}
            />

            <Text style={styles.label}>Deal Photos (Up to 2)</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {offerImages.map((uri, idx) => (
                <View key={idx} style={styles.offerThumbnailWrap}>
                  <Image source={{ uri }} style={styles.offerThumbnailImg} />
                  <TouchableOpacity
                    onPress={() => handleRemoveOfferImage(idx)}
                    style={styles.removeThumbnailBtn}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {offerImages.length < 2 && (
                <TouchableOpacity
                  onPress={handlePickOfferImage}
                  style={styles.addOfferPhotoBtn}
                >
                  <Ionicons name="camera-outline" size={24} color="#2563EB" />
                  <Text style={styles.addOfferPhotoText}>
                    {offerImages.length === 0 ? '+ Add Photo' : '+ 2nd Photo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handlePublishOffer}
              disabled={publishingOffer}
              style={[styles.saveBtn, { backgroundColor: '#F59E0B', marginTop: 6 }]}
            >
              {publishingOffer ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Publish to Offers Tab</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MULTI-STORE PICKER MODAL ────────────────────────────────────── */}
      <Modal visible={showShopPicker} transparent animationType="fade" onRequestClose={() => setShowShopPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>
                {language === 'en' ? 'Select Store to Manage' : 'నిర్వహించాల్సిన దుకాణాన్ని ఎంచుకోండి'}
              </Text>
              <TouchableOpacity onPress={() => setShowShopPicker(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {allBusinesses.map((b) => {
                const isCurrent = b.id === business?.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => {
                      setShowShopPicker(false);
                      populateBusinessFields(b);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: isCurrent ? '#EFF6FF' : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: isCurrent ? '#3B82F6' : '#E2E8F0',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: isCurrent ? '#1D4ED8' : '#0F172A' }}>
                        {b.name_en}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        {b.address || 'Kurnool'}
                      </Text>
                    </View>
                    {isCurrent && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── PLAN UPGRADE MODAL ─────────────────────────────────────── */}
      <Modal visible={showUpgradeModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={styles.modalTitle}>⚡ Upgrade Store Listing</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Unlock blue checkmark, customer leads & Hot Deals</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, marginBottom: 16 }}>
              {/* Standard Verified Plan */}
              <TouchableOpacity
                onPress={() => setSelectedUpgradePlan('biz_standard')}
                style={[
                  styles.upgradePlanOption,
                  selectedUpgradePlan === 'biz_standard' && styles.upgradePlanOptionActive,
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={selectedUpgradePlan === 'biz_standard' ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selectedUpgradePlan === 'biz_standard' ? '#2563EB' : '#94A3B8'}
                    />
                    <Text style={[styles.upgradePlanName, selectedUpgradePlan === 'biz_standard' && { color: '#1D4ED8' }]}>
                      Standard Verified
                    </Text>
                  </View>
                  <View style={styles.upgradePriceBadge}>
                    <Text style={styles.upgradePriceText}>₹399 / 6 Mo</Text>
                  </View>
                </View>
                <View style={{ marginTop: 6, gap: 3, paddingLeft: 28 }}>
                  <Text style={styles.upgradePerk}>• Blue Verified Merchant Badge</Text>
                  <Text style={styles.upgradePerk}>• Direct WhatsApp & Call buttons</Text>
                  <Text style={styles.upgradePerk}>• Priority ranking above free stores</Text>
                </View>
              </TouchableOpacity>

              {/* Premium Featured Plan */}
              <TouchableOpacity
                onPress={() => setSelectedUpgradePlan('biz_premium')}
                style={[
                  styles.upgradePlanOption,
                  selectedUpgradePlan === 'biz_premium' && styles.upgradePlanOptionActive,
                  { borderColor: selectedUpgradePlan === 'biz_premium' ? '#D97706' : '#FDE68A' }
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={selectedUpgradePlan === 'biz_premium' ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selectedUpgradePlan === 'biz_premium' ? '#D97706' : '#94A3B8'}
                    />
                    <Text style={[styles.upgradePlanName, selectedUpgradePlan === 'biz_premium' && { color: '#B45309' }]}>
                      👑 Premium Featured (1 Year)
                    </Text>
                  </View>
                  <View style={[styles.upgradePriceBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.upgradePriceText, { color: '#B45309' }]}>₹999 / 1 Yr</Text>
                  </View>
                </View>
                <View style={{ marginTop: 6, gap: 3, paddingLeft: 28 }}>
                  <Text style={styles.upgradePerk}>• Top #1 Homepage Featured Banner</Text>
                  <Text style={styles.upgradePerk}>• Unlimited Hot Deals & Offers publishing</Text>
                  <Text style={styles.upgradePerk}>• Full photo gallery & social media boost</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowUpgradeModal(false);
                setShowRazorpayModal(true);
              }}
              style={styles.proceedUpgradeBtn}
            >
              <Text style={styles.proceedUpgradeBtnText}>
                Proceed to Pay {selectedUpgradePlan === 'biz_premium' ? '₹999' : '₹399'} via Razorpay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── RAZORPAY SUBSCRIPTION MODAL ─────────────────────────────────── */}
      <RazorpayModal
        visible={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        planName={selectedUpgradePlan === 'biz_premium' ? 'Premium Featured Business (1 Year)' : 'Standard Verified Business (6 Months)'}
        amount={selectedUpgradePlan === 'biz_premium' ? 999 : 399}
        entityName={business?.name_en || 'Business'}
        customerPhone={business?.phone}
        onSuccess={async (paymentData) => {
          setShowRazorpayModal(false);
          const paymentId = paymentData.razorpay_payment_id;
          const orderId = paymentData.razorpay_order_id;
          if (business) {
            try {
              const expiryDays = selectedUpgradePlan === 'biz_premium' ? 365 : 180;
              const expiryDate = new Date(Date.now() + expiryDays * 86400000).toISOString().split('T')[0];
              const newTier: 'featured' | 'premium' = selectedUpgradePlan === 'biz_premium' ? 'featured' : 'premium';
              const targetPlanId = selectedUpgradePlan === 'biz_premium' ? 'premium' : 'verified';

              await updateBusinessProfile(business.id, {
                paymentStatus: 'paid',
                tier: newTier,
                planId: targetPlanId,
                verificationBadge: 'verified_business',
                planExpiresAt: expiryDate,
                paymentId,
                orderId,
                status: 'published',
              });
              setBusiness((prev) => (prev ? {
                ...prev,
                paymentStatus: 'paid',
                tier: newTier,
                planId: targetPlanId,
                planExpiresAt: expiryDate,
                status: 'published'
              } : null));
              Alert.alert('Upgrade Successful!', 'Your store has been upgraded to verified status with full privileges on Kurnool One!');
            } catch (updErr) {
              console.warn('Update post-payment error:', updErr);
            }
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  navTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  heroCard: {
    backgroundColor: '#1E3A8A', borderRadius: 20, padding: 18, marginBottom: 20,
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  tierPill: { backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  tierPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginTop: 6 },
  heroSub: { fontSize: 12, color: '#BFDBFE', marginTop: 2 },
  sectionHeader: { fontSize: 15, fontWeight: '900', color: '#111827', marginBottom: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
  },
  kpiValue: { fontSize: 22, fontWeight: '900', color: '#111827', marginTop: 6 },
  kpiLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginTop: 2 },
  offerCtaCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#D97706', padding: 16, borderRadius: 18, marginTop: 4,
  },
  offerCtaTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  offerCtaSub: { fontSize: 11, color: '#FEF3C7', marginTop: 2 },
  label: { fontSize: 11, fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginTop: 6,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  brandingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  brandingBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandingBoxSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logoPickerBtn: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPreviewImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
  },
  coverPickerBtn: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPreviewImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOverlayLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLeadsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyLeadsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyLeadsSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  leadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  leadIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leadCitizenName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  leadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  leadAreaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  leadPhoneText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  leadCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadWaBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerThumbnailWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  offerThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  removeThumbnailBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOfferPhotoBtn: {
    width: 76,
    height: 76,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOfferPhotoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  planStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  planStatusTitle: { fontSize: 13, fontWeight: '800', color: '#1E40AF' },
  planStatusDesc: { fontSize: 11, color: '#3B82F6', marginTop: 3, lineHeight: 15 },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  upgradePlanOption: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  upgradePlanOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  upgradePlanName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  upgradePriceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upgradePriceText: { fontSize: 12, fontWeight: '900', color: '#2563EB' },
  upgradePerk: { fontSize: 11, color: '#475569' },
  proceedUpgradeBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  proceedUpgradeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});

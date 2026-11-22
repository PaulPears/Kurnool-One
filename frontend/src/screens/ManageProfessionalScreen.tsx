import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, StatusBar, Linking, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchMyProfessionalProfile,
  fetchMyProfessionals,
  updateProfessionalProfile,
  uploadProfessionalAvatar,
  createBusinessOffer,
  uploadOfferImage,
  fetchMyLeads,
  deleteProfessional,
  recordSubscriptionPayment,
  createMarketplaceItem,
  fetchMyMarketplaceItems,
  updateMarketplaceItem,
  deleteMarketplaceItem,
  ProfessionalItem,
  LeadItem,
  MarketplaceItem,
} from '../services/directoryService';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayModal from '../components/RazorpayModal';
import BusinessHoursSelector from '../components/BusinessHoursSelector';
import { CalendarDatePickerModal } from '../components/CalendarDatePickerModal';
import { pickImageWithFreeStyleCrop } from '../utils/imageUploadHelper';

export default function ManageProfessionalScreen({ navigation, route }: any) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfessionalItem | null>(null);
  const [allProfiles, setAllProfiles] = useState<ProfessionalItem[]>([]);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [showAllLeadsModal, setShowAllLeadsModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<'pro_standard' | 'pro_premium'>('pro_standard');

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [serviceAreas, setServiceAreas] = useState('All Kurnool');
  const [visitingCharges, setVisitingCharges] = useState('₹150');
  const [hourlyRate, setHourlyRate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validUntilDate, setValidUntilDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const [operatingHours, setOperatingHours] = useState<any>({
    monday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    tuesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    wednesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    thursday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    friday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    saturday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    sunday: { closed: false, open: '10:00 AM', close: '08:00 PM' },
  });
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  // Offer / Special Deal State
  const getExpiryDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Valid till ${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  };

  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [discountTag, setDiscountTag] = useState('FREE INSPECTION');
  const [selectedValidityDays, setSelectedValidityDays] = useState<number>(7);
  const [validUntil, setValidUntil] = useState(getExpiryDateStr(7));
  const [offerImages, setOfferImages] = useState<string[]>([]);
  const [publishingOffer, setPublishingOffer] = useState(false);

  // Bazaar Product / Equipment Posting State
  const [bazaarModalVisible, setBazaarModalVisible] = useState(false);
  const [myBazaarItems, setMyBazaarItems] = useState<MarketplaceItem[]>([]);
  const [bazaarTitle, setBazaarTitle] = useState('');
  const [bazaarPrice, setBazaarPrice] = useState('');
  const [bazaarCategory, setBazaarCategory] = useState('Tools & Equipment');
  const [bazaarDescription, setBazaarDescription] = useState('');
  const [bazaarImages, setBazaarImages] = useState<string[]>([]);
  const [publishingBazaar, setPublishingBazaar] = useState(false);

  const handleDeleteProListing = () => {
    Alert.alert(
      language === 'en' ? 'Delete Professional Profile?' : 'వృత్తి ప్రొఫైల్‌ను తొలగించాలా?',
      language === 'en'
        ? `Are you sure you want to permanently delete your professional profile? This action cannot be undone.`
        : `మీ ప్రొఫైల్ వివరాలను శాశ్వతంగా తొలగించాలనుకుంటున్నారా?`,
      [
        { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
        {
          text: language === 'en' ? 'Yes, Delete' : 'అవును, తొలగించు',
          style: 'destructive',
          onPress: async () => {
            try {
              if (profile?.id) {
                await deleteProfessional(profile.id);
                Alert.alert(
                  language === 'en' ? 'Deleted' : 'తొలగించబడింది',
                  language === 'en' ? 'Your professional profile has been removed.' : 'మీ ప్రొఫైల్ తొలగించబడింది.',
                  [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
                );
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete profile');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateProfessionalFields = async (p: ProfessionalItem, uid?: string) => {
    setProfile(p);
    setFullName(p.fullName || '');
    setPhone(p.phone || '');
    setWhatsapp(p.whatsapp || '');
    setExperienceYears(p.experienceYears?.toString() || '3');
    setServiceAreas(Array.isArray(p.serviceAreas) ? p.serviceAreas.join(', ') : 'All Kurnool');
    setVisitingCharges(p.visitingCharges || '₹150');
    setHourlyRate(p.hourlyRate || '');
    setAvatarUrl(p.avatarUrl || '');
    setPortfolioPhotos(Array.isArray(p.portfolioPhotos) ? p.portfolioPhotos.slice(0, 4) : []);
    if ((p as any).operatingHours) {
      setOperatingHours((p as any).operatingHours);
    }
    setInstagramUrl(p.instagramUrl || '');
    setYoutubeUrl(p.youtubeUrl || '');
    setLinkedinUrl(p.linkedinUrl || '');
    setTwitterUrl(p.twitterUrl || '');
    setFacebookUrl(p.facebookUrl || '');
    setWebsiteUrl(p.websiteUrl || '');
    setDescription(p.description || '');

    const effectiveUid = p.userId || uid || auth.currentUser?.uid || '';
    const proLeads = await fetchMyLeads(effectiveUid, p.id);
    setLeads(proLeads);
    try {
      const mkt = await fetchMyMarketplaceItems(effectiveUid, undefined, p.id);
      setMyBazaarItems(mkt);
    } catch {}
  };

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
        } catch { }
      }

      let p: ProfessionalItem | null = null;
      const targetProId = route?.params?.proId;
      if (targetProId) {
        try {
          const docSnap = await getDoc(doc(db, 'professionals', targetProId));
          if (docSnap.exists()) {
            p = { id: docSnap.id, ...docSnap.data() } as ProfessionalItem;
          }
        } catch (fetchErr) {
          console.warn('Direct pro fetch error:', fetchErr);
        }
      }

      const list = await fetchMyProfessionals(uid);
      setAllProfiles(list);

      if (!p && list && list.length > 0) {
        p = list[0];
      }

      if (!p) {
        p = await fetchMyProfessionalProfile(uid, userPhone);
      }

      if (p) {
        await populateProfessionalFields(p, uid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePickBazaarImage = async () => {
    try {
      const res = await pickImageWithFreeStyleCrop();
      if (res?.uri) {
        setBazaarImages(prev => [...prev, res.uri].slice(0, 3));
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to select image');
    }
  };

  const handlePublishBazaarItem = async () => {
    if (!profile || !bazaarTitle.trim() || !bazaarPrice.trim()) {
      Alert.alert('Required', 'Please enter item title and price');
      return;
    }
    setPublishingBazaar(true);
    try {
      let uploadedUrls: string[] = [];
      for (const uri of bazaarImages) {
        const url = await uploadOfferImage(uri);
        uploadedUrls.push(url);
      }
      if (uploadedUrls.length === 0 && profile.avatarUrl) {
        uploadedUrls.push(profile.avatarUrl);
      }

      await createMarketplaceItem({
        title_en: bazaarTitle.trim(),
        price: bazaarPrice.trim().startsWith('₹') ? bazaarPrice.trim() : `₹${bazaarPrice.trim()}`,
        category: bazaarCategory,
        description: bazaarDescription.trim() || `Offered by verified professional ${profile.fullName}.`,
        sellerName: profile.fullName,
        sellerPhone: profile.phone,
        sellerWhatsapp: profile.whatsapp || profile.phone,
        sellerUid: profile.userId || auth.currentUser?.uid || '',
        area: 'Kurnool',
        condition: 'Professional Offering',
        imageUrl: uploadedUrls[0] || '',
        images: uploadedUrls,
        status: 'active',
        sourceType: 'professional',
        proId: profile.id,
        proName: profile.fullName,
      });

      Alert.alert('Item Published!', 'Your offering is now listed in Kurnool Bazaar.');
      setBazaarTitle('');
      setBazaarPrice('');
      setBazaarDescription('');
      setBazaarImages([]);
      setBazaarModalVisible(false);
      const updated = await fetchMyMarketplaceItems(profile.userId || '', undefined, profile.id);
      setMyBazaarItems(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to list in Bazaar');
    } finally {
      setPublishingBazaar(false);
    }
  };

  const handleMarkSoldBazaar = async (item: MarketplaceItem) => {
    try {
      await updateMarketplaceItem(item.id, { status: item.status === 'sold' ? 'active' : 'sold' });
      const updated = await fetchMyMarketplaceItems(profile?.userId || '', undefined, profile?.id);
      setMyBazaarItems(updated);
      Alert.alert('Updated', item.status === 'sold' ? 'Item marked as Active' : 'Item marked as SOLD');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update status');
    }
  };

  const handleDeleteBazaarItem = (id: string) => {
    Alert.alert('Delete Listing', 'Remove this listing from Kurnool Bazaar?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMarketplaceItem(id);
            const updated = await fetchMyMarketplaceItems(profile?.userId || '', undefined, profile?.id);
            setMyBazaarItems(updated);
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete listing');
          }
        },
      },
    ]);
  };

  const pickAndUploadAvatar = async () => {
    if (!profile) return;
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setUploadingAvatar(true);
      try {
        const url = await uploadProfessionalAvatar(res.uri);
        await updateProfessionalProfile(profile.id, { avatarUrl: url });
        setAvatarUrl(url);
        setProfile(prev => (prev ? { ...prev, avatarUrl: url } : null));
        Alert.alert('Success', 'Profile photo updated successfully!');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to upload photo');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const areas = serviceAreas.split(',').map(s => s.trim()).filter(Boolean);
      await updateProfessionalProfile(profile.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        experienceYears: parseInt(experienceYears, 10) || 1,
        serviceAreas: areas.length > 0 ? areas : ['All Kurnool'],
        visitingCharges: visitingCharges.trim(),
        hourlyRate: hourlyRate.trim() || undefined,
        operatingHours: operatingHours,
        avatarUrl: avatarUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        description: description.trim(),
      });

      Alert.alert('Success', 'Professional profile & rates updated live on Kurnool One!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickAndUploadPortfolioPhoto = async () => {
    if (!profile) return;
    if ((profile as any).paymentStatus !== 'paid') {
      Alert.alert(
        'Subscription Required',
        'Uploading up to 4 additional portfolio photos is available after completing a Standard or Elite Pro subscription payment.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => setShowUpgradeModal(true) },
        ]
      );
      return;
    }
    if (portfolioPhotos.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 additional portfolio photos.');
      return;
    }
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setUploadingPortfolio(true);
      try {
        const url = await uploadProfessionalAvatar(res.uri);
        const updated = [...portfolioPhotos, url].slice(0, 4);
        await updateProfessionalProfile(profile.id, { portfolioPhotos: updated });
        setPortfolioPhotos(updated);
        setProfile(prev => (prev ? { ...prev, portfolioPhotos: updated } : null));
        Alert.alert('Success', 'Portfolio photo added successfully!');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to upload portfolio photo');
      } finally {
        setUploadingPortfolio(false);
      }
    }
  };

  const handleRemovePortfolioPhoto = async (index: number) => {
    if (!profile) return;
    const updated = portfolioPhotos.filter((_, i) => i !== index);
    try {
      await updateProfessionalProfile(profile.id, { portfolioPhotos: updated });
      setPortfolioPhotos(updated);
      setProfile(prev => (prev ? { ...prev, portfolioPhotos: updated } : null));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to remove portfolio photo');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      language === 'en' ? 'Log Out' : 'లాగ్ అవుట్',
      language === 'en' ? 'Do you want to log out from this Professional account?' : 'మీరు ఈ ప్రొఫెషనల్ ఖాతా నుండి లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
      [
        { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
        {
          text: language === 'en' ? 'Log Out' : 'లాగ్ అవుట్',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
            } catch { }
            await AsyncStorage.multiRemove(['user', 'token']);
            navigation.replace('MobileFirebaseLogin');
          },
        },
      ]
    );
  };

  const handlePickOfferImage = async () => {
    if (offerImages.length >= 2) {
      Alert.alert('Limit Reached', 'You can attach up to 2 photos per deal.');
      return;
    }

    if (offerImages.length === 1) {
      Alert.alert(
        'Add 2nd Photo',
        '1st photo is 100% Free! You can attach a 2nd photo to highlight service tools, work samples, or discount flyers.',
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
      const res = await pickImageWithFreeStyleCrop({
        title: 'Offer Promotional Image',
        message: 'Choose photo source to crop offer banner:',
        quality: 0.8,
      });

      if (res && res.uri) {
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
    if (!profile || !offerTitle.trim()) {
      Alert.alert('Required', 'Please enter a special offer headline');
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
      } else if (profile.avatarUrl) {
        uploadedUrls.push(profile.avatarUrl);
      }

      await createBusinessOffer({
        title_en: offerTitle.trim(),
        description_en: `Special service offer by ${profile.fullName} (${profile.category}). Call to book service.`,
        discountText: discountTag.trim(),
        businessId: profile.id,
        businessName: profile.fullName,
        validUntil: validUntil.trim(),
        expiresAt: validUntilDate.toISOString(),
        bannerUrl: uploadedUrls[0] || '',
        images: uploadedUrls,
        phone: profile.phone,
        category: profile.category,
      });

      Alert.alert('Deal Published!', 'Your service offer is now live on the Offers tab for all citizens in Kurnool.');
      setOfferTitle('');
      setOfferImages([]);
      setOfferModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to publish offer');
    } finally {
      setPublishingOffer(false);
    }
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading Professional Portal...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="briefcase-outline" size={48} color="#0D9488" />
          </View>
          <Text style={styles.emptyTitle}>No Professional Profile Found</Text>
          <Text style={styles.emptySub}>
            You haven&apos;t listed your professional profile yet. Join Kurnool&apos;s leading doctors, creators, freelancers, and technicians.
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('RegisterProfessional')}
          >
            <Text style={styles.createBtnText}>+ List Professional Profile Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{profile.fullName}</Text>
          <Text style={styles.headerSub}>{profile.category} • Kurnool One Pro</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Register Another Profile Action */}
        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterProfessional')}
            style={{
              backgroundColor: '#F0FDFA',
              borderWidth: 1.5,
              borderColor: '#99F6E4',
              borderStyle: 'dashed',
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="add-circle" size={18} color="#0D9488" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0D9488' }}>
              {language === 'en' ? '+ Register Another Professional Service' : '+ మరొక వృత్తి సేవను నమోదు చేయండి'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Profile Switcher */}
        {allProfiles.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowProfilePicker(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F0FDFA',
              borderWidth: 1,
              borderColor: '#99F6E4',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
              <Ionicons name="swap-horizontal" size={18} color="#0D9488" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#134E4A' }} numberOfLines={1}>
                {language === 'en' ? `Managing: ${profile.fullName} (${profile.category})` : `నిర్వహణ: ${profile.fullName} (${profile.category})`}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0D9488' }}>
              {language === 'en' ? 'Switch Profile ▼' : 'మార్చు ▼'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Analytics Card */}
        <View style={styles.analyticsCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.analyticsTitle}>Client Inquiries & Reach</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="sparkles" size={14} color="#0D9488" />
              <Text style={styles.verifiedBadgeText}>Active Pro</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.metricBox}>
              <Ionicons name="eye-outline" size={18} color="#0D9488" />
              <Text style={styles.metricValue}>{(profile as any).viewCount ?? leads.filter(l => l.actionType === 'view').length}</Text>
              <Text style={styles.metricLabel}>Profile Views</Text>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="call-outline" size={18} color="#10B981" />
              <Text style={styles.metricValue}>{(profile as any).callCount ?? leads.filter(l => l.actionType === 'call').length}</Text>
              <Text style={styles.metricLabel}>Call Taps</Text>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="logo-whatsapp" size={18} color="#059669" />
              <Text style={styles.metricValue}>{(profile as any).whatsappCount ?? leads.filter(l => l.actionType === 'whatsapp').length}</Text>
              <Text style={styles.metricLabel}>WhatsApp Leads</Text>
            </View>
          </View>
        </View>

        {/* Payment Verification Wall */}
        {profile.paymentStatus === 'unpaid' && (
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
                {language === 'en' ? 'Professional Subscription Pending' : 'సభ్యత్వ చెల్లింపు పెండింగ్‌లో ఉంది'}
              </Text>
            </View>
            <Text style={{ fontSize: 12.5, color: '#7F1D1D', lineHeight: 18, marginBottom: 12 }}>
              {language === 'en'
                ? 'Your professional profile is currently unpaid. Complete subscription payment via Razorpay to activate your profile across Kurnool and receive direct client phone calls.'
                : 'మీ ప్రొఫైల్ ఇంకా చెల్లింపు పూర్తి కాలేదు. రేజర్‌పే ద్వారా చెల్లింపు పూర్తి చేసి మీ ప్రొఫైల్‌ను యాక్టివేట్ చేయండి.'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowRazorpayModal(true)}
              style={{
                backgroundColor: '#0D9488',
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

        {/* Broadcast Deal / Offer Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            const isEligible = profile?.paymentStatus === 'paid';
            if (!isEligible) {
              Alert.alert(
                language === 'en' ? 'Verified Professional Feature' : 'వెరిఫైడ్ ప్రొఫెషనల్ ఫీచర్',
                language === 'en'
                  ? 'Broadcasting service offers and discounts is exclusively available to Standard Verified and Elite professionals. Upgrade your profile to reach customers across Kurnool.'
                  : 'ఆఫర్లను ప్రసారం చేయడానికి మీ ప్రొఫైల్‌ను స్టాండర్డ్ లేదా ఎలైట్‌కు అప్‌గ్రేడ్ చేయండి.',
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
              <Ionicons name="flame" size={18} color="#FEF08A" />
              <Text style={styles.offerCtaTitle}>Post an Offer</Text>
              {profile?.paymentStatus !== 'paid' && (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>🔒 UPGRADE</Text>
                </View>
              )}
            </View>
            <Text style={styles.offerCtaSub}>
              Publish special offers, discounts and seasonal promotions for Kurnool residents.
            </Text>
          </View>
          <View style={styles.offerCtaBtn}>
            <Text style={styles.offerCtaBtnText}>Post Offer →</Text>
          </View>
        </TouchableOpacity>

        {/* Sell Equipment / Tools / Products on Kurnool Bazaar */}
        <TouchableOpacity
          onPress={() => setBazaarModalVisible(true)}
          style={[styles.offerCtaCard, { backgroundColor: '#065F46', borderColor: '#059669', marginTop: 10 }]}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="cart" size={18} color="#A7F3D0" />
              <Text style={[styles.offerCtaTitle, { color: '#FFFFFF' }]}>
                {language === 'en' ? 'Sell on Kurnool Bazaar' : 'కర్నూలు బజార్‌లో అమ్మండి'}
              </Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>C2C BAZAAR</Text>
              </View>
            </View>
            <Text style={[styles.offerCtaSub, { color: '#D1FAE5' }]}>
              {language === 'en'
                ? 'Sell tools, equipment, spare parts, or products to citizens across Kurnool.'
                : 'మీ పరికరాలు, టూల్స్ లేదా వస్తువులను కర్నూలు ప్రజలకు నేరుగా అమ్మండి.'}
            </Text>
          </View>
          <View style={[styles.offerCtaBtn, { backgroundColor: '#059669' }]}>
            <Text style={[styles.offerCtaBtnText, { color: '#FFFFFF' }]}>+ Sell Item →</Text>
          </View>
        </TouchableOpacity>

        {/* My Bazaar Listings */}
        {myBazaarItems.length > 0 && (
          <View style={{ marginTop: 12, marginBottom: 12 }}>
            <Text style={[styles.sectionHeader, { marginBottom: 8 }]}>
              {language === 'en' ? 'My Bazaar Items' : 'నా బజార్ ప్రకటనలు'} ({myBazaarItems.length})
            </Text>
            {myBazaarItems.map((item) => (
              <View key={item.id} style={[styles.leadCard, { marginBottom: 8 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827' }}>{item.title_en || (item as any).title}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669', marginTop: 2 }}>₹{item.price}</Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Status: {item.status?.toUpperCase()}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => handleMarkSoldBazaar(item)}
                    style={{ backgroundColor: item.status === 'sold' ? '#059669' : '#F59E0B', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                      {item.status === 'sold' ? 'Activate' : 'Mark Sold'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteBazaarItem(item.id)}
                    style={{ backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 }}
                  >
                    <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── LIVE CLIENT LEADS SECTION ─────────────── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 }}>
          <Text style={styles.sectionHeader}>
            {language === 'en' ? 'Live Client Leads' : 'క్లయింట్ లీడ్స్'} ({leads.length})
          </Text>
          <TouchableOpacity onPress={loadData} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="refresh" size={14} color="#0D9488" />
            <Text style={{ fontSize: 12, color: '#0D9488', fontWeight: '700' }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {leads.length === 0 ? (
          <View style={styles.emptyLeadsBox}>
            <Ionicons name="notifications-outline" size={26} color="#94A3B8" />
            <Text style={styles.emptyLeadsTitle}>No Leads Yet</Text>
            <Text style={styles.emptyLeadsSub}>
              When citizens in Kurnool view your profile or initiate a call/WhatsApp inquiry, their lead details will appear here instantly.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginBottom: 16 }}>
            {[...leads]
              .sort((a, b) => {
                const tA = (a as any).createdAt?.toMillis ? (a as any).createdAt.toMillis() : new Date((a as any).createdAt || 0).getTime();
                const tB = (b as any).createdAt?.toMillis ? (b as any).createdAt.toMillis() : new Date((b as any).createdAt || 0).getTime();
                return tB - tA;
              })
              .slice(0, 5)
              .map((item, idx) => (
                <View key={item.id || idx} style={styles.leadCard}>
                  <View style={[
                    styles.leadIconWrap,
                    { backgroundColor: item.actionType === 'call' ? '#ECFDF5' : item.actionType === 'whatsapp' ? '#F0FDF4' : '#EFF6FF' }
                  ]}>
                    <Ionicons
                      name={item.actionType === 'call' ? 'call' : item.actionType === 'whatsapp' ? 'logo-whatsapp' : 'eye'}
                      size={16}
                      color={item.actionType === 'call' ? '#059669' : item.actionType === 'whatsapp' ? '#16A34A' : '#0D9488'}
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
                          { color: item.actionType === 'call' ? '#059669' : item.actionType === 'whatsapp' ? '#16A34A' : '#0D9488' }
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
                        style={[styles.leadCallBtn, { backgroundColor: '#0D9488' }]}
                      >
                        <Ionicons name="call" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`https://wa.me/91${item.citizenPhone?.replace(/\D/g, '')}?text=Hello, thank you for checking out my services on Kurnool One! How can I assist you?`).catch(() => {})}
                        style={styles.leadWaBtn}
                      >
                        <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))}

            {leads.length > 5 && (
              <TouchableOpacity
                onPress={() => setShowAllLeadsModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F0FDFA',
                  paddingVertical: 10,
                  borderRadius: 10,
                  gap: 6,
                  borderWidth: 1,
                  borderColor: '#99F6E4',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0D9488' }}>
                  {language === 'en' ? `Show More Leads (${leads.length - 5} More) →` : `మరిన్ని లీడ్స్ చూడండి (${leads.length - 5}) →`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dynamic Pricing Plan & Upgrade Badge */}
        <View style={styles.planBanner}>
          <Ionicons
            name={profile?.paymentStatus === 'paid' ? 'shield-checkmark' : 'information-circle'}
            size={22}
            color="#0D9488"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.planBannerTitle}>
              {profile?.paymentStatus === 'paid'
                ? profile?.planId === 'pro_premium'
                  ? '👑 Professional Elite (1 Year)'
                  : '🛡️ Standard Verified Pro (6 Months)'
                : '🆓 Free Basic Professional'}
            </Text>
            <Text style={styles.planBannerSub}>
              {profile?.paymentStatus === 'paid'
                ? 'Verified checkmark badge and client call buttons active.'
                : 'Upgrade for official Blue Checkmark badge, direct WhatsApp leads & Deals.'}
            </Text>
          </View>
          {profile?.paymentStatus !== 'paid' && (
            <TouchableOpacity
              onPress={() => setShowUpgradeModal(true)}
              style={styles.proUpgradeBtn}
            >
              <Text style={styles.proUpgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rates & Fees Card */}
        <View style={styles.ratesCard}>
          <Text style={styles.ratesCardTitle}>Upfront Client Rates</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Visiting / Base Fee</Text>
              <TextInput
                style={styles.textInput}
                value={visitingCharges}
                onChangeText={setVisitingCharges}
                placeholder="e.g. ₹150 or ₹500"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Hourly / Package Rate</Text>
              <TextInput
                style={styles.textInput}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="e.g. ₹250/hr"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </View>

        {/* Profile Details Form */}
        <Text style={styles.sectionHeader}>Profile Details</Text>

        {/* Profile Photo / Avatar */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Profile Photo / Avatar</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#0D9488' }} />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={32} color="#0D9488" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={pickAndUploadAvatar}
                disabled={uploadingAvatar}
                style={{ backgroundColor: '#0D9488', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                      {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                Free-style crop with camera or gallery upload.
              </Text>
            </View>
          </View>

          {/* 4 Additional Portfolio Photos (Paid Subscribers Only) */}
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                  Work Portfolio Gallery ({portfolioPhotos.length}/4)
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>
                  {(profile as any)?.paymentStatus === 'paid'
                    ? 'Add up to 4 additional photos of your work & projects'
                    : 'Unlocked automatically after subscription payment'}
                </Text>
              </View>
              {(profile as any)?.paymentStatus !== 'paid' && (
                <TouchableOpacity
                  onPress={() => setShowUpgradeModal(true)}
                  style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#B45309' }}>🔒 Unlock</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {portfolioPhotos.map((url, idx) => (
                <View key={idx} style={{ width: 68, height: 68, borderRadius: 12, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
                  <TouchableOpacity
                    onPress={() => handleRemovePortfolioPhoto(idx)}
                    style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(220,38,38,0.9)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {portfolioPhotos.length < 4 && (
                <TouchableOpacity
                  onPress={pickAndUploadPortfolioPhoto}
                  disabled={uploadingPortfolio}
                  style={{
                    width: 68, height: 68, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
                    borderColor: (profile as any)?.paymentStatus === 'paid' ? '#0D9488' : '#CBD5E1',
                    backgroundColor: (profile as any)?.paymentStatus === 'paid' ? '#F0FDFA' : '#F8FAFC',
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  {uploadingPortfolio ? (
                    <ActivityIndicator size="small" color="#0D9488" />
                  ) : (
                    <>
                      <Ionicons name={(profile as any)?.paymentStatus === 'paid' ? 'add-circle' : 'lock-closed'} size={22} color={(profile as any)?.paymentStatus === 'paid' ? '#0D9488' : '#94A3B8'} />
                      <Text style={{ fontSize: 9, fontWeight: '700', color: (profile as any)?.paymentStatus === 'paid' ? '#0D9488' : '#94A3B8', marginTop: 2 }}>
                        {(profile as any)?.paymentStatus === 'paid' ? 'Add Photo' : 'Locked'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Full Name / Professional Handle *</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Dr. Srinivas Rao"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Call Phone *</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="9848012345"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>WhatsApp Bookings</Text>
            <TextInput
              style={styles.textInput}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
              placeholder="9848012345"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Experience in Years</Text>
          <TextInput
            style={styles.textInput}
            value={experienceYears}
            onChangeText={setExperienceYears}
            keyboardType="numeric"
            placeholder="e.g. 5"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Service Localities in Kurnool</Text>
          <TextInput
            style={styles.textInput}
            value={serviceAreas}
            onChangeText={setServiceAreas}
            placeholder="e.g. Camp Area, C-Camp, All Kurnool"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Social Links */}
        <Text style={styles.sectionHeader}>Social & Portfolio Channels (All Optional)</Text>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Instagram Handle / URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            placeholder="https://instagram.com/your_handle"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>YouTube Channel URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://youtube.com/@channel"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>LinkedIn Profile URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            placeholder="https://linkedin.com/in/your_name"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Twitter / X Profile URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={twitterUrl}
            onChangeText={setTwitterUrl}
            placeholder="https://x.com/your_handle"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Facebook Profile URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={facebookUrl}
            onChangeText={setFacebookUrl}
            placeholder="https://facebook.com/your_profile"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Personal Website / Portfolio (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            placeholder="https://yourportfolio.com"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <BusinessHoursSelector
            value={operatingHours}
            onChange={(newSchedule) => setOperatingHours(newSchedule)}
            title={language === 'en' ? 'Working Hours / Availability' : 'పనివేళలు / లభ్యత'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>About Expertise & Qualifications</Text>
          <TextInput
            style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Describe your qualifications, past projects, awards, and specialties..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save & Publish Changes</Text>
          )}
        </TouchableOpacity>

        {/* ─── DANGER ZONE: DELETE PROFESSIONAL PROFILE ─── */}
        <View style={{ marginTop: 32, padding: 16, backgroundColor: '#FEF2F2', borderRadius: 16, borderWidth: 1, borderColor: '#FEE2E2' }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626', marginBottom: 4 }}>
            {language === 'en' ? 'Delete Professional Profile' : 'వృత్తి ప్రొఫైల్‌ను తొలగించండి'}
          </Text>
          <Text style={{ fontSize: 12, color: '#991B1B', lineHeight: 18, marginBottom: 14 }}>
            {language === 'en'
              ? 'Permanently delete your professional listing from Kurnool One. This action cannot be undone.'
              : 'కర్నూలు వన్ నుండి మీ ప్రొఫైల్‌ను శాశ్వతంగా తొలగిస్తుంది. ఈ చర్యను రద్దు చేయలేరు.'}
          </Text>
          <TouchableOpacity
            onPress={handleDeleteProListing}
            style={{ backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
              {language === 'en' ? '🗑️ Permanently Delete My Profile' : '🗑️ నా ప్రొఫైల్‌ను తొలగించు'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── OFFER MODAL ────────────────────────────────────────────────── */}
      <Modal visible={offerModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Post Special Service Offer</Text>
              <TouchableOpacity onPress={() => setOfferModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Offer Headline *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Free Inspection on AC Servicing"
              value={offerTitle}
              onChangeText={setOfferTitle}
            />

            <Text style={styles.label}>Discount Tag *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. FREE VISIT or 20% OFF"
              value={discountTag}
              onChangeText={setDiscountTag}
            />

            <Text style={styles.label}>Offer Validity Period (Valid Until)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {[3, 7, 15, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  onPress={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + days);
                    d.setHours(23, 59, 59, 999);
                    setValidUntilDate(d);
                    setSelectedValidityDays(days);
                    setValidUntil(getExpiryDateStr(days));
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: selectedValidityDays === days ? '#0D9488' : '#F1F5F9',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: selectedValidityDays === days ? '#0D9488' : '#CBD5E1',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: selectedValidityDays === days ? '#FFFFFF' : '#475569',
                    }}
                  >
                    {days} Days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F0FDFA',
                borderWidth: 1,
                borderColor: '#99F6E4',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar" size={18} color="#0D9488" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F766E' }}>{validUntil}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0D9488' }}>Pick Date ▼</Text>
            </TouchableOpacity>

            <CalendarDatePickerModal
              visible={showDatePicker}
              selectedDate={validUntilDate}
              onClose={() => setShowDatePicker(false)}
              onSelectDate={(date) => {
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                setValidUntilDate(endOfDay);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                setValidUntil(`Valid till ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`);
                setSelectedValidityDays(0);
              }}
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
                  <Ionicons name="camera-outline" size={24} color="#0D9488" />
                  <Text style={[styles.addOfferPhotoText, { color: '#0D9488' }]}>
                    {offerImages.length === 0 ? '+ Add Photo' : '+ 2nd Photo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handlePublishOffer}
              disabled={publishingOffer}
              style={[styles.saveBtn, { backgroundColor: '#0D9488', marginTop: 6 }]}
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

      {/* ─── PRO UPGRADE MODAL ─────────────────────────────────────── */}
      <Modal visible={showUpgradeModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={styles.modalTitle}>⚡ Upgrade Professional Profile</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Get verified badge, WhatsApp leads & post offers</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, marginBottom: 16 }}>
              {/* Standard Verified Plan */}
              <TouchableOpacity
                onPress={() => setSelectedUpgradePlan('pro_standard')}
                style={[
                  styles.upgradePlanOption,
                  selectedUpgradePlan === 'pro_standard' && styles.upgradePlanOptionActive,
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={selectedUpgradePlan === 'pro_standard' ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selectedUpgradePlan === 'pro_standard' ? '#0D9488' : '#94A3B8'}
                    />
                    <Text style={[styles.upgradePlanName, selectedUpgradePlan === 'pro_standard' && { color: '#0F766E' }]}>
                      Standard Verified Pro
                    </Text>
                  </View>
                  <View style={styles.upgradePriceBadge}>
                    <Text style={styles.upgradePriceText}>₹199 / 6 Mo</Text>
                  </View>
                </View>
                <View style={{ marginTop: 6, gap: 3, paddingLeft: 28 }}>
                  <Text style={styles.upgradePerk}>• Verified Pro badge & ranking boost</Text>
                  <Text style={styles.upgradePerk}>• Direct 1-tap WhatsApp inquiry button</Text>
                  <Text style={styles.upgradePerk}>• Client ratings & review showcase</Text>
                </View>
              </TouchableOpacity>

              {/* Elite Featured Plan */}
              <TouchableOpacity
                onPress={() => setSelectedUpgradePlan('pro_premium')}
                style={[
                  styles.upgradePlanOption,
                  selectedUpgradePlan === 'pro_premium' && styles.upgradePlanOptionActive,
                  { borderColor: selectedUpgradePlan === 'pro_premium' ? '#0D9488' : '#CCFBF1' }
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={selectedUpgradePlan === 'pro_premium' ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selectedUpgradePlan === 'pro_premium' ? '#0D9488' : '#94A3B8'}
                    />
                    <Text style={[styles.upgradePlanName, selectedUpgradePlan === 'pro_premium' && { color: '#0F766E' }]}>
                      👑 Professional Elite (1 Year)
                    </Text>
                  </View>
                  <View style={[styles.upgradePriceBadge, { backgroundColor: '#CCFBF1' }]}>
                    <Text style={[styles.upgradePriceText, { color: '#0F766E' }]}>₹499 / 1 Yr</Text>
                  </View>
                </View>
                <View style={{ marginTop: 6, gap: 3, paddingLeft: 28 }}>
                  <Text style={styles.upgradePerk}>• Top category ranking for 1 Full Year</Text>
                  <Text style={styles.upgradePerk}>• Unlimited service offers & discount deals</Text>
                  <Text style={styles.upgradePerk}>• Complete portfolio photo gallery</Text>
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
                Proceed to Pay {selectedUpgradePlan === 'pro_premium' ? '₹499' : '₹199'} via Razorpay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── RAZORPAY SUBSCRIPTION MODAL ─────────────────────────────────── */}
      <RazorpayModal
        visible={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        planName={selectedUpgradePlan === 'pro_premium' ? 'Professional Elite (1 Year)' : 'Standard Verified Pro (6 Months)'}
        amount={selectedUpgradePlan === 'pro_premium' ? 499 : 199}
        entityName={profile?.fullName || 'Professional'}
        customerPhone={profile?.phone}
        onSuccess={async (paymentData) => {
          setShowRazorpayModal(false);
          const paymentId = paymentData.razorpay_payment_id;
          const orderId = paymentData.razorpay_order_id;
          if (profile) {
            try {
              const expiryDays = selectedUpgradePlan === 'pro_premium' ? 365 : 180;
              const expiryDate = new Date(Date.now() + expiryDays * 86400000).toISOString().split('T')[0];

              await updateProfessionalProfile(profile.id, {
                paymentStatus: 'paid',
                planId: selectedUpgradePlan,
                planExpiresAt: expiryDate,
                paymentId,
                orderId,
                status: 'active',
              });

              // Write permanent ledger to /subscriptions
              try {
                await recordSubscriptionPayment({
                  transactionId: paymentId,
                  orderId,
                  userId: auth.currentUser?.uid || profile.userId || '',
                  userEmail: auth.currentUser?.email || (profile as any).email || '',
                  userPhone: profile.phone || '',
                  entityId: profile.id,
                  entityName: profile.fullName,
                  entityType: 'professional',
                  planId: selectedUpgradePlan,
                  planName: selectedUpgradePlan === 'pro_premium' ? 'Professional Elite (1 Year)' : 'Standard Verified Pro (6 Months)',
                  amount: selectedUpgradePlan === 'pro_premium' ? 499 : 199,
                  currency: 'INR',
                  startDate: new Date().toISOString().split('T')[0],
                  expiresAt: expiryDate,
                  status: 'active',
                });
              } catch (subErr) {
                console.warn('Subscription ledger record error:', subErr);
              }
              setProfile((prev) => (prev ? {
                ...prev,
                paymentStatus: 'paid',
                planId: selectedUpgradePlan,
                status: 'active'
              } : null));
              Alert.alert('Upgrade Successful!', 'Your professional profile is now verified and active across Kurnool One!');
            } catch (updErr) {
              console.warn('Pro update post-payment error:', updErr);
            }
          }
        }}
      />

      {/* ─── SWITCH PROFESSIONAL PROFILE PICKER MODAL ────────────────── */}
      <Modal visible={showProfilePicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>
                {language === 'en' ? 'Select Professional Profile' : 'వృత్తి ప్రొఫైల్‌ను ఎంచుకోండి'}
              </Text>
              <TouchableOpacity onPress={() => setShowProfilePicker(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {allProfiles.map((p) => {
                const isCurrent = p.id === profile?.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      setShowProfilePicker(false);
                      populateProfessionalFields(p);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: isCurrent ? '#F0FDFA' : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: isCurrent ? '#0D9488' : '#E2E8F0',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: isCurrent ? '#0F766E' : '#0F172A' }}>
                        {p.fullName}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        {p.category} • {p.serviceAreas || 'Kurnool'}
                      </Text>
                    </View>
                    {isCurrent && <Ionicons name="checkmark-circle" size={20} color="#0D9488" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── ALL LEADS MODAL ─────────────────────────────────────── */}
      <Modal visible={showAllLeadsModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={styles.modalTitle}>
                  {language === 'en' ? 'All Client Leads' : 'అన్ని క్లయింట్ లీడ్స్'} ({leads.length})
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>
                  {language === 'en' ? 'Chronological list with most recent inquiries on top' : 'ఇటీవలి విచారణలు పైభాగంలో ఉంటాయి'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAllLeadsModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ marginTop: 8 }}>
              <View style={{ gap: 10, paddingBottom: 20 }}>
                {[...leads]
                  .sort((a, b) => {
                    const tA = (a as any).createdAt?.toMillis ? (a as any).createdAt.toMillis() : new Date((a as any).createdAt || 0).getTime();
                    const tB = (b as any).createdAt?.toMillis ? (b as any).createdAt.toMillis() : new Date((b as any).createdAt || 0).getTime();
                    return tB - tA;
                  })
                  .map((item, idx) => (
                    <View key={item.id || idx} style={styles.leadCard}>
                      <View style={[
                        styles.leadIconWrap,
                        { backgroundColor: item.actionType === 'call' ? '#ECFDF5' : item.actionType === 'whatsapp' ? '#F0FDF4' : '#EFF6FF' }
                      ]}>
                        <Ionicons
                          name={item.actionType === 'call' ? 'call' : item.actionType === 'whatsapp' ? 'logo-whatsapp' : 'eye'}
                          size={16}
                          color={item.actionType === 'call' ? '#059669' : item.actionType === 'whatsapp' ? '#16A34A' : '#0D9488'}
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
                              { color: item.actionType === 'call' ? '#059669' : item.actionType === 'whatsapp' ? '#16A34A' : '#0D9488' }
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
                            style={[styles.leadCallBtn, { backgroundColor: '#0D9488' }]}
                          >
                            <Ionicons name="call" size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => Linking.openURL(`https://wa.me/91${item.citizenPhone?.replace(/\D/g, '')}?text=Hello, thank you for checking out my services on Kurnool One! How can I assist you?`).catch(() => {})}
                            style={styles.leadWaBtn}
                          >
                            <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 12, fontSize: 13, color: '#64748B', fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  analyticsCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
  },
  analyticsTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#CCFBF1',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
  },
  verifiedBadgeText: { fontSize: 10, fontWeight: '800', color: '#0D9488' },
  metricBox: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9',
  },
  metricValue: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  metricLabel: { fontSize: 9, color: '#64748B', fontWeight: '700', marginTop: 2 },
  planBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#99F6E4',
    padding: 12, borderRadius: 14, marginBottom: 16,
  },
  planBannerTitle: { fontSize: 12, fontWeight: '800', color: '#0F766E' },
  planBannerSub: { fontSize: 10, color: '#115E59', marginTop: 1 },
  ratesCard: {
    backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#CCFBF1',
    padding: 14, borderRadius: 14, marginBottom: 16,
  },
  ratesCardTitle: { fontSize: 12, fontWeight: '800', color: '#0F766E', marginBottom: 10 },
  sectionHeader: {
    fontSize: 13, fontWeight: '800', color: '#334155',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4,
  },
  formGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 5 },
  textInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#0D9488', paddingVertical: 15, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
    shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptySub: {
    fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 24,
  },
  createBtn: {
    backgroundColor: '#0D9488', paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 14,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
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
    color: '#0D9488',
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
  offerCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C2410C',
    borderWidth: 2,
    borderColor: '#FB923C',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  offerCtaTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 },
  offerCtaSub: { fontSize: 11.5, color: '#FFEDD5', marginTop: 2, lineHeight: 16 },
  offerCtaBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  offerCtaBtnText: {
    color: '#C2410C',
    fontWeight: '900',
    fontSize: 13,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  label: { fontSize: 11, fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', marginBottom: 14,
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
    borderColor: '#99F6E4',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOfferPhotoText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  proUpgradeBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  proUpgradeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
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
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  upgradePlanName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  upgradePriceBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upgradePriceText: { fontSize: 12, fontWeight: '900', color: '#0D9488' },
  upgradePerk: { fontSize: 11, color: '#475569' },
  proceedUpgradeBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  proceedUpgradeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});

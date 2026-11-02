import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, StyleSheet, StatusBar, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import { pickImageWithFreeStyleCrop } from '../utils/imageUploadHelper';
import {
  MASTER_CATEGORIES,
  BUSINESS_PRICING_PLANS,
  registerBusiness,
  uploadBusinessLogo,
  uploadBusinessCover,
  fetchMyBusinesses,
  BusinessItem,
} from '../services/directoryService';
import RazorpayModal from '../components/RazorpayModal';
import BusinessHoursSelector from '../components/BusinessHoursSelector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { createOrUpdateUser, checkPhoneRoleExclusivity, registerPhoneRole } from '../services/firestoreService';

export default function RegisterBusinessScreen({ navigation }: any) {
  const { language } = useLanguage();
  const isFocused = useIsFocused();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [localUser, setLocalUser] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // Existing listing detection state
  const [existingBusinesses, setExistingBusinesses] = useState<BusinessItem[]>([]);
  const [showExistingModal, setShowExistingModal] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isFocused) {
      if (auth.currentUser) {
        setCurrentUser(auth.currentUser);
      }
      AsyncStorage.getItem('user').then(async (val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            setLocalUser(parsed);
          } catch { }
        }

        const uid = auth.currentUser?.uid;
        if (uid) {
          try {
            const list = await fetchMyBusinesses(uid, '');
            if (list && list.length > 0) {
              setExistingBusinesses(list);
              setShowExistingModal(true);
            }
          } catch (e) {
            console.warn('Listing check error:', e);
          }
        }
      });
    }
  }, [isFocused]);

  const isUserAuthenticated = !!(currentUser || localUser);
  const [selectedPlan, setSelectedPlan] = useState<'biz_free' | 'biz_standard' | 'biz_premium'>('biz_standard');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  const getPlanDetails = () => {
    if (selectedPlan === 'biz_free') return { amount: 0, name: 'Free Basic Listing (₹0)' };
    if (selectedPlan === 'biz_premium') return { amount: 999, name: 'Premium Featured (1 Year - ₹999)' };
    return { amount: 399, name: 'Standard Verified (6 Months - ₹399)' };
  };
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [categoryId, setCategoryId] = useState(MASTER_CATEGORIES[0]?.id || 'restaurants');
  const [customCategory, setCustomCategory] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [timing, setTiming] = useState('10:00 AM - 09:00 PM');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [description, setDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['UPI']);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Day Operating Hours
  const [operatingHours, setOperatingHours] = useState<any>({
    monday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    tuesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    wednesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    thursday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    friday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    saturday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    sunday: { closed: false, open: '10:00 AM', close: '08:00 PM' },
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const currentCategory = MASTER_CATEGORIES.find(c => c.id === categoryId) || MASTER_CATEGORIES[0];

  const handlePhoneInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleWhatsappInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setWhatsapp(cleaned);
  };

  const pickLogo = async () => {
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setLogoUri(res.uri);
    }
  };

  const pickCover = async () => {
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setCoverUri(res.uri);
    }
  };

  const handleInitiatePayment = () => {
    if (!isUserAuthenticated) {
      Alert.alert('Login Required', 'You must be logged in before registering a business.');
      return;
    }

    if (!nameEn.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Required Fields', 'Please provide Business Name, Phone Number, and Address.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number (e.g. 9848012345) starting with 6, 7, 8, or 9.');
      return;
    }

    if (whatsapp.trim()) {
      const cleanWa = whatsapp.replace(/\D/g, '');
      if (cleanWa.length !== 10 || !/^[6-9]\d{9}$/.test(cleanWa)) {
        Alert.alert('Invalid WhatsApp Number', 'Please enter a valid 10-digit WhatsApp number.');
        return;
      }
    }

    if (selectedPlan === 'biz_free') {
      handlePaymentSuccess({ id: 'free_basic', amount: 0, status: 'free' });
      return;
    }

    setShowRazorpayModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setShowRazorpayModal(false);
    setLoading(true);
    try {
      const exclusivity = await checkPhoneRoleExclusivity(phone, 'business');
      if (!exclusivity.allowed) {
        Alert.alert('Phone Number Ineligible', exclusivity.message);
        setLoading(false);
        return;
      }

      let uploadedLogoUrl = '';
      if (logoUri) {
        if (logoUri.startsWith('file://') || logoUri.startsWith('content://')) {
          uploadedLogoUrl = await uploadBusinessLogo(logoUri);
        } else {
          uploadedLogoUrl = logoUri;
        }
      }

      let uploadedCoverUrl = '';
      if (coverUri) {
        if (coverUri.startsWith('file://') || coverUri.startsWith('content://')) {
          uploadedCoverUrl = await uploadBusinessCover(coverUri);
        } else {
          uploadedCoverUrl = coverUri;
        }
      }

      let cleanWebsite = website.trim();
      if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
        cleanWebsite = `https://${cleanWebsite}`;
      }

      const effectiveUid = currentUser?.uid || localUser?.uid || localUser?.id || '';

      const createdBizId = await registerBusiness({
        name_en: nameEn.trim(),
        name_te: nameTe.trim() || nameEn.trim(),
        categoryId,
        customCategory: categoryId === 'other' ? customCategory.trim() : undefined,
        subcategoryId: 'general',
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        timing: timing.trim(),
        website: cleanWebsite,
        googleMapsUrl: googleMapsUrl.trim(),
        description_en: description.trim() || 'Local business in Kurnool',
        description_te: description.trim() || 'కర్నూలులోని స్థానిక వ్యాపారం',
        logoUrl: uploadedLogoUrl || undefined,
        coverImage: uploadedCoverUrl || undefined,
        bannerUrl: uploadedCoverUrl || undefined,
        images: uploadedCoverUrl ? [uploadedCoverUrl] : uploadedLogoUrl ? [uploadedLogoUrl] : [],
        thumbnailUrl: uploadedCoverUrl || uploadedLogoUrl || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : ['UPI'],
        socialLinks: {
          facebook: facebook.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          youtube: youtube.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        planId: selectedPlan === 'biz_free' ? 'free' : selectedPlan === 'biz_premium' ? 'yearly' : 'half_yearly',
        paymentStatus: 'paid',
        paymentId: paymentData.razorpay_payment_id || `pay_${Date.now()}`,
        tier: 'featured',
        verificationBadge: 'none',
        claimStatus: 'claimed',
        ownerUid: effectiveUid,
        operatingHours,
        partnerCode: partnerCode.trim().toUpperCase() || undefined,
      });

      if (effectiveUid) {
        await registerPhoneRole(phone, 'business', effectiveUid, {
          name: nameEn.trim(),
          businessName: nameEn.trim(),
        });
      }

      try {
        const stored = await AsyncStorage.getItem('user');
        let existing: any = {};
        if (stored) try { existing = JSON.parse(stored); } catch { }
        await AsyncStorage.setItem('user', JSON.stringify({
          ...existing,
          uid: effectiveUid || existing.uid,
          id: effectiveUid || existing.id,
          role: 'business',
          phone: phone.trim(),
        }));
      } catch { }

      Alert.alert(
        'Payment Verified & Business Published! 🛡️',
        `Your business listing (${getPlanDetails().name}) is now live on Kurnool One.`,
        [{ text: 'Open My Dashboard', onPress: () => navigation.replace('ManageBusiness', { businessId: createdBizId }) }]
      );
    } catch (e: any) {
      console.error('Business registration error:', e);
      Alert.alert(
        'Registration Notice',
        e?.message ? `Registration error: ${e.message}` : 'Could not complete business registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Auth gate if user is not logged in
  if (!isUserAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Register Business</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.gateContainer}>
          <View style={styles.gateIconWrap}>
            <Ionicons name="lock-closed" size={48} color="#2563EB" />
          </View>
          <Text style={styles.gateTitle}>Login Required</Text>
          <Text style={styles.gateSub}>
            Please sign in to your profile before registering a business. Your listing will be securely linked to your account for managing leads and updates.
          </Text>

          <TouchableOpacity
            style={styles.gateLoginBtn}
            onPress={() => navigation.navigate('MobileFirebaseLogin', { returnScreen: 'RegisterBusiness' })}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.gateLoginBtnText}>Sign In / Register</Text>
          </TouchableOpacity>


        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {language === 'en' ? 'Register Business / Service' : 'వ్యాపార నమోదు'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          {/* User Badge */}
          <View style={styles.userBadge}>
            <Ionicons name="person-circle" size={20} color="#2563EB" />
            <Text style={styles.userBadgeText}>
              Listing as: <Text style={{ fontWeight: '800' }}>{currentUser?.displayName || localUser?.name || currentUser?.email || 'Verified Merchant'}</Text>
            </Text>
          </View>

          {/* Registration Benefits & Inclusions */}
          <View style={styles.benefitsBox}>
            <Text style={styles.benefitsTitle}>🎁 What You Get With Your Registration:</Text>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
              <Text style={styles.benefitText}>Listed on Kurnool One Directory & City-Wide Search</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
              <Text style={styles.benefitText}>Direct Customer Phone Calls & WhatsApp leads (0% Commission)</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
              <Text style={styles.benefitText}>Broadcast 5 Free Push Notifications / day for deals & offers</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
              <Text style={styles.benefitText}>Store Timings, Google Maps Directions & Photo Showcase</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
              <Text style={styles.benefitText}>Dedicated Merchant Dashboard to update offers & track leads</Text>
            </View>
          </View>

          {/* Form Fields */}
          <Text style={styles.label}>Business / Service Name (English) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Royal Rayalaseema Restaurant"
            placeholderTextColor="#9CA3AF"
            maxLength={80}
            value={nameEn}
            onChangeText={setNameEn}
          />

          <Text style={styles.label}>Business Name in Telugu (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="ఉదా: రాయలసీమ రెస్టారెంట్"
            placeholderTextColor="#9CA3AF"
            maxLength={80}
            value={nameTe}
            onChangeText={setNameTe}
          />

          {/* Category Dropdown Menu */}
          <Text style={styles.label}>Business Category *</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowCategoryDropdown(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={[styles.catIconWrap, { backgroundColor: `${currentCategory?.color || '#2563EB'}15` }]}>
                <Ionicons name={currentCategory?.icon as any || 'storefront'} size={20} color={currentCategory?.color || '#2563EB'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownValue}>
                  {language === 'en' ? currentCategory?.name_en : currentCategory?.name_te}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Tap to change category ({MASTER_CATEGORIES.length} available)</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>

          {categoryId === 'other_businesses' && (
            <View style={{ marginBottom: 14, backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#92400E', marginBottom: 4 }}>
                {language === 'en' ? 'Type Your Custom Category / Trade Name *' : 'మీ నిర్దిష్ట వర్గం / వ్యాపార రకం నమోదు చేయండి *'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#FFFFFF', borderColor: '#F59E0B', marginBottom: 4 }]}
                placeholder={language === 'en' ? 'e.g. Solar Solutions, Terracotta Pottery...' : 'ఉదా: సోలార్, కుండల తయారీ...'}
                placeholderTextColor="#9CA3AF"
                maxLength={50}
                value={customCategory}
                onChangeText={setCustomCategory}
              />
              <Text style={{ fontSize: 10, color: '#B45309' }}>
                {language === 'en' ? 'Admins will review and feature it across Kurnool One.' : 'అడ్మిన్లు సమీక్షించి దీన్ని ప్రత్యేక వర్గంగా జోడిస్తారు.'}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Phone Number (For Customer Calls) *</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={[styles.input, { paddingRight: phone ? 40 : 16 }]}
              placeholder="e.g. 9848012345 (10 digits)"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneInput}
            />
            {phone ? (
              <TouchableOpacity
                onPress={() => setPhone('')}
                style={{ position: 'absolute', right: 12, padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.label}>WhatsApp Number</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={[styles.input, { paddingRight: whatsapp ? 40 : 16 }]}
              placeholder="e.g. 9848012345 (10 digits)"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              value={whatsapp}
              onChangeText={handleWhatsappInput}
            />
            {whatsapp ? (
              <TouchableOpacity
                onPress={() => setWhatsapp('')}
                style={{ position: 'absolute', right: 12, padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.label}>Full Address (Street / Area / Kurnool) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Near Old Bus Stand, Park Road, Kurnool"
            placeholderTextColor="#9CA3AF"
            maxLength={150}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Landmark</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Opposite State Bank"
            placeholderTextColor="#9CA3AF"
            maxLength={80}
            value={landmark}
            onChangeText={setLandmark}
          />

          <Text style={styles.label}>Business Website (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. https://mybusiness.com or mybusiness.in"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
            maxLength={100}
            value={website}
            onChangeText={setWebsite}
          />

          <Text style={styles.label}>Google Map Location Link (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. https://maps.app.goo.gl/..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
            maxLength={250}
            value={googleMapsUrl}
            onChangeText={setGoogleMapsUrl}
          />

          {/* Operating Hours Selector */}
          <BusinessHoursSelector
            value={operatingHours}
            onChange={(newSched, summary) => {
              setOperatingHours(newSched);
              setTiming(summary);
            }}
            title="Store / Business Hours"
          />

          {/* Amenities & Features Selector */}
          <Text style={[styles.label, { marginTop: 14, fontWeight: '800', color: '#0F172A' }]}>
            Store Amenities & Features
          </Text>
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
                    paddingVertical: 7,
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

          {/* Social Media & Online Links (All Optional) */}
          <Text style={[styles.label, { marginTop: 14, fontWeight: '800', color: '#0F172A' }]}>
            Social Media & Online Links (All Optional)
          </Text>

          <Text style={styles.label}>Instagram Handle / URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://instagram.com/your_shop"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            maxLength={100}
            value={instagram}
            onChangeText={setInstagram}
          />

          <Text style={styles.label}>Facebook Page URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://facebook.com/your_shop"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            maxLength={100}
            value={facebook}
            onChangeText={setFacebook}
          />

          <Text style={styles.label}>Twitter / X URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://x.com/your_shop"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            maxLength={100}
            value={twitter}
            onChangeText={setTwitter}
          />

          <Text style={styles.label}>YouTube Channel URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/@your_channel"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            maxLength={100}
            value={youtube}
            onChangeText={setYoutube}
          />

          <Text style={styles.label}>LinkedIn Company Page URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://linkedin.com/company/your_company"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            maxLength={100}
            value={linkedin}
            onChangeText={setLinkedin}
          />

          {/* Visual Branding Section: Logo & Cover Image */}
          <Text style={[styles.label, { marginTop: 16, fontWeight: '800', color: '#0F172A' }]}>
            Business Logo & Storefront Cover Image
          </Text>
          <View style={styles.uploadCardsRow}>
            {/* Logo Picker */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity onPress={pickLogo} style={styles.logoPickerBox}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.pickedImg} />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Ionicons name="camera-outline" size={24} color="#2563EB" />
                    <Text style={styles.uploadBtnText}>Upload Logo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.uploadSubtext}>1:1 Business Logo</Text>
            </View>

            {/* Cover Picker */}
            <View style={{ flex: 1.6, alignItems: 'center' }}>
              <TouchableOpacity onPress={pickCover} style={styles.coverPickerBox}>
                {coverUri ? (
                  <Image source={{ uri: coverUri }} style={styles.pickedImg} />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Ionicons name="image-outline" size={24} color="#2563EB" />
                    <Text style={styles.uploadBtnText}>Upload Cover</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.uploadSubtext}>16:9 Storefront Banner</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <Text style={[styles.label, { marginBottom: 0 }]}>Services / Business Description</Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>{description.length}/500</Text>
          </View>
          <TextInput
            style={[styles.input, { minHeight: 90, marginTop: 4 }]}
            placeholder="Tell customers about your products, specialties, and experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          {/* Partner Referral Code */}
          <Text style={[styles.label, { marginTop: 14 }]}>Partner Referral Code (Optional)</Text>
          <TextInput
            style={[styles.input, { textTransform: 'uppercase' }]}
            placeholder="e.g. KNL-7842 (if introduced by a partner)"
            placeholderTextColor="#9CA3AF"
            value={partnerCode}
            onChangeText={(txt) => setPartnerCode(txt.toUpperCase())}
            autoCapitalize="characters"
          />

          {/* Commercial Advertising & Directory Plan Selection */}
          <Text style={[styles.label, { marginTop: 20, fontWeight: '800', color: '#0F172A', fontSize: 16 }]}>
            Choose Listing & Advertising Plan
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 16 }}>
            Official commercial listing, verified blue tick badge, direct customer call button & promotion on Kurnool One.
          </Text>

          <View style={{ gap: 12, marginBottom: 16 }}>
            {BUSINESS_PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id as any)}
                  style={[
                    styles.planOptionCard,
                    isSelected && styles.planOptionCardActive,
                    plan.recommended && !isSelected && { borderColor: '#F59E0B', borderWidth: 1.5 }
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isSelected ? '#2563EB' : '#94A3B8'}
                      />
                      <Text style={[styles.planOptionTitle, isSelected && { color: '#1D4ED8' }]}>{plan.name}</Text>
                    </View>
                    <View style={[styles.priceBadge, plan.price > 0 && { backgroundColor: '#EFF6FF' }]}>
                      <Text style={[styles.priceBadgeText, plan.price > 0 && { color: '#1D4ED8' }]}>
                        {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.planOptionSub}>{plan.badge} • {plan.period}</Text>

                  {/* Benefit Perks Checklist */}
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 5 }}>
                    {plan.features.map((feat, fIdx) => (
                      <View key={fIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="checkmark-circle" size={14} color={isSelected ? '#2563EB' : '#059669'} />
                        <Text style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleInitiatePayment}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={selectedPlan === 'biz_free' ? 'checkmark-circle-outline' : 'card-outline'} size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>
                  {selectedPlan === 'biz_free' ? 'Register Business for Free' : `Pay ₹${getPlanDetails().amount} & Activate via Razorpay`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* In-App Razorpay Checkout Modal */}
      <RazorpayModal
        visible={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        onSuccess={handlePaymentSuccess}
        planName={getPlanDetails().name}
        amount={getPlanDetails().amount}
        entityName={nameEn.trim() || 'My Business'}
        customerPhone={phone.trim() || '9876500001'}
        customerEmail={currentUser?.email || 'merchant@kurnoolone.com'}
      />

      {/* Category Dropdown Modal */}
      <Modal visible={showCategoryDropdown} transparent animationType="slide" onRequestClose={() => setShowCategoryDropdown(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="grid" size={20} color="#2563EB" />
                <Text style={styles.modalTitle}>Select Business Category</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search category (e.g. Restaurant, Hotel, Hospital, Cloth)..."
              placeholderTextColor="#94A3B8"
              value={catSearch}
              onChangeText={setCatSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {MASTER_CATEGORIES
                .filter(c =>
                  !catSearch ||
                  c.name_en.toLowerCase().includes(catSearch.toLowerCase()) ||
                  c.name_te.includes(catSearch)
                )
                .map(cat => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setShowCategoryDropdown(false);
                      }}
                      style={[styles.catOptionRow, isSelected && styles.catOptionRowActive]}
                    >
                      <View style={[styles.catOptionIcon, { backgroundColor: `${cat.color || '#2563EB'}15` }]}>
                        <Ionicons name={cat.icon as any || 'storefront'} size={20} color={cat.color || '#2563EB'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.catOptionTitle, isSelected && { color: '#2563EB', fontWeight: '800' }]}>
                          {cat.name_en}
                        </Text>
                        <Text style={styles.catOptionSub}>{cat.name_te}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Existing Listing Detected Modal */}
      <Modal visible={showExistingModal} transparent animationType="fade" onRequestClose={() => setShowExistingModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 25 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
              <Ionicons name="storefront" size={32} color="#2563EB" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 6 }}>
              {language === 'en' ? 'Existing Listing Found' : 'మునుపటి లిస్టింగ్ కనుగొనబడింది'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 16 }}>
              {language === 'en'
                ? `You already have "${existingBusinesses[0]?.name_en || 'a registered business'}" linked to your account. Would you like to manage your existing listing or register an additional branch?`
                : `మీ ఖాతాకు ఇప్పటికే "${existingBusinesses[0]?.name_en || 'ఒక వ్యాపారం'}" నమోదు చేయబడి ఉంది. మీరు మీ పాత దుకాణాన్ని నిర్వహించాలనుకుంటున్నారా లేదా కొత్త బ్రాంచ్‌ను నమోదు చేయాలనుకుంటున్నారా?`}
            </Text>

            {/* Manage Existing Button */}
            <TouchableOpacity
              onPress={() => {
                setShowExistingModal(false);
                navigation.navigate('ManageBusiness', { businessId: existingBusinesses[0]?.id });
              }}
              style={{ backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                {language === 'en' ? 'Manage Existing Listing' : 'పాత లిస్టింగ్ నిర్వహించండి'}
              </Text>
            </TouchableOpacity>

            {/* Register Another Branch */}
            <TouchableOpacity
              onPress={() => setShowExistingModal(false)}
              style={{ paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' }}
            >
              <Text style={{ color: '#475569', fontWeight: '700', fontSize: 13 }}>
                {language === 'en' ? 'Register Another Listing / Branch' : 'మరొక దుకాణాన్ని నమోదు చేయండి'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  gateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  gateIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  gateSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  gateLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  gateLoginBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  gateDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
  },
  gateDemoBtnText: {
    color: '#1E40AF',
    fontWeight: '700',
    fontSize: 14,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  userBadgeText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  imagePicker: {
    height: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 2,
    borderColor: '#E5E7EB', borderStyle: 'dashed', backgroundColor: '#FFFFFF',
    marginBottom: 16, justifyContent: 'center', alignItems: 'center',
  },
  previewImg: { width: '100%', height: '100%' },
  pickerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  catPillActive: { backgroundColor: '#2563EB' },
  catPillText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  catPillTextActive: { color: '#FFFFFF' },
  planCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center',
    justifyContent: 'center',
  },
  planCardActive: {
    borderColor: '#2563EB', backgroundColor: '#EFF6FF',
  },
  popularBadge: {
    position: 'absolute', top: -8, right: 6, backgroundColor: '#10B981',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  popularBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFFFFF' },
  planCardTitle: { fontSize: 12, fontWeight: '800', color: '#374151' },
  planCardTitleActive: { color: '#2563EB' },
  planCardPrice: { fontSize: 11, fontWeight: '800', color: '#6B7280', marginTop: 2 },
  planCardPriceActive: { color: '#1D4ED8' },
  planCardDesc: { fontSize: 9, color: '#94A3B8', marginTop: 2 },
  submitBtn: {
    backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  uploadCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  logoPickerBox: {
    width: '100%',
    height: 110,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPickerBox: {
    width: '100%',
    height: 110,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickedImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  uploadSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
  },
  planOptionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  planOptionCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  planOptionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  priceBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  planOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 26,
    marginTop: 2,
    fontWeight: '600',
  },
  benefitsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    flex: 1,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  categoryModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSearchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  catOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catOptionRowActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  catOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  catOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});



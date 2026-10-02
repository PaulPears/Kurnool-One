import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import {
  MASTER_CATEGORIES,
  BUSINESS_PRICING_PLANS,
  registerBusiness,
  uploadBusinessLogo,
  uploadBusinessCover
} from '../services/directoryService';
import RazorpayModal from '../components/RazorpayModal';
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
      AsyncStorage.getItem('user').then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            setLocalUser(parsed);
            if (parsed.phone && !phone) setPhone(parsed.phone);
          } catch {}
        }
      });
    }
  }, [isFocused]);

  const isUserAuthenticated = !!(currentUser || localUser);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'half_yearly' | 'yearly'>('half_yearly');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  const getPlanDetails = () => {
    if (selectedPlan === 'monthly') return { amount: 199, name: 'Business Listing (Monthly - ₹199)' };
    if (selectedPlan === 'yearly') return { amount: 2000, name: 'Business Listing (1 Year - ₹2,000)' };
    return { amount: 999, name: 'Business Listing (6 Months - ₹999)' };
  };
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [categoryId, setCategoryId] = useState(MASTER_CATEGORIES[0]?.id || 'restaurants');
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

  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setLogoUri(res.assets[0].uri);
    }
  };

  const pickCover = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setCoverUri(res.assets[0].uri);
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

      await registerBusiness({
        name_en: nameEn.trim(),
        name_te: nameTe.trim() || nameEn.trim(),
        categoryId,
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
        amenities: ['UPI Accepted', 'Verified Merchant'],
        socialLinks: {
          facebook: facebook.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          youtube: youtube.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        planId: selectedPlan,
        paymentStatus: 'paid',
        paymentId: paymentData.razorpay_payment_id || `pay_${Date.now()}`,
        tier: 'featured',
        verificationBadge: 'verified_business',
        claimStatus: 'verified',
        ownerUid: effectiveUid,
        operatingHours,
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
        if (stored) try { existing = JSON.parse(stored); } catch {}
        await AsyncStorage.setItem('user', JSON.stringify({
          ...existing,
          uid: effectiveUid || existing.uid,
          id: effectiveUid || existing.id,
          role: 'business',
          phone: phone.trim(),
        }));
      } catch {}

      Alert.alert(
        'Payment Verified & Business Published! 🛡️',
        `Your business listing (${getPlanDetails().name}) has been activated with the Verified Blue Tick badge.`,
        [{ text: 'Open My Dashboard', onPress: () => navigation.replace('ManageBusiness') }]
      );
    } catch (e: any) {
      Alert.alert('Registration Complete', 'Business listing registered successfully!');
      navigation.replace('ManageBusiness');
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* User Badge */}
        <View style={styles.userBadge}>
          <Ionicons name="person-circle" size={20} color="#2563EB" />
          <Text style={styles.userBadgeText}>
            Listing as: <Text style={{ fontWeight: '800' }}>{currentUser?.displayName || localUser?.name || currentUser?.email || 'Verified Merchant'}</Text>
          </Text>
        </View>

        {/* Plan Selector with official user prices */}
        <Text style={styles.label}>Select Business Listing Plan *</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'monthly', name: 'Monthly', price: '₹199 / mo', desc: 'Standard Listing' },
            { id: 'half_yearly', name: '6 Months', price: '₹999 / 6mo', desc: 'Most Popular', popular: true },
            { id: 'yearly', name: 'Yearly', price: '₹2,000 / yr', desc: 'Best Value' },
          ].map(plan => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id as any)}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardActive,
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}
              <Text style={[styles.planCardTitle, selectedPlan === plan.id && styles.planCardTitleActive]}>
                {plan.name}
              </Text>
              <Text style={[styles.planCardPrice, selectedPlan === plan.id && styles.planCardPriceActive]}>
                {plan.price}
              </Text>
              <Text style={styles.planCardDesc}>{plan.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>Business / Service Name (English) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Royal Rayalaseema Restaurant"
          placeholderTextColor="#9CA3AF"
          value={nameEn}
          onChangeText={setNameEn}
        />

        <Text style={styles.label}>Business Name in Telugu (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="ఉదా: రాయలసీమ రెస్టారెంట్"
          placeholderTextColor="#9CA3AF"
          value={nameTe}
          onChangeText={setNameTe}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={styles.label}>Category *</Text>
          <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: 'bold' }}>
            {MASTER_CATEGORIES.find(c => c.id === categoryId)?.name_en}
          </Text>
        </View>

        <TextInput
          style={[styles.input, { height: 42, fontSize: 13, marginBottom: 8 }]}
          placeholder="Filter categories (e.g. Restaurant, Hotel, Clinic, Jewellery)..."
          placeholderTextColor="#9CA3AF"
          value={catSearch}
          onChangeText={setCatSearch}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {MASTER_CATEGORIES
              .filter(c =>
                !catSearch ||
                c.name_en.toLowerCase().includes(catSearch.toLowerCase()) ||
                c.name_te.includes(catSearch)
              )
              .map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
                >
                  <Text style={[styles.catPillText, categoryId === cat.id && styles.catPillTextActive]}>
                    {language === 'en' ? cat.name_en : cat.name_te}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Phone Number (For Customer Calls) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9848012345"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>WhatsApp Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9848012345"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />

        <Text style={styles.label}>Full Address (Street / Area / Kurnool) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Near Old Bus Stand, Park Road, Kurnool"
          placeholderTextColor="#9CA3AF"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Opposite State Bank"
          placeholderTextColor="#9CA3AF"
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
          value={googleMapsUrl}
          onChangeText={setGoogleMapsUrl}
        />

        {/* Operating Hours */}
        <Text style={styles.label}>Business Hours (Monday – Sunday)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Monday to Saturday 09:30 AM - 09:00 PM, Sunday 10:00 AM - 02:00 PM"
          placeholderTextColor="#9CA3AF"
          value={timing}
          onChangeText={setTiming}
        />

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
          value={instagram}
          onChangeText={setInstagram}
        />

        <Text style={styles.label}>Facebook Page URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://facebook.com/your_shop"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={facebook}
          onChangeText={setFacebook}
        />

        <Text style={styles.label}>Twitter / X URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://x.com/your_shop"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={twitter}
          onChangeText={setTwitter}
        />

        <Text style={styles.label}>YouTube Channel URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://youtube.com/@your_channel"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={youtube}
          onChangeText={setYoutube}
        />

        <Text style={styles.label}>LinkedIn Company Page URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://linkedin.com/company/your_company"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
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

        <Text style={styles.label}>Services / Business Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 90 }]}
          placeholder="Tell customers about your products, specialties, and experience..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* Commercial Advertising & Directory Plan Selection */}
        <Text style={[styles.label, { marginTop: 20, fontWeight: '800', color: '#0F172A', fontSize: 16 }]}>
          Choose Listing & Advertising Plan
        </Text>
        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 16 }}>
          Official commercial listing, verified blue tick badge, direct customer call button & promotion on Kurnool One.
        </Text>

        <View style={{ gap: 10, marginBottom: 16 }}>
          {BUSINESS_PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlan === (plan.id === 'biz_monthly' ? 'monthly' : plan.id === 'biz_yearly' ? 'yearly' : 'half_yearly');
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id === 'biz_monthly' ? 'monthly' : plan.id === 'biz_yearly' ? 'yearly' : 'half_yearly')}
                style={[
                  styles.planOptionCard,
                  isSelected && styles.planOptionCardActive
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#2563EB' : '#94A3B8'}
                    />
                    <Text style={[styles.planOptionTitle, isSelected && { color: '#1D4ED8' }]}>{plan.name}</Text>
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>₹{plan.price}</Text>
                  </View>
                </View>
                <Text style={styles.planOptionSub}>{plan.badge} • {plan.period}</Text>
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
              <Ionicons name="card-outline" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Pay ₹{getPlanDetails().amount} & Activate via Razorpay</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

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
});



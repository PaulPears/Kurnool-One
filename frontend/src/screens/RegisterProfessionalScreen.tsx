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
  PROFESSIONAL_CATEGORIES,
  PROFESSIONAL_PRICING_PLANS,
  registerProfessional,
  uploadProfessionalAvatar,
  fetchMyProfessionalProfile,
  ProfessionalItem,
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
import { createOrUpdateUser, checkPhoneRoleExclusivity, registerPhoneRole } from '../services/firestoreService';

import { useIsFocused } from '@react-navigation/native';

export default function RegisterProfessionalScreen({ navigation }: any) {
  const { language } = useLanguage();
  const isFocused = useIsFocused();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [localUser, setLocalUser] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // Existing profile detection state
  const [existingProfile, setExistingProfile] = useState<ProfessionalItem | null>(null);
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
          } catch {}
        }

        const uid = auth.currentUser?.uid;
        if (uid) {
          try {
            const prof = await fetchMyProfessionalProfile(uid, '');
            if (prof) {
              setExistingProfile(prof);
              setShowExistingModal(true);
            }
          } catch (e) {
            console.warn('Pro profile check error:', e);
          }
        }
      });
    }
  }, [isFocused]);

  const isUserAuthenticated = !!(currentUser || localUser);
  const [selectedPlan, setSelectedPlan] = useState<'pro_free' | 'pro_standard' | 'pro_elite'>('pro_standard');

  const getPlanDetails = () => {
    if (selectedPlan === 'pro_free') return { amount: 0, name: 'Free Basic Profile (₹0)' };
    if (selectedPlan === 'pro_elite') return { amount: 499, name: 'Elite Pro (1 Year - ₹499)' };
    return { amount: 199, name: 'Standard Verified (6 Months - ₹199)' };
  };
  const [fullName, setFullName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(PROFESSIONAL_CATEGORIES[0]?.id || 'influencers_creators');
  const [customCategory, setCustomCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [serviceAreas, setServiceAreas] = useState('All Kurnool City');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [visitingCharges, setVisitingCharges] = useState('₹150');
  const [hourlyRate, setHourlyRate] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Daily Operating / Working Hours
  const [operatingHours, setOperatingHours] = useState<any>({
    monday: { closed: false, open: '09:00 AM', close: '08:00 PM' },
    tuesday: { closed: false, open: '09:00 AM', close: '08:00 PM' },
    wednesday: { closed: false, open: '09:00 AM', close: '08:00 PM' },
    thursday: { closed: false, open: '09:00 AM', close: '08:00 PM' },
    friday: { closed: false, open: '09:00 AM', close: '08:00 PM' },
    saturday: { closed: false, open: '09:00 AM', close: '08:00 PM' },
    sunday: { closed: false, open: '10:00 AM', close: '05:00 PM' },
  });

  const handlePhoneInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleWhatsappInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setWhatsapp(cleaned);
  };

  const selectedCat = PROFESSIONAL_CATEGORIES.find(c => c.id === selectedCatId) || PROFESSIONAL_CATEGORIES[0];

  const handleCategorySelect = (catId: string) => {
    setSelectedCatId(catId);
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    if (cat?.placeholderRate) {
      setVisitingCharges(cat.placeholderRate);
    }
  };

  const pickImage = async () => {
    const res = await pickImageWithFreeStyleCrop();
    if (res?.uri) {
      setImageUri(res.uri);
    }
  };

  const handleInitiatePayment = async () => {
    if (!isUserAuthenticated) {
      Alert.alert('Login Required', 'You must log in to your profile before listing a professional profile.');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert(
        language === 'en' ? 'Required Field' : 'తప్పనిసరి ఫీల్డ్',
        language === 'en' ? 'Please enter your Full Name or Creator Handle.' : 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.'
      );
      return;
    }

    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      Alert.alert(
        language === 'en' ? 'Required Field' : 'తప్పనిసరి ఫీల్డ్',
        language === 'en' ? 'Please enter a valid 10-digit Phone Number.' : 'దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్‌ను నమోదు చేయండి.'
      );
      return;
    }

    if (selectedPlan === 'pro_free') {
      handlePaymentSuccess({ id: 'free_basic', amount: 0, status: 'free' });
      return;
    }

    setShowRazorpayModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setShowRazorpayModal(false);
    setLoading(true);
    try {
      const exclusivity = await checkPhoneRoleExclusivity(phone, 'professional');
      if (!exclusivity.allowed) {
        Alert.alert(
          language === 'en' ? 'Phone Number Ineligible' : 'ఫోన్ నంబర్ అనర్హమైనది',
          exclusivity.message
        );
        setLoading(false);
        return;
      }

      let uploadedAvatarUrl = '';
      if (imageUri) {
        uploadedAvatarUrl = await uploadProfessionalAvatar(imageUri);
      }

      const areasArray = serviceAreas
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const finalAvatar = uploadedAvatarUrl || undefined;

      const effectiveUid = currentUser?.uid || localUser?.uid || localUser?.id || '';

      const createdProId = await registerProfessional({
        fullName: fullName.trim(),
        category: selectedCatId === 'other_professionals' && customCategory.trim() ? customCategory.trim() : selectedCat.name_en,
        categoryName_te: selectedCatId === 'other_professionals' && customCategory.trim() ? customCategory.trim() : selectedCat.name_te,
        customCategory: selectedCatId === 'other_professionals' ? customCategory.trim() : undefined,
        experienceYears: parseInt(experienceYears, 10) || 1,
        serviceAreas: areasArray.length > 0 ? areasArray : ['All Kurnool'],
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        visitingCharges: visitingCharges.trim(),
        hourlyRate: hourlyRate.trim() || undefined,
        operatingHours: operatingHours,
        avatarUrl: finalAvatar,
        instagramUrl: instagramUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        description: description.trim() || `Professional ${selectedCat.name_en} serving Kurnool.`,
        portfolioPhotos: [],
        verifiedProfessional: false,
        status: 'active',
        userId: effectiveUid,
        planId: selectedPlan,
        partnerCode: partnerCode.trim().toUpperCase() || undefined,
        paymentStatus: 'paid',
        paymentId: paymentData.razorpay_payment_id || `pay_${Date.now()}`,
      });

      if (effectiveUid) {
        await registerPhoneRole(phone, 'professional', effectiveUid, {
          name: fullName.trim(),
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
          role: 'professional',
          phone: phone.trim(),
        }));
      } catch {}

      Alert.alert(
        language === 'en' ? 'Payment Verified & Profile Published! 🛡️' : 'చెల్లింపు పూర్తయింది & ప్రొఫైల్ ప్రచురించబడింది!',
        language === 'en'
          ? `Your professional profile (${getPlanDetails().name}) is now live in Kurnool One.`
          : 'మీ ప్రొఫైల్ ఇప్పుడు కర్నూలు వన్‌లో ప్రత్యక్షంగా ఉంది.',
        [{ text: 'Open My Dashboard', onPress: () => navigation.replace('ManageProfessional', { proId: createdProId }) }]
      );
    } catch (e: any) {
      console.error('Professional registration error:', e);
      Alert.alert(
        'Registration Notice',
        e?.message ? `Registration error: ${e.message}` : 'Could not complete professional registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Auth Gate
  if (!isUserAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Profile</Text>
        </View>

        <View style={styles.gateContainer}>
          <View style={styles.gateIconWrap}>
            <Ionicons name="lock-closed" size={48} color="#0D9488" />
          </View>
          <Text style={styles.gateTitle}>Login Required</Text>
          <Text style={styles.gateSub}>
            Please sign in to your profile before creating a professional profile. Your profile and client leads will be securely linked to your account.
          </Text>

          <TouchableOpacity
            style={[styles.gateLoginBtn, { backgroundColor: '#0D9488' }]}
            onPress={() => navigation.navigate('MobileFirebaseLogin', { returnScreen: 'RegisterProfessional' })}
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'List Personal Profile' : 'వ్యక్తిగత ప్రొఫైల్ నమోదు'}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'Influencers, Painters & Skilled Pros' : 'ఇన్‌ఫ్లుయెన్సర్లు, పెయింటర్లు & నిపుణులు'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
          {/* User Identity Banner */}
          <View style={styles.userBadge}>
            <Ionicons name="person-circle" size={20} color="#0D9488" />
            <Text style={styles.userBadgeText}>
              Logged in as: <Text style={{ fontWeight: '800' }}>{currentUser?.displayName || localUser?.name || currentUser?.email || 'Verified Professional'}</Text>
            </Text>
          </View>

          {/* Registration Benefits & Inclusions */}
        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>🎁 What You Get With Your Professional Listing:</Text>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={15} color="#0D9488" />
            <Text style={styles.benefitText}>Listed on Kurnool One Directory & Skilled Professionals Search</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={15} color="#0D9488" />
            <Text style={styles.benefitText}>Direct Customer Phone Calls & WhatsApp leads (0% Commission)</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={15} color="#0D9488" />
            <Text style={styles.benefitText}>Broadcast 3 Free Push Notifications / day for jobs & availability</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={15} color="#0D9488" />
            <Text style={styles.benefitText}>Upfront Visiting Charges & Custom Rate card display</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={15} color="#0D9488" />
            <Text style={styles.benefitText}>Dedicated Professional Dashboard to manage leads & availability</Text>
          </View>
        </View>

        {/* Avatar / Profile Photo Picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color="#9CA3AF" />
                <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {language === 'en' ? 'Tap circle above to select your profile photo' : 'మీ ప్రొఫైల్ ఫోటోను ఎంచుకోవడానికి పైన నొక్కండి'}
          </Text>
        </View>

        {/* Category Dropdown Menu */}
        <Text style={styles.label}>
          {language === 'en' ? 'Select Profession / Skill *' : 'వృత్తి / నైపుణ్యాన్ని ఎంచుకోండి *'}
        </Text>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setShowCategoryDropdown(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={[styles.catIconWrap, { backgroundColor: `${selectedCat?.color || '#0D9488'}15` }]}>
              <Ionicons name={selectedCat?.icon as any || 'briefcase'} size={20} color={selectedCat?.color || '#0D9488'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dropdownValue}>
                {language === 'en' ? selectedCat?.name_en : selectedCat?.name_te}
              </Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Tap to select profession ({PROFESSIONAL_CATEGORIES.length} available)</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>

        {selectedCatId === 'other_professionals' && (
          <View style={{ marginBottom: 14, backgroundColor: '#EEF2FF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#6366F1' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#312E81', marginBottom: 4 }}>
              {language === 'en' ? 'Type Your Specific Profession / Skill / Specialty *' : 'మీ నిర్దిష్ట వృత్తి లేదా నైపుణ్యాన్ని నమోదు చేయండి *'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#FFFFFF', borderColor: '#6366F1', marginBottom: 4 }]}
              placeholder={language === 'en' ? 'e.g. Wildlife Photographer, Yoga Therapist, Sound Engineer...' : 'ఉదా: యోగా థెరపిస్ట్, సౌండ్ ఇంజనీర్...'}
              placeholderTextColor="#9CA3AF"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
            <Text style={{ fontSize: 10, color: '#4338CA' }}>
              {language === 'en' ? 'Not in list? Enter your specialty to show on your profile.' : 'జాబితాలో లేదా? మీ ప్రత్యేకతను నమోదు చేయండి.'}
            </Text>
          </View>
        )}

        {/* Full Name */}
        <Text style={styles.label}>
          {language === 'en' ? 'Full Name / Creator Handle *' : 'పూర్తి పేరు / ఛానల్ పేరు *'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ramesh Kumar or Renu Vlogs"
          placeholderTextColor="#9CA3AF"
          maxLength={60}
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Experience & Areas */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              {language === 'en' ? 'Experience (Years)' : 'అనుభవం (సంవత్సరాలు)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 6"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={2}
              value={experienceYears}
              onChangeText={setExperienceYears}
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <Text style={styles.label}>
              {language === 'en' ? 'Service Areas' : 'సేవా ప్రాంతాలు'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Camp Area, City"
              placeholderTextColor="#9CA3AF"
              maxLength={150}
              value={serviceAreas}
              onChangeText={setServiceAreas}
            />
          </View>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="pricetag" size={16} color="#0D9488" />
            <Text style={styles.pricingTitle}>
              {language === 'en' ? 'Upfront Rates (Seen by Clients)' : 'సేవా రుసుము వివరాలు'}
            </Text>
          </View>

          <Text style={styles.pricingLabel}>
            {language === 'en' ? 'Visiting / Starting Fee' : 'విజిటింగ్ / ప్రారంభ రుసుము'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#FFFFFF' }]}
            placeholder="e.g. ₹150 or ₹1,000 / Collab"
            placeholderTextColor="#9CA3AF"
            maxLength={40}
            value={visitingCharges}
            onChangeText={setVisitingCharges}
          />

          <Text style={[styles.pricingLabel, { marginTop: 8 }]}>
            {language === 'en' ? 'Standard / Package Rate (Optional)' : 'ప్యాకేజీ / రేటు (ఐచ్ఛికం)'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#FFFFFF' }]}
            placeholder="e.g. ₹250/hr or ₹12/sq.ft or Per Reel"
            placeholderTextColor="#9CA3AF"
            maxLength={40}
            value={hourlyRate}
            onChangeText={setHourlyRate}
          />
        </View>

        {/* Phone & WhatsApp */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              {language === 'en' ? 'Call Phone *' : 'ఫోన్ నంబర్ *'}
            </Text>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput
                style={[styles.input, { paddingRight: phone ? 36 : 14 }]}
                placeholder="9848012345"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={handlePhoneInput}
              />
              {phone ? (
                <TouchableOpacity
                  onPress={() => setPhone('')}
                  style={{ position: 'absolute', right: 10, padding: 4 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              {language === 'en' ? 'WhatsApp' : 'వాట్సాప్ నంబర్'}
            </Text>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput
                style={[styles.input, { paddingRight: whatsapp ? 36 : 14 }]}
                placeholder="9848012345"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={whatsapp}
                onChangeText={handleWhatsappInput}
              />
              {whatsapp ? (
                <TouchableOpacity
                  onPress={() => setWhatsapp('')}
                  style={{ position: 'absolute', right: 10, padding: 4 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Social Media & Channels (All Optional) */}
        <Text style={[styles.label, { marginTop: 12, fontWeight: '800', color: '#0F172A' }]}>
          {language === 'en' ? 'Social Media Accounts (All Optional)' : 'సోషల్ మీడియా ఖాతాలు (ఐచ్ఛికం)'}
        </Text>

        <Text style={styles.label}>
          {language === 'en' ? 'Instagram Profile URL (Optional)' : 'ఇన్‌స్టాగ్రామ్ లింక్ (ఐచ్ఛికం)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://instagram.com/your_handle"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          maxLength={100}
          value={instagramUrl}
          onChangeText={setInstagramUrl}
        />

        <Text style={styles.label}>
          {language === 'en' ? 'YouTube Channel URL (Optional)' : 'యూట్యూబ్ లింక్ (ఐచ్ఛికం)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://youtube.com/@channel"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          maxLength={100}
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
        />

        <Text style={styles.label}>
          {language === 'en' ? 'LinkedIn Profile URL (Optional)' : 'లింక్డ్‌ఇన్ ప్రొఫైల్ (ఐచ్ఛికం)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://linkedin.com/in/your_name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          maxLength={100}
          value={linkedinUrl}
          onChangeText={setLinkedinUrl}
        />

        <Text style={styles.label}>
          {language === 'en' ? 'Twitter / X Profile URL (Optional)' : 'ట్విట్టర్ / X ప్రొఫైల్ (ఐచ్ఛికం)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://x.com/your_handle"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          maxLength={100}
          value={twitterUrl}
          onChangeText={setTwitterUrl}
        />

        <Text style={styles.label}>
          {language === 'en' ? 'Facebook Profile URL (Optional)' : 'ఫేస్‌బుక్ ప్రొఫైల్ (ఐచ్ఛికం)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://facebook.com/your_profile"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          maxLength={100}
          value={facebookUrl}
          onChangeText={setFacebookUrl}
        />

        <Text style={styles.label}>
          {language === 'en' ? 'Personal Website / Portfolio (Optional)' : 'వెబ్‌సైట్ / పోర్ట్‌ఫోలియో (ఐచ్ఛికం)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://yourportfolio.com"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          maxLength={100}
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
        />

        {/* Bio / Description */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Text style={[styles.label, { marginBottom: 0 }]}>
            {language === 'en' ? 'About Your Skills & Work' : 'మీ నైపుణ్యాలు & అనుభవం'}
          </Text>
          <Text style={{ fontSize: 11, color: '#64748B' }}>{description.length}/500</Text>
        </View>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top', marginTop: 4 }]}
          placeholder="Describe your expertise, past projects, awards, and why clients should choose you..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          value={description}
          onChangeText={setDescription}
        />

        {/* Working Hours & Availability */}
        <Text style={[styles.label, { marginTop: 16, fontWeight: '800', color: '#0F172A' }]}>
          {language === 'en' ? 'Working Hours & Daily Availability' : 'పని వేళలు & లభ్యత'}
        </Text>
        <BusinessHoursSelector
          value={operatingHours}
          onChange={setOperatingHours}
        />

        {/* Partner Referral Code */}
        <Text style={[styles.label, { marginTop: 14 }]}>
          {language === 'en' ? 'Partner Referral Code (Optional)' : 'పార్ట్‌నర్ రెఫరల్ కోడ్ (ఐచ్ఛికం)'}
        </Text>
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
          {language === 'en' ? 'Choose Professional Plan' : 'ప్రొఫెషనల్ ప్లాన్ ఎంచుకోండి'}
        </Text>
        <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 16 }}>
          {language === 'en'
            ? 'Official professional listing, active pro badge, direct client call & WhatsApp inquiry buttons.'
            : 'అధికారిక ప్రొఫైల్, యాక్టివ్ బ్యాడ్జ్ మరియు కస్టమర్ కాల్స్.'}
        </Text>

        <View style={{ gap: 12, marginBottom: 16 }}>
          {PROFESSIONAL_PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id as any)}
                style={[
                  styles.planItemCard,
                  isSelected && styles.planItemCardActive,
                  plan.recommended && !isSelected && { borderColor: '#0D9488', borderWidth: 1.5 }
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? '#0D9488' : '#94A3B8'}
                    />
                    <Text style={[styles.planItemTitle, isSelected && { color: '#0F766E' }]}>{plan.name}</Text>
                  </View>
                  <View style={[styles.proPriceBadge, plan.price > 0 && { backgroundColor: '#CCFBF1' }]}>
                    <Text style={[styles.proPriceBadgeText, plan.price > 0 && { color: '#0F766E' }]}>
                      {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.planItemSub}>{plan.badge} • {plan.period}</Text>

                {/* Benefit Perks Checklist */}
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 5 }}>
                  {plan.features.map((feat, fIdx) => (
                    <View key={fIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="checkmark-circle" size={14} color={isSelected ? '#0D9488' : '#059669'} />
                      <Text style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>{feat}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleInitiatePayment}
          disabled={loading}
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name={selectedPlan === 'pro_free' ? 'checkmark-circle-outline' : 'card-outline'} size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {selectedPlan === 'pro_free'
                  ? (language === 'en' ? 'Register Profile for Free' : 'ఉచితంగా ప్రొఫైల్ నమోదు చేయండి')
                  : (language === 'en' ? `Pay ₹${getPlanDetails().amount} & Publish Profile` : `₹${getPlanDetails().amount} చెల్లించి ప్రచురించు`)}
              </Text>
            </>
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
        entityName={fullName.trim() || 'My Profile'}
        customerPhone={phone.trim() || '9876500002'}
        customerEmail={currentUser?.email || 'pro@kurnoolone.com'}
      />

      {/* Category Dropdown Modal */}
      <Modal visible={showCategoryDropdown} transparent animationType="slide" onRequestClose={() => setShowCategoryDropdown(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="briefcase" size={20} color="#0D9488" />
                <Text style={styles.modalTitle}>Select Profession / Skill</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search profession (e.g. Electrician, Maid, Painter, Tutor)..."
              placeholderTextColor="#94A3B8"
              value={catSearch}
              onChangeText={setCatSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {PROFESSIONAL_CATEGORIES
                .filter(c =>
                  !catSearch ||
                  c.name_en.toLowerCase().includes(catSearch.toLowerCase()) ||
                  c.name_te.includes(catSearch)
                )
                .map(cat => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        handleCategorySelect(cat.id);
                        setShowCategoryDropdown(false);
                      }}
                      style={[styles.catOptionRow, isSelected && styles.catOptionRowActive]}
                    >
                      <View style={[styles.catOptionIcon, { backgroundColor: `${cat.color || '#0D9488'}15` }]}>
                        <Ionicons name={cat.icon as any || 'briefcase'} size={20} color={cat.color || '#0D9488'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.catOptionTitle, isSelected && { color: '#0D9488', fontWeight: '800' }]}>
                          {cat.name_en}
                        </Text>
                        <Text style={styles.catOptionSub}>{cat.name_te}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#0D9488" />}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Existing Profile Detected Modal */}
      <Modal visible={showExistingModal} transparent animationType="fade" onRequestClose={() => setShowExistingModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 25 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
              <Ionicons name="briefcase" size={32} color="#0D9488" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 6 }}>
              {language === 'en' ? 'Existing Profile Found' : 'మునుపటి ప్రొఫైల్ కనుగొనబడింది'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 16 }}>
              {language === 'en'
                ? `You already have an active professional profile as "${existingProfile?.fullName || 'Service Professional'}" (${existingProfile?.category || 'Specialist'}). Would you like to manage your profile or edit your existing details?`
                : `మీరు ఇప్పటికే "${existingProfile?.fullName || 'సర్వీస్ ప్రొఫెషనల్'}" గా నమోదు చేయబడి ఉన్నారు. మీరు మీ వివరాలు నిర్వహించాలనుకుంటున్నారా?`}
            </Text>

            {/* Manage Existing Button */}
            <TouchableOpacity
              onPress={() => {
                setShowExistingModal(false);
                navigation.navigate('ManageProfessional', { proId: existingProfile?.id });
              }}
              style={{ backgroundColor: '#0D9488', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                {language === 'en' ? 'Manage Existing Profile' : 'పాత ప్రొఫైల్ నిర్వహించండి'}
              </Text>
            </TouchableOpacity>

            {/* Continue Editing */}
            <TouchableOpacity
              onPress={() => setShowExistingModal(false)}
              style={{ paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' }}
            >
              <Text style={{ color: '#475569', fontWeight: '700', fontSize: 13 }}>
                {language === 'en' ? 'Continue & Update Details' : 'వివరాలు నవీకరించండి'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
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
    backgroundColor: '#CCFBF1',
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
    backgroundColor: '#0D9488',
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
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
  },
  gateDemoBtnText: {
    color: '#0F766E',
    fontWeight: '700',
    fontSize: 14,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  userBadgeText: {
    fontSize: 13,
    color: '#0F766E',
  },
  planCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center',
    justifyContent: 'center',
  },
  planCardActive: {
    borderColor: '#0D9488', backgroundColor: '#F0FDFA',
  },
  popularBadge: {
    position: 'absolute', top: -8, right: 6, backgroundColor: '#0D9488',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  popularBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFFFFF' },
  planCardTitle: { fontSize: 12, fontWeight: '800', color: '#374151' },
  planCardTitleActive: { color: '#0D9488' },
  planCardPrice: { fontSize: 11, fontWeight: '800', color: '#6B7280', marginTop: 2 },
  planCardPriceActive: { color: '#0F766E' },
  planCardDesc: { fontSize: 9, color: '#94A3B8', marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginVertical: 12 },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#EFF6FF', overflow: 'visible', position: 'relative',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#DBEAFE',
  },
  avatarImg: { width: 86, height: 86, borderRadius: 43 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginTop: 2 },
  cameraIconBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#0D9488', width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  avatarHint: { fontSize: 11, color: '#6B7280', marginTop: 6, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '800', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827', fontWeight: '500',
  },
  catChipsRow: { gap: 8, paddingVertical: 4 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  catChipActive: {
    backgroundColor: '#F0FDFA', borderColor: '#0D9488',
  },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  catChipTextActive: { color: '#0D9488' },
  row: { flexDirection: 'row', gap: 10 },
  pricingCard: {
    backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#CCFBF1',
    borderRadius: 16, padding: 14, marginTop: 14,
  },
  pricingTitle: { fontSize: 13, fontWeight: '900', color: '#0F766E' },
  pricingLabel: { fontSize: 11, fontWeight: '800', color: '#115E59', marginBottom: 4 },
  submitBtn: {
    backgroundColor: '#0D9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 16, marginTop: 24,
    shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  planItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  planItemCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  planItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  proPriceBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  proPriceBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F766E',
  },
  planItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 26,
    marginTop: 2,
    fontWeight: '600',
  },
  benefitsBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#134E4A',
    fontWeight: '600',
    flex: 1,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
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
    backgroundColor: '#F1F5F9',
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  catOptionRowActive: {
    backgroundColor: '#F0FDFA',
  },
  catOptionIcon: {
    width: 38,
    height: 38,
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
    marginTop: 2,
  },
});


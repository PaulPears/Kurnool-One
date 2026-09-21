import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import { MASTER_CATEGORIES, registerBusiness, uploadBusinessImage } from '../services/directoryService';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { createOrUpdateUser } from '../services/firestoreService';

export default function RegisterBusinessScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
    });
    return unsub;
  }, []);

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'half_yearly' | 'yearly'>('half_yearly');
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
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
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

  const handleQuickMerchantLogin = async () => {
    setDemoLoading(true);
    try {
      const email = 'merchant@kurnoolone.com';
      const pass = 'Password@123';
      let userRes: any = null;
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        userRes = res.user;
      } catch (e: any) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
          const createRes = await createUserWithEmailAndPassword(auth, email, pass);
          await updateProfile(createRes.user, { displayName: 'Kurnool Merchant' });
          userRes = createRes.user;
        } else {
          throw e;
        }
      }
      if (userRes) {
        await createOrUpdateUser({
          ...userRes,
          displayName: userRes.displayName || 'Kurnool Merchant',
        });
      }
    } catch (err: any) {
      Alert.alert('Login Error', err.message || 'Failed to sign in demo merchant.');
    } finally {
      setDemoLoading(false);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      Alert.alert('Login Required', 'You must be logged in before registering a business.');
      return;
    }

    if (!nameEn.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Required Fields', 'Please provide Business Name, Phone Number, and Address.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (imageUri) {
        if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
          uploadedImageUrl = await uploadBusinessImage(imageUri);
        } else {
          uploadedImageUrl = imageUri;
        }
      }

      let cleanWebsite = website.trim();
      if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
        cleanWebsite = `https://${cleanWebsite}`;
      }

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
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        thumbnailUrl: uploadedImageUrl || undefined,
        amenities: ['UPI Accepted'],
        planId: selectedPlan,
        paymentStatus: 'unpaid',
        tier: 'featured',
        verificationBadge: 'verified_business',
        claimStatus: 'verified',
        ownerUid: currentUser.uid,
        operatingHours,
      });

      Alert.alert(
        'Business Registered!',
        `Your business listing (${selectedPlan.replace('_', ' ').toUpperCase()} Plan) has been submitted successfully and is attached to your account (${currentUser.email}).`,
        [{ text: 'OK', onPress: () => navigation.replace('Main') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit business registration');
    } finally {
      setLoading(false);
    }
  };

  // Auth gate if user is not logged in or is anonymous
  if (!currentUser || currentUser.isAnonymous) {
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

          <TouchableOpacity
            style={styles.gateDemoBtn}
            onPress={handleQuickMerchantLogin}
            disabled={demoLoading}
          >
            {demoLoading ? (
              <ActivityIndicator color="#1E40AF" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                <Text style={styles.gateDemoBtnText}>Instant Demo Merchant Login (1-Click)</Text>
              </>
            )}
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
            Listing as: <Text style={{ fontWeight: '800' }}>{currentUser.displayName || currentUser.email}</Text>
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

        {/* Image Picker */}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', fontWeight: '700', marginTop: 6 }}>
                Add Storefront / Profile Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

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

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit & Activate Business</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
});

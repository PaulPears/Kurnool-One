import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import {
  PROFESSIONAL_CATEGORIES,
  registerProfessional,
  uploadProfessionalAvatar,
} from '../services/directoryService';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { createOrUpdateUser } from '../services/firestoreService';

export default function RegisterProfessionalScreen({ navigation }: any) {
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
  const [fullName, setFullName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(PROFESSIONAL_CATEGORIES[0]?.id || 'influencers_creators');
  const [experienceYears, setExperienceYears] = useState('3');
  const [serviceAreas, setServiceAreas] = useState('All Kurnool City');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [visitingCharges, setVisitingCharges] = useState('₹150');
  const [hourlyRate, setHourlyRate] = useState('');
  const [avatarUrlText, setAvatarUrlText] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCat = PROFESSIONAL_CATEGORIES.find(c => c.id === selectedCatId) || PROFESSIONAL_CATEGORIES[0];

  const handleQuickProLogin = async () => {
    setDemoLoading(true);
    try {
      const email = 'pro@kurnoolone.com';
      const pass = 'Password@123';
      let userRes: any = null;
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        userRes = res.user;
      } catch (e: any) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
          const createRes = await createUserWithEmailAndPassword(auth, email, pass);
          await updateProfile(createRes.user, { displayName: 'Dr. Srinivas Rao' });
          userRes = createRes.user;
        } else {
          throw e;
        }
      }
      if (userRes) {
        await createOrUpdateUser({
          ...userRes,
          displayName: userRes.displayName || 'Dr. Srinivas Rao',
        });
      }
    } catch (err: any) {
      Alert.alert('Login Error', err.message || 'Failed to sign in demo professional.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCatId(catId);
    const cat = PROFESSIONAL_CATEGORIES.find(c => c.id === catId);
    if (cat?.placeholderRate) {
      setVisitingCharges(cat.placeholderRate);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || currentUser.isAnonymous) {
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

    setLoading(true);
    try {
      let uploadedAvatarUrl = '';
      if (imageUri) {
        uploadedAvatarUrl = await uploadProfessionalAvatar(imageUri);
      }

      const areasArray = serviceAreas
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const finalAvatar = uploadedAvatarUrl || avatarUrlText.trim() || undefined;

      await registerProfessional({
        fullName: fullName.trim(),
        category: selectedCat.name_en,
        categoryName_te: selectedCat.name_te,
        experienceYears: parseInt(experienceYears, 10) || 1,
        serviceAreas: areasArray.length > 0 ? areasArray : ['All Kurnool'],
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        visitingCharges: visitingCharges.trim(),
        hourlyRate: hourlyRate.trim() || undefined,
        avatarUrl: finalAvatar,
        instagramUrl: instagramUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        description: description.trim() || `Professional ${selectedCat.name_en} serving Kurnool.`,
        portfolioPhotos: [],
        verifiedProfessional: true,
        status: 'active',
        userId: currentUser.uid,
        planId: selectedPlan,
      });

      Alert.alert(
        language === 'en' ? 'Profile Published!' : 'ప్రొఫైల్ ప్రచురించబడింది!',
        language === 'en'
          ? `Your professional profile (${selectedPlan.replace('_', ' ').toUpperCase()} Plan) is now live in Kurnool One.`
          : 'మీ ప్రొఫైల్ ఇప్పుడు కర్నూలు వన్‌లో ప్రత్యక్షంగా ఉంది.',
        [{ text: 'OK', onPress: () => navigation.replace('Main') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to list profile.');
    } finally {
      setLoading(false);
    }
  };

  // Auth Gate
  if (!currentUser || currentUser.isAnonymous) {
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

          <TouchableOpacity
            style={styles.gateDemoBtn}
            onPress={handleQuickProLogin}
            disabled={demoLoading}
          >
            {demoLoading ? (
              <ActivityIndicator color="#0F766E" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                <Text style={styles.gateDemoBtnText}>Instant Demo Pro Login (1-Click)</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Identity Banner */}
        <View style={styles.userBadge}>
          <Ionicons name="person-circle" size={20} color="#0D9488" />
          <Text style={styles.userBadgeText}>
            Logged in as: <Text style={{ fontWeight: '800' }}>{currentUser.displayName || currentUser.email}</Text>
          </Text>
        </View>

        {/* Official Pricing Plan Selector */}
        <Text style={styles.label}>Select Personal Profile Plan *</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'monthly', name: 'Monthly', price: '₹99 / mo', desc: 'Standard Profile' },
            { id: 'half_yearly', name: '6 Months', price: '₹500 / 6mo', desc: 'Popular Choice', popular: true },
            { id: 'yearly', name: 'Yearly', price: '₹900 / yr', desc: 'Best Value' },
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

        {/* Avatar Picker & Photo URL */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {imageUri || avatarUrlText ? (
              <Image source={{ uri: imageUri || avatarUrlText }} style={styles.avatarImg} />
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
            {language === 'en' ? 'Upload your photo or enter image URL below' : 'మీ ఫోటో అప్‌లోడ్ చేయండి లేదా లింక్ నమోదు చేయండి'}
          </Text>
          <TextInput
            style={[styles.input, { width: '100%', marginTop: 8, fontSize: 13 }]}
            placeholder="Or paste profile photo URL (https://...)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            value={avatarUrlText}
            onChangeText={setAvatarUrlText}
          />
        </View>

        {/* Category Picker */}
        <Text style={styles.label}>
          {language === 'en' ? 'Select Profession / Skill *' : 'వృత్తి / నైపుణ్యాన్ని ఎంచుకోండి *'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsRow}>
          {PROFESSIONAL_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategorySelect(cat.id)}
              style={[
                styles.catChip,
                selectedCatId === cat.id && styles.catChipActive,
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedCatId === cat.id && styles.catChipTextActive,
                ]}
              >
                {language === 'en' ? cat.name_en : cat.name_te}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Full Name */}
        <Text style={styles.label}>
          {language === 'en' ? 'Full Name / Creator Handle *' : 'పూర్తి పేరు / ఛానల్ పేరు *'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ramesh Kumar or Renu Vlogs"
          placeholderTextColor="#9CA3AF"
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
            <TextInput
              style={styles.input}
              placeholder="9848012345"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              {language === 'en' ? 'WhatsApp' : 'వాట్సాప్ నంబర్'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="9848012345"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
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
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
        />

        {/* Bio / Description */}
        <Text style={styles.label}>
          {language === 'en' ? 'About Your Skills & Work' : 'మీ నైపుణ్యాలు & అనుభవం'}
        </Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Describe your expertise, past projects, awards, and why clients should choose you..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>
                {language === 'en' ? 'Publish My Profile' : 'నా ప్రొఫైల్‌ను ప్రచురించు'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
});

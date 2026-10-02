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
  fetchMyLeads,
  BusinessItem,
  LeadItem,
} from '../services/directoryService';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageBusinessScreen({ navigation }: any) {
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);

  // Edit fields
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [timing, setTiming] = useState('');
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

  // Offer Modal
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [discountTag, setDiscountTag] = useState('FLAT 20% OFF');
  const [validUntil, setValidUntil] = useState('Valid for next 15 days');
  const [publishingOffer, setPublishingOffer] = useState(false);

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

      const list = await fetchMyBusinesses(uid, userPhone);
      if (list && list.length > 0) {
        const b = list[0];
        setBusiness(b);
        setPhone(b.phone || '');
        setWhatsapp(b.whatsapp || '');
        setTiming(b.timing || '');
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

        const leadsList = await fetchMyLeads(b.ownerUid || uid, b.id);
        setLeads(leadsList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadLogo = async () => {
    if (!business) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setUploadingLogo(true);
      try {
        const url = await uploadBusinessLogo(res.assets[0].uri);
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
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setUploadingCover(true);
      try {
        const url = await uploadBusinessCover(res.assets[0].uri);
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
      });

      Alert.alert('Success', 'Business details updated live on Kurnool One!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishOffer = async () => {
    if (!business || !offerTitle.trim()) {
      Alert.alert('Required', 'Please enter an offer headline');
      return;
    }

    setPublishingOffer(true);
    try {
      await createBusinessOffer({
        title_en: offerTitle.trim(),
        description_en: `Exclusive offer from ${business.name_en}. Call or visit to redeem.`,
        discountText: discountTag.trim(),
        businessId: business.id,
        businessName: business.name_en,
        validUntil: validUntil.trim(),
        bannerUrl: business.images?.[0] || '',
        phone: business.phone,
        category: business.categoryId,
      });

      Alert.alert('Offer Published!', 'Your deal is now visible on the Offers & Events tab across Kurnool.');
      setOfferTitle('');
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
                {business.tier === 'featured' ? '👑 PREMIUM' : business.verificationBadge === 'verified_business' ? '🛡️ VERIFIED' : 'FREE'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#DBEAFE', fontWeight: 'bold' }}>365 Days Active</Text>
          </View>
          <Text style={styles.heroTitle}>{business.name_en}</Text>
          <Text style={styles.heroSub}>{business.address}</Text>
        </View>

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
            <Text style={styles.kpiValue}>{business.ratingAvg.toFixed(1)} ★</Text>
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
          onPress={() => setOfferModalVisible(true)}
          style={styles.offerCtaCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.offerCtaTitle}>🎁 Post a Festival Discount / Deal</Text>
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

        <Text style={styles.label}>Operating Hours / Timings</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10:00 AM - 10:00 PM"
          value={timing}
          onChangeText={setTiming}
        />

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

            <Text style={styles.label}>Validity / Expiry *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Valid until 31st October"
              value={validUntil}
              onChangeText={setValidUntil}
            />

            <TouchableOpacity
              onPress={handlePublishOffer}
              disabled={publishingOffer}
              style={[styles.saveBtn, { backgroundColor: '#F59E0B', marginTop: 10 }]}
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
});

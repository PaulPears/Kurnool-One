import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, Modal, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchMyBusinesses,
  updateBusinessProfile,
  createBusinessOffer,
  BusinessItem,
} from '../services/directoryService';
import { auth } from '../config/firebase';

export default function ManageBusinessScreen({ navigation }: any) {
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessItem | null>(null);

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
      const user = auth.currentUser;
      const list = await fetchMyBusinesses(user?.uid);
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.centerContainer}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {language === 'en' ? 'My Business Portal' : 'నా వ్యాపార నిర్వహణ'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('BusinessDetail', { businessId: business.id })}>
          <Ionicons name="eye-outline" size={22} color="#2563EB" />
        </TouchableOpacity>
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
});

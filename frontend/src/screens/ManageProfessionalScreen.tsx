import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchMyProfessionalProfile,
  updateProfessionalProfile,
  ProfessionalItem,
} from '../services/directoryService';
import { auth } from '../config/firebase';

export default function ManageProfessionalScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfessionalItem | null>(null);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [serviceAreas, setServiceAreas] = useState('All Kurnool');
  const [visitingCharges, setVisitingCharges] = useState('₹150');
  const [hourlyRate, setHourlyRate] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const p = await fetchMyProfessionalProfile(user.uid);
        if (p) {
          setProfile(p);
          setFullName(p.fullName || '');
          setPhone(p.phone || '');
          setWhatsapp(p.whatsapp || '');
          setExperienceYears(p.experienceYears?.toString() || '3');
          setServiceAreas(Array.isArray(p.serviceAreas) ? p.serviceAreas.join(', ') : 'All Kurnool');
          setVisitingCharges(p.visitingCharges || '₹150');
          setHourlyRate(p.hourlyRate || '');
          setInstagramUrl(p.instagramUrl || '');
          setYoutubeUrl(p.youtubeUrl || '');
          setDescription(p.description || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        instagramUrl: instagramUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        description: description.trim(),
      });

      Alert.alert('Success', 'Professional profile & rates updated live on Kurnool One!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Dashboard</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{profile.fullName}</Text>
          <Text style={styles.headerSub}>{profile.category} • Kurnool One Pro</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Analytics Card */}
        <View style={styles.analyticsCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.analyticsTitle}>Client Inquiries & Reach</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
              <Text style={styles.verifiedBadgeText}>Verified Pro</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.metricBox}>
              <Ionicons name="eye-outline" size={18} color="#0D9488" />
              <Text style={styles.metricValue}>86</Text>
              <Text style={styles.metricLabel}>Profile Views</Text>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="call-outline" size={18} color="#10B981" />
              <Text style={styles.metricValue}>14</Text>
              <Text style={styles.metricLabel}>Call Taps</Text>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="logo-whatsapp" size={18} color="#059669" />
              <Text style={styles.metricValue}>11</Text>
              <Text style={styles.metricLabel}>WhatsApp Leads</Text>
            </View>
          </View>
        </View>

        {/* Pricing Plan Badge */}
        <View style={styles.planBanner}>
          <Ionicons name="ribbon" size={20} color="#0D9488" />
          <View style={{ flex: 1 }}>
            <Text style={styles.planBannerTitle}>Active Plan: 6 Months (₹500 / 6mo)</Text>
            <Text style={styles.planBannerSub}>Verified badge and priority directory listing active.</Text>
          </View>
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
        <Text style={styles.sectionHeader}>Social & Portfolio Channels</Text>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Instagram Handle / URL (For Creators)</Text>
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
          <Text style={styles.inputLabel}>YouTube Channel URL</Text>
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
      </ScrollView>
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
});

import React from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  Linking, Share, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { ProfessionalItem } from '../services/directoryService';

export default function ProfessionalDetailScreen({ route, navigation }: any) {
  const { pro } = route.params as { pro: ProfessionalItem };
  const { language } = useLanguage();

  const handleCall = () => {
    if (pro.phone) {
      Linking.openURL(`tel:${pro.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (pro.whatsapp || pro.phone) {
      const num = (pro.whatsapp || pro.phone).replace(/[^0-9]/g, '');
      const waNumber = num.startsWith('91') ? num : `91${num}`;
      Linking.openURL(`https://wa.me/${waNumber}?text=Hello ${pro.fullName}, I found your profile on Kurnool One and need your service.`).catch(() => {});
    }
  };

  const handleOpenLink = (url?: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(finalUrl).catch(() => {});
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Need a ${pro.category} in Kurnool? Check out ${pro.fullName} on Kurnool One!\nPhone: ${pro.phone}\nAreas: ${pro.serviceAreas.join(', ')}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{pro.fullName}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.navBtn}>
          <Ionicons name="share-social-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {pro.avatarUrl ? (
              <Image source={{ uri: pro.avatarUrl }} style={{ width: 72, height: 72, borderRadius: 36 }} />
            ) : (
              <Text style={styles.avatarText}>{pro.fullName.charAt(0)}</Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <Text style={styles.name}>{pro.fullName}</Text>
            {pro.verifiedProfessional && (
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            )}
          </View>

          <Text style={styles.category}>{pro.category}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingScore}>{pro.ratingAvg.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({pro.ratingCount} ratings)</Text>
            <Text style={{ color: '#D1D5DB' }}>•</Text>
            <Text style={styles.expText}>{pro.experienceYears} Years Experience</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleCall} style={styles.actionBtnCall}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleWhatsApp} style={styles.actionBtnWa}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing / Charges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Charges</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={styles.feeLabel}>Visiting / Inspection Charges:</Text>
            <Text style={styles.feeValue}>{pro.visitingCharges || '₹150'}</Text>
          </View>
          {pro.hourlyRate && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 6 }}>
              <Text style={styles.feeLabel}>Standard Rate:</Text>
              <Text style={styles.feeValue}>{pro.hourlyRate}</Text>
            </View>
          )}
        </View>

        {/* Service Areas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Locations Covered</Text>
          <View style={styles.areasWrap}>
            {pro.serviceAreas.map((area, idx) => (
              <View key={idx} style={styles.areaPill}>
                <Ionicons name="location-outline" size={14} color="#2563EB" />
                <Text style={styles.areaPillText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Service */}
        {pro.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About Services</Text>
            <Text style={styles.descText}>{pro.description}</Text>
          </View>
        )}

        {/* Social Media & Online Profiles */}
        {(pro.instagramUrl || pro.youtubeUrl || pro.linkedinUrl || pro.twitterUrl || pro.facebookUrl || pro.websiteUrl) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Social & Online Profiles</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {pro.instagramUrl && (
                <TouchableOpacity onPress={() => handleOpenLink(pro.instagramUrl)} style={[styles.areaPill, { backgroundColor: '#FDF2F8' }]}>
                  <Ionicons name="logo-instagram" size={16} color="#DB2777" />
                  <Text style={[styles.areaPillText, { color: '#BE185D' }]}>Instagram</Text>
                </TouchableOpacity>
              )}
              {pro.youtubeUrl && (
                <TouchableOpacity onPress={() => handleOpenLink(pro.youtubeUrl)} style={[styles.areaPill, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="logo-youtube" size={16} color="#DC2626" />
                  <Text style={[styles.areaPillText, { color: '#B91C1C' }]}>YouTube</Text>
                </TouchableOpacity>
              )}
              {pro.linkedinUrl && (
                <TouchableOpacity onPress={() => handleOpenLink(pro.linkedinUrl)} style={[styles.areaPill, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="logo-linkedin" size={16} color="#0284C7" />
                  <Text style={[styles.areaPillText, { color: '#0369A1' }]}>LinkedIn</Text>
                </TouchableOpacity>
              )}
              {pro.twitterUrl && (
                <TouchableOpacity onPress={() => handleOpenLink(pro.twitterUrl)} style={[styles.areaPill, { backgroundColor: '#F8FAFC' }]}>
                  <Ionicons name="logo-twitter" size={16} color="#0F172A" />
                  <Text style={[styles.areaPillText, { color: '#0F172A' }]}>Twitter / X</Text>
                </TouchableOpacity>
              )}
              {pro.facebookUrl && (
                <TouchableOpacity onPress={() => handleOpenLink(pro.facebookUrl)} style={[styles.areaPill, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="logo-facebook" size={16} color="#1D4ED8" />
                  <Text style={[styles.areaPillText, { color: '#1D4ED8' }]}>Facebook</Text>
                </TouchableOpacity>
              )}
              {pro.websiteUrl && (
                <TouchableOpacity onPress={() => handleOpenLink(pro.websiteUrl)} style={[styles.areaPill, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="globe-outline" size={16} color="#16A34A" />
                  <Text style={[styles.areaPillText, { color: '#15803D' }]}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Trust Notice */}
        <View style={styles.trustBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#15803D" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.trustTitle}>Kurnool One Direct Connect</Text>
            <Text style={styles.trustSub}>
              Connect directly with verified local self-employed professionals without third-party commission.
            </Text>
          </View>
        </View>
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
  navTitle: { fontSize: 16, fontWeight: '800', color: '#111827', flex: 1, marginHorizontal: 10 },
  profileCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#BFDBFE',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#2563EB' },
  name: { fontSize: 20, fontWeight: '900', color: '#111827' },
  category: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  ratingScore: { fontSize: 13, fontWeight: '800', color: '#111827' },
  ratingCount: { fontSize: 12, color: '#6B7280' },
  expText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  actionBtnCall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14,
  },
  actionBtnWa: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 14,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#F3F4F6',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 12 },
  feeLabel: { fontSize: 13, color: '#6B7280' },
  feeValue: { fontSize: 14, fontWeight: '800', color: '#111827' },
  areasWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  areaPillText: { fontSize: 12, fontWeight: '600', color: '#1D4ED8' },
  descText: { fontSize: 13, lineHeight: 20, color: '#4B5563' },
  trustBox: {
    flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 14,
    borderRadius: 14, borderWidth: 1, borderColor: '#DCFCE7', alignItems: 'center',
  },
  trustTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  trustSub: { fontSize: 11, color: '#15803D', marginTop: 2, lineHeight: 16 },
});

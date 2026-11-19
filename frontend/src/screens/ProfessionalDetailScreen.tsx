import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Linking, Share, StyleSheet, Image, ActivityIndicator,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  ProfessionalItem,
  recordCustomerLead,
  fetchProfessionalById,
  ProfessionalReview,
  addProfessionalReview,
  fetchProfessionalReviews,
} from '../services/directoryService';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReportModal } from '../components/ReportModal';

export default function ProfessionalDetailScreen({ route, navigation }: any) {
  const { pro: initialPro, proId } = (route.params || {}) as { pro?: ProfessionalItem; proId?: string };
  const { language } = useLanguage();

  const [pro, setPro] = useState<ProfessionalItem | null>(initialPro || null);
  const [loading, setLoading] = useState<boolean>(!initialPro && !!proId);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [currentUserPhone, setCurrentUserPhone] = useState<string>('');

  const [reviews, setReviews] = useState<ProfessionalReview[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.uid || parsed.id) setCurrentUserUid(parsed.uid || parsed.id);
          if (parsed.phone) setCurrentUserPhone(parsed.phone);
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    const targetId = proId || initialPro?.id;
    if (targetId && (!pro || !pro.description || !pro.serviceAreas)) {
      fetchProfessionalById(targetId).then(data => {
        if (data) setPro(prev => ({ ...(prev || {}), ...data }));
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [proId, initialPro?.id]);

  useEffect(() => {
    const targetId = proId || initialPro?.id;
    if (targetId) {
      fetchProfessionalReviews(targetId).then(setReviews).catch(() => {});
    }
  }, [proId, initialPro?.id]);

  const handleSubmitReview = async () => {
    if (!auth.currentUser) {
      Alert.alert(
        language === 'en' ? 'Sign In Required' : 'లాగిన్ అవసరం',
        language === 'en' ? 'Please sign in to rate and review this professional.' : 'ఈ నిపుణుడిని రేట్ చేయడానికి దయచేసి లాగిన్ అవ్వండి.',
        [
          { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
          { text: language === 'en' ? 'Sign In' : 'లాగిన్', onPress: () => navigation.navigate('MobileFirebaseLogin') },
        ]
      );
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Review Required', 'Please share your experience with this professional.');
      return;
    }
    if (!pro?.id) return;
    setSubmittingReview(true);
    try {
      await addProfessionalReview(pro.id, userRating, reviewComment);
      Alert.alert('Review Submitted! ⭐', 'Thank you for rating this professional on Kurnool One.');
      setReviewModalVisible(false);
      setReviewComment('');
      setUserRating(5);
      const updatedReviews = await fetchProfessionalReviews(pro.id);
      setReviews(updatedReviews);
      if (updatedReviews.length > 0) {
        const sum = updatedReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        const newAvg = Number((sum / updatedReviews.length).toFixed(1));
        setPro(prev => prev ? { ...prev, ratingAvg: newAvg, ratingCount: updatedReviews.length } : null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isOwner = Boolean(
    pro && (
      (auth.currentUser?.uid && pro.userId === auth.currentUser.uid) ||
      (currentUserUid && pro.userId === currentUserUid) ||
      (currentUserPhone && pro.phone && currentUserPhone.replace(/[^0-9]/g, '').slice(-10) === pro.phone.replace(/[^0-9]/g, '').slice(-10))
    )
  );

  const logProLead = async (actionType: 'view' | 'call' | 'whatsapp') => {
    try {
      if (!pro) return;
      const currentUser = auth.currentUser;
      if (pro.userId && currentUser && pro.userId === currentUser.uid) {
        return;
      }
      let citizenName = currentUser?.displayName || 'Kurnool Resident';
      let citizenPhone = currentUser?.phoneNumber || '';
      let citizenArea = '';
      let citizenGender = '';

      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) citizenName = parsed.name;
          if (parsed.phone) citizenPhone = parsed.phone;
          if (parsed.location) citizenArea = parsed.location;
          if (parsed.gender) citizenGender = parsed.gender;
        } catch {}
      }

      await recordCustomerLead({
        targetId: pro.id,
        targetType: 'professional',
        targetOwnerUid: pro.userId,
        targetName: pro.fullName,
        actionType,
        citizenUid: currentUser?.uid,
        citizenName,
        citizenPhone,
        citizenArea,
        citizenGender,
      });
    } catch {}
  };

  useEffect(() => {
    if (pro?.id) {
      logProLead('view');
    }
  }, [pro?.id]);

  const handleCall = () => {
    if (pro?.phone) {
      logProLead('call');
      Linking.openURL(`tel:${pro.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (pro && (pro.whatsapp || pro.phone)) {
      logProLead('whatsapp');
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
    if (!pro) return;
    try {
      const appUrl = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';
      await Share.share({
        message: `Need a ${pro.category} in Kurnool? Check out ${pro.fullName} on Kurnool One!\nPhone: ${pro.phone}\nAreas: ${pro.serviceAreas?.join(', ') || 'Kurnool'}\n\n👉 Download Kurnool One App:\n${appUrl}`,
      });
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{language === 'en' ? 'Professional Details' : 'వివరాలు'}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!pro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{language === 'en' ? 'Not Found' : 'కనిపించలేదు'}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
            {language === 'en' ? 'Professional profile not found or has been removed.' : 'ప్రొఫైల్ వివరాలు అందుబాటులో లేవు.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{pro.fullName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity onPress={() => setReportModalVisible(true)} style={styles.navBtn}>
            <Ionicons name="flag-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.navBtn}>
            <Ionicons name="share-social-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>
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
            <Text style={styles.ratingScore}>{Number(pro.ratingAvg || 5.0).toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({pro.ratingCount || 1} ratings)</Text>
            <Text style={{ color: '#D1D5DB' }}>•</Text>
            <Text style={styles.expText}>{pro.experienceYears != null ? pro.experienceYears : 2}+ Years Experience</Text>
          </View>

          {/* Owner Manage Banner */}
          {isOwner && (
            <TouchableOpacity
              style={styles.ownerManageBanner}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ManageProfessional', { proId: pro.id })}
            >
              <View style={styles.ownerManageLeft}>
                <View style={styles.ownerManageIconWrap}>
                  <Ionicons name="settings" size={20} color="#1D4ED8" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.ownerManageTitle}>You own this profile</Text>
                  <Text style={styles.ownerManageSubtitle}>Tap to edit details, visiting charges & leads</Text>
                </View>
              </View>
              <View style={styles.ownerManageBtn}>
                <Text style={styles.ownerManageBtnText}>Manage</Text>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

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
            {(Array.isArray(pro.serviceAreas) && pro.serviceAreas.length > 0
              ? pro.serviceAreas
              : typeof (pro.serviceAreas as any) === 'string' && (pro.serviceAreas as any).trim()
              ? [(pro.serviceAreas as any).trim()]
              : ['Kurnool City & Surrounding Areas']
            ).map((area: string, idx: number) => (
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

        {/* Customer Reviews Section */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={styles.cardTitle}>Client Reviews ({reviews.length})</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827' }}>
                  {Number(pro.ratingAvg || 5.0).toFixed(1)} / 5.0
                </Text>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>({pro.ratingCount || reviews.length} ratings)</Text>
              </View>
            </View>
            {!isOwner && (
              <TouchableOpacity
                onPress={() => setReviewModalVisible(true)}
                style={{ backgroundColor: '#0D9488', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="star-outline" size={14} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>+ Rate & Review</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews.length === 0 ? (
            <View style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#CBD5E1" />
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>
                No reviews yet. Be the first client to leave a review!
              </Text>
            </View>
          ) : (
            reviews.map((rev) => (
              <View key={rev.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E293B' }}>{rev.userName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= rev.rating ? 'star' : 'star-outline'}
                        size={12}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 17 }}>{rev.comment}</Text>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

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

        {/* Third-Party Professional Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
          <Text style={styles.disclaimerText}>
            Disclaimer: Rates, credentials, and services are offered directly by this independent professional. Kurnool One is a discovery platform and does not employ or guarantee individual service quality. Users should verify credentials independently.
          </Text>
        </View>

        {/* Report Professional Link */}
        <TouchableOpacity
          onPress={() => setReportModalVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, paddingVertical: 10 }}
        >
          <Ionicons name="flag-outline" size={14} color="#EF4444" />
          <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>Report profile or conduct issue with this professional</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rate & Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide" onRequestClose={() => setReviewModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#0F172A' }}>Rate & Review Professional</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 10 }}>
              How was your service experience with <Text style={{ fontWeight: '800', color: '#0F172A' }}>{pro?.fullName}</Text>?
            </Text>

            {/* Interactive 5-Star Rating Picker */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setUserRating(s)} style={{ padding: 4 }}>
                  <Ionicons
                    name={s <= userRating ? 'star' : 'star-outline'}
                    size={36}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={{
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                color: '#0F172A',
                height: 90,
                textAlignVertical: 'top',
                marginBottom: 16,
              }}
              placeholder="Share feedback on punctuality, pricing, and service quality..."
              placeholderTextColor="#94A3B8"
              multiline
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={submittingReview}
              style={{
                backgroundColor: '#0D9488',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      {pro && (
        <ReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          targetId={pro.id}
          targetTitle={pro.fullName}
          reportType="professional"
        />
      )}
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
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14,
    marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  disclaimerText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
  ownerManageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginVertical: 12,
    width: '100%',
  },
  ownerManageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  ownerManageIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerManageTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  ownerManageSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 15,
  },
  ownerManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  ownerManageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity,
  Linking, Alert, Modal, TextInput, ActivityIndicator, Share, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchBusinessById, fetchBusinessReviews, addBusinessReview, trackBusinessInteraction,
  BusinessItem, BusinessReview,
} from '../services/directoryService';
import { auth } from '../config/firebase';

export default function BusinessDetailScreen({ route, navigation }: any) {
  const { businessId } = route.params || {};
  const { language } = useLanguage();

  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const data = await fetchBusinessById(businessId);
      setBusiness(data);
      if (businessId) {
        trackBusinessInteraction(businessId, 'view');
        const revs = await fetchBusinessReviews(businessId);
        setReviews(revs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (business?.phone) {
      if (businessId) trackBusinessInteraction(businessId, 'call');
      Linking.openURL(`tel:${business.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (business?.whatsapp) {
      if (businessId) trackBusinessInteraction(businessId, 'whatsapp');
      const clean = business.whatsapp.replace(/[^0-9]/g, '');
      const waNumber = clean.startsWith('91') ? clean : `91${clean}`;
      Linking.openURL(`https://wa.me/${waNumber}?text=Hello, I found your listing on Kurnool One.`).catch(() => {});
    }
  };

  const handleDirections = () => {
    if (business?.googleMapsUrl) {
      Linking.openURL(business.googleMapsUrl).catch(() => {});
    } else if (business?.latitude && business?.longitude) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`).catch(() => {});
    } else if (business?.address) {
      const query = encodeURIComponent(`${business.name_en}, ${business.address}, Kurnool`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
    }
  };

  const handleWebsite = () => {
    if (business?.website) {
      let url = business.website.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      Linking.openURL(url).catch(() => {
        Alert.alert('Unable to open link', 'Please verify the website URL.');
      });
    }
  };

  const handleShare = async () => {
    if (!business) return;
    try {
      await Share.share({
        message: `Check out ${business.name_en} on Kurnool One! \nAddress: ${business.address}\nPhone: ${business.phone}\nDownload Kurnool One App.`,
      });
    } catch {}
  };

  const handleSubmitReview = async () => {
    if (!auth.currentUser) {
      Alert.alert('Sign in required', 'Please sign in to rate and review this business.');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Review Required', 'Please write a brief comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      await addBusinessReview(businessId, userRating, reviewComment);
      Alert.alert('Thank You', 'Your review has been submitted successfully!');
      setReviewComment('');
      setReviewModalVisible(false);
      loadBusiness();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: '#6B7280', fontSize: 16 }}>Listing not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {language === 'en' ? business.name_en : (business.name_te || business.name_en)}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.navBtn}>
          <Ionicons name="share-social-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        {business.images && business.images.length > 0 ? (
          <Image source={{ uri: business.images[0] }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="storefront-outline" size={60} color="#2563EB" />
          </View>
        )}

        <View style={styles.body}>
          {/* Header & Badges */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {business.verificationBadge === 'verified_business' && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#15803D" />
                <Text style={styles.verifiedText}>Verified Business</Text>
              </View>
            )}
            {business.tier === 'featured' && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>FEATURED</Text>
              </View>
            )}
            {business.priceRange && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{business.priceRange}</Text>
              </View>
            )}
          </View>

          <Text style={styles.titleEn}>{business.name_en}</Text>
          {business.name_te ? <Text style={styles.titleTe}>{business.name_te}</Text> : null}

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(business.ratingAvg) ? 'star' : 'star-outline'}
                  size={16}
                  color="#F59E0B"
                />
              ))}
            </View>
            <Text style={styles.ratingScore}>{business.ratingAvg.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({business.ratingCount} reviews)</Text>
          </View>

          {/* Big Action Buttons */}
          <View style={styles.actionButtonsGrid}>
            <TouchableOpacity onPress={handleCall} style={styles.actionBtnCall}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>

            {business.whatsapp ? (
              <TouchableOpacity onPress={handleWhatsApp} style={styles.actionBtnWa}>
                <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity onPress={handleDirections} style={styles.actionBtnDir}>
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Map</Text>
            </TouchableOpacity>

            {business.website ? (
              <TouchableOpacity onPress={handleWebsite} style={styles.actionBtnWeb}>
                <Ionicons name="globe-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Website</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Information Cards */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Business Info</Text>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color="#2563EB" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{business.address}</Text>
                {business.landmark ? (
                  <Text style={styles.infoSub}>Landmark: {business.landmark}</Text>
                ) : null}
              </View>
            </View>

            {business.timing ? (
              <View style={[styles.infoRow, { marginTop: 14 }]}>
                <Ionicons name="time" size={18} color="#2563EB" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>Working Hours</Text>
                  <Text style={styles.infoValue}>{business.timing}</Text>
                </View>
              </View>
            ) : null}

            {business.website ? (
              <TouchableOpacity onPress={handleWebsite} style={[styles.infoRow, { marginTop: 14 }]}>
                <Ionicons name="globe-outline" size={18} color="#7C3AED" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={[styles.infoValue, { color: '#2563EB', textDecorationLine: 'underline' }]}>
                    {business.website} ↗
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {business.googleMapsUrl ? (
              <TouchableOpacity onPress={handleDirections} style={[styles.infoRow, { marginTop: 14 }]}>
                <Ionicons name="map-outline" size={18} color="#0284C7" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>Google Maps Location</Text>
                  <Text style={[styles.infoValue, { color: '#0284C7' }]}>
                    Open in Google Maps App ↗
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* About / Description */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>
              {language === 'en' ? business.description_en : (business.description_te || business.description_en)}
            </Text>
          </View>

          {/* Amenities */}
          {business.amenities && business.amenities.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Amenities & Features</Text>
              <View style={styles.amenitiesWrap}>
                {business.amenities.map((item, idx) => (
                  <View key={idx} style={styles.amenityChip}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#15803D" />
                    <Text style={styles.amenityText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews & Ratings Section */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Customer Reviews ({reviews.length})</Text>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(true)}
                style={styles.writeReviewBtn}
              >
                <Ionicons name="create-outline" size={14} color="#2563EB" />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>
                No reviews yet. Be the first customer to leave a review!
              </Text>
            ) : (
              reviews.map(rev => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.reviewerName}>{rev.userName}</Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons
                          key={s}
                          name={s <= rev.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                  <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Rate & Review</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Select Star Rating:</Text>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons
                    name={star <= userRating ? 'star' : 'star-outline'}
                    size={36}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience with this business..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={submittingReview}
              style={styles.submitReviewBtn}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitReviewText}>Post Review</Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: 16, fontWeight: '800', color: '#111827', flex: 1, marginHorizontal: 10 },
  coverImage: { width: '100%', height: 220 },
  body: { padding: 16, paddingBottom: 60 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 11, fontWeight: '800', color: '#15803D' },
  featuredBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: { fontSize: 10, fontWeight: '900', color: '#B45309' },
  priceBadge: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  priceText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  titleEn: { fontSize: 22, fontWeight: '900', color: '#111827' },
  titleTe: { fontSize: 16, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  ratingScore: { fontSize: 14, fontWeight: '800', color: '#111827' },
  ratingCount: { fontSize: 12, color: '#6B7280' },
  actionButtonsGrid: {
    flexDirection: 'row', gap: 10, marginVertical: 18,
  },
  actionBtnCall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 14,
  },
  actionBtnWa: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#16A34A', paddingVertical: 12, borderRadius: 14,
  },
  actionBtnDir: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#0284C7', paddingVertical: 12, borderRadius: 14,
  },
  actionBtnWeb: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 14,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 2 },
  infoSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  descriptionText: { fontSize: 14, lineHeight: 22, color: '#4B5563' },
  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7',
  },
  amenityText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  writeReviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10,
  },
  writeReviewText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  reviewItem: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
    marginTop: 10,
  },
  reviewerName: { fontSize: 13, fontWeight: '800', color: '#111827' },
  reviewComment: { fontSize: 13, color: '#4B5563', marginTop: 4, lineHeight: 18 },
  reviewDate: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  reviewInput: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14, padding: 14, fontSize: 14, color: '#111827',
    marginBottom: 16, minHeight: 90,
  },
  submitReviewBtn: {
    backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14,
    alignItems: 'center',
  },
  submitReviewText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

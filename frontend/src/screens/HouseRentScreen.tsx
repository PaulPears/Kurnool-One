import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, Linking, ActivityIndicator, StatusBar, StyleSheet, Modal, Share,
  TextInput, Alert, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { pickImageWithFreeStyleCrop } from '../utils/imageUploadHelper';
import {
  fetchHouseRentals,
  createHouseRental,
  deleteHouseRental,
  updateHouseRental,
  uploadRentalImage,
  HouseRentalItem,
} from '../services/directoryService';

const BHK_FILTERS = ['All', '1 RK', '1 BHK', '2 BHK', '3 BHK', 'Commercial'];

export default function HouseRentScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [selectedBhk, setSelectedBhk] = useState('All');
  const [rentals, setRentals] = useState<HouseRentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Rental Detail Modal with Swipeable Gallery
  const [selectedRental, setSelectedRental] = useState<HouseRentalItem | null>(null);
  const [activeSwipeIdx, setActiveSwipeIdx] = useState(0);

  // Full-screen Image Viewer
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Post Rental Modal State
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [posting, setPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [bhk, setBhk] = useState<'1 RK' | '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | 'Commercial'>('2 BHK');
  const [propertyType, setPropertyType] = useState('Apartment / Flat');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [tenantPreference, setTenantPreference] = useState<'Family Only' | 'Bachelors' | 'Any / All'>('Family Only');
  const [furnishing, setFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished'>('Semi-Furnished');
  const [area, setArea] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [waterFacility, setWaterFacility] = useState('24/7 Borewell + Municipal Tap');
  const [parking, setParking] = useState('Bike & Car Parking');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    loadRentals();
  }, [selectedBhk]);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const data = await fetchHouseRentals(selectedBhk);
      setRentals(data);
    } catch (err) {
      console.warn('Error loading rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch(() => { });
    }
  };

  const handleWhatsApp = (phoneNumber?: string, houseTitle?: string) => {
    if (!phoneNumber) return;
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = `Hi, I saw your rental listing "${houseTitle || 'House for Rent'}" on the Kurnool One App. Is it still available?`;
    Linking.openURL(`whatsapp://send?phone=${waNumber}&text=${encodeURIComponent(text)}`).catch(() => {
      Linking.openURL(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`).catch(() => { });
    });
  };

  const handleShare = async (item: HouseRentalItem) => {
    try {
      const appUrl = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';
      await Share.share({
        message: `🏠 *TO-LET in Kurnool: ${item.title_en}*\n💰 Rent: ₹${item.monthlyRent.toLocaleString('en-IN')}/month\n📍 Location: ${item.area}\n🏷️ ${item.bhk} • ${item.tenantPreference}\n📞 Contact Owner: ${item.ownerPhone}\n\nExplore more rental houses on Kurnool One App:\n👉 ${appUrl}`,
      });
    } catch { }
  };

  const openImageViewer = (imgs: string[], initialIdx = 0) => {
    if (imgs && imgs.length > 0) {
      setViewerImages(imgs);
      setViewerIndex(initialIdx);
      setViewerVisible(true);
    }
  };

  const handlePickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can attach up to 5 photos per rental listing.');
      return;
    }

    const pickAndAdd = async () => {
      try {
        const res = await pickImageWithFreeStyleCrop({
          title: language === 'en' ? 'Rental Property Photo' : 'అద్దె ఇంటి ఫోటో',
          message: language === 'en' ? 'Select photo source with free-style crop:' : 'ఫోటోను ఎంచుకుని మీకు కావలసినట్లు క్రాప్ చేయండి:',
        });
        if (res?.uri) {
          setImages(prev => [...prev, res.uri]);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Could not pick photo');
      }
    };

    if (images.length >= 1) {
      Alert.alert(
        language === 'en' ? `Unlock Photo #${images.length + 1}` : `ఫోటో #${images.length + 1} అన్‌లాక్ చేయండి`,
        language === 'en'
          ? `Slot #1 is free. Watch a rewarded partner video ad to unlock Photo Slot #${images.length + 1}?`
          : `1వ ఫోటో ఉచితం. ఫోటో #${images.length + 1} అన్‌లాక్ చేయడానికి వీడియో ప్రకటన చూడాలా?`,
        [
          { text: language === 'en' ? 'Cancel' : 'వద్దు', style: 'cancel' },
          { text: language === 'en' ? 'Watch Ad & Unlock' : 'ప్రకటన చూసి అన్‌లాక్ చేయండి', onPress: pickAndAdd },
        ]
      );
    } else {
      await pickAndAdd();
    }
  };

  const handleOpenPostModal = async () => {
    if (!auth.currentUser) {
      Alert.alert(
        language === 'en' ? 'Login Required' : 'లాగిన్ అవసరం',
        language === 'en'
          ? 'Please sign in to post a rental property. This protects tenant and owner security.'
          : 'ఇంటిని పోస్ట్ చేయడానికి దయచేసి లాగిన్ అవ్వండి.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('MobileFirebaseLogin') },
        ]
      );
      return;
    }
    // Pre-fill phone if available
    let userPhone = auth.currentUser.phoneNumber || '';
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.phone) userPhone = p.phone;
      }
    } catch { }
    if (userPhone && !phone) setPhone(userPhone.replace('+91', ''));
    setPostModalVisible(true);
  };

  const handleSubmitPost = async () => {
    if (!title.trim() || !monthlyRent.trim() || !area.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter Title, Monthly Rent, Locality/Area, and Contact Phone.');
      return;
    }

    const rentNum = parseInt(monthlyRent.replace(/[^0-9]/g, ''), 10);
    if (!rentNum || isNaN(rentNum)) {
      Alert.alert('Invalid Rent', 'Please enter a valid monthly rent amount in Rupees.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setPosting(true);
    try {
      let uploadedUrls: string[] = [];
      for (const uri of images) {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          uploadedUrls.push(uri);
        } else {
          const url = await uploadRentalImage(uri);
          uploadedUrls.push(url);
        }
      }

      const uid = auth.currentUser?.uid || '';
      const ownerName = auth.currentUser?.displayName || 'Property Owner';

      await createHouseRental({
        ownerUid: uid,
        ownerName,
        ownerPhone: cleanPhone,
        ownerWhatsapp: whatsapp.trim() || cleanPhone,
        title_en: title.trim(),
        bhk,
        propertyType,
        monthlyRent: rentNum,
        depositAmount: deposit ? parseInt(deposit.replace(/[^0-9]/g, ''), 10) : undefined,
        tenantPreference,
        furnishing,
        area: area.trim(),
        addressDetails: addressDetails.trim() || undefined,
        waterFacility: waterFacility.trim() || undefined,
        parking: parking.trim() || undefined,
        description: description.trim() || `${bhk} ${propertyType} available for rent in ${area.trim()}, Kurnool.`,
        images: uploadedUrls,
        status: 'available',
        postedDate: 'Just now',
      });

      Alert.alert('Success! 🏠', 'Your rental property is now live on Kurnool One.');
      setPostModalVisible(false);
      // Reset form
      setTitle('');
      setMonthlyRent('');
      setDeposit('');
      setArea('');
      setAddressDetails('');
      setDescription('');
      setImages([]);
      loadRentals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not post rental listing. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (item: HouseRentalItem) => {
    Alert.alert(
      'Delete Rental Listing',
      'Are you sure you want to remove this property listing from Kurnool One?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHouseRental(item.id);
              Alert.alert('Listing Removed');
              loadRentals();
            } catch {
              Alert.alert('Error', 'Could not delete listing.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (item: HouseRentalItem) => {
    const nextStatus = item.status === 'available' ? 'rented' : 'available';
    Alert.alert(
      item.status === 'available' ? 'Mark as Rented Out?' : 'Mark as Available?',
      item.status === 'available'
        ? 'This will inform citizens that this property has been occupied.'
        : 'This will show this listing to citizens looking for rent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateHouseRental(item.id, { status: nextStatus });
              loadRentals();
            } catch { }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>
                {language === 'en' ? 'House Rentals' : 'ఇళ్లు అద్దెకు'}
              </Text>
              <View style={styles.toLetBadge}>
                <Text style={styles.toLetBadgeText}>TO-LET</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {language === 'en' ? 'Flats, Houses & Commercial Spaces' : 'కర్నూలు నగరంలో అద్దె ఇళ్లు'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleOpenPostModal} style={styles.postBtn}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.postBtnText}>{language === 'en' ? '+ Post' : '+ పోస్ట్'}</Text>
        </TouchableOpacity>
      </View>

      {/* BHK Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {BHK_FILTERS.map(b => {
            const isSelected = selectedBhk === b;
            return (
              <TouchableOpacity
                key={b}
                onPress={() => setSelectedBhk(b)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {b}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Rentals List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>
            {language === 'en' ? 'Loading Kurnool rentals...' : 'అద్దె ఇళ్ల సమాచారం లోడ్ అవుతోంది...'}
          </Text>
        </View>
      ) : (
        <FlatList
          key="rent_grid_2"
          data={rentals}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRentals} colors={['#2563EB']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="home-outline" size={40} color="#2563EB" />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No Rentals in this Category' : 'ఈ విభాగంలో ఇళ్లు లేవు'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en'
                  ? 'Be the first to list a house for rent in Kurnool!'
                  : 'కర్నూలులో మొదటి అద్దె ఇంటిని పోస్ట్ చేయండి!'}
              </Text>
              <TouchableOpacity onPress={handleOpenPostModal} style={styles.emptyActionBtn}>
                <Text style={styles.emptyActionBtnText}>{language === 'en' ? '+ Post House for Rent' : '+ అద్దె ఇంటిని పోస్ట్ చేయండి'}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const coverPhoto = item.images && item.images.length > 0 ? item.images[0] : null;
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedRental(item);
                  setActiveSwipeIdx(0);
                }}
                style={styles.gridCard}
              >
                {/* Image Wrap */}
                <View style={styles.gridImageWrap}>
                  {coverPhoto ? (
                    <Image source={{ uri: coverPhoto }} style={styles.gridImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.gridImg, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="home" size={28} color="#2563EB" />
                    </View>
                  )}
                  {/* Rent Badge */}
                  <View style={styles.gridPriceBadge}>
                    <Text style={styles.gridPriceBadgeText}>
                      ₹{item.monthlyRent.toLocaleString('en-IN')}/mo
                    </Text>
                  </View>
                  {/* BHK Pill */}
                  <View style={styles.gridBhkPill}>
                    <Text style={styles.gridBhkPillText}>{item.bhk}</Text>
                  </View>
                  {item.status === 'rented' && (
                    <View style={styles.gridRentedOverlay}>
                      <Text style={styles.gridRentedOverlayText}>RENTED</Text>
                    </View>
                  )}
                </View>

                {/* Card Body */}
                <View style={styles.gridBody}>
                  <Text style={styles.gridTitle} numberOfLines={2}>
                    {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                  </Text>
                  <Text style={styles.gridArea} numberOfLines={1}>
                    <Ionicons name="location-outline" size={11} color="#2563EB" /> {item.area}
                  </Text>
                  <View style={styles.gridTagRow}>
                    <View style={styles.gridTenantTag}>
                      <Text style={styles.gridTenantTagText}>{item.tenantPreference}</Text>
                    </View>
                  </View>
                  <View style={styles.gridTapCue}>
                    <Text style={styles.gridTapCueText}>{language === 'en' ? 'View Details' : 'వివరాలు చూడండి'}</Text>
                    <Ionicons name="arrow-forward" size={11} color="#2563EB" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ─── RENTAL PROPERTY DETAIL MODAL WITH SWIPEABLE GALLERY ─────────── */}
      <Modal visible={!!selectedRental} animationType="slide" onRequestClose={() => setSelectedRental(null)}>
        <SafeAreaView style={styles.detailModalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          {selectedRental && (
            <>
              {/* Modal Top Header */}
              <View style={styles.detailModalHeader}>
                <TouchableOpacity onPress={() => setSelectedRental(null)} style={styles.detailBackBtn}>
                  <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.detailModalTitle} numberOfLines={1}>
                  {selectedRental.bhk} • {selectedRental.area}
                </Text>
                <TouchableOpacity onPress={() => handleShare(selectedRental)} style={styles.detailShareBtn}>
                  <Ionicons name="share-social-outline" size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Swipeable Photo Gallery (Swipe Left / Right) */}
                {selectedRental.images && selectedRental.images.length > 0 ? (
                  <View style={styles.galleryContainer}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(e) => {
                        const width = e.nativeEvent.layoutMeasurement.width;
                        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                        setActiveSwipeIdx(idx);
                      }}
                    >
                      {selectedRental.images.map((imgUri, sIdx) => (
                        <TouchableOpacity
                          key={sIdx}
                          activeOpacity={0.95}
                          onPress={() => openImageViewer(selectedRental.images, sIdx)}
                        >
                          <Image
                            source={{ uri: imgUri }}
                            style={styles.gallerySlideImg}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Photo Counter Pill */}
                    <View style={styles.galleryCounterPill}>
                      <Ionicons name="images" size={12} color="#FFFFFF" />
                      <Text style={styles.galleryCounterText}>
                        {activeSwipeIdx + 1} / {selectedRental.images.length}
                      </Text>
                    </View>

                    {/* Pagination Dots */}
                    {selectedRental.images.length > 1 && (
                      <View style={styles.galleryDotsRow}>
                        {selectedRental.images.map((_, dotIdx) => (
                          <View
                            key={dotIdx}
                            style={[
                              styles.galleryDot,
                              dotIdx === activeSwipeIdx && styles.galleryDotActive,
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.galleryFallback}>
                    <Ionicons name="home" size={48} color="#94A3B8" />
                  </View>
                )}

                <View style={{ padding: 16 }}>
                  {/* Rent & Deposit Box */}
                  <View style={styles.detailPriceCard}>
                    <View>
                      <Text style={styles.detailRentAmt}>
                        ₹{selectedRental.monthlyRent.toLocaleString('en-IN')}
                        <Text style={styles.detailPerMonth}> / month</Text>
                      </Text>
                      {selectedRental.depositAmount ? (
                        <Text style={styles.detailDepositText}>
                          Security Deposit / Advance: ₹{selectedRental.depositAmount.toLocaleString('en-IN')}
                        </Text>
                      ) : null}
                    </View>
                    {selectedRental.status === 'rented' && (
                      <View style={styles.rentedBadge}>
                        <Text style={styles.rentedBadgeText}>RENTED OUT</Text>
                      </View>
                    )}
                  </View>

                  {/* Title & Locality */}
                  <Text style={styles.detailTitle}>
                    {language === 'en' ? selectedRental.title_en : (selectedRental.title_te || selectedRental.title_en)}
                  </Text>
                  <Text style={styles.detailArea}>
                    <Ionicons name="location" size={14} color="#2563EB" /> {selectedRental.area}
                  </Text>

                  {/* Specifications Grid */}
                  <Text style={styles.detailSectionTitle}>Property Specifications</Text>
                  <View style={styles.specsGrid}>
                    <View style={styles.specBox}>
                      <Ionicons name="bed-outline" size={18} color="#2563EB" />
                      <Text style={styles.specBoxLabel}>BHK Type</Text>
                      <Text style={styles.specBoxVal}>{selectedRental.bhk}</Text>
                    </View>
                    <View style={styles.specBox}>
                      <Ionicons name="people-outline" size={18} color="#059669" />
                      <Text style={styles.specBoxLabel}>Preferred Tenant</Text>
                      <Text style={styles.specBoxVal}>{selectedRental.tenantPreference}</Text>
                    </View>
                    <View style={styles.specBox}>
                      <Ionicons name="sparkles-outline" size={18} color="#7C3AED" />
                      <Text style={styles.specBoxLabel}>Furnishing</Text>
                      <Text style={styles.specBoxVal}>{selectedRental.furnishing}</Text>
                    </View>
                    <View style={styles.specBox}>
                      <Ionicons name="business-outline" size={18} color="#D97706" />
                      <Text style={styles.specBoxLabel}>Property Type</Text>
                      <Text style={styles.specBoxVal}>{selectedRental.propertyType}</Text>
                    </View>
                    <View style={styles.specBox}>
                      <Ionicons name="water-outline" size={18} color="#0284C7" />
                      <Text style={styles.specBoxLabel}>Water Supply</Text>
                      <Text style={styles.specBoxVal}>{selectedRental.waterFacility || 'Available'}</Text>
                    </View>
                    <View style={styles.specBox}>
                      <Ionicons name="car-outline" size={18} color="#16A34A" />
                      <Text style={styles.specBoxLabel}>Parking</Text>
                      <Text style={styles.specBoxVal}>{selectedRental.parking || 'Available'}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  {selectedRental.description ? (
                    <>
                      <Text style={styles.detailSectionTitle}>Description</Text>
                      <Text style={styles.detailDesc}>{selectedRental.description}</Text>
                    </>
                  ) : null}

                  {/* Address */}
                  {selectedRental.addressDetails ? (
                    <>
                      <Text style={styles.detailSectionTitle}>Address Details</Text>
                      <Text style={styles.detailAddress}>{selectedRental.addressDetails}</Text>
                    </>
                  ) : null}

                  {/* Owner Controls */}
                  {auth.currentUser?.uid && selectedRental.ownerUid === auth.currentUser.uid && (
                    <View style={styles.ownerControlsCard}>
                      <Text style={styles.ownerControlsTitle}>Owner Management Controls</Text>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            handleToggleStatus(selectedRental);
                            setSelectedRental(null);
                          }}
                          style={[styles.ownerBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                        >
                          <Ionicons name="swap-horizontal" size={15} color="#2563EB" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#1D4ED8' }}>
                            {selectedRental.status === 'available' ? 'Mark Rented' : 'Mark Available'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            handleDelete(selectedRental);
                            setSelectedRental(null);
                          }}
                          style={[styles.ownerBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                        >
                          <Ionicons name="trash-outline" size={15} color="#DC2626" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Sticky Bottom Action Buttons */}
              <View style={styles.detailBottomBar}>
                <TouchableOpacity
                  onPress={() => handleCall(selectedRental.ownerPhone)}
                  style={styles.detailCallBtn}
                >
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                  <Text style={styles.detailCallBtnText}>Call Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleWhatsApp(selectedRental.ownerWhatsapp || selectedRental.ownerPhone, selectedRental.title_en)}
                  style={styles.detailWaBtn}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                  <Text style={styles.detailWaBtnText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Post Rental Modal */}
      <Modal visible={postModalVisible} animationType="slide" onRequestClose={() => setPostModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {language === 'en' ? 'Post House for Rent' : 'అద్దె ఇంటిని పోస్ట్ చేయండి'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {language === 'en' ? 'Reach verified tenants in Kurnool' : 'కర్నూలు పౌరులకు అద్దెకు ఇవ్వండి'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setPostModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* BHK Selection */}
            <Text style={styles.label}>BHK Configuration *</Text>
            <View style={styles.optionRow}>
              {(['1 RK', '1 BHK', '2 BHK', '3 BHK', 'Commercial'] as const).map(b => (
                <TouchableOpacity
                  key={b}
                  onPress={() => setBhk(b)}
                  style={[styles.optionPill, bhk === b && styles.optionPillActive]}
                >
                  <Text style={[styles.optionPillText, bhk === b && styles.optionPillTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Property Type */}
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.optionRow}>
              {['Apartment / Flat', 'Independent House', 'Commercial Space', 'Single Room / RK'].map(pt => (
                <TouchableOpacity
                  key={pt}
                  onPress={() => setPropertyType(pt)}
                  style={[styles.optionPill, propertyType === pt && styles.optionPillActive]}
                >
                  <Text style={[styles.optionPillText, propertyType === pt && styles.optionPillTextActive]}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <Text style={styles.label}>Listing Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2 BHK East Facing Flat with Car Parking"
              placeholderTextColor="#94A3B8"
              maxLength={80}
              value={title}
              onChangeText={setTitle}
            />

            {/* Rent & Deposit */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Monthly Rent (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={8}
                  value={monthlyRent}
                  onChangeText={setMonthlyRent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Security Deposit (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 25000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={8}
                  value={deposit}
                  onChangeText={setDeposit}
                />
              </View>
            </View>

            {/* Tenant Preference */}
            <Text style={styles.label}>Preferred Tenant</Text>
            <View style={styles.optionRow}>
              {(['Family Only', 'Bachelors', 'Any / All'] as const).map(tp => (
                <TouchableOpacity
                  key={tp}
                  onPress={() => setTenantPreference(tp)}
                  style={[styles.optionPill, tenantPreference === tp && styles.optionPillActive]}
                >
                  <Text style={[styles.optionPillText, tenantPreference === tp && styles.optionPillTextActive]}>{tp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Furnishing */}
            <Text style={styles.label}>Furnishing Status</Text>
            <View style={styles.optionRow}>
              {(['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFurnishing(f)}
                  style={[styles.optionPill, furnishing === f && styles.optionPillActive]}
                >
                  <Text style={[styles.optionPillText, furnishing === f && styles.optionPillTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Locality in Kurnool */}
            <Text style={styles.label}>Locality / Area in Kurnool *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Gayatri Estate, B Camp, Joharapuram, etc."
              placeholderTextColor="#94A3B8"
              maxLength={60}
              value={area}
              onChangeText={setArea}
            />

            {/* Address Details & Landmark */}
            <Text style={styles.label}>Address / Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Venkateswara Swamy Temple, 2nd Cross"
              placeholderTextColor="#94A3B8"
              maxLength={150}
              value={addressDetails}
              onChangeText={setAddressDetails}
            />

            {/* Contact Phone & WhatsApp */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Contact Phone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>WhatsApp Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                />
              </View>
            </View>

            {/* Water & Parking */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Water Supply</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 24/7 Borewell"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                  value={waterFacility}
                  onChangeText={setWaterFacility}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Parking</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Car & Bike"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                  value={parking}
                  onChangeText={setParking}
                />
              </View>
            </View>

            {/* Description */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Description & Rules</Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>{description.length}/500</Text>
            </View>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top', marginTop: 4 }]}
              placeholder="Mention rules, flooring, balcony, maintenance charges, etc."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={500}
              value={description}
              onChangeText={setDescription}
            />

            {/* Photos (1 Free + 4 Rewarded Video Ad Slots) */}
            <Text style={styles.label}>
              {language === 'en' ? 'Property Photos (1 Free + 4 Rewarded Ad Slots)' : 'ఇంటి ఫోటోలు (1 ఉచితం + 4 యాడ్ స్లాట్లు)'}
            </Text>
            <View style={styles.photoPickerRow}>
              {images.map((imgUri, idx) => (
                <View key={idx} style={styles.photoThumbWrap}>
                  <Image source={{ uri: imgUri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    style={styles.photoDeleteBtn}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity onPress={handlePickImages} style={styles.addPhotoBtn}>
                  <Ionicons name="camera-outline" size={24} color="#2563EB" />
                  <Text style={styles.addPhotoText}>
                    {images.length === 0 ? '+ Add Photo' : `+ Unlock #${images.length + 1}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitPost}
              disabled={posting}
              style={[styles.submitPostBtn, posting && { opacity: 0.6 }]}
            >
              {posting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitPostBtnText}>Publish Rental Listing</Text>
                </>
              )}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Full-Screen Image Viewer */}
      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <SafeAreaView style={styles.viewerOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerCounter}>
              {viewerImages.length > 1 ? `${viewerIndex + 1} / ${viewerImages.length}` : '1 Photo'}
            </Text>
            <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.viewerCloseBtn}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.viewerCenter}>
            {viewerImages[viewerIndex] && (
              <Image source={{ uri: viewerImages[viewerIndex] }} style={styles.viewerMainImg} resizeMode="contain" />
            )}
            {viewerImages.length > 1 && (
              <View style={styles.viewerArrowsRow}>
                <TouchableOpacity
                  disabled={viewerIndex === 0}
                  onPress={() => setViewerIndex(prev => Math.max(0, prev - 1))}
                  style={[styles.viewerArrowBtn, viewerIndex === 0 && { opacity: 0.3 }]}
                >
                  <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={viewerIndex === viewerImages.length - 1}
                  onPress={() => setViewerIndex(prev => Math.min(viewerImages.length - 1, prev + 1))}
                  style={[styles.viewerArrowBtn, viewerIndex === viewerImages.length - 1 && { opacity: 0.3 }]}
                >
                  <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  toLetBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  toLetBadgeText: { fontSize: 9, fontWeight: '900', color: '#2563EB' },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  postBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  filterChipTextActive: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyActionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imgWrap: { width: '100%', height: 180, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  imgPlaceholder: { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  bhkOverlayPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bhkOverlayText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.3 },
  cardBody: { padding: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  rentAmount: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  perMonth: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  depositText: { fontSize: 11, color: '#64748B', marginTop: 1 },
  tenantPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tenantPillText: { fontSize: 10, fontWeight: '800', color: '#15803D' },
  rentedBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rentedBadgeText: { fontSize: 9, fontWeight: '900', color: '#DC2626' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  metaArea: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  specChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specChipText: { fontSize: 10, color: '#334155', fontWeight: '600' },
  descText: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ownerName: { fontSize: 11, fontWeight: '700', color: '#334155' },
  postedDate: { fontSize: 10, color: '#94A3B8' },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  waBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  shareBtn: {
    padding: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 7,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  closeBtn: { padding: 4 },
  modalScroll: { flex: 1, padding: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionPillActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionPillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  optionPillTextActive: { color: '#FFFFFF' },
  photoPickerRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  photoThumbWrap: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { fontSize: 10, fontWeight: '700', color: '#2563EB', marginTop: 2 },
  submitPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  submitPostBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  viewerOverlay: { flex: 1, backgroundColor: '#000000' },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewerCounter: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  viewerCloseBtn: { padding: 4 },
  viewerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewerMainImg: { width: '100%', height: '80%' },
  viewerArrowsRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  viewerArrowBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 2-Column Compact Grid Styles (Matching Kurnool Bazaar)
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gridImageWrap: {
    width: '100%',
    height: 125,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  gridPriceBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridPriceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  gridBhkPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridBhkPillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  gridRentedOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridRentedOverlayText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  gridBody: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
  },
  gridArea: {
    fontSize: 10.5,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 4,
  },
  gridTagRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  gridTenantTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  gridTenantTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  gridTapCue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  gridTapCueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  // Detail Modal & Swipe Gallery Styles
  detailModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailBackBtn: { padding: 4 },
  detailShareBtn: { padding: 4 },
  detailModalTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  galleryContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  gallerySlideImg: {
    width: 390,
    height: 250,
  },
  galleryFallback: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryCounterPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  galleryDotsRow: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  galleryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  galleryDotActive: {
    backgroundColor: '#FFFFFF',
    width: 14,
  },
  detailPriceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  detailRentAmt: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  detailPerMonth: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  detailDepositText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    marginTop: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 24,
  },
  detailArea: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
    marginBottom: 14,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
  },
  specBoxVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  detailDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  detailAddress: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  ownerControlsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
  },
  ownerControlsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  ownerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
  },
  detailCallBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  detailWaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
  },
  detailWaBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

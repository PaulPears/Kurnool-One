import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, Linking, ActivityIndicator, StatusBar, StyleSheet, Modal, Share,
  TextInput, Alert, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { pickImageWithFreeStyleCrop } from '../utils/imageUploadHelper';
import {
  fetchOffers,
  fetchEvents,
  fetchMarketplaceItems,
  createMarketplaceItem,
  updateMarketplaceItem,
  deleteMarketplaceItem,
  uploadOfferImage,
  OfferItem,
  EventItem,
  MarketplaceItem,
} from '../services/directoryService';

export const DEAL_FILTER_CATEGORIES = [
  { id: 'all', label_en: 'All Deals', label_te: 'అన్ని ఆఫర్లు', icon: 'flame' },
  { id: 'restaurants_dining', label_en: 'Restaurants', label_te: 'రెస్టారెంట్లు', icon: 'restaurant' },
  { id: 'cafes_bakeries', label_en: 'Cafes & Sweets', label_te: 'కేఫ్‌లు & స్వీట్స్', icon: 'cafe' },
  { id: 'clothing_fashion', label_en: 'Fashion', label_te: 'ఫ్యాషన్ & బట్టలు', icon: 'shirt' },
  { id: 'electronics_mobiles', label_en: 'Electronics', label_te: 'ఎలక్ట్రానిక్స్', icon: 'phone-portrait' },
  { id: 'supermarkets_groceries', label_en: 'Groceries', label_te: 'కిరాణా & మార్కెట్', icon: 'cart' },
  { id: 'beauty_salons', label_en: 'Beauty & Salon', label_te: 'బ్యూటీ & సెలూన్', icon: 'sparkles' },
];

export const MARKET_FILTER_CATEGORIES = [
  { id: 'all', label_en: 'All Items', label_te: 'అన్నీ' },
  { id: 'Two-Wheelers', label_en: '🏍️ Two-Wheelers', label_te: '🏍️ బైక్స్ & స్కూటర్లు' },
  { id: 'Mobiles & Tablets', label_en: '📱 Mobiles', label_te: '📱 మొబైల్స్' },
  { id: 'Home Appliances', label_en: '📺 Appliances', label_te: '📺 గృహోపకరణాలు' },
  { id: 'Properties & Plots', label_en: '🏠 Properties', label_te: '🏠 ఇళ్ళు & ప్లాట్లు' },
  { id: 'Furniture', label_en: '🛋️ Furniture', label_te: '🛋️ ఫర్నిచర్' },
  { id: 'Fashion & Personal', label_en: '👕 Others', label_te: '👕 ఇతరాలు' },
];

export interface MarketItem {
  id: string;
  title_en: string;
  title_te?: string;
  price: string;
  category: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp?: string;
  sellerUid?: string;
  area: string;
  condition: string;
  postedDate?: string;
  imageUrl?: string;
  images?: string[];
  description: string;
  status?: string;
}

const SEED_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'm1',
    title_en: 'Honda Activa 5G (Single Owner, Kurnool Reg)',
    title_te: 'హోండా యాక్టివా 5G (సింగిల్ ఓనర్, కర్నూలు)',
    price: '₹38,500',
    category: 'Two-Wheelers',
    sellerName: 'Suresh Rao',
    sellerPhone: '9848012345',
    sellerWhatsapp: '9848012345',
    area: 'Abbas Nagar, Kurnool',
    condition: 'Excellent • 24,000 KM',
    postedDate: 'Today',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Very well maintained scooter with insurance valid till Dec 2026. New rear tyre, single hand drive.',
  },
  {
    id: 'm2',
    title_en: 'Apple iPhone 13 (128GB Midnight Black)',
    title_te: 'యాపిల్ ఐఫోన్ 13 (128GB బ్లాక్)',
    price: '₹36,000',
    category: 'Mobiles & Tablets',
    sellerName: 'Imran Khan',
    sellerPhone: '9876543210',
    sellerWhatsapp: '9876543210',
    area: 'Birla Compound, Kurnool',
    condition: '87% Battery • Bill & Box',
    postedDate: 'Yesterday',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Scratchless condition with original Apple adapter, bill, and box. Screen guard installed.',
  },
  {
    id: 'm3',
    title_en: 'Godrej 260L Double Door Refrigerator',
    title_te: 'గోద్రెజ్ 260L డబుల్ డోర్ ఫ్రిజ్',
    price: '₹11,500',
    category: 'Home Appliances',
    sellerName: 'Venkatesh M.',
    sellerPhone: '9440112233',
    sellerWhatsapp: '9440112233',
    area: 'B Camp, Kurnool',
    condition: '2 Years Used • Mint',
    postedDate: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Selling due to relocation. 3-star power rating, super chilling, perfectly clean and scratch-free.',
  },
  {
    id: 'm4',
    title_en: '2 BHK Independent House for Immediate Sale',
    title_te: '2 BHK ఇండిపెండెంట్ ఇల్లు అమ్మకానికి',
    price: '₹46,00,000',
    category: 'Properties & Plots',
    sellerName: 'Lakshmi Narayana',
    sellerPhone: '9849200001',
    sellerWhatsapp: '9849200001',
    area: 'Joharapuram Road, Kurnool',
    condition: '150 Sq.Yds • East Face',
    postedDate: '3 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Gram Panchayat approved, 30ft road, clear title with Borewell + Municipal tap connection.',
  },
  {
    id: 'm5',
    title_en: 'Solid Teak Wood 6-Seater Dining Table',
    title_te: 'టేకు చెక్క 6-సీటర్ డైనింగ్ టేబుల్',
    price: '₹15,000',
    category: 'Furniture',
    sellerName: 'Anand Kumar',
    sellerPhone: '9123456789',
    sellerWhatsapp: '9123456789',
    area: 'Nandyal Checkpost, Kurnool',
    condition: 'Solid Teak • 6 Chairs',
    postedDate: '4 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Pure original teak wood dining table with glass top and 6 cushioned matching chairs.',
  },
];

export default function OffersScreen({ route, navigation }: any) {
  const { language } = useLanguage();
  const initialTab = route?.params?.initialTab;
  const [activeTab, setActiveTab] = useState<'offers' | 'marketplace' | 'events'>(
    initialTab === 'marketplace' ? 'marketplace' : initialTab === 'events' ? 'events' : 'offers'
  );

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(SEED_MARKET_ITEMS);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDealCategory, setSelectedDealCategory] = useState('all');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState('all');

  const handleToggleSold = async (item: MarketItem) => {
    const isCurrentlySold = item.status === 'sold';
    const newStatus: 'active' | 'sold' = isCurrentlySold ? 'active' : 'sold';
    try {
      await updateMarketplaceItem(item.id, { status: newStatus });
      setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
      Alert.alert(
        newStatus === 'sold'
          ? (language === 'en' ? 'Item Marked as SOLD' : 'వస్తువు అమ్ముడైంది')
          : (language === 'en' ? 'Item Marked as AVAILABLE' : 'వస్తువు అందుబాటులోకి వచ్చింది'),
        newStatus === 'sold'
          ? (language === 'en' ? 'Buyers will now see this item marked as 🔴 SOLD OUT.' : 'కొనుగోలుదారులకు ఇది 🔴 SOLD OUT గా కనిపిస్తుంది.')
          : (language === 'en' ? 'This item is now active and available for buyers.' : 'ఈ వస్తువు తిరిగి కొనుగోలుదారులకు అందుబాటులో ఉంది.')
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update status');
    }
  };

  const displayedOffers = selectedDealCategory === 'all'
    ? offers
    : offers.filter(o => o.category === selectedDealCategory || (selectedDealCategory === 'restaurants_dining' && (o.category === 'restaurants_cafes' || o.category === 'restaurants_dining')));

  const displayedMarketItems = selectedMarketCategory === 'all'
    ? marketItems
    : marketItems.filter(m => m.category === selectedMarketCategory || (selectedMarketCategory === 'Furniture' && m.category?.toLowerCase().includes('furniture')));

  // Marketplace Post State
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<OfferItem | null>(null);
  const [selectedMarketItem, setSelectedMarketItem] = useState<MarketItem | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Two-Wheelers');
  const [postPrice, setPostPrice] = useState('');
  const [postCondition, setPostCondition] = useState('');
  const [postArea, setPostArea] = useState('');
  const [postPhone, setPostPhone] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  // Image Viewer State
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openImageViewer = (imgs: string[], initialIdx = 0) => {
    if (imgs && imgs.length > 0) {
      setViewerImages(imgs);
      setViewerIndex(initialIdx);
      setViewerVisible(true);
    }
  };

  const handleShareMarketItem = async (item: MarketItem) => {
    try {
      const title = language === 'en' ? item.title_en : (item.title_te || item.title_en);
      const appUrl = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';
      await Share.share({
        message: `🛍️ *${title}*\n💰 Price: ${item.price}\n📍 Location: ${item.area}\n🏷️ Category: ${item.category}\n\nChat with seller & explore more listings on Kurnool One App:\n👉 Download App: ${appUrl}`,
      });
    } catch {}
  };

  const handleShareOffer = async (offer: OfferItem) => {
    try {
      const title = language === 'en' ? offer.title_en : (offer.title_te || offer.title_en);
      const appUrl = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';
      await Share.share({
        message: `🔥 *${title}*\n🏷️ ${offer.discountText} at ${offer.businessName}\n📅 ${offer.validUntil}\n\n👉 Grab this deal on Kurnool One App:\n${appUrl}`,
      });
    } catch {}
  };

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'offers') {
        const data = await fetchOffers();
        const todayStr = new Date().toISOString().split('T')[0];
        const activeOffers = data.filter(offer => {
          if (!offer.validUntil) return true;
          const offerDate = new Date(offer.validUntil).getTime();
          const todayDate = new Date(todayStr).getTime();
          if (isNaN(offerDate)) return true;
          return offerDate >= todayDate;
        });
        setOffers(activeOffers);
      } else if (activeTab === 'marketplace') {
        const liveItems = await fetchMarketplaceItems();
        if (liveItems && liveItems.length > 0) {
          // Combine live with seeds if needed or show live items
          const liveIds = new Set(liveItems.map(i => i.id));
          const filteredSeeds = SEED_MARKET_ITEMS.filter(s => !liveIds.has(s.id));
          setMarketItems([...liveItems, ...filteredSeeds]);
        } else {
          setMarketItems(SEED_MARKET_ITEMS);
        }
      } else {
        const data = await fetchEvents();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleWhatsApp = (phone?: string, title?: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      const msg = title
        ? `Hello, I saw your "${title}" listing on Kurnool One App. Is it available?`
        : `Hello, I found your offer on Kurnool One App.`;
      Linking.openURL(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`).catch(() => {});
    }
  };

  const handleOpenPostModal = async () => {
    if (!auth.currentUser) {
      Alert.alert(
        language === 'en' ? 'Sign In Required' : 'లాగిన్ అవసరం',
        language === 'en'
          ? 'Please sign in to post and sell items on Kurnool Marketplace.'
          : 'కర్నూలు మార్కెట్‌ప్లేస్‌లో వస్తువులను పోస్ట్ చేయడానికి దయచేసి లాగిన్ అవ్వండి.',
        [
          { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
          { text: language === 'en' ? 'Sign In' : 'లాగిన్', onPress: () => navigation.navigate('MobileFirebaseLogin') },
        ]
      );
      return;
    }
    setPostModalVisible(true);
  };

  const handlePickPostImage = async () => {
    if (postImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can attach up to 5 photos per listing.');
      return;
    }
    const pickImage = async () => {
      try {
        const res = await pickImageWithFreeStyleCrop({
          title: language === 'en' ? 'Classified Photo' : 'వస్తువు ఫోటో',
          message: language === 'en' ? 'Select photo source with free-style crop:' : 'ఫోటోను ఎంచుకుని మీకు కావలసినట్లు క్రాప్ చేయండి:',
        });
        if (res?.uri) {
          setPostImages(prev => [...prev, res.uri]);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Could not pick image');
      }
    };

    if (postImages.length >= 1) {
      Alert.alert(
        language === 'en' ? 'Extra Photo Slot' : 'మరిన్ని ఫోటోలు',
        language === 'en'
          ? 'Free slot used (1 photo). Watch a quick partner ad to add up to 5 photos?'
          : '1వ ఫోటో ఉచితం. మరిన్ని ఫోటోలు (5 వరకు) జోడించడానికి చిన్న ప్రకటన చూడాలా?',
        [
          { text: language === 'en' ? 'Cancel' : 'వద్దు', style: 'cancel' },
          { text: language === 'en' ? 'Watch Ad & Add' : 'చూసి జోడించండి', onPress: pickImage },
        ]
      );
    } else {
      await pickImage();
    }
  };

  const handleSubmitPost = async () => {
    if (!postTitle.trim() || !postPrice.trim() || !postPhone.trim() || !postDesc.trim()) {
      Alert.alert(
        language === 'en' ? 'Required Fields' : 'తప్పనిసరి వివరాలు',
        language === 'en'
          ? 'Please enter Title, Price, Phone number, and Item Description.'
          : 'దయచేసి శీర్షిక, ధర, ఫోన్ నంబర్ మరియు వస్తువు పూర్తి వివరాలను నమోదు చేయండి.'
      );
      return;
    }
    if (postDesc.trim().length < 15) {
      Alert.alert(
        language === 'en' ? 'Description Too Short' : 'వివరాలు అసంపూర్ణం',
        language === 'en'
          ? 'Please write at least 15 characters describing the item condition, usage, and details.'
          : 'దయచేసి వస్తువు పరిస్థితి మరియు వివరాలను కనీసం 15 అక్షరాలలో వివరించండి.'
      );
      return;
    }
    const cleanPhone = postPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setPosting(true);
    try {
      let uploaded: string[] = [];
      for (const uri of postImages) {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          uploaded.push(uri);
        } else {
          try {
            const u = await uploadOfferImage(uri);
            if (u) uploaded.push(u);
          } catch (imgErr) {
            console.warn('Image upload error:', imgErr);
          }
        }
      }
      const uid = auth.currentUser?.uid || '';
      await createMarketplaceItem({
        title_en: postTitle.trim(),
        price: postPrice.trim().startsWith('₹') ? postPrice.trim() : `₹${postPrice.trim()}`,
        category: postCategory || 'other',
        condition: postCondition.trim() || 'Used / Pre-owned',
        area: postArea.trim() || 'Kurnool City',
        sellerName: auth.currentUser?.displayName || 'Citizen Seller',
        sellerPhone: cleanPhone,
        sellerWhatsapp: cleanPhone,
        sellerUid: uid,
        description: postDesc.trim() || postTitle.trim(),
        images: uploaded,
        imageUrl: uploaded[0] || '',
        status: 'active',
      });
      Alert.alert('Success! 🛍️', 'Your item is now live on Kurnool Bazaar!');
      setPostModalVisible(false);
      setPostTitle('');
      setPostPrice('');
      setPostCondition('Used / Pre-owned');
      setPostArea('');
      setPostDesc('');
      setPostImages([]);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit post');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteMyItem = async (itemId: string) => {
    Alert.alert(
      'Remove Listing',
      'Are you sure you want to delete this listing from Kurnool Marketplace?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMarketplaceItem(itemId);
              setMarketItems(prev => prev.filter(i => i.id !== itemId));
              Alert.alert('Deleted', 'Listing removed.');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Back Navigation */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {navigation?.canGoBack && navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 2 }}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {language === 'en' ? 'Deals & Kurnool Bazaar' : 'హాట్ ఆఫర్లు & బజార్'}
            </Text>
            <Text style={styles.headerSub}>
              {language === 'en' ? 'Merchant discounts and citizen buy & sell second-hand goods' : 'స్థానిక తగ్గింపులు మరియు పౌరుల సెకండ్ హ్యాండ్ అమ్మకాలు'}
            </Text>
          </View>
        </View>
      </View>

      {/* Mode Tabs (Hot Deals & Offers, Kurnool Bazaar) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('offers')}
          style={[styles.tabBtn, activeTab === 'offers' && styles.tabBtnActive]}
        >
          <Ionicons name="flame" size={16} color={activeTab === 'offers' ? '#DC2626' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'offers' && { color: '#DC2626', fontWeight: '800' }]}>
            {language === 'en' ? 'Hot Deals & Offers' : 'హాట్ డీల్స్ & ఆఫర్లు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('marketplace')}
          style={[styles.tabBtn, activeTab === 'marketplace' && styles.tabBtnActive]}
        >
          <Ionicons name="cart" size={16} color={activeTab === 'marketplace' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'marketplace' && { color: '#059669', fontWeight: '800' }]}>
            {language === 'en' ? 'Kurnool Bazaar' : 'కర్నూలు బజార్'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Bar */}
      {activeTab === 'offers' && (
        <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {DEAL_FILTER_CATEGORIES.map(cat => {
              const isSelected = selectedDealCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedDealCategory(cat.id)}
                  style={[styles.filterChip, isSelected && styles.filterChipActiveDeals]}
                >
                  <Ionicons name={cat.icon as any} size={13} color={isSelected ? '#FFFFFF' : '#DC2626'} />
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {language === 'en' ? cat.label_en : cat.label_te}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {activeTab === 'marketplace' && (
        <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {MARKET_FILTER_CATEGORIES.map(cat => {
              const isSelected = selectedMarketCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedMarketCategory(cat.id)}
                  style={[styles.filterChip, isSelected && styles.filterChipActiveMarket]}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {language === 'en' ? cat.label_en : cat.label_te}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Content Body */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'offers' ? (
        <FlatList
          key="deals_grid_2"
          data={displayedOffers}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="pricetag-outline" size={36} color="#DC2626" />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No Active Offers Today' : 'ఈ రోజు క్రియాశీల ఆఫర్లు లేవు'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en'
                  ? 'Local shops and service pros broadcast push discounts here. Check back soon!'
                  : 'స్థానిక దుకాణాలు త్వరలో ఇక్కడ ఆఫర్లను పోస్ట్ చేస్తాయి.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const offerImages = item.images && item.images.length > 0 ? item.images : item.bannerUrl ? [item.bannerUrl] : [];
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedDeal(item)}
                style={styles.gridCard}
              >
                <View style={styles.gridImageWrap}>
                  {offerImages.length > 0 ? (
                    <Image source={{ uri: offerImages[0] }} style={styles.gridImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.gridImg, { backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="pricetag" size={28} color="#DC2626" />
                    </View>
                  )}
                  <View style={styles.gridDiscountBadge}>
                    <Text style={styles.gridDiscountBadgeText}>{item.discountText}</Text>
                  </View>
                </View>
                <View style={styles.gridBody}>
                  <Text style={styles.gridTitle} numberOfLines={2}>
                    {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                  </Text>
                  <Text style={styles.gridSub} numberOfLines={1}>
                    <Ionicons name="storefront-outline" size={11} color="#2563EB" /> {item.businessName}
                  </Text>
                  <View style={styles.gridTapCue}>
                    <Text style={styles.gridTapCueText}>{language === 'en' ? 'View Deal' : 'ఆఫర్ చూడండి'}</Text>
                    <Ionicons name="arrow-forward" size={11} color="#DC2626" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : activeTab === 'marketplace' ? (
        <FlatList
          key="market_grid_2"
          data={displayedMarketItems}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#059669']} />}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#ECFDF5', borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#065F46' }}>
                  {language === 'en' ? 'Kurnool Bazaar' : 'కర్నూలు బజార్'}
                </Text>
                <Text style={{ fontSize: 10, color: '#047857', marginTop: 1 }}>
                  {language === 'en' ? 'Buy & sell pre-owned items directly' : 'సెకండ్ హ్యాండ్ వస్తువులు కొనండి & అమ్మండి'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenPostModal}
                style={{ backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                  {language === 'en' ? '+ Sell' : '+ అమ్మండి'}
                </Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="cart-outline" size={36} color="#059669" />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No Items in this Category' : 'ఈ విభాగంలో వస్తువులు లేవు'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en'
                  ? 'Citizens and sellers list pre-owned vehicles, phones, and home items here.'
                  : 'పౌరులు తమ సెకండ్ హ్యాండ్ వస్తువులను ఇక్కడ పోస్ట్ చేస్తారు.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const itemImages = item.images && item.images.length > 0 ? item.images : item.imageUrl ? [item.imageUrl] : [];
            const isSold = item.status === 'sold';
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setSelectedMarketItem(item)}
                style={[styles.gridCard, isSold && { opacity: 0.8 }]}
              >
                <View style={styles.gridImageWrap}>
                  {itemImages.length > 0 ? (
                    <Image source={{ uri: itemImages[0] }} style={styles.gridImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.gridImg, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="cart-outline" size={28} color="#94A3B8" />
                    </View>
                  )}
                  <View style={styles.gridPriceBadge}>
                    <Text style={styles.gridPriceBadgeText}>{item.price}</Text>
                  </View>
                  {isSold && (
                    <View style={styles.soldOverlay}>
                      <View style={styles.soldOverlayBadge}>
                        <Text style={[styles.soldOverlayText, { fontSize: 11 }]}>SOLD</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.gridBody}>
                  <Text style={styles.gridTitle} numberOfLines={2}>
                    {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                  </Text>
                  <Text style={styles.gridSub} numberOfLines={1}>
                    <Ionicons name="location-outline" size={11} color="#6B7280" /> {item.area}
                  </Text>
                  <View style={styles.gridTapCue}>
                    <Text style={[styles.gridTapCueText, { color: '#059669' }]}>{language === 'en' ? 'View Details' : 'వివరాలు'}</Text>
                    <Ionicons name="arrow-forward" size={11} color="#059669" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : null}

      {/* Sticky Bottom Community Disclaimer Banner */}
      <View style={styles.stickyDisclaimerWrap}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" style={{ marginTop: 1 }} />
        <Text style={styles.stickyDisclaimerText}>
          {language === 'en'
            ? 'Independent civic platform. Deals, offers & marketplace items are posted directly by respective merchants & sellers. Kurnool One is not responsible for pricing or fulfillment.'
            : 'స్వతంత్ర వేదిక. ఆఫర్లు & మార్కెట్‌ప్లేస్ ఉత్పత్తులు సంబంధిత విక్రేతల ద్వారా పోస్ట్ చేయబడతాయి. కర్నూలు వన్ లావాదేవీలకు బాధ్యత వహించదు.'}
        </Text>
      </View>
      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <SafeAreaView style={styles.viewerOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.viewerHeader}>
            <View style={styles.viewerCounterBadge}>
              <Text style={styles.viewerCounterText}>
                {viewerImages.length > 1
                  ? `${viewerIndex + 1} / ${viewerImages.length}`
                  : '1 Photo'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setViewerVisible(false)}
              style={styles.viewerCloseBtn}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.viewerImageContainer}>
            {viewerImages[viewerIndex] ? (
              <Image
                source={{ uri: viewerImages[viewerIndex] }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ) : null}

            {viewerImages.length > 1 && (
              <View style={styles.viewerNavRow}>
                <TouchableOpacity
                  disabled={viewerIndex === 0}
                  onPress={() => setViewerIndex(prev => Math.max(0, prev - 1))}
                  style={[styles.viewerNavBtn, viewerIndex === 0 && { opacity: 0.3 }]}
                >
                  <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={viewerIndex === viewerImages.length - 1}
                  onPress={() => setViewerIndex(prev => Math.min(viewerImages.length - 1, prev + 1))}
                  style={[styles.viewerNavBtn, viewerIndex === viewerImages.length - 1 && { opacity: 0.3 }]}
                >
                  <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Deal Details Modal */}
      <Modal
        visible={!!selectedDeal}
        animationType="slide"
        onRequestClose={() => setSelectedDeal(null)}
      >
        {selectedDeal && (
          <SafeAreaView style={styles.detailsModalContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.detailsModalHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.detailsModalTitle} numberOfLines={1}>
                  {selectedDeal.businessName}
                </Text>
                <Text style={styles.detailsModalSub}>
                  {language === 'en' ? 'Hot Deal Details' : 'ఆఫర్ పూర్తి వివరాలు'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDeal(null)}
                style={styles.detailsModalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {(() => {
                const dealImages = selectedDeal.images && selectedDeal.images.length > 0
                  ? selectedDeal.images
                  : selectedDeal.bannerUrl ? [selectedDeal.bannerUrl] : [];
                if (dealImages.length === 0) return null;
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openImageViewer(dealImages)}
                    style={styles.detailsModalImageWrap}
                  >
                    <Image source={{ uri: dealImages[0] }} style={styles.detailsModalImage} resizeMode="cover" />
                    <View style={styles.imageZoomBadge}>
                      <Ionicons name="scan-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.imageZoomBadgeText}>
                        {dealImages.length > 1 ? `${dealImages.length} Photos (Tap to Zoom)` : 'Tap to Zoom'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })()}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 8 }}>
                <View style={styles.gridDiscountBadge}>
                  <Text style={styles.gridDiscountBadgeText}>{selectedDeal.discountText}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                  {language === 'en' ? `Valid until: ${selectedDeal.validUntil}` : `చెల్లుబాటు: ${selectedDeal.validUntil}`}
                </Text>
              </View>

              <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 4 }}>
                {language === 'en' ? selectedDeal.title_en : (selectedDeal.title_te || selectedDeal.title_en)}
              </Text>

              <Text style={{ fontSize: 14, fontWeight: '700', color: '#2563EB', marginTop: 4 }}>
                <Ionicons name="storefront-outline" size={14} color="#2563EB" /> {selectedDeal.businessName}
              </Text>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.detailsSectionTitle}>{language === 'en' ? 'Offer Description' : 'ఆఫర్ వివరణ'}</Text>
                <Text style={styles.detailsDescText}>
                  {language === 'en' ? selectedDeal.description_en : (selectedDeal.description_te || selectedDeal.description_en)}
                </Text>
              </View>

              {/* Native Advanced Ad Container */}
              <View style={styles.nativeAdBox}>
                <View style={styles.nativeAdPill}>
                  <Text style={styles.nativeAdPillText}>SPONSORED</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="sparkles" size={24} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nativeAdTitle}>Promote Your Kurnool Business Here</Text>
                    <Text style={styles.nativeAdDesc}>Reach 25,000+ Kurnool citizens daily with Native Ads.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={styles.modalStickyBottom}>
              <TouchableOpacity
                onPress={() => handleCall(selectedDeal.phone)}
                style={styles.stickyBtnCall}
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={styles.stickyBtnTextCall}>{language === 'en' ? 'Call Merchant' : 'కాల్ చేయండి'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleWhatsApp(selectedDeal.phone, selectedDeal.title_en)}
                style={styles.stickyBtnWa}
              >
                <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
                <Text style={styles.stickyBtnTextWa}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* Marketplace Item Details Modal */}
      <Modal
        visible={!!selectedMarketItem}
        animationType="slide"
        onRequestClose={() => setSelectedMarketItem(null)}
      >
        {selectedMarketItem && (
          <SafeAreaView style={styles.detailsModalContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.detailsModalHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.detailsModalTitle} numberOfLines={1}>
                  {language === 'en' ? selectedMarketItem.title_en : (selectedMarketItem.title_te || selectedMarketItem.title_en)}
                </Text>
                <Text style={styles.detailsModalSub}>
                  {language === 'en' ? 'Classified Item Full Details' : 'వస్తువు పూర్తి వివరాలు'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMarketItem(null)}
                style={styles.detailsModalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {(() => {
                const itemImages = selectedMarketItem.images && selectedMarketItem.images.length > 0
                  ? selectedMarketItem.images
                  : selectedMarketItem.imageUrl ? [selectedMarketItem.imageUrl] : [];
                if (itemImages.length === 0) return null;
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openImageViewer(itemImages)}
                    style={styles.detailsModalImageWrap}
                  >
                    <Image source={{ uri: itemImages[0] }} style={styles.detailsModalImage} resizeMode="cover" />
                    {selectedMarketItem.status === 'sold' && (
                      <View style={styles.soldOverlay}>
                        <View style={styles.soldOverlayBadge}>
                          <Text style={styles.soldOverlayText}>🔴 SOLD OUT</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.imageZoomBadge}>
                      <Ionicons name="scan-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.imageZoomBadgeText}>
                        {itemImages.length > 1 ? `${itemImages.length} Photos (Tap to Zoom)` : 'Tap to Zoom'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })()}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 8 }}>
                <View style={[styles.gridPriceBadge, { paddingHorizontal: 12, paddingVertical: 6 }]}>
                  <Text style={[styles.gridPriceBadgeText, { fontSize: 18 }]}>{selectedMarketItem.price}</Text>
                </View>
                <View style={styles.marketCatPill}>
                  <Text style={[styles.marketCatText, { fontSize: 11 }]}>{selectedMarketItem.category}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 4 }}>
                {language === 'en' ? selectedMarketItem.title_en : (selectedMarketItem.title_te || selectedMarketItem.title_en)}
              </Text>

              <View style={[styles.marketMetaRow, { marginTop: 8 }]}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={[styles.marketMetaText, { fontSize: 13 }]}>{selectedMarketItem.area}</Text>
                <Text style={{ color: '#D1D5DB' }}>•</Text>
                <Text style={[styles.marketMetaText, { fontSize: 13 }]}>{selectedMarketItem.condition}</Text>
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.detailsSectionTitle}>{language === 'en' ? 'Item Description' : 'వస్తువు వివరణ'}</Text>
                <Text style={styles.detailsDescText}>{selectedMarketItem.description}</Text>
              </View>

              <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>
                  {language === 'en' ? 'Seller Name' : 'విక్రేత పేరు'}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B', marginTop: 2 }}>
                  {selectedMarketItem.sellerName}
                </Text>
              </View>

              {selectedMarketItem.sellerUid && auth.currentUser?.uid && selectedMarketItem.sellerUid === auth.currentUser.uid && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => {
                      handleToggleSold(selectedMarketItem);
                      setSelectedMarketItem(null);
                    }}
                    style={[styles.soldToggleBtn, selectedMarketItem.status === 'sold' ? styles.soldToggleBtnReactivate : styles.soldToggleBtnMark, { flex: 1, paddingVertical: 10, justifyContent: 'center' }]}
                  >
                    <Ionicons name={selectedMarketItem.status === 'sold' ? 'refresh-outline' : 'checkmark-done'} size={14} color="#FFFFFF" />
                    <Text style={styles.soldToggleText}>
                      {selectedMarketItem.status === 'sold' ? 'Reactivate as Available' : 'Mark as Sold'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleDeleteMyItem(selectedMarketItem.id);
                      setSelectedMarketItem(null);
                    }}
                    style={{ paddingHorizontal: 16, backgroundColor: '#FEE2E2', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Native Advanced Ad Container */}
              <View style={styles.nativeAdBox}>
                <View style={styles.nativeAdPill}>
                  <Text style={styles.nativeAdPillText}>SPONSORED</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="megaphone" size={22} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nativeAdTitle}>Verified Shifting & Delivery in Kurnool</Text>
                    <Text style={styles.nativeAdDesc}>Doorstep pickup, packaging & transport service across Kurnool.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            {selectedMarketItem.status !== 'sold' ? (
              <View style={styles.modalStickyBottom}>
                <TouchableOpacity
                  onPress={() => handleCall(selectedMarketItem.sellerPhone)}
                  style={styles.stickyBtnCall}
                >
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                  <Text style={styles.stickyBtnTextCall}>{language === 'en' ? 'Call Seller' : 'కాల్ చేయండి'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleWhatsApp(selectedMarketItem.sellerWhatsapp || selectedMarketItem.sellerPhone, selectedMarketItem.title_en)}
                  style={styles.stickyBtnWa}
                >
                  <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
                  <Text style={styles.stickyBtnTextWa}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.modalStickyBottom, { backgroundColor: '#FEE2E2', justifyContent: 'center' }]}>
                <Text style={{ color: '#DC2626', fontWeight: '900', fontSize: 13 }}>THIS ITEM HAS BEEN SOLD OUT</Text>
              </View>
            )}
          </SafeAreaView>
        )}
      </Modal>

      {/* Post Marketplace Item Modal */}
      <Modal
        visible={postModalVisible}
        animationType="slide"
        onRequestClose={() => setPostModalVisible(false)}
      >
        <SafeAreaView style={styles.postModalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <View style={styles.postModalHeader}>
            <View>
              <Text style={styles.postModalTitle}>
                {language === 'en' ? 'Post Classified Item' : 'వస్తువును అమ్మండి'}
              </Text>
              <Text style={styles.postModalSub}>
                {language === 'en' ? 'Direct buy & sell in Kurnool' : 'కర్నూలు మార్కెట్‌ప్లేస్‌లో పోస్ట్ చేయండి'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPostModalVisible(false)}
              style={styles.postModalCloseBtn}
            >
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.postModalScroll}
            contentContainerStyle={styles.postModalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Category Selector */}
            <Text style={styles.inputLabel}>
              {language === 'en' ? 'Category' : 'వర్గం'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={styles.categoryChipRow}>
                {['Two-Wheelers', 'Mobiles & Tablets', 'Home Appliances', 'Furniture', 'Properties & Plots', 'Others'].map(cat => {
                  const isSelected = postCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setPostCategory(cat)}
                      style={[styles.catChip, isSelected && styles.catChipActive]}
                    >
                      <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Title */}
            <Text style={styles.inputLabel}>
              {language === 'en' ? 'Item Title *' : 'వస్తువు పేరు *'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={language === 'en' ? 'e.g., Honda Activa 5G (2020)' : 'ఉదాహరణ: హోండా యాక్టివా 5G'}
              value={postTitle}
              onChangeText={setPostTitle}
              placeholderTextColor="#9CA3AF"
            />

            {/* Price & Condition */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>
                  {language === 'en' ? 'Price (₹) *' : 'ధర (₹) *'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="₹35,000"
                  value={postPrice}
                  onChangeText={setPostPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>
                  {language === 'en' ? 'Condition / Specs' : 'పరిస్థితి / వివరాలు'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={language === 'en' ? 'e.g. Mint • 1 Yr' : 'ఉదా: కొత్తగా ఉంది'}
                  value={postCondition}
                  onChangeText={setPostCondition}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Area & Phone */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>
                  {language === 'en' ? 'Locality / Area' : 'ప్రాంతం'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Gandhi Nagar"
                  value={postArea}
                  onChangeText={setPostArea}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>
                  {language === 'en' ? 'Phone Number *' : 'ఫోన్ నెంబర్ *'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10-digit mobile"
                  value={postPhone}
                  onChangeText={setPostPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Description */}
            <Text style={styles.inputLabel}>
              {language === 'en' ? 'Description' : 'వివరాలు'}
            </Text>
            <TextInput
              style={[styles.textInput, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder={language === 'en' ? 'Mention condition, bill/box status, reason for selling...' : 'వస్తువు వివరాలు రాయండి...'}
              value={postDesc}
              onChangeText={setPostDesc}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />

            {/* Photos */}
            <Text style={styles.inputLabel}>
              {language === 'en' ? 'Photos (Up to 2)' : 'ఫోటోలు (గరిష్టంగా 2)'}
            </Text>
            <View style={styles.photoPickerRow}>
              {postImages.map((uri, idx) => (
                <View key={idx} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    onPress={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                    style={styles.photoThumbRemove}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {postImages.length < 2 && (
                <TouchableOpacity
                  onPress={handlePickPostImage}
                  style={styles.photoAddBtn}
                >
                  <Ionicons name="camera-outline" size={24} color="#059669" />
                  <Text style={styles.photoAddText}>
                    {language === 'en' ? 'Add Photo' : 'ఫోటో జోడించండి'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Civic safety banner */}
            <View style={styles.postSafetyNote}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginTop: 2 }} />
              <Text style={styles.postSafetyText}>
                {language === 'en'
                  ? 'Citizens trade directly. Meet in public places and inspect items in person before making any payment.'
                  : 'పౌరులు నేరుగా లావాదేవీలు చేస్తారు. బహిరంగ ప్రదేశాలలో కలవండి మరియు చెల్లింపు చేసే ముందు వస్తువును పరిశీలించండి.'}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitPost}
              disabled={posting}
              style={[styles.submitPostBtn, posting && { opacity: 0.7 }]}
            >
              {posting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.submitPostBtnText}>
                    {language === 'en' ? 'Publish Item' : 'ఐటెమ్‌ను పబ్లిష్ చేయండి'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  tabContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 10, marginBottom: 4,
    backgroundColor: '#E5E7EB', borderRadius: 14, padding: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  offerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  discountBadge: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#FECACA',
  },
  discountText: { fontSize: 12, fontWeight: '900', color: '#DC2626' },
  validUntil: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  offerTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 4 },
  bizName: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 4 },
  offerDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginTop: 6 },
  cardActionsRow: {
    flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10,
  },
  actionBtnCall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 10,
  },
  actionBtnTextCall: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  actionBtnWa: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#16A34A', paddingVertical: 10, borderRadius: 10,
  },
  actionBtnTextWa: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  marketCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  marketImg: { width: '100%', height: 160 },
  marketBody: { padding: 14 },
  priceBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0',
  },
  priceBadgeText: { fontSize: 15, fontWeight: '900', color: '#15803D' },
  marketCatPill: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  marketCatText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  marketTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 6 },
  marketMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  marketMetaText: { fontSize: 11, color: '#6B7280' },
  marketDesc: { fontSize: 12, color: '#4B5563', lineHeight: 17, marginTop: 6 },
  sellerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
  },
  sellerName: { fontSize: 12, fontWeight: '700', color: '#374151' },
  actionBtnCallSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2563EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  actionBtnTextCallSmall: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  actionBtnWaSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#16A34A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  actionBtnTextWaSmall: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  eventCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eventPoster: { width: '100%', height: 160 },
  eventBody: { padding: 16 },
  eventDatePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  eventDateText: { fontSize: 11, fontWeight: '800', color: '#1E40AF' },
  entryPill: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  entryText: { fontSize: 10, fontWeight: '800', color: '#4B5563' },
  eventTitle: { fontSize: 17, fontWeight: '900', color: '#111827', marginTop: 8 },
  eventInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  eventInfoText: { fontSize: 12, color: '#4B5563', flex: 1 },
  organizerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
  },
  organizerText: { fontSize: 12, color: '#6B7280', flex: 1 },
  contactOrgBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2563EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  contactOrgText: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60, paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17, fontWeight: '800', color: '#1F2937', textAlign: 'center', marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, maxWidth: 280,
  },
  stickyDisclaimerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stickyDisclaimerText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    fontWeight: '500',
  },
  dealImageWrap: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  dealBannerImg: {
    width: '100%',
    height: '100%',
  },
  marketImgWrap: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  imageZoomBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageZoomBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionBtnShare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnTextShare: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnShareSmall: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  viewerCounterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewerCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  viewerCloseBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
  },
  viewerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerNavRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerNavBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postModalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  postModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  postModalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  postModalSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  postModalCloseBtn: { padding: 4 },
  postModalScroll: { flex: 1 },
  postModalScrollContent: { padding: 16, paddingBottom: 40 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 4 },
  categoryChipRow: { flexDirection: 'row', gap: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  catChipActive: { backgroundColor: '#ECFDF5', borderColor: '#059669' },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  catChipTextActive: { color: '#059669', fontWeight: '800' },
  inputRow: { flexDirection: 'row', marginBottom: 12 },
  textInput: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
    color: '#111827', marginBottom: 12,
  },
  photoPickerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  photoThumbWrap: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoThumbRemove: {
    position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  photoAddBtn: {
    width: 80, height: 80, borderRadius: 10, borderWidth: 1.5,
    borderStyle: 'dashed', borderColor: '#059669', backgroundColor: '#ECFDF5',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoAddText: { fontSize: 9, fontWeight: '700', color: '#059669', textAlign: 'center' },
  postSafetyNote: {
    flexDirection: 'row', gap: 8, backgroundColor: '#F0FDF4', padding: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16,
  },
  postSafetyText: { flex: 1, fontSize: 11, color: '#166534', lineHeight: 16 },
  submitPostBtn: {
    backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  submitPostBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActiveDeals: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  filterChipActiveMarket: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOverlayBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-8deg' }],
  },
  soldOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  soldPill: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soldPillText: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 10,
  },
  soldToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldToggleBtnMark: {
    backgroundColor: '#DC2626',
  },
  soldToggleBtnReactivate: {
    backgroundColor: '#059669',
  },
  soldToggleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  // Compact 2-column Grid Styles
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
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
  gridDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridDiscountBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  gridPriceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridPriceBadgeText: {
    color: '#34D399',
    fontWeight: '900',
    fontSize: 12,
  },
  gridBody: {
    padding: 9,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
    minHeight: 34,
  },
  gridSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  gridTapCue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  gridTapCueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  // Details Modal Styles
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  detailsModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  detailsModalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailsModalCloseBtn: {
    padding: 4,
  },
  detailsModalImageWrap: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsModalImage: {
    width: '100%',
    height: '100%',
  },
  detailsSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailsDescText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E293B',
  },
  // Native Advanced Ad Box
  nativeAdBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  nativeAdPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nativeAdPillText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  nativeAdTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  nativeAdDesc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  // Modal Sticky Bottom Action Bar
  modalStickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  stickyBtnCall: {
    flex: 1,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  stickyBtnTextCall: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  stickyBtnWa: {
    flex: 1,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  stickyBtnTextWa: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

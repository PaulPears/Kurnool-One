import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, Linking, ActivityIndicator, StatusBar, StyleSheet, Modal, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { fetchOffers, fetchEvents, OfferItem, EventItem } from '../services/directoryService';

export interface MarketItem {
  id: string;
  title_en: string;
  title_te?: string;
  price: string;
  category: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp?: string;
  area: string;
  condition: string;
  postedDate: string;
  imageUrl?: string;
  images?: string[];
  description: string;
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
        setMarketItems(SEED_MARKET_ITEMS);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Deals, Offers & Market' : 'ఆఫర్లు, డీల్స్ & మార్కెట్'}
        </Text>
        <Text style={styles.headerSub}>
          {language === 'en' ? 'Local merchant discounts, citizen buy & sell, and city events' : 'స్థానిక తగ్గింపులు, మార్కెట్‌ప్లేస్ మరియు నగర కార్యక్రమాలు'}
        </Text>
      </View>

      {/* Mode Tabs (Deals & Offers, Marketplace, City Events) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('offers')}
          style={[styles.tabBtn, activeTab === 'offers' && styles.tabBtnActive]}
        >
          <Ionicons name="flame" size={15} color={activeTab === 'offers' ? '#DC2626' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'offers' && { color: '#DC2626', fontWeight: '800' }]}>
            {language === 'en' ? 'Hot Deals' : 'ఆఫర్లు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('marketplace')}
          style={[styles.tabBtn, activeTab === 'marketplace' && styles.tabBtnActive]}
        >
          <Ionicons name="cart" size={15} color={activeTab === 'marketplace' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'marketplace' && { color: '#059669', fontWeight: '800' }]}>
            {language === 'en' ? 'Marketplace' : 'మార్కెట్'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('events')}
          style={[styles.tabBtn, activeTab === 'events' && styles.tabBtnActive]}
        >
          <Ionicons name="calendar" size={15} color={activeTab === 'events' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'events' && { color: '#2563EB', fontWeight: '800' }]}>
            {language === 'en' ? 'City Events' : 'ఈవెంట్లు'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Body */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'offers' ? (
        <FlatList
          data={offers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
              <View style={styles.offerCard}>
                {offerImages.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openImageViewer(offerImages)}
                    style={styles.dealImageWrap}
                  >
                    <Image source={{ uri: offerImages[0] }} style={styles.dealBannerImg} resizeMode="cover" />
                    <View style={styles.imageZoomBadge}>
                      <Ionicons name="expand-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.imageZoomBadgeText}>
                        {offerImages.length > 1 ? `${offerImages.length} Photos` : 'View Photo'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.offerHeader}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discountText}</Text>
                  </View>
                  <Text style={styles.validUntil}>{item.validUntil}</Text>
                </View>

                <Text style={styles.offerTitle}>
                  {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                </Text>

                <Text style={styles.bizName}>
                  <Ionicons name="storefront-outline" size={13} color="#2563EB" /> {item.businessName}
                </Text>

                <Text style={styles.offerDesc}>
                  {language === 'en' ? item.description_en : (item.description_te || item.description_en)}
                </Text>

                <View style={styles.cardActionsRow}>
                  {item.phone && (
                    <TouchableOpacity
                      onPress={() => handleCall(item.phone)}
                      style={styles.actionBtnCall}
                    >
                      <Ionicons name="call" size={14} color="#FFFFFF" />
                      <Text style={styles.actionBtnTextCall}>Call Merchant</Text>
                    </TouchableOpacity>
                  )}
                  {item.phone && (
                    <TouchableOpacity
                      onPress={() => handleWhatsApp(item.phone, item.title_en)}
                      style={styles.actionBtnWa}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnTextWa}>WhatsApp</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleShareOffer(item)}
                    style={styles.actionBtnShare}
                  >
                    <Ionicons name="share-social-outline" size={15} color="#4B5563" />
                    <Text style={styles.actionBtnTextShare}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      ) : activeTab === 'marketplace' ? (
        <FlatList
          data={marketItems}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="cart-outline" size={36} color="#059669" />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'Marketplace is Empty' : 'మార్కెట్‌ప్లేస్ ఖాళీగా ఉంది'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en'
                  ? 'Citizens and sellers in Kurnool will list pre-owned vehicles, phones, and items here.'
                  : 'కర్నూలు పౌరులు తమ వస్తువులను ఇక్కడ పోస్ట్ చేస్తారు.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const itemImages = item.images && item.images.length > 0 ? item.images : item.imageUrl ? [item.imageUrl] : [];
            return (
              <View style={styles.marketCard}>
                {itemImages.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openImageViewer(itemImages)}
                    style={styles.marketImgWrap}
                  >
                    <Image source={{ uri: itemImages[0] }} style={styles.marketImg} resizeMode="cover" />
                    <View style={styles.imageZoomBadge}>
                      <Ionicons name="scan-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.imageZoomBadgeText}>
                        {itemImages.length > 1 ? `${itemImages.length} Photos` : 'Tap to View'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                <View style={styles.marketBody}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{item.price}</Text>
                    </View>
                    <View style={styles.marketCatPill}>
                      <Text style={styles.marketCatText}>{item.category}</Text>
                    </View>
                  </View>

                  <Text style={styles.marketTitle}>
                    {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                  </Text>

                  <View style={styles.marketMetaRow}>
                    <Ionicons name="location-outline" size={13} color="#6B7280" />
                    <Text style={styles.marketMetaText}>{item.area}</Text>
                    <Text style={{ color: '#D1D5DB' }}>•</Text>
                    <Text style={styles.marketMetaText}>{item.condition}</Text>
                  </View>

                  <Text style={styles.marketDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.sellerRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
                      <Text style={styles.sellerName} numberOfLines={1}>{item.sellerName}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => handleCall(item.sellerPhone)}
                        style={styles.actionBtnCallSmall}
                      >
                        <Ionicons name="call" size={12} color="#FFFFFF" />
                        <Text style={styles.actionBtnTextCallSmall}>Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleWhatsApp(item.sellerWhatsapp || item.sellerPhone, item.title_en)}
                        style={styles.actionBtnWaSmall}
                      >
                        <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
                        <Text style={styles.actionBtnTextWaSmall}>WhatsApp</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleShareMarketItem(item)}
                        style={styles.actionBtnShareSmall}
                      >
                        <Ionicons name="share-social-outline" size={13} color="#374151" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={36} color="#2563EB" />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No Upcoming Events' : 'రాబోయే నగర కార్యక్రమాలు లేవు'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en'
                  ? 'City cultural festivals, expo fairs, and meetups will appear here.'
                  : 'నగర ఉత్సవాలు మరియు కార్యక్రమాలు ఇక్కడ కనిపిస్తాయి.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              {item.posterUrl ? (
                <Image source={{ uri: item.posterUrl }} style={styles.eventPoster} resizeMode="cover" />
              ) : null}

              <View style={styles.eventBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={styles.eventDatePill}>
                    <Ionicons name="calendar-outline" size={13} color="#1E40AF" />
                    <Text style={styles.eventDateText}>{item.dateStr}</Text>
                  </View>
                  <View style={styles.entryPill}>
                    <Text style={styles.entryText}>{item.entryType.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>
                  {language === 'en' ? item.title_en : (item.title_te || item.title_en)}
                </Text>

                <View style={styles.eventInfoRow}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.eventInfoText}>{item.timeStr}</Text>
                </View>

                <View style={styles.eventInfoRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.eventInfoText} numberOfLines={1}>{item.venue}</Text>
                </View>

                <View style={styles.organizerRow}>
                  <Text style={styles.organizerText}>Organizer: {item.organizerName}</Text>
                  {item.contactPhone ? (
                    <TouchableOpacity
                      onPress={() => handleCall(item.contactPhone)}
                      style={styles.contactOrgBtn}
                    >
                      <Ionicons name="call" size={12} color="#FFFFFF" />
                      <Text style={styles.contactOrgText}>Contact</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />
      )}

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
});

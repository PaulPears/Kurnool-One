import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';
import { useLanguage } from '../context/LanguageContext';
import { fetchPromotions, fetchPromotionBanners, fetchSavedPostIds } from '../services/firestoreService';
import { SafeBannerAd, AD_TEST_ID } from '../components/SafeBannerAd';
import { Ionicons } from '@expo/vector-icons';

const AD_UNIT_ID = __DEV__ ? AD_TEST_ID : 'ca-app-pub-6894923761807901/6222488522';
const AD_FREQUENCY = 3;

const BANNER_AD_UNITS = [
  __DEV__ ? AD_TEST_ID : 'ca-app-pub-6894923761807901/6222488522',
  __DEV__ ? AD_TEST_ID : 'ca-app-pub-6894923761807901/7134481060',
];

function AdBanner() {
  return (
    <View style={styles.adContainer}>
      <Text style={styles.adLabel}>SPONSORED</Text>
      <SafeBannerAd unitId={AD_UNIT_ID} />
    </View>
  );
}

function HeroBanner({ banner }: { banner: any }) {
  const handlePress = () => {
    if (banner.redirectUrl) {
      Linking.openURL(banner.redirectUrl).catch(() => {});
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.92} style={styles.heroBanner}>
      <Image source={{ uri: banner.imageUrl }} style={styles.heroBannerImage} resizeMode="cover" />
      {banner.title ? (
        <View style={styles.heroBannerOverlay}>
          <Text style={styles.heroBannerTitle}>{banner.title}</Text>
          {banner.redirectUrl ? (
            <View style={styles.heroBannerCTA}>
              <Text style={styles.heroBannerCTAText}>Learn More</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function PromotionsScreen({ navigation }: any) {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { language } = useLanguage();

  useFocusEffect(
    useCallback(() => {
      void load(promotions.length > 0);
      void loadUser();
    }, [promotions.length])
  );

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const load = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const [data, banners, storedData] = await Promise.all([
        fetchPromotions(),
        fetchPromotionBanners(),
        AsyncStorage.getItem('user'),
      ]);

      let savedIds: string[] = [];
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const uid = parsed.uid || parsed.id;
        if (uid) {
          savedIds = await fetchSavedPostIds(uid);
        }
      }

      setPromotions(
        data.map((item) => ({
          ...item,
          isSaved: savedIds.includes(item.id),
        }))
      );
      setHeroBanners(banners.filter((item: any) => item.active));
    } catch (error) {
      console.error('Fetch Promotions error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const buildFeedItems = () => {
    const items: any[] = [];
    let adCount = 0;

    promotions.forEach((post, index) => {
      items.push({ type: 'post', data: post, key: `post_${post.id}` });
      if ((index + 1) % AD_FREQUENCY === 0 && adCount < 5) {
        items.push({ type: 'ad', key: `ad_${adCount}` });
        adCount += 1;
      }
    });

    while (adCount < Math.min(5, Math.ceil(promotions.length / AD_FREQUENCY) + 1)) {
      items.push({ type: 'ad', key: `ad_extra_${adCount}` });
      adCount += 1;
    }

    return items;
  };

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const feedItems = buildFeedItems();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Promotions</Text>
          <Text style={styles.headerSub}>Verified events, offers, and updates</Text>
        </View>
      </View>

      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 132 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load(false);
            }}
            colors={['#2563EB']}
          />
        }
        ListHeaderComponent={() => (
          <View>
            {heroBanners.length > 0 ? (
              <View style={{ marginBottom: 8 }}>
                {heroBanners.map((banner) => (
                  <HeroBanner key={banner.id} banner={banner} />
                ))}
              </View>
            ) : null}

            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sectionLabel}>Sponsored</Text>
              {BANNER_AD_UNITS.map((unitId, index) => (
                <View key={index} style={styles.adContainer}>
                  <Text style={styles.adLabel}>ADVERTISEMENT {index + 1}</Text>
                  <SafeBannerAd unitId={unitId} />
                </View>
              ))}
            </View>

            {isAdmin ? (
              <View style={styles.adminCard}>
                <View style={styles.adminCopy}>
                  <Text style={styles.adminTitle}>Admin Controls</Text>
                  <Text style={styles.adminText}>
                    Create promotion posts or manage the top hero banners.
                  </Text>
                </View>

                <View style={{ flexDirection: 'column', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreatePost', { initialPromotion: true, autoPick: 'image' })}
                    style={styles.adminAction}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
                    <Text style={styles.adminActionText}>New Promotion</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AdminBanners')}
                    style={styles.adminAction}
                  >
                    <Ionicons name="images-outline" size={18} color="#2563EB" />
                    <Text style={styles.adminActionText}>Manage Banners</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <View style={styles.contactBar}>
              <Text style={styles.contactText}>
                Promote your business on Kurnool One: <Text style={styles.contactEmail}>support@kurnoolone.com</Text>
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          if (item.type === 'ad') return <AdBanner />;

          const promotion = item.data;
          return (
            <NewsCard
              id={promotion.id}
              title={language === 'en' ? promotion.title_en : promotion.title_te}
              content={language === 'en' ? promotion.content_en : promotion.content_te}
              category={language === 'en' ? promotion.name_en : promotion.name_te}
              author={promotion.author_name}
              authorPhoto={promotion.author_photo}
              date={new Date(promotion.created_at).toLocaleDateString()}
              imageUrl={promotion.media_url}
              type={promotion.type}
              likeCount={promotion.like_count}
              commentCount={promotion.comment_count}
              likedByMe={promotion.liked_by_me}
              language={language}
              onRefresh={() => void load(true)}
              authorId={promotion.author_id}
              fullPosts={promotions}
              isSaved={promotion.isSaved}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>PR</Text>
            <Text style={styles.emptyTitle}>No promotions active</Text>
            <Text style={styles.emptyText}>
              Official community announcements and offers will appear here.
            </Text>
          </View>
        }
      />

      {isAdmin ? (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost', { initialPromotion: true, autoPick: 'image' })}
          style={styles.adminFab}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  contactBar: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  contactText: {
    fontSize: 12,
    color: '#1E40AF',
    textAlign: 'center',
  },
  contactEmail: {
    fontWeight: '800',
  },
  adContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  adLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroBanner: {
    margin: 12,
    marginBottom: 4,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    backgroundColor: '#1E40AF',
  },
  heroBannerImage: {
    width: '100%',
    height: 180,
  },
  heroBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroBannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroBannerCTA: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroBannerCTAText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 12,
  },
  adminCard: {
    backgroundColor: '#EFF6FF',
    margin: 12,
    marginBottom: 8,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  adminCopy: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  adminText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#1D4ED8',
  },
  adminAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  adminActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    opacity: 0.45,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 16,
    color: '#2563EB',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 6,
    color: '#6B7280',
  },
  adminFab: {
    position: 'absolute',
    right: 20,
    bottom: 92,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 12,
  },
});

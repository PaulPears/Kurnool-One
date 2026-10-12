import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Share,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { fetchNews, NewsItem } from '../services/directoryService';

export default function NewsScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchNews();
      setNewsList(data);
    } catch (e) {
      console.error('loadNews error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (article: NewsItem) => {
    try {
      const title = language === 'en' ? article.title_en : (article.title_te || article.title_en);
      const content = language === 'en' ? article.content_en : (article.content_te || article.content_en);
      const snippet = content ? (content.length > 180 ? `${content.substring(0, 180)}...` : content) : '';
      const appUrl = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';
      await Share.share({
        message: `📰 *${title}*\n\n${snippet}\n\n👉 Download Kurnool One App for local updates:\n${appUrl}`,
      });
    } catch {}
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => {
    const title = language === 'en' ? item.title_en : (item.title_te || item.title_en);
    const content = language === 'en' ? item.content_en : (item.content_te || item.content_en);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedArticle(item)}
        style={styles.card}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Ionicons name="newspaper-outline" size={36} color="#2563EB" />
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category || 'Local'}</Text>
            </View>
            <Text style={styles.dateText}>{item.dateStr || 'Recent'}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.snippet} numberOfLines={2}>{content}</Text>

          <View style={styles.cardFooter}>
            {item.source ? (
              <Text style={styles.sourceText} numberOfLines={1}>
                Source: {item.source}
              </Text>
            ) : <View />}

            <TouchableOpacity
              onPress={() => handleShare(item)}
              style={styles.shareBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-social-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Kurnool City News' : 'కర్నూలు నగర వార్తలు'}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'Curated Local Updates & Announcements' : 'స్థానిక విశేషాలు మరియు ప్రకటనలు'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={newsList}
          keyExtractor={(item) => item.id}
          renderItem={renderNewsItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 60 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="newspaper-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No News Articles Yet' : 'వార్తలు ఇంకా అందుబాటులో లేవు'}
              </Text>
              <Text style={styles.emptySub}>
                {language === 'en'
                  ? 'Check back soon for the latest happenings across Kurnool.'
                  : 'తాజా నగర అప్‌డేట్స్ కోసం వేచి ఉండండి.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Sticky Bottom Community Disclaimer Banner */}
      <View style={styles.stickyDisclaimerWrap}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" style={{ marginTop: 1 }} />
        <Text style={styles.stickyDisclaimerText}>
          {language === 'en'
            ? 'Independent civic news aggregator. Curated with source attribution. Kurnool One is not affiliated with any government agency.'
            : 'స్వతంత్ర సమాచార వేదిక. కర్నూలు వన్ ఏ ప్రభుత్వ లేదా ప్రెస్ సంస్థతో సంబంధం కలిగి లేదు.'}
        </Text>
      </View>

      {/* Article Detail Modal */}
      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.backBtn}>
              <Ionicons name="close" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Kurnool News</Text>
            {selectedArticle && (
              <TouchableOpacity onPress={() => handleShare(selectedArticle)} style={styles.backBtn}>
                <Ionicons name="share-social-outline" size={22} color="#111827" />
              </TouchableOpacity>
            )}
          </View>

          {selectedArticle && (
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedArticle.imageUrl ? (
                <Image
                  source={{ uri: selectedArticle.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : null}

              <View style={styles.modalMetaRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{selectedArticle.category}</Text>
                </View>
                <Text style={styles.dateText}>{selectedArticle.dateStr || 'Recent'}</Text>
              </View>

              <Text style={styles.modalArticleTitle}>
                {language === 'en' ? selectedArticle.title_en : (selectedArticle.title_te || selectedArticle.title_en)}
              </Text>

              {selectedArticle.source ? (
                <Text style={styles.modalSourceText}>
                  Source Attribution: {selectedArticle.source}
                </Text>
              ) : null}

              <Text style={styles.modalArticleBody}>
                {language === 'en' ? selectedArticle.content_en : (selectedArticle.content_te || selectedArticle.content_en)}
              </Text>

              <View style={styles.disclaimerBox}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                <Text style={styles.disclaimerText}>
                  Kurnool One independently aggregates community announcements. Information is subject to updates by reporting sources.
                </Text>
              </View>
            </ScrollView>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 170 },
  placeholderImage: {
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { padding: 14 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  categoryBadgeText: { fontSize: 10, fontWeight: '800', color: '#2563EB' },
  dateText: { fontSize: 11, color: '#9CA3AF' },
  title: { fontSize: 15, fontWeight: '800', color: '#111827', lineHeight: 21 },
  snippet: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sourceText: { fontSize: 11, color: '#6B7280', flex: 1, fontStyle: 'italic' },
  shareBtn: { padding: 4 },
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
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
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disclaimerText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  modalContent: { padding: 16, paddingBottom: 60 },
  modalImage: { width: '100%', height: 210, borderRadius: 14, marginBottom: 14 },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalArticleTitle: { fontSize: 20, fontWeight: '900', color: '#111827', lineHeight: 28 },
  modalSourceText: { fontSize: 12, color: '#6B7280', marginTop: 6, marginBottom: 14, fontStyle: 'italic' },
  modalArticleBody: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 20 },
});

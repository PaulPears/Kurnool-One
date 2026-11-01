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
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { fetchNews, submitNewsStory, uploadNewsImage, NewsItem } from '../services/directoryService';
import { pickImageWithFreeStyleCrop } from '../utils/imageUploadHelper';

export default function NewsScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Citizen Reporter Modal State
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('Civic');
  const [area, setArea] = useState('');
  const [content, setContent] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePickNewsImage = async () => {
    const res = await pickImageWithFreeStyleCrop({
      title: language === 'en' ? 'News Photo' : 'వార్తా ఫోటో',
      message: language === 'en'
        ? 'Capture or select photo for this story (free-style crop enabled):'
        : 'ఫోటోను ఎంచుకుని మీకు కావలసిన విధంగా క్రాప్ చేయండి:',
    });
    if (res?.uri) {
      setLocalImageUri(res.uri);
    }
  };

  const handleSubmitNews = async () => {
    if (!headline.trim() || !content.trim() || !reporterName.trim() || !reporterPhone.trim()) {
      Alert.alert(
        language === 'en' ? 'Missing Details' : 'వివరాలు అసంపూర్ణం',
        language === 'en' ? 'Please fill in headline, content, your name, and phone number.' : 'దయచేసి శీర్షిక, వార్తా వివరాలు, మీ పేరు మరియు ఫోన్ నంబర్‌ను నమోదు చేయండి.'
      );
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';
      if (localImageUri) {
        try {
          finalImageUrl = await uploadNewsImage(localImageUri);
        } catch (uploadErr) {
          console.warn('News photo upload non-fatal error:', uploadErr);
        }
      }

      await submitNewsStory({
        title_en: headline.trim(),
        title_te: headline.trim(),
        category,
        area: area.trim() || 'Kurnool City',
        content_en: content.trim(),
        content_te: content.trim(),
        source: `${reporterName.trim()} (Citizen Reporter)`,
        authorName: reporterName.trim(),
        authorPhone: reporterPhone.trim(),
        imageUrl: finalImageUrl,
        publishedAt: new Date().toISOString().split('T')[0],
        status: 'pending_approval',
      });

      Alert.alert(
        language === 'en' ? 'Story Submitted 📰' : 'వార్త సమర్పించబడింది 📰',
        language === 'en'
          ? 'Thank you! Your story has been sent to our editorial desk for verification. It will be published once approved.'
          : 'ధన్యవాదాలు! మీ వార్త సంపాదకీయ పరిశీలన కోసం పంపబడింది. ఆమోదం పొందిన తర్వాత లైవ్ చేయబడుతుంది.'
      );

      setSubmitModalVisible(false);
      setHeadline('');
      setContent('');
      setArea('');
      setReporterName('');
      setReporterPhone('');
      setLocalImageUri(null);
    } catch (err) {
      console.error(err);
      Alert.alert(
        language === 'en' ? 'Error' : 'లోపం',
        language === 'en' ? 'Failed to submit news story. Please try again.' : 'వార్త సమర్పణ విఫలమైంది.'
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <TouchableOpacity
          onPress={() => setSubmitModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#2563EB',
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
          }}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
            {language === 'en' ? 'Report' : 'వార్త'}
          </Text>
        </TouchableOpacity>
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

      {/* Submit News Story Modal (Citizen Journalism) */}
      <Modal
        visible={submitModalVisible}
        animationType="slide"
        onRequestClose={() => setSubmitModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSubmitModalVisible(false)} style={styles.backBtn}>
              <Ionicons name="close" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {language === 'en' ? 'Submit Local News Story' : 'వార్తను సమర్పించండి'}
            </Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
              {language === 'en'
                ? 'Report local news, civic issues, and events in Kurnool. Stories will be published once verified by our editorial desk.'
                : 'కర్నూలు స్థానిక విశేషాలు మరియు సమస్యలను నివేదించండి. సంపాదకీయ బృందం పరిశీలన అనంతరం లైవ్ చేయబడుతుంది.'}
            </Text>

            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 }}>
              {language === 'en' ? 'Headline *' : 'వార్తా శీర్షిక *'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 12, backgroundColor: '#F8FAFC' }}
              placeholder={language === 'en' ? 'e.g. New traffic diversion at Bellary Chowrasta' : 'ఉదా: బళ్లారి చౌరస్తా వద్ద ట్రాఫిక్ మళ్లింపు'}
              value={headline}
              onChangeText={setHeadline}
            />

            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 }}>
              {language === 'en' ? 'Area in Kurnool *' : 'ప్రాంతం *'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 12, backgroundColor: '#F8FAFC' }}
              placeholder={language === 'en' ? 'e.g. Raj Vihar / C-Camp / Old City' : 'ఉదా: రాజ్ విహార్ / బి క్యాంప్'}
              value={area}
              onChangeText={setArea}
            />

            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 }}>
              {language === 'en' ? 'Detailed News Story *' : 'వార్తా వివరాలు *'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 13, height: 110, textAlignVertical: 'top', marginBottom: 12, backgroundColor: '#F8FAFC' }}
              placeholder={language === 'en' ? 'Provide full factual details...' : 'పూర్తి వాస్తవ సమాచారాన్ని నమోదు చేయండి...'}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 }}>
              {language === 'en' ? 'Reporter Name *' : 'మీ పేరు (విలేకరి) *'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 12, backgroundColor: '#F8FAFC' }}
              placeholder="e.g. S. Srinivas"
              value={reporterName}
              onChangeText={setReporterName}
            />

            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 }}>
              {language === 'en' ? 'Reporter Phone *' : 'సంప్రదించాల్సిన ఫోన్ నంబర్ *'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 12, backgroundColor: '#F8FAFC' }}
              placeholder="98480XXXXX"
              keyboardType="phone-pad"
              value={reporterPhone}
              onChangeText={setReporterPhone}
            />

            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 }}>
              {language === 'en' ? 'Story Photo (Optional - Free-Style Crop)' : 'వార్తా ఫోటో (ఐచ్ఛికం - క్రాపింగ్ సౌలభ్యం)'}
            </Text>
            {localImageUri ? (
              <View style={{ marginBottom: 16 }}>
                <Image
                  source={{ uri: localImageUri }}
                  style={{ width: '100%', height: 160, borderRadius: 12, backgroundColor: '#E2E8F0' }}
                  resizeMode="cover"
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={handlePickNewsImage}
                    style={{ flex: 1, backgroundColor: '#EFF6FF', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>
                      {language === 'en' ? 'Change Photo' : 'ఫోటో మార్చండి'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setLocalImageUri(null)}
                    style={{ flex: 1, backgroundColor: '#FEF2F2', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
                      {language === 'en' ? 'Remove' : 'తొలగించు'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickNewsImage}
                style={{
                  borderWidth: 1.5,
                  borderColor: '#BFDBFE',
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  paddingVertical: 18,
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC',
                  marginBottom: 16,
                  gap: 6,
                }}
              >
                <Ionicons name="camera-outline" size={24} color="#2563EB" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563EB' }}>
                  {language === 'en' ? '📷 Add Photo (Camera or Gallery)' : '📷 ఫోటో జోడించండి (కెమెరా / గ్యాలరీ)'}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>
                  {language === 'en' ? 'Free-style drag and crop supported' : 'మీకు నచ్చినట్లు క్రాప్ చేయవచ్చు'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSubmitNews}
              disabled={submitting}
              style={{
                backgroundColor: '#2563EB',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                  {language === 'en' ? 'Submit Story for Verification' : 'వార్తను సమర్పించండి'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../services/firestoreService';
import { useLanguage } from '../context/LanguageContext';
import PostImageEditor, { PostImageEditorHandle } from '../components/PostImageEditor';

export default function CreatePostScreen({ route, navigation }: any) {
  const { initialPromotion, autoPick } = route.params || {};
  const isPromotionMode = !!initialPromotion;
  const { language } = useLanguage();
  const autoPickDoneRef = useRef(false);
  const imageEditorRef = useRef<PostImageEditorHandle | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ uri: string; type: 'image' } | null>(null);
  const [isPromotion, setIsPromotion] = useState(isPromotionMode);
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'only_me'>('public');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (english: string) => (language === 'en' ? english : english);

  useEffect(() => {
    void checkAdmin();
  }, [isPromotionMode]);

  useEffect(() => {
    if (autoPickDoneRef.current) return;

    if (autoPick === 'image') {
      autoPickDoneRef.current = true;
      void pickMedia();
    }
  }, [autoPick]);

  const checkAdmin = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;

      const parsed = JSON.parse(userData);
      const isUserAdmin = parsed?.role === 'admin';
      setIsAdmin(isUserAdmin);

      if (isPromotionMode && isUserAdmin) {
        setIsPromotion(true);
      }
    } catch {
      // ignore
    }
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia({
        uri: result.assets[0].uri,
        type: 'image',
      });
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);

      if (!media?.uri) {
        Alert.alert(t('Media Required'), t('Please select an image to post.'));
        setLoading(false);
        return;
      }

      let preparedMedia = media ? { ...media } : null;
      if (preparedMedia?.type === 'image' && imageEditorRef.current) {
        preparedMedia = {
          ...preparedMedia,
          uri: await imageEditorRef.current.exportImageAsync(),
        };
      }

      const caption = title ? `${title}\n\n${content}`.trim() : content;

      await createPost(
        {
          title_en: title,
          title_te: title,
          content_en: content,
          content_te: content,
          caption,
          isPromotion,
          isQuickClip: false,
          privacy,
        },
        preparedMedia ? { uri: preparedMedia.uri, type: preparedMedia.type } : undefined
      );

      Alert.alert(t('Success'), t('Post published!'), [
        { text: t('OK'), onPress: () => navigation.navigate('Main') },
      ]);
    } catch (error) {
      console.error('Publish Error:', error);
      Alert.alert(t('Error'), t('Failed to publish post. Please try again.'));
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isPromotionMode
                ? t('Create Promotion')
                : t('Create Post')}
          </Text>

          <TouchableOpacity
            onPress={handlePublish}
            disabled={loading}
            style={[styles.postButton, loading && styles.postButtonDisabled]}
          >
            <Text style={styles.postButtonText}>{t('Post')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder={t('Title')}
              placeholderTextColor="#9CA3AF"
              multiline
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder={t("Tell us what's happening... (Optional)")}
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          {isPromotionMode ? (
            <View style={styles.modeBanner}>
              <Ionicons name="megaphone-outline" size={18} color="#1D4ED8" />
              <View style={styles.modeBannerCopy}>
                <Text style={styles.modeBannerTitle}>{t('Promotion post')}</Text>
                <Text style={styles.modeBannerText}>
                  {t('This post will be published on the Promotions page for admin announcements, offers, and updates.')}
                </Text>
              </View>
            </View>
          ) : null}

          {media?.type === 'image' ? (
            <View style={styles.mediaEditorSection}>
              <View style={styles.mediaSectionHeader}>
                <Text style={styles.mediaSectionTitle}>{t('Selected Photo')}</Text>
                <View style={styles.mediaSectionActions}>
                  <TouchableOpacity onPress={() => void pickMedia()} style={styles.inlineActionButton}>
                    <Ionicons name="image-outline" size={16} color="#1D4ED8" />
                    <Text style={styles.inlineActionText}>{t('Change')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setMedia(null)} style={styles.inlineDangerButton}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={styles.inlineDangerText}>{t('Remove')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <PostImageEditor
                ref={imageEditorRef}
                imageUri={media.uri}
                onImageUriChange={(uri) =>
                  setMedia((current) => (current ? { ...current, uri } : current))
                }
              />
            </View>
          ) : null}

          {isAdmin && !isPromotionMode ? (
            <View style={styles.adminSection}>
              <View>
                <Text style={styles.adminTitle}>{t('Official Promotion')}</Text>
                <Text style={styles.adminSubtitle}>{t('Only admins can publish to Promotions directly.')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPromotion(!isPromotion)}
                style={[styles.toggleButton, isPromotion ? styles.toggleButtonActive : styles.toggleButtonInactive]}
              >
                <View style={[styles.toggleKnob, isPromotion ? styles.toggleKnobActive : styles.toggleKnobInactive]} />
              </TouchableOpacity>
            </View>
          ) : null}

          {!isPromotionMode ? (
            <View style={{ marginBottom: 24, marginTop: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>{t('Privacy')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setPrivacy('public')}
                  style={[styles.privacyButton, privacy === 'public' && styles.privacyButtonActive]}
                >
                  <Ionicons name="globe-outline" size={16} color={privacy === 'public' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.privacyButtonText, privacy === 'public' && styles.privacyButtonTextActive]}>{t('Public')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPrivacy('followers')}
                  style={[styles.privacyButton, privacy === 'followers' && styles.privacyButtonActive]}
                >
                  <Ionicons name="people-outline" size={16} color={privacy === 'followers' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.privacyButtonText, privacy === 'followers' && styles.privacyButtonTextActive]}>{t('Followers')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPrivacy('only_me')}
                  style={[styles.privacyButton, privacy === 'only_me' && styles.privacyButtonActive]}
                >
                  <Ionicons name="lock-closed-outline" size={16} color={privacy === 'only_me' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.privacyButtonText, privacy === 'only_me' && styles.privacyButtonTextActive]}>{t('Only Me')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.mediaButtonsContainer}>
            <TouchableOpacity
              onPress={() => void pickMedia()}
              style={[styles.mediaButton, media?.type === 'image' && styles.mediaButtonSelected]}
            >
              <Ionicons name="image-outline" size={22} color="#6C3BFF" />
              <Text style={styles.mediaButtonText}>{t('Photo')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C3BFF" />
          <Text style={styles.loadingText}>{t('Publishing to Kurnool One...')}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6C3BFF',
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    minHeight: 40,
  },
  contentInput: {
    fontSize: 18,
    color: '#374151',
    minHeight: 150,
    lineHeight: 26,
  },
  modeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
    marginBottom: 20,
  },
  modeBannerCopy: {
    flex: 1,
  },
  modeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  modeBannerText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  mediaEditorSection: {
    marginBottom: 8,
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  mediaSectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  inlineDangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  inlineDangerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  mediaPreview: {
    width: '100%',
    height: 240,
    backgroundColor: '#F9FAFB',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
    marginBottom: 24,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    maxWidth: 220,
  },
  toggleButton: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#6C3BFF',
  },
  toggleButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 12 }],
  },
  toggleKnobInactive: {
    transform: [{ translateX: -12 }],
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
    paddingBottom: 40,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  mediaButtonSelected: {
    borderColor: '#C4B5FD',
    backgroundColor: '#F5F3FF',
  },
  mediaButtonSpacer: {
    marginLeft: 12,
  },
  mediaButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C3BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#6C3BFF',
  },
  mediaButtonText: {
    marginLeft: 8,
    color: '#6C3BFF',
    fontSize: 15,
    fontWeight: '600',
  },
  mediaButtonTextActive: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  privacyButtonActive: {
    backgroundColor: '#6C3BFF',
  },
  privacyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  privacyButtonTextActive: {
    color: '#FFFFFF',
  },
});

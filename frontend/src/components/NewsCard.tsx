import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Share, Alert, ActivityIndicator, StyleSheet, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getMediaUrl } from '../api/api';
import { toggleLike, reportPost, deletePost, toggleSavePost, checkIsSaved, getComments, addComment } from '../services/firestoreService';
import { useNavigation } from '@react-navigation/native';

interface NewsCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorPhoto?: string;
  date: string;
  imageUrl?: string;
  type?: 'text' | 'image' | 'video';
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  language: 'en' | 'te';
  onRefresh?: () => void;
  authorId?: string;
  fullPosts?: any[];
  isSaved?: boolean;
}

export default function NewsCard({
  id, title, content, category, author, authorPhoto, date, imageUrl,
  type = 'text', likeCount, commentCount, likedByMe, language,
  onRefresh, authorId: postAuthorId, fullPosts = [], isSaved: isSavedProp = false,
}: NewsCardProps) {
  const navigation        = useNavigation<any>();
  const [localLiked, setLocalLiked]           = useState(likedByMe);
  const [localLikeCount, setLocalLikeCount]   = useState(likeCount);
  const [isRemoving, setIsRemoving]           = useState(false);
  const [currentUser, setCurrentUser]         = useState<any>(null);
  const [showLargeHeart, setShowLargeHeart]   = useState(false);
  const [isSaved, setIsSaved]                 = useState(isSavedProp);
  const lastTapRef                            = useRef<number>(0);
  const tapTimerRef                           = useRef<NodeJS.Timeout | null>(null);
  const [showComments, setShowComments]       = useState(false);
  const [comments, setComments]               = useState<any[]>([]);
  const [newComment, setNewComment]           = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [imageRatio, setImageRatio]           = useState<number>(4 / 5);

  React.useEffect(() => {
    if (imageUrl) {
      const resolvedUrl = getMediaUrl(imageUrl);
      if (resolvedUrl) {
        Image.getSize(
          resolvedUrl,
          (width, height) => {
            if (width && height) {
              setImageRatio(width / height);
            }
          },
          () => {
            // Fallback if getSize fails
            setImageRatio(1);
          }
        );
      }
    }
  }, [imageUrl]);

  React.useEffect(() => {
    setIsSaved(isSavedProp);
  }, [isSavedProp]);

  React.useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const u = JSON.parse(data);
        setCurrentUser(u);
      }
    } catch { /* ignore */ }
  };

  const handleLike = async () => {
    try {
      const uid = currentUser?.uid || currentUser?.id;
      if (!uid) { Alert.alert('Sign in required', 'Please sign in to like posts.'); return; }
      setLocalLiked(!localLiked);
      setLocalLikeCount(localLiked ? localLikeCount - 1 : localLikeCount + 1);
      const res = await toggleLike(id, uid);
      setLocalLiked(res.liked);
      setLocalLikeCount(res.like_count);
    } catch (error) {
      console.error('Like error:', error);
      setLocalLiked(localLiked);
      setLocalLikeCount(localLikeCount);
    }
  };

  const handleSave = async () => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) { Alert.alert('Sign in required', 'Please sign in to save posts.'); return; }
    try {
      setIsSaved(!isSaved);
      const currentlySaved = await toggleSavePost(uid, id);
      setIsSaved(currentlySaved);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      setIsSaved(isSaved);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Post',
      'Are you sure you want to report this post as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: async () => {
          try {
            const uid = currentUser?.uid || currentUser?.id;
            if (uid) await reportPost(id, uid, 'Inappropriate content');
            Alert.alert('Thank you', 'Our team will review this post.');
          } catch (error) { console.error(error); }
        }},
      ]
    );
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://kurnoolone.com/post/${id}`;
      await Share.share({
        message: `${title}\n\n${content ? content.substring(0, 50) + '...' : ''}\n\nRead more on Kurnool One App:\n${shareUrl}`
      });
    } catch { /* ignore */ }
  };

  const openComments = async () => {
    setShowComments(true);
    setLoadingComments(true);
    try {
      const fetchedComments = await getComments(id);
      setComments(fetchedComments);
    } catch (e) { console.error(e); } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) { Alert.alert('Sign in required'); return; }
    try {
      await addComment(id, uid, newComment);
      setNewComment('');
      const fetchedComments = await getComments(id);
      setComments(fetchedComments);
    } catch (e) { console.error(e); }
  };

  const handleRemove = async () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to remove this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setIsRemoving(true);
            await deletePost(id);
            if (onRefresh) onRefresh();
          } catch {
            Alert.alert('Error', 'Could not delete post');
          } finally {
            setIsRemoving(false);
          }
        }},
      ]
    );
  };

  const canDelete =
    currentUser?.role === 'admin' ||
    currentUser?.uid === postAuthorId ||
    currentUser?.id === postAuthorId;

  if (isRemoving) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#2563EB" style={{ paddingVertical: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('UserProfile', { userId: postAuthorId })}
          style={styles.authorRow}
        >
          {authorPhoto ? (
            <Image source={{ uri: getMediaUrl(authorPhoto) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{author?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{author}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {category && category !== 'General' && category !== 'సాధారణం' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
          {canDelete && (
            <TouchableOpacity onPress={handleRemove} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Media — 4:5 aspect ratio (1080×1350) */}
      {imageUrl && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            const now = Date.now();
            if (lastTapRef.current && (now - lastTapRef.current) < 300) {
              lastTapRef.current = 0;
              if (!localLiked) handleLike();
              setShowLargeHeart(true);
              setTimeout(() => setShowLargeHeart(false), 1000);
            } else {
              lastTapRef.current = now;
            }
          }}
          style={{ position: 'relative' }}
        >
          <Image
            source={{ uri: getMediaUrl(imageUrl as string) }}
            style={[styles.mediaImage, { aspectRatio: imageRatio }]}
            resizeMode="contain"
          />
          {showLargeHeart && (
            <View style={styles.heartOverlay}>
              <Ionicons name="heart" size={100} color="white" />
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {content ? <Text style={styles.body} numberOfLines={3}>{content}</Text> : null}

        {/* Action Bar */}
        <View style={styles.actionBar}>
          {/* Like */}
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <Ionicons
              name={localLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={localLiked ? '#EF4444' : '#9CA3AF'}
            />
            {localLikeCount > 0 && (
              <Text style={[styles.actionCount, localLiked && { color: '#EF4444' }]}>
                {localLikeCount}
              </Text>
            )}
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity onPress={openComments} style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={22} color="#9CA3AF" />
            <Text style={styles.actionCount}>{comments.length > 0 ? comments.length : (commentCount > 0 ? commentCount : '')}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <Ionicons name="paper-plane-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Save */}
          <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? '#2563EB' : '#9CA3AF'}
            />
          </TouchableOpacity>

          {/* Report */}
          <TouchableOpacity onPress={handleReport} style={styles.actionBtn}>
            <Ionicons name="flag-outline" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Modal */}
      <Modal visible={showComments} animationType="slide" transparent={true} onRequestClose={() => setShowComments(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', height: '75%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {loadingComments ? (
              <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                      {item.userPhotoURL ? <Image source={{ uri: item.userPhotoURL }} style={{ width: 36, height: 36, borderRadius: 18 }} /> : <Text style={{ color: '#2563EB', fontWeight: 'bold' }}>{item.userName?.charAt(0) || 'U'}</Text>}
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>{item.userName}</Text>
                      <Text style={{ fontSize: 14, color: '#374151' }}>{item.content}</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>No comments yet. Be the first!</Text>}
              />
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 8 }}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, fontSize: 14 }}
              />
              <TouchableOpacity onPress={submitComment} disabled={!newComment.trim()}>
                <Ionicons name="send" size={24} color={newComment.trim() ? '#2563EB' : '#D1D5DB'} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 16,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  mediaImage: {
    width: '100%',
    backgroundColor: '#000000',
  },
  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heartOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    paddingTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    gap: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});

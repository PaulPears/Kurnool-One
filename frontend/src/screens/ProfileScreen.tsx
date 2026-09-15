import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, RefreshControl, Share, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';
import { useLanguage } from '../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import {
  getUser, fetchUserPosts, deleteUserAccount, toggleFollowUser, checkIsFollowing, fetchSavedPosts, fetchSavedPostIds
} from '../services/firestoreService';

type ProfileTab = 'posts' | 'saved';

export default function ProfileScreen({ route, navigation }: any) {
  const { userId: paramUserId } = route.params || {};
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isSelf, setIsSelf] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { language } = useLanguage();

  useFocusEffect(
    React.useCallback(() => { loadProfile(user !== null); }, [paramUserId, activeTab])
  );

  const loadProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('user');
      const cUser = storedData ? JSON.parse(storedData) : null;
      setCurrentUser(cUser);

      const targetUid = paramUserId || cUser?.uid;
      setIsSelf(!paramUserId || paramUserId === cUser?.uid);

      if (targetUid) {
        const [userInfo, savedIds] = await Promise.all([
          getUser(targetUid),
          cUser?.uid ? fetchSavedPostIds(cUser.uid) : Promise.resolve([])
        ]);

        setUser(userInfo);

        if (isSelf && userInfo && cUser) {
          const updatedLocalUser = { ...cUser, ...userInfo };
          await AsyncStorage.setItem('user', JSON.stringify(updatedLocalUser));
          setCurrentUser(updatedLocalUser);
        }

        if (cUser && !isSelf) {
          const following = await checkIsFollowing(cUser.uid, targetUid);
          setIsFollowing(following);
        }

        if (activeTab === 'posts') {
          const userPosts = await fetchUserPosts(targetUid);
          const mappedPosts = (Array.isArray(userPosts) ? userPosts : []).map(post => ({
            ...post,
            isSaved: savedIds.includes(post.id)
          }));
          setPosts(mappedPosts);
        } else if (activeTab === 'saved' && isSelf) {
          const sPosts = await fetchSavedPosts(targetUid);
          const mappedSaved = sPosts.map(post => ({
            ...post,
            isSaved: true
          }));
          setSavedPosts(mappedSaved);
        }
      }
    } catch (error) {
      console.error('Load Profile Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !user) return;
    setFollowLoading(true);
    try {
      const currentlyFollowing = await toggleFollowUser(currentUser.uid, user.id);
      setIsFollowing(currentlyFollowing);
      setUser({
        ...user,
        followerCount: (user.followerCount || 0) + (currentlyFollowing ? 1 : -1)
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${user?.name}'s profile on Kurnool One App!`,
      });
    } catch (error) {
      console.error('Share Error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await auth.signOut();
        await AsyncStorage.clear();
        navigation.replace('MobileFirebaseLogin');
      }},
    ]);
  };

  const getFilteredPosts = () => {
    if (activeTab === 'posts') return posts;
    if (activeTab === 'saved') return savedPosts;
    return [];
  };

  const renderPostList = () => {
    const data = getFilteredPosts();
    if (data.length === 0) {
      return (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="cube-outline" size={60} color="#1D4ED8" />
            <Ionicons name="paper-plane-outline" size={40} color="#2563EB" style={styles.paperPlane} />
          </View>
          <Text style={styles.emptyTitle}>{language === 'en' ? 'No posts yet' : 'ఇంకా పోస్ట్లు లేవు'}</Text>
          <Text style={styles.emptySubtitle}>{language === 'en' ? 'When you post, they\'ll show up here.' : 'మీరు పోస్ట్ చేసినప్పుడు, అవి ఇక్కడ కనిపిస్తాయి.'}</Text>
          <TouchableOpacity style={styles.createPostButton} onPress={() => navigation.navigate('CreatePost')}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.createPostButtonText}>{language === 'en' ? 'Create Post' : 'పోస్ట్ సృష్టించు'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return data.map(item => (
      <NewsCard
        key={item.id}
        id={item.id}
        title={language === 'en' ? item.title_en : item.title_te}
        content={language === 'en' ? item.content_en : item.content_te}
        category={language === 'en' ? item.name_en : item.name_te}
        author={item.author_name}
        authorPhoto={item.author_photo}
        date={new Date(item.created_at).toLocaleDateString()}
        imageUrl={item.media_url}
        type={item.type}
        likeCount={item.like_count}
        commentCount={item.comment_count}
        likedByMe={item.liked_by_me}
        language={language}
        onRefresh={() => loadProfile(true)}
        authorId={item.author_id}
        fullPosts={data}
        isSaved={item.isSaved}
      />
    ));
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProfile} colors={['#2563EB']} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{language === 'en' ? 'Profile' : 'ప్రొఫైల్'}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Decorative elements */}
          <View style={styles.decorativeCircle} />
          <View style={styles.dottedPattern} />
          
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                </View>
              )}
              {isSelf && (
                <TouchableOpacity style={styles.cameraIcon} onPress={() => navigation.navigate('EditProfile')}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.username}>{user?.name || 'Pears'}</Text>
            {user?.email && (
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                <Text style={styles.phoneNumber}>{user.email}</Text>
              </View>
            )}
          </View>

          {/* Edit Profile Button */}
          {isSelf && (
            <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="pencil" size={18} color="#fff" />
              <Text style={styles.editProfileButtonText}>{language === 'en' ? 'Edit Profile' : 'ప్రొఫైల్ సవరించు'}</Text>
            </TouchableOpacity>
          )}

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Ionicons name="grid-outline" size={20} color="#2563EB" />
              <Text style={styles.statCount}>{posts.length}</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Posts' : 'పోస్ట్లు'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Ionicons name="people-outline" size={20} color="#1D4ED8" />
              <Text style={styles.statCount}>{user?.followerCount || 0}</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Followers' : 'అనుచరులు'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Ionicons name="person-add-outline" size={20} color="#3B82F6" />
              <Text style={styles.statCount}>{user?.followingCount || 0}</Text>
              <Text style={styles.statLabel}>{language === 'en' ? 'Following' : 'అనుసరిస్తున్నారు'}</Text>
            </View>
          </View>
        </View>

        {/* Menu List Cards */}
        <View style={styles.menuContainer}>
          {user && (user.role === 'admin' || user.role === 'super_admin') && isSelf && (
            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('AdminDashboard')}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{language === 'en' ? 'Admin Dashboard' : 'అడ్మిన్ డాష్బోర్డ్'}</Text>
                <Text style={styles.menuSubtitle}>{language === 'en' ? 'Manage users and content' : 'వినియోగదారులు మరియు కంటెంట్‌ను నిర్వహించండి'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuCard} onPress={handleShareProfile}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="share-social-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{language === 'en' ? 'Share Profile' : 'ప్రొఫైల్ పంచుకోండి'}</Text>
              <Text style={styles.menuSubtitle}>{language === 'en' ? 'Share your profile with friends' : 'మీ ప్రొఫైల్ను స్నేహితులతో పంచుకోండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          {renderPostList()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#EFF6FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  dottedPattern: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(29, 78, 216, 0.1)',
    borderStyle: 'dashed',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  notificationBadgeSmall: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationBadgeTextSmall: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  postsSection: {
    paddingHorizontal: 16,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIllustration: {
    position: 'relative',
    marginBottom: 20,
  },
  paperPlane: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: 24,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#2563EB',
  },
  navCenterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -20,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, RefreshControl, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAdminStats, fetchPendingPromotions, fetchFeedPosts,
  updatePostStatus, deletePost, fetchReportedPosts, dismissPostReports,
  fetchAllUsers, banUser, changeUserRole
} from '../services/firestoreService';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

type Tab = 'overview' | 'businesses' | 'promotions' | 'posts' | 'reports' | 'banners' | 'users';

export default function AdminDashboardScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState<any>(null);
  const [data, setData]           = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('user');

  useEffect(() => {
    const checkRole = async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setCurrentUserRole(JSON.parse(u).role || 'user');
    };
    checkRole();
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await getAdminStats();
        setStats(res);
      } else if (activeTab === 'businesses') {
        const snap = await getDocs(query(collection(db, 'businesses'), where('status', '==', 'pending_approval')));
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else if (activeTab === 'promotions') {
        const res = await fetchPendingPromotions();
        setData(res);
      } else if (activeTab === 'posts') {
        const res = await fetchFeedPosts();
        setData(res);
      } else if (activeTab === 'reports') {
        const res = await fetchReportedPosts();
        setData(res);
      } else if (activeTab === 'users') {
        const res = await fetchAllUsers();
        setData(res);
      } else if (activeTab === 'banners') {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBusinessAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await updateDoc(doc(db, 'businesses', id), {
        status: action === 'approve' ? 'published' : 'suspended',
        verificationBadge: action === 'approve' ? 'verified_business' : 'none',
      });
      Alert.alert('Success', `Business ${action === 'approve' ? 'Approved & Published' : 'Rejected'}`);
      fetchData();
    } catch {
      Alert.alert('Error', 'Action failed');
    }
  };

  const handlePromotion = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updatePostStatus(id, status);
      Alert.alert('Success', `Promotion ${status}`);
      fetchData();
    } catch { Alert.alert('Error', 'Action failed'); }
  };

  const handleDeletePost = async (id: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to remove this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deletePost(id);
          fetchData();
        } catch { Alert.alert('Error', 'Deletion failed'); }
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Log out of the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await auth.signOut();
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'MobileFirebaseLogin' }] });
      }},
    ]);
  };

  const renderOverview = () => (
    <ScrollView className="flex-1 p-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}>
      <View className="flex-row flex-wrap justify-between">
        {[
          { label: 'Total Users',    value: stats?.total_users,        icon: 'people',    color: '#3B82F6' },
          { label: 'Total Posts',    value: stats?.total_posts,        icon: 'newspaper', color: '#10B981' },
          { label: 'Pending Promo',  value: stats?.pending_promotions, icon: 'megaphone', color: '#F59E0B' },
          { label: 'Reports',        value: stats?.total_reports,      icon: 'flag',      color: '#EF4444' },
        ].map((item, i) => (
          <View key={i} className="w-[48%] bg-white p-6 rounded-3xl mb-4 shadow-sm border border-gray-100">
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            <Text className="text-3xl font-black text-gray-900 mt-2">{item.value ?? 0}</Text>
            <Text className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{item.label}</Text>
          </View>
        ))}
      </View>
      <View className="mt-6 bg-blue-50 p-6 rounded-3xl border border-blue-100">
        <Text className="text-blue-900 font-bold text-lg mb-2">Platform Health Check</Text>
        <Text className="text-blue-700 text-sm mb-4">
          Everything is running on Firebase. There are {stats?.pending_promotions ?? 0} promotion requests waiting.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
          onPress={() => navigation.navigate('CreatePost', { isPromotionMode: true })}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Send Announcement</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPromotions = () => (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      className="p-4"
      renderItem={({ item }) => (
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-lg flex-1 mr-2" numberOfLines={1}>{item.title_en}</Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-[10px] font-bold uppercase">Pending</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm mb-4" numberOfLines={2}>{item.content_en}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => handlePromotion(item.id, 'approved')} className="flex-1 bg-green-500 py-3 rounded-2xl items-center">
              <Text className="text-white font-bold">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePromotion(item.id, 'rejected')} className="flex-1 bg-red-50 py-3 rounded-2xl items-center border border-red-100">
              <Text className="text-red-500 font-bold">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text className="text-center mt-20 text-gray-400">No pending promotions</Text>}
    />
  );

  const renderModeration = () => (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      className="p-4"
      renderItem={({ item }) => (
        <View className="bg-white p-3 rounded-2xl mb-3 flex-row items-center border border-gray-100">
          {item.media_url ? (
            <Image source={{ uri: item.media_url }} className="w-16 h-16 rounded-xl bg-gray-100" />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center">
              <Ionicons name="newspaper-outline" size={28} color="#9CA3AF" />
            </View>
          )}
          <View className="flex-1 ml-4">
            <Text className="font-bold text-gray-900" numberOfLines={1}>{item.title_en || 'Text Post'}</Text>
            <Text className="text-gray-500 text-xs">by @{item.author_name}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeletePost(item.id)} className="p-3">
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    />
  );

  const handleDismissReport = async (id: string) => {
    try {
      await dismissPostReports(id);
      fetchData();
    } catch {
      Alert.alert('Error', 'Failed to dismiss reports');
    }
  };

  const renderReports = () => (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      className="p-4"
      renderItem={({ item }) => (
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-lg flex-1 mr-2 text-red-600" numberOfLines={1}>Reported Post</Text>
            <View className="bg-red-100 px-3 py-1 rounded-full">
              <Text className="text-red-700 text-[10px] font-bold uppercase">{item.reportCount || 1} Reports</Text>
            </View>
          </View>
          <Text className="text-gray-900 text-sm mb-1 font-bold" numberOfLines={1}>{item.title_en || 'Media Post'}</Text>
          <Text className="text-gray-500 text-xs mb-4" numberOfLines={2}>{item.content_en || 'No text content'}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => handleDeletePost(item.id)} className="flex-1 bg-red-500 py-3 rounded-2xl items-center">
              <Text className="text-white font-bold">Delete Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDismissReport(item.id)} className="flex-1 bg-gray-100 py-3 rounded-2xl items-center border border-gray-200">
              <Text className="text-gray-800 font-bold">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text className="text-center mt-20 text-gray-400">No reported posts</Text>}
    />
  );

  const handleBanUser = async (id: string, currentlyBanned: boolean) => {
    Alert.alert(
      currentlyBanned ? 'Unban User' : 'Ban User',
      currentlyBanned ? 'Allow this user to access the app?' : 'Prevent this user from accessing the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: currentlyBanned ? 'Unban' : 'Ban', style: 'destructive', onPress: async () => {
          try {
            await banUser(id, !currentlyBanned);
            fetchData();
          } catch {
            Alert.alert('Error', 'Failed to update user status');
          }
        }}
      ]
    );
  };

  const handleRoleChange = async (id: string, currentRole: string) => {
    if (currentUserRole !== 'super_admin') {
      Alert.alert('Access Denied', 'Only Super Admins can change roles.');
      return;
    }
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Change Role',
      `Change user role to ${nextRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: async () => {
          try {
            await changeUserRole(id, nextRole as any);
            fetchData();
          } catch {
            Alert.alert('Error', 'Failed to change role');
          }
        }}
      ]
    );
  };

  const renderUsers = () => (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      className="p-4"
      renderItem={({ item }) => (
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-200">
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={24} color="#9CA3AF" />
            )}
          </View>
          <View className="flex-1 ml-4">
            <Text className="font-bold text-gray-900" numberOfLines={1}>{item.name || 'Anonymous'}</Text>
            <Text className="text-gray-500 text-xs">{item.email || item.phoneNumber || 'No contact info'}</Text>
            <TouchableOpacity onPress={() => handleRoleChange(item.id, item.role || 'user')}>
              <Text className={`text-[10px] uppercase font-bold mt-1 ${item.role === 'admin' ? 'text-purple-600' : item.role === 'super_admin' ? 'text-red-600' : 'text-blue-500'}`}>
                Role: {item.role || 'user'} {currentUserRole === 'super_admin' ? '✏️' : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => handleBanUser(item.id, item.isBanned)} 
            className={`px-4 py-2 rounded-xl border ${item.isBanned ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
          >
            <Text className={`font-bold text-xs ${item.isBanned ? 'text-green-600' : 'text-red-600'}`}>
              {item.isBanned ? 'Unban' : 'Ban'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text className="text-center mt-20 text-gray-400">No users found</Text>}
    />
  );

  const renderBusinesses = () => (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      className="p-4"
      renderItem={({ item }) => (
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-lg flex-1 mr-2" numberOfLines={1}>{item.name_en || item.name_te}</Text>
            <View className="bg-amber-100 px-3 py-1 rounded-full">
              <Text className="text-amber-700 text-[10px] font-bold uppercase">Pending Review</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm mb-1">{item.address}</Text>
          <Text className="text-gray-500 text-xs mb-3">Phone: {item.phone}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => handleBusinessAction(item.id, 'approve')} className="flex-1 bg-green-500 py-3 rounded-2xl items-center">
              <Text className="text-white font-bold">Approve & Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBusinessAction(item.id, 'reject')} className="flex-1 bg-red-50 py-3 rounded-2xl items-center border border-red-100">
              <Text className="text-red-500 font-bold">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text className="text-center mt-20 text-gray-400">No pending business registrations</Text>}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-6 border-b border-gray-100 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-black text-gray-900">Admin Panel</Text>
          <Text className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Command Center</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row px-4 py-4 space-x-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['overview', 'businesses', 'promotions', 'posts', 'reports', 'banners', 'users'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-full border mr-2 ${activeTab === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-100'}`}
            >
              <Text className={`font-bold text-xs uppercase ${activeTab === t ? 'text-white' : 'text-gray-400'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <View className="flex-1">
          {activeTab === 'overview'    && renderOverview()}
          {activeTab === 'businesses'  && renderBusinesses()}
          {activeTab === 'promotions'  && renderPromotions()}
          {activeTab === 'posts'       && renderModeration()}
          {activeTab === 'reports'     && renderReports()}
          {activeTab === 'banners'     && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', marginBottom: 16 }}>Manage promotion banners</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminBanners')}
                style={{ backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Open Banner Manager</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'users'       && renderUsers()}
        </View>
      )}
    </SafeAreaView>
  );
}

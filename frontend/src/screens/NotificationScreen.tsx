import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications, getBroadcastNotifications, markNotificationsRead } from '../services/firestoreService';

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('user');
      let personalData: any[] = [];
      let uid = '';
      if (stored) {
        const user = JSON.parse(stored);
        uid = user?.uid || user?.id;
        if (uid) {
          personalData = await getNotifications(uid);
          await markNotificationsRead(uid);
        }
      }

      // Always fetch public broadcast announcements
      const broadcasts = await getBroadcastNotifications(20);

      // Merge and sort newest first
      const combined = [...broadcasts, ...personalData].sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      });

      setNotifications(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = (item: any) => {
    if (item.isBroadcast) {
      if (item.actionUrl?.includes('offer') || item.category === 'deal') {
        navigation.navigate('Main', { screen: 'Offers' });
      } else if (item.actionUrl?.includes('news') || item.category === 'breaking') {
        navigation.navigate('News');
      } else if (item.actionUrl?.includes('event') || item.category === 'event') {
        navigation.navigate('Main', { screen: 'Explore' });
      } else if (item.actionUrl?.includes('blood')) {
        navigation.navigate('BloodDonors');
      } else {
        navigation.navigate('Main', { screen: 'Explore' });
      }
      return;
    }

    if (item.type === 'deal' || item.type === 'offer') {
      navigation.navigate('Main', { screen: 'Offers' });
    } else if (item.type === 'news') {
      navigation.navigate('News');
    } else if (item.type === 'business' && item.businessId) {
      navigation.navigate('BusinessDetail', { businessId: item.businessId });
    } else if (item.type === 'pro' && item.proId) {
      navigation.navigate('ProfessionalDetail', { proId: item.proId });
    }
  };

  const renderNotification = ({ item }: any) => {
    if (item.isBroadcast) {
      return (
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.8}
          className="px-4 py-4 border-b border-gray-100 flex-row items-start bg-amber-50/40"
        >
          <View className="w-11 h-11 rounded-2xl bg-amber-500/20 items-center justify-center mr-3 mt-0.5">
            <Ionicons name="megaphone" size={20} color="#D97706" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Text className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {item.category === 'deal' ? '🏷️ Deal' : item.category === 'breaking' ? '⚡ Breaking' : item.category === 'alert' ? '⚠️ Alert' : '📢 Broadcast'}
              </Text>
              <Text className="text-gray-400 text-xs">
                {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Text className="font-bold text-gray-900 text-sm leading-snug">{item.title}</Text>
            <Text className="text-gray-600 text-xs mt-1 leading-relaxed">{item.body}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const isLike   = item.type === 'like';
    const isReport = item.type === 'report';
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
        className={`px-4 py-4 border-b border-gray-50 flex-row items-center ${item.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
      >
        <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
          {item.actorPhoto ? (
            <Image source={{ uri: item.actorPhoto }} className="w-12 h-12 rounded-full" />
          ) : (
            <Text className="text-blue-600 font-bold text-lg">{item.actorName?.charAt(0) || '?'}</Text>
          )}
          <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-100">
            <Text className="text-xs">{isLike ? '❤️' : isReport ? '⚠️' : '💬'}</Text>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 leading-snug">
            <Text className="font-bold">{item.actorName}</Text>{' '}
            {isLike ? 'liked your post' : isReport ? 'reported a post for review' : 'commented on your post'}
            {item.postTitle ? `: "${item.postTitle}"` : ''}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-center relative">
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute right-4 top-4">
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 opacity-40">
              <Text className="text-6xl mb-4">🔔</Text>
              <Text className="text-lg font-bold">No notifications yet</Text>
              <Text className="text-gray-500">When someone likes or comments, you'll see it here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

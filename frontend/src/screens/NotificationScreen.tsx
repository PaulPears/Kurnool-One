import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications, markNotificationsRead } from '../services/firestoreService';

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      const uid  = user?.uid || user?.id;
      if (!uid) return;

      const data = await getNotifications(uid);
      setNotifications(data);
      await markNotificationsRead(uid);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }: any) => {
    const isLike   = item.type === 'like';
    const isReport = item.type === 'report';
    return (
      <TouchableOpacity
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

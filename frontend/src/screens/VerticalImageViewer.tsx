import React, { useState, useRef } from 'react';
import { View, Text, Image, FlatList, Dimensions, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function ImageItem({ item, navigation }: any) {
  const { language } = useLanguage();

  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-black relative justify-center">
      <Image 
        source={{ uri: item.media_url }} 
        className="w-full h-[80%] bg-gray-900"
        resizeMode="contain"
      />

      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="absolute top-12 left-6 w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/20"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Content Overlay */}
      <View className="absolute bottom-16 left-6 right-20">
        <Text className="text-white font-bold text-lg mb-2 shadow-lg">@{item.author_name}</Text>
        <Text className="text-white text-base mb-1 shadow-md">
          {language === 'en' ? item.title_en : item.title_te}
        </Text>
        <Text className="text-white/80 text-sm shadow-md" numberOfLines={3}>
          {language === 'en' ? item.content_en : item.content_te}
        </Text>
      </View>

      {/* Side Actions */}
      <View className="absolute right-6 bottom-32 items-center">
        <TouchableOpacity className="items-center mb-8">
          <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20">
            <Ionicons name="heart" size={32} color={item.liked_by_me ? "#FF3B30" : "white"} />
          </View>
          <Text className="text-white text-xs font-bold mt-1">{item.like_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20">
            <Ionicons name="share-social" size={32} color="white" />
          </View>
          <Text className="text-white text-xs font-bold mt-1">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function VerticalImageViewer({ route, navigation }: any) {
  const { posts, initialId } = route.params || {};
  
  // Filter only image posts for this viewer
  const imagePosts = posts.filter((p: any) => p.type === 'image');
  const initialIndex = imagePosts.findIndex((p: any) => p.id === initialId);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <FlatList
        data={imagePosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ImageItem item={item} navigation={navigation} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

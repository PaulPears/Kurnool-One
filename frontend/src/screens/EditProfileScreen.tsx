import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile, uploadProfilePhoto } from '../services/firestoreService';

export default function EditProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const u = JSON.parse(data);
        setUser(u);
        setName(u.name || '');
        setBio(u.bio || '');
        setPhotoUri(u.photoURL || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      let url = user.photoURL;
      if (photoUri && photoUri !== user.photoURL) {
        url = await uploadProfilePhoto(user.id, photoUri);
      }
      const updates = { name, bio, photoURL: url };
      await updateUserProfile(user.id, updates);
      
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <SafeAreaView className="flex-1 bg-white" />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="close" size={26} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-900">Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={loading}
          className={`px-5 py-2 rounded-full ${loading ? 'bg-blue-400' : 'bg-blue-600'} shadow-sm`}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text className="text-white font-bold text-[13px]">Save</Text>}
        </TouchableOpacity>
      </View>

      <View className="p-6 items-center">
        <View className="relative mb-8 mt-4">
          <View className="w-32 h-32 rounded-full bg-blue-50 overflow-hidden items-center justify-center border-4 border-white shadow-sm">
            {photoUri ? (
              <Image source={{ uri: photoUri }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={56} color="#9CA3AF" />
            )}
          </View>
          <TouchableOpacity 
            onPress={pickImage} 
            className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full border-4 border-white items-center justify-center shadow-sm"
          >
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View className="w-full mb-5">
          <Text className="text-gray-500 font-bold text-[11px] mb-2 ml-1 uppercase tracking-wider">Display Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900 font-semibold"
            placeholder="Your Name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="w-full mb-5">
          <Text className="text-gray-500 font-bold text-[11px] mb-2 ml-1 uppercase tracking-wider">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900 font-semibold"
            placeholder="Tell us about yourself..."
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

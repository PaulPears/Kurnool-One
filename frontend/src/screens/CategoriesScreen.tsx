import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { getCategories } from '../services/firestoreService';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch Categories Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row justify-between items-center mt-8">
        <Text className="text-2xl font-bold text-gray-900">
          {language === 'en' ? 'Categories' : 'వర్గాలు'}
        </Text>
        <View className="flex-row bg-gray-100 rounded-full p-1 border border-gray-200">
          <TouchableOpacity 
            onPress={toggleLanguage}
            className="px-4 py-1.5 rounded-full bg-white shadow"
          >
            <Text className="font-semibold text-sm text-blue-600">
              {language === 'en' ? 'తెలుగు' : 'ENG'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-white p-6 rounded-2xl w-[48%] items-center justify-center shadow-sm border border-gray-100 h-32">
            <Text className="text-3xl mb-3">📍</Text>
            <Text className="text-base font-bold text-gray-800 text-center">
              {language === 'en' ? item.name_en : item.name_te}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}


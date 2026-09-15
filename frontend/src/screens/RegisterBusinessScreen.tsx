import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../context/LanguageContext';
import { MASTER_CATEGORIES, registerBusiness } from '../services/directoryService';
import { auth } from '../config/firebase';

export default function RegisterBusinessScreen({ navigation }: any) {
  const { language } = useLanguage();

  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [categoryId, setCategoryId] = useState(MASTER_CATEGORIES[0].id);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [timing, setTiming] = useState('10:00 AM - 09:00 PM');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!nameEn.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Required Fields', 'Please provide Business Name, Phone Number, and Address.');
      return;
    }

    setLoading(true);
    try {
      await registerBusiness({
        name_en: nameEn.trim(),
        name_te: nameTe.trim() || nameEn.trim(),
        categoryId,
        subcategoryId: 'general',
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        timing: timing.trim(),
        description_en: description.trim() || 'Local business in Kurnool',
        description_te: description.trim() || 'కర్నూలులోని స్థానిక వ్యాపారం',
        images: imageUri ? [imageUri] : [],
        amenities: ['UPI Accepted'],
      });

      Alert.alert(
        'Submission Received!',
        'Thank you for registering your business with Kurnool One. Our admin team will review and approve your listing shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit business registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {language === 'en' ? 'Register Business / Service' : 'వ్యాపార నమోదు'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerNote}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text style={styles.bannerNoteText}>
            List your business or skilled professional service on Kurnool One to reach thousands of residents across Kurnool.
          </Text>
        </View>

        {/* Image Picker */}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', fontWeight: '700', marginTop: 6 }}>
                Add Storefront / Profile Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <Text style={styles.label}>Business / Service Name (English) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Royal Rayalaseema Restaurant"
          placeholderTextColor="#9CA3AF"
          value={nameEn}
          onChangeText={setNameEn}
        />

        <Text style={styles.label}>Business Name in Telugu (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="ఉదా: రాయలసీమ రెస్టారెంట్"
          placeholderTextColor="#9CA3AF"
          value={nameTe}
          onChangeText={setNameTe}
        />

        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {MASTER_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
              >
                <Text style={[styles.catPillText, categoryId === cat.id && styles.catPillTextActive]}>
                  {language === 'en' ? cat.name_en : cat.name_te}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Phone Number (For Customer Calls) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9848012345"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>WhatsApp Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9848012345"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />

        <Text style={styles.label}>Full Address (Street / Area / Kurnool) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Near Old Bus Stand, Park Road, Kurnool"
          placeholderTextColor="#9CA3AF"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Opposite State Bank"
          placeholderTextColor="#9CA3AF"
          value={landmark}
          onChangeText={setLandmark}
        />

        <Text style={styles.label}>Working Hours / Timings</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 09:30 AM - 09:00 PM"
          placeholderTextColor="#9CA3AF"
          value={timing}
          onChangeText={setTiming}
        />

        <Text style={styles.label}>Services / Business Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 90 }]}
          placeholder="Tell customers about your products, specialties, and experience..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  bannerNote: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EFF6FF', padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 16,
  },
  bannerNoteText: { fontSize: 12, color: '#1E40AF', flex: 1, lineHeight: 17 },
  imagePicker: {
    height: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 2,
    borderColor: '#E5E7EB', borderStyle: 'dashed', backgroundColor: '#FFFFFF',
    marginBottom: 16, justifyContent: 'center', alignItems: 'center',
  },
  previewImg: { width: '100%', height: '100%' },
  pickerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  catPillActive: { backgroundColor: '#2563EB' },
  catPillText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  catPillTextActive: { color: '#FFFFFF' },
  submitBtn: {
    backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});

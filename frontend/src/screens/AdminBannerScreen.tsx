import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  Image, Alert, ActivityIndicator, TextInput, ScrollView, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  fetchPromotionBanners, createPromotionBanner,
  updatePromotionBanner, deletePromotionBanner, uploadBannerImage,
} from '../services/firestoreService';

export default function AdminBannerScreen({ navigation }: any) {
  const [banners, setBanners]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [imageUri, setImageUri]     = useState('');
  const [title, setTitle]           = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadBanners();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) setCurrentUser(JSON.parse(data));
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchPromotionBanners();
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const resetForm = () => {
    setImageUri('');
    setTitle('');
    setRedirectUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!imageUri && !editingId) {
      Alert.alert('Error', 'Please pick a banner image first.');
      return;
    }
    setSaving(true);
    try {
      let finalImageUrl = imageUri;

      // Only upload if it's a new local file (not an existing Firestore URL)
      if (imageUri && !imageUri.startsWith('http')) {
        finalImageUrl = await uploadBannerImage(currentUser?.uid || 'admin', imageUri);
      }

      if (editingId) {
        await updatePromotionBanner(editingId, {
          imageUrl: finalImageUrl,
          title,
          redirectUrl,
        });
        Alert.alert('Success', 'Banner updated!');
      } else {
        await createPromotionBanner({
          imageUrl: finalImageUrl,
          title,
          redirectUrl,
          active: true,
        });
        Alert.alert('Success', 'Banner published!');
      }
      resetForm();
      loadBanners();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setImageUri(banner.imageUrl || '');
    setTitle(banner.title || '');
    setRedirectUrl(banner.redirectUrl || '');
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Banner', 'Remove this promotion banner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deletePromotionBanner(id);
        loadBanners();
      }},
    ]);
  };

  const handleToggleActive = async (banner: any) => {
    await updatePromotionBanner(banner.id, { active: !banner.active });
    loadBanners();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotion Banners</Text>
        <TouchableOpacity
          onPress={() => { resetForm(); setShowForm(true); }}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Add / Edit Form */}
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{editingId ? 'Edit Banner' : 'New Banner'}</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                  <Text style={{ color: '#9CA3AF', fontWeight: '600', marginTop: 8 }}>
                    Tap to pick banner image
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Banner Title (optional)"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={styles.input}
              placeholder="Redirect URL (https://...)"
              value={redirectUrl}
              onChangeText={setRedirectUrl}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>{editingId ? 'Update Banner' : 'Publish Banner'}</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Banner List */}
        <Text style={styles.sectionTitle}>Active Banners ({banners.length})</Text>
        {loading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 40 }} />
        ) : banners.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.4 }}>
            <Ionicons name="image-outline" size={60} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', marginTop: 8, fontWeight: '600' }}>No banners yet</Text>
          </View>
        ) : (
          banners.map(banner => (
            <View key={banner.id} style={styles.bannerCard}>
              {banner.imageUrl ? (
                <Image source={{ uri: banner.imageUrl }} style={styles.bannerThumbnail} resizeMode="cover" />
              ) : (
                <View style={[styles.bannerThumbnail, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {banner.title || 'Untitled Banner'}
                </Text>
                {banner.redirectUrl ? (
                  <Text style={styles.bannerUrl} numberOfLines={1}>{banner.redirectUrl}</Text>
                ) : null}
                <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleToggleActive(banner)}
                    style={[styles.toggleBtn, banner.active ? styles.activeBtn : styles.inactiveBtn]}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: banner.active ? '#16A34A' : '#9CA3AF' }}>
                      {banner.active ? 'LIVE' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEdit(banner)} style={styles.iconBtn}>
                    <Ionicons name="pencil-outline" size={16} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(banner.id)} style={[styles.iconBtn, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  addBtn: {
    backgroundColor: '#2563EB', width: 36, height: 36,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  form: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  formTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  imagePicker: {
    borderRadius: 14, overflow: 'hidden', marginBottom: 14,
    borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed',
    minHeight: 140,
  },
  previewImage: { width: '100%', height: 160 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', marginBottom: 10,
  },
  saveBtn: {
    flex: 1, backgroundColor: '#2563EB', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cancelBtn: {
    flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  cancelBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 14 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  bannerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  bannerThumbnail: { width: 80, height: 60, borderRadius: 10 },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  bannerUrl: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeBtn: { backgroundColor: '#DCFCE7' },
  inactiveBtn: { backgroundColor: '#F3F4F6' },
  iconBtn: { backgroundColor: '#EFF6FF', padding: 6, borderRadius: 8 },
});

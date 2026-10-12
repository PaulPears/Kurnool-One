import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  TextInput, Image, ActivityIndicator, StatusBar, Linking, StyleSheet, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import {
  MASTER_CATEGORIES, PROFESSIONAL_CATEGORIES, fetchBusinesses, fetchProfessionals,
  BusinessItem, ProfessionalItem, CategoryItem,
} from '../services/directoryService';

export default function DirectoryScreen({ route, navigation }: any) {
  const { initialCategory, initialTab } = route.params || {};
  const { language } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'businesses' | 'professionals'>(
    initialTab === 'professionals' ? 'professionals' : 'businesses'
  );
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  useEffect(() => {
    if (route.params?.initialTab === 'professionals') {
      setActiveTab('professionals');
    } else if (route.params?.initialTab === 'businesses') {
      setActiveTab('businesses');
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    if (route.params?.initialCategory) {
      setSelectedCategory(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  useEffect(() => {
    loadData();
  }, [selectedCategory, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'businesses') {
        const data = await fetchBusinesses(selectedCategory, searchQuery);
        setBusinesses(data);
      } else {
        const data = await fetchProfessionals(selectedCategory, searchQuery);
        setProfessionals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (activeTab === 'businesses') {
      const data = await fetchBusinesses(selectedCategory, text);
      setBusinesses(data);
    } else {
      const data = await fetchProfessionals(selectedCategory, text);
      setProfessionals(data);
    }
  };

  const currentCategoryObj = MASTER_CATEGORIES.find(c => c.id === selectedCategory);

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleWhatsApp = (phone: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      Linking.openURL(`https://wa.me/${waNumber}?text=Hello, I found your listing on Kurnool One.`).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Kurnool Businesses' : 'కర్నూలు వ్యాపారాలు'}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'Commercial Businesses & Professional Profiles' : 'వ్యాపారాలు & నిపుణుల ప్రొఫైళ్లు'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate(activeTab === 'professionals' ? 'RegisterProfessional' : 'RegisterBusiness')}
          style={styles.addBizBtn}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBizText}>
            {activeTab === 'professionals'
              ? (language === 'en' ? 'List Yourself' : 'నమోదు')
              : (language === 'en' ? 'List Shop' : 'నమోదు')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'en' ? 'Search by name, category or service...' : 'పేరు, వర్గం లేదా సేవ ద్వారా వెతకండి...'}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Mode Tabs: Businesses vs Skilled Professionals */}
      <View style={styles.typeTabsContainer}>
        <TouchableOpacity
          onPress={() => { setActiveTab('businesses'); setSelectedCategory('all'); }}
          style={[styles.typeTab, activeTab === 'businesses' && styles.typeTabActive]}
        >
          <Ionicons
            name="business"
            size={16}
            color={activeTab === 'businesses' ? '#2563EB' : '#6B7280'}
          />
          <Text style={[styles.typeTabText, activeTab === 'businesses' && styles.typeTabTextActive]}>
            {language === 'en' ? 'Shops & Businesses' : 'దుకాణాలు & వ్యాపారాలు'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setActiveTab('professionals'); setSelectedCategory('all'); }}
          style={[styles.typeTab, activeTab === 'professionals' && styles.typeTabActive]}
        >
          <Ionicons
            name="hammer"
            size={16}
            color={activeTab === 'professionals' ? '#2563EB' : '#6B7280'}
          />
          <Text style={[styles.typeTabText, activeTab === 'professionals' && styles.typeTabTextActive]}>
            {language === 'en' ? 'Skilled Pros / Near You' : 'నైపుణ్య నిపుణులు'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Dropdown and Filter Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10, marginBottom: 4 }}>
        <TouchableOpacity
          onPress={() => setShowCategoryModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#EFF6FF',
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#BFDBFE',
            gap: 6,
          }}
        >
          <Ionicons name="grid-outline" size={14} color="#2563EB" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#1D4ED8' }}>
            {selectedCategory === 'all'
              ? (activeTab === 'professionals' ? 'All Professions ▼' : 'All Categories ▼')
              : ((activeTab === 'professionals'
                  ? PROFESSIONAL_CATEGORIES.find(c => c.id === selectedCategory)
                  : MASTER_CATEGORIES.find(c => c.id === selectedCategory))?.name_en || 'Category') + ' ▼'}
          </Text>
        </TouchableOpacity>

        {selectedCategory !== 'all' && (
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>Clear Filter ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Horizontal Filter (Businesses & Professionals) */}
      <View style={styles.categoryScrollWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={
            activeTab === 'professionals'
              ? [{ id: 'all', name_en: 'All Pros', name_te: 'అందరూ' }, ...PROFESSIONAL_CATEGORIES]
              : [{ id: 'all', name_en: 'All', name_te: 'అన్నీ' }, ...MASTER_CATEGORIES]
          }
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            const catColor = (item as any).color || '#2563EB';
            const catBg = (item as any).bgLight || '#EFF6FF';
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(item.id);
                  setSelectedSubcategory('all');
                }}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: catColor, borderColor: catColor }
                    : { backgroundColor: catBg, borderColor: `${catColor}30` }
                ]}
              >
                {(item as any).icon && item.id !== 'all' ? (
                  <Ionicons
                    name={(item as any).icon}
                    size={13}
                    color={isSelected ? '#FFFFFF' : catColor}
                    style={{ marginRight: 5 }}
                  />
                ) : null}
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected
                      ? { color: '#FFFFFF', fontWeight: '800' }
                      : { color: catColor, fontWeight: '700' }
                  ]}
                >
                  {language === 'en' ? item.name_en : item.name_te}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'businesses' ? (
        <FlatList
          data={businesses}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const coverUri = item.coverImage || item.bannerUrl || (item.images && item.images.length > 0 ? item.images[0] : null);
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
                style={styles.bizCard}
              >
                {coverUri ? (
                  <Image source={{ uri: coverUri }} style={styles.bizImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.bizImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="storefront-outline" size={36} color="#2563EB" />
                  </View>
                )}

                <View style={styles.bizContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.bizTitle} numberOfLines={1}>
                    {language === 'en' ? item.name_en : (item.name_te || item.name_en)}
                  </Text>
                  {item.tier === 'featured' && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>FEATURED</Text>
                    </View>
                  )}
                </View>

                {(() => {
                  const bizCat = MASTER_CATEGORIES.find(c => c.id === item.categoryId);
                  const catColor = bizCat?.color || '#2563EB';
                  const catBg = bizCat?.bgLight || '#EFF6FF';
                  const catIcon = (bizCat?.icon as any) || 'storefront';
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: catBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4, marginBottom: 4, borderWidth: 1, borderColor: `${catColor}30` }}>
                      <Ionicons name={catIcon} size={12} color={catColor} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: catColor }}>
                        {language === 'en' ? (bizCat?.name_en || item.customCategory || 'Business') : (bizCat?.name_te || item.customCategory || 'వ్యాపారం')}
                      </Text>
                    </View>
                  );
                })()}

                <Text style={styles.bizAddress} numberOfLines={1}>
                  <Ionicons name="location-outline" size={13} color="#6B7280" /> {item.address}
                </Text>

                <View style={styles.bizMetaRow}>
                  <View style={styles.ratingPill}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.ratingAvg.toFixed(1)}</Text>
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>({item.ratingCount})</Text>
                  </View>
                  {item.timing && (
                    <Text style={styles.bizTiming} numberOfLines={1}>
                      <Ionicons name="time-outline" size={12} color="#6B7280" /> {item.timing}
                    </Text>
                  )}
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.bizActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleCall(item.phone)}
                    style={styles.actionBtnCall}
                  >
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnTextCall}>Call</Text>
                  </TouchableOpacity>

                  {item.whatsapp && (
                    <TouchableOpacity
                      onPress={() => handleWhatsApp(item.whatsapp!)}
                      style={styles.actionBtnWa}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnTextWa}>WhatsApp</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
                    style={styles.actionBtnDetails}
                  >
                    <Text style={styles.actionBtnTextDetails}>View &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {language === 'en' ? 'No businesses found' : 'వ్యాపారాలు కనిపించలేదు'}
              </Text>
              <Text style={styles.emptySub}>
                {language === 'en' ? 'Try searching another category or keyword.' : 'మరొక వర్గాన్ని శోధించండి.'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={professionals}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const proCat = PROFESSIONAL_CATEGORIES.find(c => c.id === item.category || c.name_en === item.category);
            const catColor = proCat?.color || '#0D9488';
            const catBg = proCat?.bgLight || '#F0FDFA';
            const catIcon = (proCat?.icon as any) || 'briefcase';

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProfessionalDetail', { pro: item })}
                style={styles.proCard}
              >
                <View style={styles.proHeader}>
                  <View style={[styles.proAvatar, { backgroundColor: catBg, borderColor: `${catColor}40` }]}>
                    {item.avatarUrl ? (
                      <Image source={{ uri: item.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                    ) : (
                      <Text style={[styles.proAvatarText, { color: catColor }]}>{item.fullName.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.proName} numberOfLines={1}>{item.fullName}</Text>
                      {item.verifiedProfessional && (
                        <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: catBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4, marginBottom: 3, borderWidth: 1, borderColor: `${catColor}30` }}>
                      <Ionicons name={catIcon} size={12} color={catColor} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: catColor }}>
                        {language === 'en' ? (proCat?.name_en || item.category) : (proCat?.name_te || item.categoryName_te || item.category)}
                      </Text>
                    </View>
                    <Text style={styles.proExp}>
                      {item.experienceYears} Years Experience • Rating {item.ratingAvg.toFixed(1)} ★
                    </Text>
                  </View>
                </View>

              {item.serviceAreas && item.serviceAreas.length > 0 && (
                <View style={styles.serviceAreasWrap}>
                  <Ionicons name="location" size={13} color="#2563EB" />
                  <Text style={styles.serviceAreasText} numberOfLines={1}>
                    Areas: {item.serviceAreas.join(', ')}
                  </Text>
                </View>
              )}

              <View style={styles.proActionsRow}>
                {item.visitingCharges && (
                  <Text style={styles.proChargeText}>
                    Visit: <Text style={{ fontWeight: '800', color: '#111827' }}>{item.visitingCharges}</Text>
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginLeft: 'auto' }}>
                  <TouchableOpacity
                    onPress={() => handleCall(item.phone)}
                    style={styles.actionBtnCall}
                  >
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnTextCall}>Call</Text>
                  </TouchableOpacity>

                  {item.whatsapp && (
                    <TouchableOpacity
                      onPress={() => handleWhatsApp(item.whatsapp!)}
                      style={styles.actionBtnWa}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnTextWa}>WhatsApp</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="construct-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {language === 'en' ? 'No professionals found' : 'నిపుణులు కనిపించలేదు'}
            </Text>
            <Text style={styles.emptySub}>
              {language === 'en' ? 'Try searching another category or keyword.' : 'మరొక వర్గాన్ని శోధించండి.'}
            </Text>
          </View>
        }
      />
    )}

      {/* Category Dropdown Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
                  {activeTab === 'professionals' ? 'Select Profession' : 'Select Business Category'}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Filter Kurnool {activeTab === 'professionals' ? 'experts & technicians' : 'commercial shops'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Option to view all */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('all');
                  setShowCategoryModal(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  marginBottom: 6,
                  backgroundColor: selectedCategory === 'all' ? '#EFF6FF' : '#F9FAFB',
                  borderWidth: 1,
                  borderColor: selectedCategory === 'all' ? '#BFDBFE' : '#F3F4F6',
                }}
              >
                <Ionicons name="apps" size={20} color={selectedCategory === 'all' ? '#2563EB' : '#6B7280'} />
                <Text style={{ marginLeft: 12, fontSize: 14, fontWeight: selectedCategory === 'all' ? '800' : '600', color: selectedCategory === 'all' ? '#1D4ED8' : '#374151', flex: 1 }}>
                  {activeTab === 'professionals' ? 'All Professionals & Specialists' : 'All Commercial Categories'}
                </Text>
                {selectedCategory === 'all' && (
                  <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                )}
              </TouchableOpacity>

              {(activeTab === 'professionals' ? PROFESSIONAL_CATEGORIES : MASTER_CATEGORIES).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setShowCategoryModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      marginBottom: 6,
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isSelected ? '#BFDBFE' : '#F3F4F6',
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: `${(cat as any).color || '#2563EB'}18`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={(cat.icon as any) || 'pricetag'}
                        size={19}
                        color={(cat as any).color || '#2563EB'}
                      />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: isSelected ? '800' : '600', color: isSelected ? '#1D4ED8' : '#1F2937' }}>
                        {language === 'en' ? cat.name_en : cat.name_te}
                      </Text>
                      {cat.name_te && language === 'en' ? (
                        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>{cat.name_te}</Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1D4ED8', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  addBizBtn: {
    backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center',
    gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  addBizText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  searchBarContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginTop: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111827' },
  typeTabsContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 10,
    backgroundColor: '#E5E7EB', borderRadius: 12, padding: 3,
  },
  typeTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 10,
  },
  typeTabActive: { backgroundColor: '#FFFFFF' },
  typeTabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  typeTabTextActive: { color: '#2563EB', fontWeight: '800' },
  categoryScrollWrap: { marginTop: 4, backgroundColor: '#FFFFFF' },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryChipActive: { backgroundColor: '#2563EB' },
  categoryChipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  categoryChipTextActive: { color: '#FFFFFF' },
  bizCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  bizImage: { width: '100%', height: 160 },
  bizContent: { padding: 14 },
  bizTitle: { fontSize: 17, fontWeight: '800', color: '#111827', flex: 1 },
  featuredBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A',
  },
  featuredText: { fontSize: 9, fontWeight: '900', color: '#B45309', letterSpacing: 0.5 },
  bizAddress: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  bizMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7',
  },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
  bizTiming: { fontSize: 11, color: '#4B5563', flex: 1 },
  bizActionsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
  },
  actionBtnCall: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnTextCall: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  actionBtnWa: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#16A34A', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnTextWa: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  actionBtnDetails: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 8 },
  actionBtnTextDetails: { color: '#2563EB', fontWeight: '800', fontSize: 13 },
  proCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  proHeader: { flexDirection: 'row', alignItems: 'center' },
  proAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#DBEAFE',
  },
  proAvatarText: { fontSize: 20, fontWeight: '900', color: '#2563EB' },
  proName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  proCategory: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 1 },
  proExp: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  serviceAreasWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, marginTop: 10,
  },
  serviceAreasText: { fontSize: 11, color: '#1E40AF', fontWeight: '600' },
  proActionsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
  },
  proChargeText: { fontSize: 12, color: '#6B7280' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 60, opacity: 0.5 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginTop: 10 },
  emptySub: { fontSize: 13, color: '#6B7280', marginTop: 4, textAlign: 'center' },
});

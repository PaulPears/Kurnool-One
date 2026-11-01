import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Linking, ActivityIndicator, StatusBar, StyleSheet, Modal, Share,
  TextInput, Alert, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchBloodDonors,
  registerBloodDonor,
  updateBloodDonor,
  deleteBloodDonor,
  fetchMyBloodDonorProfile,
  BloodDonorItem,
} from '../services/directoryService';

const BLOOD_GROUPS = ['All', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const SEED_BLOOD_DONORS: BloodDonorItem[] = [
  {
    id: 'seed_bd1',
    userId: 'seed_1',
    displayName: 'Praveen Kumar',
    bloodGroup: 'O+',
    phone: '9848011223',
    showPhonePublicly: true,
    area: 'Gayatri Estate, Kurnool',
    availability: 'available',
    notes: 'Available for urgent emergency requests',
    status: 'active',
  },
  {
    id: 'seed_bd2',
    userId: 'seed_2',
    displayName: 'M. Ramesh',
    bloodGroup: 'A+',
    phone: '9440198765',
    showPhonePublicly: true,
    area: 'Nandyal Checkpost, Kurnool',
    availability: 'available',
    notes: 'Regular donor at Kurnool General Hospital',
    status: 'active',
  },
  {
    id: 'seed_bd3',
    userId: 'seed_3',
    displayName: 'Syed Farooq',
    bloodGroup: 'B+',
    phone: '9123456780',
    showPhonePublicly: true,
    area: 'Joharapuram Road, Kurnool',
    availability: 'available',
    notes: 'Available during day time',
    status: 'active',
  },
  {
    id: 'seed_bd4',
    userId: 'seed_4',
    displayName: 'K. Sreekanth',
    bloodGroup: 'AB+',
    phone: '9849200001',
    showPhonePublicly: true,
    area: 'B Camp, Kurnool',
    availability: 'available',
    notes: 'Available on weekends and evenings',
    status: 'active',
  },
  {
    id: 'seed_bd5',
    userId: 'seed_5',
    displayName: 'D. Venkat',
    bloodGroup: 'O-',
    phone: '9848055667',
    showPhonePublicly: true,
    area: 'Abbas Nagar, Kurnool',
    availability: 'available',
    notes: 'Universal rare donor • Emergency response',
    status: 'active',
  },
  {
    id: 'seed_bd6',
    userId: 'seed_6',
    displayName: 'Anil Reddy',
    bloodGroup: 'A-',
    phone: '9989012345',
    showPhonePublicly: true,
    area: 'Birla Compound, Kurnool',
    availability: 'available',
    notes: 'Available for hospital emergencies',
    status: 'active',
  },
];

export default function BloodDonorsScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [donors, setDonors] = useState<BloodDonorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Donor Registration / Manage Modal State
  const [donorModalVisible, setDonorModalVisible] = useState(false);
  const [myDonorProfile, setMyDonorProfile] = useState<BloodDonorItem | null>(null);
  const [donorName, setDonorName] = useState('');
  const [donorBloodGroup, setDonorBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorArea, setDonorArea] = useState('');
  const [donorNotes, setDonorNotes] = useState('');
  const [donorConsent, setDonorConsent] = useState(false);
  const [donorAvailability, setDonorAvailability] = useState<'available' | 'donated_recently' | 'unavailable'>('available');
  const [savingDonor, setSavingDonor] = useState(false);

  useEffect(() => {
    loadDonors();
    checkMyProfile();
  }, [selectedGroup]);

  const checkMyProfile = async () => {
    const user = auth.currentUser;
    if (user?.uid) {
      const p = await fetchMyBloodDonorProfile(user.uid);
      if (p) {
        setMyDonorProfile(p);
        setDonorName(p.displayName || '');
        setDonorBloodGroup(p.bloodGroup || 'O+');
        setDonorPhone(p.phone || '');
        setDonorArea(p.area || '');
        setDonorNotes(p.notes || '');
        setDonorConsent(p.showPhonePublicly ?? true);
        setDonorAvailability(p.availability || 'available');
      }
    }
  };

  const loadDonors = async () => {
    setLoading(true);
    try {
      const data = await fetchBloodDonors(selectedGroup);
      if (data && data.length > 0) {
        const liveIds = new Set(data.map(d => d.id));
        const filteredSeeds = SEED_BLOOD_DONORS.filter(s => {
          if (liveIds.has(s.id)) return false;
          if (selectedGroup !== 'All') return s.bloodGroup === selectedGroup;
          return true;
        });
        setDonors([...data, ...filteredSeeds]);
      } else {
        if (selectedGroup !== 'All') {
          setDonors(SEED_BLOOD_DONORS.filter(s => s.bloodGroup === selectedGroup));
        } else {
          setDonors(SEED_BLOOD_DONORS);
        }
      }
    } catch {
      setDonors(selectedGroup === 'All' ? SEED_BLOOD_DONORS : SEED_BLOOD_DONORS.filter(s => s.bloodGroup === selectedGroup));
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
    }
  };

  const handleWhatsApp = (phoneNumber?: string, donor?: BloodDonorItem) => {
    if (!phoneNumber) return;
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = `Urgent: Hello ${donor?.displayName || 'Donor'}, I found your voluntary blood donor profile (${donor?.bloodGroup || ''}) on Kurnool One App. We urgently need blood for a patient in Kurnool. Are you available to donate?`;
    Linking.openURL(`whatsapp://send?phone=${waNumber}&text=${encodeURIComponent(text)}`).catch(() => {
      Linking.openURL(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`).catch(() => {});
    });
  };

  const handleShare = async (donor: BloodDonorItem) => {
    try {
      const appUrl = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';
      await Share.share({
        message: `🩸 *Emergency Blood Donor in Kurnool*\nName: ${donor.displayName}\nBlood Group: ${donor.bloodGroup}\nArea: ${donor.area}\nContact: ${donor.phone}\nStatus: ${donor.availability === 'available' ? 'Available' : 'Donated Recently'}\n\nFind more verified blood donors on Kurnool One App:\n👉 ${appUrl}`,
      });
    } catch {}
  };

  const handleOpenRegisterModal = () => {
    if (!auth.currentUser) {
      Alert.alert(
        language === 'en' ? 'Login Required' : 'లాగిన్ అవసరం',
        language === 'en'
          ? 'Please sign in to register as a voluntary blood donor.'
          : 'రక్తదాతగా నమోదు చేసుకోవడానికి దయచేసి లాగిన్ అవ్వండి.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('MobileFirebaseLogin') },
        ]
      );
      return;
    }
    if (!myDonorProfile) {
      setDonorName(auth.currentUser.displayName || '');
      let uPhone = auth.currentUser.phoneNumber || '';
      if (uPhone) setDonorPhone(uPhone.replace('+91', ''));
      setDonorConsent(true);
    }
    setDonorModalVisible(true);
  };

  const handleSaveDonor = async () => {
    if (!donorName.trim() || !donorPhone.trim() || !donorArea.trim()) {
      Alert.alert('Required Fields', 'Please enter your Full Name, 10-digit Phone Number, and Kurnool Locality.');
      return;
    }

    const cleanPhone = donorPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!donorConsent) {
      Alert.alert(
        'Consent Required',
        'Please confirm that you consent under DPDP Act 2023 to share your blood group & phone number for emergency medical situations in Kurnool.'
      );
      return;
    }

    setSavingDonor(true);
    try {
      const uid = auth.currentUser?.uid || '';
      if (myDonorProfile) {
        await updateBloodDonor(myDonorProfile.id, {
          displayName: donorName.trim(),
          bloodGroup: donorBloodGroup,
          phone: cleanPhone,
          showPhonePublicly: donorConsent,
          area: donorArea.trim(),
          availability: donorAvailability,
          notes: donorNotes.trim() || undefined,
        });
        Alert.alert('Profile Updated! 🩸', 'Your voluntary blood donor profile is updated.');
      } else {
        await registerBloodDonor({
          userId: uid,
          displayName: donorName.trim(),
          bloodGroup: donorBloodGroup,
          phone: cleanPhone,
          showPhonePublicly: donorConsent,
          area: donorArea.trim(),
          availability: donorAvailability,
          notes: donorNotes.trim() || undefined,
          status: 'active',
        });
        Alert.alert('Registered Successfully! 🩸', 'Thank you for volunteering as a blood donor for Kurnool citizens.');
      }
      setDonorModalVisible(false);
      checkMyProfile();
      loadDonors();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save donor profile.');
    } finally {
      setSavingDonor(false);
    }
  };

  const handleDeleteProfile = () => {
    if (!myDonorProfile) return;
    Alert.alert(
      'Remove Donor Profile',
      'Are you sure you want to stop volunteering and remove your donor profile from Kurnool One?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBloodDonor(myDonorProfile.id);
              setMyDonorProfile(null);
              setDonorModalVisible(false);
              Alert.alert('Profile Removed');
              loadDonors();
            } catch {
              Alert.alert('Error', 'Could not remove profile.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>
                {language === 'en' ? 'Blood Donors' : 'రక్తదాతల సమాచారం'}
              </Text>
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {language === 'en' ? 'Kurnool City Voluntary Donor Network' : 'కర్నూలు నగర స్వచ్ఛంద రక్తదాతలు'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleOpenRegisterModal} style={styles.registerBtn}>
          <Ionicons name={myDonorProfile ? 'create-outline' : 'heart'} size={16} color="#FFFFFF" />
          <Text style={styles.registerBtnText}>
            {myDonorProfile ? (language === 'en' ? 'My Status' : 'నా ప్రొఫైల్') : (language === 'en' ? '+ Register' : '+ నమోదు')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Helpline Banner */}
      <View style={styles.helplineBanner}>
        <View style={styles.helplineIconCircle}>
          <Ionicons name="medkit" size={20} color="#DC2626" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.helplineTitle}>
            {language === 'en' ? 'Urgent Need for Blood?' : 'రక్తం అత్యవసరంగా కావాలా?'}
          </Text>
          <Text style={styles.helplineSub}>
            {language === 'en'
              ? 'Filter by blood group below and call verified donors in Kurnool directly.'
              : 'బ్లడ్ గ్రూప్‌ను ఎంచుకోండి, కర్నూలు రక్తదాతలకు నేరుగా కాల్ చేయండి.'}
          </Text>
        </View>
      </View>

      {/* Blood Group Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {BLOOD_GROUPS.map(bg => {
            const isSelected = selectedGroup === bg;
            return (
              <TouchableOpacity
                key={bg}
                onPress={() => setSelectedGroup(bg)}
                style={[styles.bloodChip, isSelected && styles.bloodChipActive]}
              >
                <Text style={[styles.bloodChipText, isSelected && styles.bloodChipTextActive]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Donors List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>
            {language === 'en' ? 'Connecting to Kurnool Blood Donors...' : 'రక్తదాతల సమాచారం లోడ్ అవుతోంది...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={donors}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDonors} colors={['#DC2626']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="water-outline" size={40} color="#DC2626" />
              </View>
              <Text style={styles.emptyTitle}>
                {language === 'en' ? `No Donors Found for ${selectedGroup}` : `${selectedGroup} రక్తదాతలు అందుబాటులో లేరు`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'en'
                  ? 'Volunteer to be the first donor for this blood group in Kurnool!'
                  : 'ఈ గ్రూప్‌కు మొదటి రక్తదాతగా మీరు నమోదు చేసుకోండి!'}
              </Text>
              <TouchableOpacity onPress={handleOpenRegisterModal} style={styles.emptyActionBtn}>
                <Text style={styles.emptyActionBtnText}>{language === 'en' ? '+ Register as Blood Donor' : '+ రక్తదాతగా నమోదు చేసుకోండి'}</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.donorCard}>
              <View style={styles.donorCardLeft}>
                <View style={styles.bloodBadgeLarge}>
                  <Ionicons name="water" size={16} color="#DC2626" />
                  <Text style={styles.bloodBadgeLargeText}>{item.bloodGroup}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.donorName}>{item.displayName}</Text>
                    <View
                      style={[
                        styles.availPill,
                        {
                          backgroundColor: item.availability === 'available' ? '#F0FDF4' : '#FEF3C7',
                          borderColor: item.availability === 'available' ? '#BBF7D0' : '#FDE68A',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.availText,
                          { color: item.availability === 'available' ? '#15803D' : '#D97706' },
                        ]}
                      >
                        {item.availability === 'available' ? 'Available' : 'Donated Recently'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.areaRow}>
                    <Ionicons name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.areaText} numberOfLines={1}>{item.area}</Text>
                  </View>

                  {item.notes ? (
                    <Text style={styles.notesText} numberOfLines={1}>{item.notes}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.donorActionRow}>
                <TouchableOpacity onPress={() => handleCall(item.phone)} style={styles.callDonorBtn}>
                  <Ionicons name="call" size={13} color="#FFFFFF" />
                  <Text style={styles.callDonorBtnText}>Call Donor</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleWhatsApp(item.phone, item)} style={styles.waDonorBtn}>
                  <Ionicons name="logo-whatsapp" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareDonorBtn}>
                  <Ionicons name="share-social-outline" size={14} color="#334155" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.medicalNoticeBanner}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#991B1B" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.medicalNoticeTitle}>
                  {language === 'en' ? 'Mandatory Medical Notice:' : 'వైద్య హెచ్చరిక & నియమావళి:'}
                </Text>
                <Text style={styles.medicalNoticeText}>
                  {language === 'en'
                    ? 'Kurnool One is an independent civic directory and does not medically test blood donors. Hospitals and qualified healthcare professionals must confirm blood compatibility, cross-matching, and donor eligibility before any transfusion.'
                    : 'కర్నూలు వన్ స్వచ్ఛంద వేదిక మాత్రమే. రక్తదానం స్వీకరించే ముందు ఆసుపత్రి మరియు వైద్యులు బ్లడ్ టెస్టింగ్ & క్రాస్ మ్యాచింగ్ తప్పనిసరిగా నిర్వహించాలి.'}
                </Text>
              </View>
            </View>
          }
        />
      )}

      {/* Volunteer Donor Modal */}
      <Modal visible={donorModalVisible} animationType="slide" onRequestClose={() => setDonorModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {myDonorProfile ? 'Manage Donor Profile' : 'Register as Blood Donor'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {language === 'en' ? 'Save lives in Kurnool City' : 'కర్నూలు నగరంలో ప్రాణదాతగా నిలవండి'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setDonorModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* Blood Group Picker */}
            <Text style={styles.label}>Your Blood Group *</Text>
            <View style={styles.bloodPickerRow}>
              {(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'] as const).map(bg => (
                <TouchableOpacity
                  key={bg}
                  onPress={() => setDonorBloodGroup(bg)}
                  style={[styles.bloodPillOption, donorBloodGroup === bg && styles.bloodPillOptionActive]}
                >
                  <Text style={[styles.bloodPillOptionText, donorBloodGroup === bg && styles.bloodPillOptionTextActive]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Praveen Kumar"
              placeholderTextColor="#94A3B8"
              maxLength={60}
              value={donorName}
              onChangeText={setDonorName}
            />

            {/* Phone */}
            <Text style={styles.label}>Contact Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number for emergency calls"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={donorPhone}
              onChangeText={setDonorPhone}
            />

            {/* Area */}
            <Text style={styles.label}>Locality / Area in Kurnool *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Gayatri Estate, B Camp, Nandyal Checkpost"
              placeholderTextColor="#94A3B8"
              maxLength={60}
              value={donorArea}
              onChangeText={setDonorArea}
            />

            {/* Availability */}
            <Text style={styles.label}>Current Availability Status</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setDonorAvailability('available')}
                style={[styles.availOption, donorAvailability === 'available' && styles.availOptionActive]}
              >
                <Ionicons name="checkmark-circle" size={16} color={donorAvailability === 'available' ? '#15803D' : '#64748B'} />
                <Text style={[styles.availOptionText, donorAvailability === 'available' && { color: '#15803D', fontWeight: '800' }]}>
                  Ready to Donate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDonorAvailability('donated_recently')}
                style={[styles.availOption, donorAvailability === 'donated_recently' && styles.availOptionActive]}
              >
                <Ionicons name="time" size={16} color={donorAvailability === 'donated_recently' ? '#D97706' : '#64748B'} />
                <Text style={[styles.availOptionText, donorAvailability === 'donated_recently' && { color: '#D97706', fontWeight: '800' }]}>
                  Donated Recently
                </Text>
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Notes / Timing Preferences (Optional)</Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>{donorNotes.length}/150</Text>
            </View>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top', marginTop: 4 }]}
              placeholder="e.g. Available after 5 PM, or at General Hospital"
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={150}
              value={donorNotes}
              onChangeText={setDonorNotes}
            />

            {/* DPDP Act Explicit Consent Toggle */}
            <TouchableOpacity
              onPress={() => setDonorConsent(!donorConsent)}
              style={styles.consentRow}
              activeOpacity={0.8}
            >
              <Ionicons
                name={donorConsent ? 'checkbox' : 'square-outline'}
                size={22}
                color={donorConsent ? '#DC2626' : '#94A3B8'}
              />
              <Text style={styles.consentText}>
                I voluntarily declare under the Digital Personal Data Protection (DPDP) Act 2023 that I consent to share my blood group and phone number publicly on Kurnool One for medical emergencies in Kurnool.
              </Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveDonor}
              disabled={savingDonor}
              style={[styles.submitDonorBtn, savingDonor && { opacity: 0.6 }]}
            >
              {savingDonor ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="heart" size={18} color="#FFFFFF" />
                  <Text style={styles.submitDonorBtnText}>
                    {myDonorProfile ? 'Update Donor Profile' : 'Register as Blood Donor'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {myDonorProfile && (
              <TouchableOpacity onPress={handleDeleteProfile} style={styles.removeDonorBtn}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={styles.removeDonorBtnText}>Stop Volunteering & Delete Profile</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  emergencyBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyBadgeText: { fontSize: 9, fontWeight: '900', color: '#DC2626' },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  registerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  helplineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  helplineIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  helplineTitle: { fontSize: 14, fontWeight: '800', color: '#991B1B' },
  helplineSub: { fontSize: 11, color: '#7F1D1D', marginTop: 2, lineHeight: 16 },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bloodChipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  bloodChipText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  bloodChipTextActive: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyActionBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  donorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  donorCardLeft: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bloodBadgeLarge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodBadgeLargeText: { fontSize: 14, fontWeight: '900', color: '#DC2626', marginTop: 1 },
  donorName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  availPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  availText: { fontSize: 9, fontWeight: '800' },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  areaText: { fontSize: 12, color: '#64748B' },
  notesText: { fontSize: 11, color: '#94A3B8', marginTop: 3, fontStyle: 'italic' },
  donorActionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  callDonorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 9,
    borderRadius: 10,
  },
  callDonorBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  waDonorBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareDonorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalNoticeBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  medicalNoticeTitle: { fontSize: 11, fontWeight: '800', color: '#991B1B', marginBottom: 2 },
  medicalNoticeText: { fontSize: 10, color: '#7F1D1D', lineHeight: 15 },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  closeBtn: { padding: 4 },
  modalScroll: { flex: 1, padding: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  bloodPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodPillOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bloodPillOptionActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  bloodPillOptionText: { fontSize: 12, fontWeight: '800', color: '#334155' },
  bloodPillOptionTextActive: { color: '#FFFFFF' },
  availOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  availOptionActive: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  availOptionText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },
  consentText: { flex: 1, fontSize: 11, color: '#991B1B', lineHeight: 16 },
  submitDonorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  submitDonorBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  removeDonorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#FEE2E2',
  },
  removeDonorBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
});

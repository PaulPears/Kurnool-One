import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, StatusBar, Linking, Share, Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PartnerProgramScreen({ navigation }: any) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [area, setArea] = useState('');
  const [upiId, setUpiId] = useState('');
  const [idProof, setIdProof] = useState('');
  const [partnerCode, setPartnerCode] = useState('');

  // Stats
  const [onboardedCount, setOnboardedCount] = useState(0);
  const [earnedCommission, setEarnedCommission] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      let uid = auth.currentUser?.uid;
      let userPhone = '';
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!uid) uid = parsed.uid || parsed.id;
          userPhone = parsed.phone || '';
          if (parsed.name && !fullName) setFullName(parsed.name);
        } catch {}
      }
      if (!userPhone && auth.currentUser?.phoneNumber) {
        userPhone = auth.currentUser.phoneNumber.replace(/\D/g, '').slice(-10);
      }
      if (userPhone && !phone) {
        setPhone(userPhone);
        setWhatsapp(userPhone);
      }

      if (uid) {
        const docRef = doc(db, 'partners', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPartner(true);
          setFullName(data.fullName || '');
          setPhone(data.phone || userPhone);
          setWhatsapp(data.whatsapp || userPhone);
          setArea(data.area || '');
          setUpiId(data.upiId || '');
          setIdProof(data.idProof || '');
          setPartnerCode(data.partnerCode || `KNL-${userPhone.slice(-4)}`);
          setOnboardedCount(data.onboardedCount || 0);
          setEarnedCommission(data.earnedCommission || 0);
          setPendingCommission(data.pendingCommission || 0);
        } else {
          // Generate preliminary code
          const defaultCode = `KNL-${userPhone ? userPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`;
          setPartnerCode(defaultCode);
        }
      }
    } catch (e) {
      console.warn('Error loading partner data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPartner = async () => {
    if (!fullName.trim() || !phone.trim() || !upiId.trim()) {
      Alert.alert(
        language === 'en' ? 'Required Fields' : 'తప్పనిసరి వివరాలు',
        language === 'en'
          ? 'Please enter your Full Name, Phone Number, and UPI ID (for receiving commission payouts).'
          : 'దయచేసి మీ పూర్తి పేరు, ఫోన్ నంబర్ మరియు UPI ID ని నమోదు చేయండి.'
      );
      return;
    }

    if (!upiId.includes('@')) {
      Alert.alert(
        language === 'en' ? 'Invalid UPI ID' : 'చెల్లని UPI ID',
        language === 'en'
          ? 'Please enter a valid UPI ID (e.g. yourname@oksbi, phone@ybl, etc.)'
          : 'దయచేసి సరైన UPI ID ని నమోదు చేయండి (ఉదా: yourname@oksbi).'
      );
      return;
    }

    setSaving(true);
    try {
      const uid = auth.currentUser?.uid || `partner_${phone.replace(/\D/g, '').slice(-10)}`;
      const code = partnerCode || `KNL-${phone.slice(-4)}`;

      const partnerPayload = {
        uid,
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp || phone).trim(),
        area: area.trim() || 'Kurnool City',
        upiId: upiId.trim(),
        idProof: idProof.trim(),
        partnerCode: code,
        status: 'active',
        onboardedCount: onboardedCount || 0,
        earnedCommission: earnedCommission || 0,
        pendingCommission: pendingCommission || 0,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'partners', uid), partnerPayload, { merge: true });
      setIsPartner(true);
      setPartnerCode(code);

      Alert.alert(
        language === 'en' ? 'Partner Profile Activated!' : 'పార్ట్‌నర్ ప్రొఫైల్ యాక్టివేట్ అయ్యింది!',
        language === 'en'
          ? `Congratulations! Your Partner Referral Code is: ${code}\nShare this code with local merchants to earn 25% commission on every registration.`
          : `అభినందనలు! మీ పార్ట్‌నర్ కోడ్: ${code}\nస్థానిక వ్యాపారులతో పంచుకోండి, ప్రతి రిజిస్ట్రేషన్‌పై 25% కమీషన్ పొందండి.`
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save partner details');
    } finally {
      setSaving(false);
    }
  };

  const handleSharePartnerLink = async () => {
    const code = partnerCode || 'KNL-ONE';
    const message = language === 'en'
      ? `🚀 Grow your business in Kurnool with Kurnool One App!\nGet your shop or professional services listed to receive calls and customers across the city.\n\n👉 Register with Partner Code: *${code}* to get Instant Verification!\n📲 Download App: https://play.google.com/store/apps/details?id=com.kurnoolone.app`
      : `🚀 కర్నూలు వన్ యాప్‌లో మీ వ్యాపారం లేదా సర్వీసులను నమోదు చేసుకోండి!\nరోజూ వందలాది కస్టమర్ల కాల్స్ పొందండి.\n\n👉 నా పార్ట్‌నర్ కోడ్: *${code}* తో రిజిస్టర్ చేసుకోండి!\n📲 డౌన్‌లోడ్ చేయండి: https://play.google.com/store/apps/details?id=com.kurnoolone.app`;

    try {
      await Share.share({ message });
    } catch {}
  };

  const handleCopyCode = () => {
    if (Clipboard?.setString) {
      Clipboard.setString(partnerCode);
      Alert.alert('Copied!', `Partner Code ${partnerCode} copied to clipboard.`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Kurnool One Partner' : 'కర్నూలు వన్ పార్ట్‌నర్'}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'Earn money onboarding shops & service pros' : 'షాపులను చేర్పించి ఆదాయం సంపాదించండి'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroBanner}>
          <View style={styles.badgePill}>
            <Ionicons name="star" size={12} color="#D97706" />
            <Text style={styles.badgePillText}>OFFICIAL PARTNER PROGRAM</Text>
          </View>
          <Text style={styles.heroTitle}>
            {language === 'en' ? 'Earn 25% – 30% Commission' : 'ప్రతి షాపుపై 25% – 30% కమీషన్'}
          </Text>
          <Text style={styles.heroDesc}>
            {language === 'en'
              ? 'Onboard local shops, supermarkets, restaurants, doctors, plumbers & electricians in your area. Commission is paid directly to your UPI ID.'
              : 'కర్నూలులోని మీ ఏరియా షాపులు, డాక్టర్లు, ప్లంబర్లు, ఎలక్ట్రీషియన్లను యాప్‌లో చేర్పించి నేరుగా మీ UPI ఖాతాలోకి నగదు అందుకోండి.'}
          </Text>
        </View>

        {/* Live Earnings Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="storefront" size={22} color="#2563EB" />
            <Text style={styles.statNumber}>{onboardedCount}</Text>
            <Text style={styles.statLabel}>
              {language === 'en' ? 'Onboarded' : 'నమోదైనవి'}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="wallet" size={22} color="#059669" />
            <Text style={[styles.statNumber, { color: '#059669' }]}>₹{earnedCommission}</Text>
            <Text style={styles.statLabel}>
              {language === 'en' ? 'Earned' : 'సంపాదించినవి'}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="time" size={22} color="#D97706" />
            <Text style={[styles.statNumber, { color: '#D97706' }]}>₹{pendingCommission}</Text>
            <Text style={styles.statLabel}>
              {language === 'en' ? 'Pending' : 'రావలసినవి'}
            </Text>
          </View>
        </View>

        {/* Partner Code Box */}
        <View style={styles.codeCard}>
          <Text style={styles.codeCardLabel}>
            {language === 'en' ? 'YOUR UNIQUE PARTNER CODE' : 'మీ ప్రత్యేక పార్ట్‌నర్ కోడ్'}
          </Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{partnerCode || 'KNL-PARTNER'}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={16} color="#2563EB" />
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.codeHint}>
            {language === 'en'
              ? 'Merchants can enter this code during registration for attribution.'
              : 'దుకాణదారులు రిజిస్ట్రేషన్ సమయంలో ఈ కోడ్ నమోదు చేయవచ్చు.'}
          </Text>

          <TouchableOpacity onPress={handleSharePartnerLink} style={styles.shareWaBtn}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.shareWaBtnText}>
              {language === 'en' ? 'Share Invite on WhatsApp' : 'వాట్సాప్‌లో షేర్ చేయండి'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Commission Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>
            {language === 'en' ? 'Commission Payout Rates' : 'కమీషన్ ధరల పట్టిక'}
          </Text>

          <View style={styles.tableRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Basic Merchant Listing</Text>
              <Text style={styles.planSub}>Free plan</Text>
            </View>
            <Text style={[styles.commissionAmt, { color: '#64748B' }]}>₹0</Text>
          </View>

          <View style={styles.tableRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Standard Business (6 Months)</Text>
              <Text style={styles.planSub}>₹199 subscription</Text>
            </View>
            <Text style={styles.commissionAmt}>₹50</Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planName, { color: '#065F46' }]}>👑 Yearly Featured Business</Text>
              <Text style={styles.planSub}>₹999 / 1 Year subscription</Text>
            </View>
            <Text style={[styles.commissionAmt, { color: '#059669', fontSize: 16 }]}>₹250</Text>
          </View>

          <View style={styles.tableRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Professional Elite (1 Year)</Text>
              <Text style={styles.planSub}>₹499 subscription</Text>
            </View>
            <Text style={styles.commissionAmt}>₹150</Text>
          </View>
        </View>

        {/* Partner Registration / Profile Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isPartner
              ? (language === 'en' ? 'Partner Profile & Payout Details' : 'పార్ట్‌నర్ ప్రొఫైల్ వివరాలు')
              : (language === 'en' ? 'Register as Kurnool One Partner' : 'పార్ట్‌నర్‌గా నమోదు చేసుకోండి')}
          </Text>

          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Suresh Kumar"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.inputLabel}>Mobile / WhatsApp Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.inputLabel}>Your Area / Locality in Kurnool *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. B Camp, NR Peta, Joharapuram"
            value={area}
            onChangeText={setArea}
          />

          <Text style={styles.inputLabel}>UPI ID for Direct Payouts *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. yourname@oksbi or 9848012345@ybl"
            autoCapitalize="none"
            value={upiId}
            onChangeText={setUpiId}
          />

          <Text style={styles.inputLabel}>Aadhaar Number / ID Document (For KYC)</Text>
          <TextInput
            style={styles.input}
            placeholder="12-digit Aadhaar Number (kept confidential)"
            keyboardType="number-pad"
            maxLength={14}
            value={idProof}
            onChangeText={setIdProof}
          />

          <TouchableOpacity
            onPress={handleRegisterPartner}
            disabled={saving}
            style={styles.submitBtn}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isPartner
                  ? (language === 'en' ? 'Update Partner Details' : 'వివరాలు నవీకరించండి')
                  : (language === 'en' ? 'Activate Partner Account' : 'ఖాతాను యాక్టివేట్ చేయండి')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <Text style={styles.faqQ}>When will I receive my commission payout?</Text>
          <Text style={styles.faqA}>
            Commissions are transferred directly to your registered UPI ID within 24 hours after the merchant's subscription is verified by the admin desk.
          </Text>
          <Text style={styles.faqQ}>Who can become a Kurnool One Partner?</Text>
          <Text style={styles.faqA}>
            Any citizen, student, local entrepreneur, or marketing executive living in Kurnool who wants to earn part-time or full-time income onboarding local shops.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  heroBanner: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgePillText: { fontSize: 10, fontWeight: '900', color: '#B45309', letterSpacing: 0.5 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#78350F' },
  heroDesc: { fontSize: 12, color: '#92400E', marginTop: 4, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  statNumber: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '600' },
  codeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  codeCardLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeText: { fontSize: 18, fontWeight: '900', color: '#1E293B', letterSpacing: 1 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  codeHint: { fontSize: 11, color: '#64748B', marginTop: 8 },
  shareWaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  shareWaBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  tableCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tableTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  planName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  planSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  commissionAmt: { fontSize: 14, fontWeight: '900', color: '#2563EB' },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  formTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  faqCard: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  faqTitle: { fontSize: 13, fontWeight: '800', color: '#334155', marginBottom: 10 },
  faqQ: { fontSize: 12, fontWeight: '800', color: '#1E293B', marginTop: 6 },
  faqA: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 16 },
});


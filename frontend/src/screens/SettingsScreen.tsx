import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { deleteUserAccount } from '../services/firestoreService';

export default function SettingsScreen({ navigation }: any) {
  const { language, toggleLanguage } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      language === 'en' ? 'Sign Out' : 'లాగ్ అవుట్',
      language === 'en'
        ? 'Are you sure you want to sign out of Kurnool One?'
        : 'మీరు కర్నూలు వన్ నుండి లాగ్ అవుట్ అవ్వాలనుకుంటున్నారా?',
      [
        { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
        {
          text: language === 'en' ? 'Sign Out' : 'లాగ్ అవుట్',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              await AsyncStorage.multiRemove(['user', 'token', 'auth_role']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'MobileFirebaseLogin' }],
              });
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      language === 'en' ? '⚠️ Delete Account & Erase Data' : '⚠️ ఖాతా మరియు డేటా తొలగింపు',
      language === 'en'
        ? 'This will permanently erase your profile, saved listings, and all account data in compliance with the DPDP Act 2023 and Google Play Store policies. This action CANNOT be undone. Are you sure?'
        : 'ఇది మీ ప్రొఫైల్, లిస్టింగులు మరియు మొత్తం డేటాను శాశ్వతంగా తొలగిస్తుంది. ఈ చర్యను రద్దు చేయలేము. మీరు ఖచ్చితంగా కొనసాగించాలనుకుంటున్నారా?',
      [
        { text: language === 'en' ? 'Cancel' : 'రద్దు', style: 'cancel' },
        {
          text: language === 'en' ? 'Erase All Data' : 'మొత్తం డేటాను తొలగించండి',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUid = auth.currentUser?.uid;
              if (currentUid) {
                await deleteUserAccount(currentUid);
              }
              await auth.signOut();
              await AsyncStorage.clear();
              Alert.alert(
                language === 'en' ? 'Account Deleted' : 'ఖాతా తొలగించబడింది',
                language === 'en'
                  ? 'Your account and personal data have been completely erased.'
                  : 'మీ ఖాతా మరియు డేటా పూర్తిగా తొలగించబడ్డాయి.'
              );
              navigation.reset({
                index: 0,
                routes: [{ name: 'MobileFirebaseLogin' }],
              });
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not complete deletion.');
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Settings & Preferences' : 'సెట్టింగ్‌లు & ప్రాధాన్యతలు'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {language === 'en' ? 'App Experience' : 'యాప్ అనుభవం'}
          </Text>

          {/* Language Switcher */}
          <View style={styles.settingCard}>
            <View style={[styles.cardIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="language" size={22} color="#16A34A" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Language / భాష</Text>
              <Text style={styles.cardSubtitle}>
                {language === 'en' ? 'Currently: English' : 'ప్రస్తుతం: తెలుగు'}
              </Text>
            </View>
            <TouchableOpacity style={styles.langToggleBtn} onPress={toggleLanguage}>
              <Text style={styles.langToggleText}>
                {language === 'en' ? 'తెలుగులోకి మార్చు' : 'Switch to English'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal & Privacy Section (DPDP Act 2023 Compliant) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {language === 'en' ? 'Legal & Privacy (DPDP Act 2023)' : 'చట్టపరమైన & గోప్యతా విధానం'}
          </Text>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => Linking.openURL('https://kurnool-kaburlu.web.app/terms').catch(() => {})}
          >
            <View style={[styles.cardIconBox, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="document-text-outline" size={22} color="#475569" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Terms & Conditions</Text>
              <Text style={styles.cardSubtitle}>kurnoolone.com/terms</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => Linking.openURL('https://kurnool-kaburlu.web.app/privacy').catch(() => {})}
          >
            <View style={[styles.cardIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#16A34A" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Privacy Policy & Data Security</Text>
              <Text style={styles.cardSubtitle}>DPDP Act 2023 Compliant</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity style={styles.settingCard} onPress={handleDeleteAccount}>
            <View style={[styles.cardIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trash-outline" size={22} color="#DC2626" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: '#DC2626' }]}>Delete Account & Erase All Data</Text>
              <Text style={styles.cardSubtitle}>Permanent one-click data deletion</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutButtonText}>
            {language === 'en' ? 'Log Out from Kurnool One' : 'లాగ్ అవుట్'}
          </Text>
        </TouchableOpacity>

        {/* Build & App Version Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerBadge}>
            <Text style={styles.footerBadgeText}>K1</Text>
          </View>
          <Text style={styles.footerAppName}>KURNOOL ONE • కర్నూలు వన్</Text>
          <Text style={styles.footerVersion}>Version 2.4.0 (Official Build)</Text>
          <Text style={styles.footerSub}>Proudly Made for the Citizens of Historic Kurnool</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  langToggleBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 28,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerAppName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  footerVersion: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  footerSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});

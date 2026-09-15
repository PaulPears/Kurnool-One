import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import { deleteUserAccount } from '../services/firestoreService';

export default function SettingsScreen({ navigation }: any) {
  const { language, toggleLanguage } = useLanguage();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await auth.signOut();
        await AsyncStorage.clear();
        navigation.replace('MobileFirebaseLogin');
      }},
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will permanently erase all your listings, posts, likes, reviews, and profile data from Kurnool One.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: async () => {
          try {
            const user = auth.currentUser;
            if (user) {
              await deleteUserAccount(user.uid);
              await AsyncStorage.clear();
              Alert.alert('Account Deleted', 'Your account and data have been permanently removed.');
              navigation.replace('MobileFirebaseLogin');
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to delete account. Please re-authenticate and try again.');
          }
        }},
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About Kurnool One (కర్నూలు వన్)',
      'Kurnool One is the comprehensive digital city platform for Kurnool, connecting residents and visitors with local businesses, skilled service professionals, tourist places, places of worship, city events, and exclusive offers.\n\nKey Features:\n• Business & Shop Directory\n• Skilled Professionals & Repair Services (Near You)\n• Explore Kurnool (Tourism & Heritage)\n• Places of Worship (Temples, Churches, Masjids)\n• Verified City Events & Announcements\n• Exclusive Local Promotions & Deals\n\nDisclaimer:\nKurnool One is an independent private platform and is not affiliated with, endorsed by, or operated by the Kurnool Municipal Corporation or the Government of Andhra Pradesh.\n\nContact Us:\n📧 Email: support@kurnoolone.com\n📍 Kurnool, Andhra Pradesh, India',
      [{ text: 'OK' }]
    );
  };

  const showTermsAndConditions = () => {
    Alert.alert(
      'Terms and Conditions – Kurnool One',
      'Last Updated: 2026\n\nWelcome to Kurnool One. By accessing or using the Kurnool One mobile application and services, you agree to comply with our Terms of Service.\n\n1. Directory Information: Kurnool One connects users with third-party local businesses and service providers. Kurnool One does not endorse or guarantee the quality of third-party services.\n2. Verification Badges: Badges indicate that identity or business documents have been reviewed by our admin team; they do not represent official government endorsement.\n3. Content Standards: Any abusive, fraudulent, defamatory, or infringing content will be removed immediately.\n\nFor support: support@kurnoolone.com',
      [{ text: 'OK' }]
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy – Kurnool One',
      'Information We Collect:\nWhen using Kurnool One, we may collect:\n• Name and Contact Details (if registering or signing in)\n• Profile photo and uploaded business media\n• Approximate location for "Near Me" search\n• Reviews and feedback submitted\n\nWe strictly respect your privacy under India\'s DPDP Act. We never sell personal information to third parties.\n\nYou have the right to delete your account and all associated personal data at any time directly through this Settings menu.\n\nContact: support@kurnoolone.com',
      [{ text: 'OK' }]
    );
  };

  const showHelpAndSupport = () => {
    Alert.alert(
      'Help & Support – Kurnool One',
      'Need assistance with your listing, account, or services?\n\nWe Can Help You With:\n• Registering or claiming your business listing\n• Service professional profile verification\n• Reporting inaccurate or closed businesses\n• Account assistance & technical issues\n• Promotional campaigns and banners\n\nContact Support:\n📧 Email: support@kurnoolone.com\n📍 Kurnool, Andhra Pradesh, India',
      [{ text: 'OK' }]
    );
  };

  const showPromotions = () => {
    Alert.alert(
      'Promotions & Advertisements – Kurnool One',
      'Kurnool One offers premium visibility for local businesses, shops, and service providers.\n\nAdvertising Options:\n• Top Homepage Hero Banners\n• Featured Business Placement in Category\n• Exclusive Offers & Deals Section\n• Sponsored Event Highlights\n\nContact for Business Promotions:\n📧 support@kurnoolone.com',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'en' ? 'Settings' : 'సెట్టింగ్లు'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* General Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{language === 'en' ? 'General' : 'సాధారణం'}</Text>
          
          <TouchableOpacity style={styles.settingsCard} onPress={toggleLanguage}>
            <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="language-outline" size={22} color="#6C3BFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Language' : 'భాష'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'English' : 'తెలుగు'}</Text>
            </View>
            <Text style={styles.rightText}>{language === 'en' ? 'English' : 'తెలుగు'}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{language === 'en' ? 'Account' : 'ఖాతా'}</Text>
          
          <TouchableOpacity style={styles.settingsCard} onPress={() => navigation.navigate('EditProfile')}>
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]} >
              <Ionicons name="person-outline" size={22} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Edit Profile' : 'ప్రొఫైల్ సవరించు'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Manage your public profile' : 'మీ ప్రొఫైల్ నిర్వహించండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={() => Alert.alert('Linked Account', `Your account is linked via Google Sign-In.\nEmail: ${auth.currentUser?.email || 'Unknown'}`, [{ text: 'OK' }])}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="logo-google" size={20} color="#9333EA" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Linked Account' : 'లింక్ చేయబడిన ఖాతా'}</Text>
              <Text style={styles.cardSubtitle}>{auth.currentUser?.email || (language === 'en' ? 'Google Sign-In active' : 'గూగుల్ సైన్-ఇన్ యాక్టివ్')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={handleDeleteAccount}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Delete Account' : 'ఖాతాను తొలగించండి'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Permanently delete your data' : 'మీ డేటాను శాశ్వతంగా తొలగించండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{language === 'en' ? 'Privacy & Security' : 'గోప్యత మరియు భద్రత'}</Text>
          
          <TouchableOpacity style={styles.settingsCard} onPress={showPrivacyPolicy}>
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Privacy & Security' : 'గోప్యత మరియు భద్రత'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Manage privacy and security' : 'గోప్యత మరియు భద్రతను నిర్వహించండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={() => Alert.alert('Data & Privacy', 'You have full control over your data. To request data deletion, please email support@kurnoolone.com', [{ text: 'OK' }])}>
            <View style={[styles.iconContainer, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="lock-closed-outline" size={22} color="#EC4899" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Data & Privacy' : 'డేటా మరియు గోప్యత'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Manage your personal data' : 'మీ వ్యక్తిగత డేటాను నిర్వహించండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{language === 'en' ? 'Notifications' : 'నోటిఫికేషన్లు'}</Text>
          
          <TouchableOpacity style={styles.settingsCard} onPress={() => navigation.navigate('Notifications')}>
            <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="notifications-outline" size={22} color="#6C3BFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Notifications' : 'నోటిఫికేషన్లు'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Manage your notifications' : 'మీ నోటిఫికేషన్లను నిర్వహించండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* More Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{language === 'en' ? 'More' : 'మరిన్ని'}</Text>
          
          <TouchableOpacity style={styles.settingsCard} onPress={showPromotions}>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="megaphone-outline" size={22} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Promotions & Advertisements' : 'ప్రమోషన్లు మరియు ప్రకటనలు'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Manage promotions and ads' : 'ప్రమోషన్లు మరియు ప్రకటనలను నిర్వహించండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={showHelpAndSupport}>
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="headset-outline" size={22} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Help & Support' : 'సహాయం మరియు మద్దతు'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Get help and support' : 'సహాయం మరియు మద్దతు పొందండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={showAbout}>
            <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="information-circle-outline" size={22} color="#6C3BFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'About Kurnool One' : 'కర్నూలు వన్ గురించి'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Learn more about us' : 'మమ్మల్ని గురించి మరింత తెలుసుకోండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={showTermsAndConditions}>
            <View style={[styles.iconContainer, { backgroundColor: '#FED7AA' }]}>
              <Ionicons name="document-text-outline" size={22} color="#F97316" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Terms & Conditions' : 'నిబంధనలు మరియు షరతులు'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Read our terms and conditions' : 'మా నిబంధనలు మరియు షరతులను చదవండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard} onPress={showPrivacyPolicy}>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{language === 'en' ? 'Privacy Policy' : 'గోప్యతా విధానం'}</Text>
              <Text style={styles.cardSubtitle}>{language === 'en' ? 'Read our privacy policy' : 'మా గోప్యతా విధానాన్ని చదవండి'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutButtonText}>{language === 'en' ? 'Logout' : 'లాగ్అవుట్'}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kurnool One v1.0.0</Text>
          <Text style={styles.footerText}>© 2026 Kurnool One</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  rightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C3BFF',
    marginRight: 8,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  Platform,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { createOrUpdateUser } from '../services/firestoreService';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

WebBrowser.maybeCompleteAuthSession();

// Configure GoogleSignin once at startup
try {
  GoogleSignin.configure({
    webClientId: '77831467457-hspogpc77l8r6uollgce645qfi12utg6.apps.googleusercontent.com',
    offlineAccess: false,
  });
} catch (configErr) {
  console.warn('GoogleSignin configure warning:', configErr);
}

// Official 4-color Google Icon
function OfficialGoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export default function MobileFirebaseLogin({ navigation, route }: any) {
  const returnScreen = route?.params?.returnScreen;

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auto-redirect if already authenticated
  useEffect(() => {
    const checkPersistedSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.uid || parsed.id)) {
            resolveAndNavigate(parsed.role, parsed.uid || parsed.id);
          }
        }
      } catch (e) {
        console.warn('Session check error:', e);
      }
    };
    checkPersistedSession();
  }, []);

  const resolveAndNavigate = (role: string, uid?: string) => {
    if (returnScreen) {
      navigation.replace(returnScreen);
      return;
    }
    if (role === 'business') {
      navigation.replace('ManageBusiness');
    } else if (role === 'professional') {
      navigation.replace('ManageProfessional');
    } else if (role === 'admin' || role === 'super_admin') {
      navigation.replace('AdminDashboard');
    } else {
      navigation.replace('Main');
    }
  };

  const handlePostGoogleAuth = async (firebaseUser: User) => {
    try {
      // 1. Create or update user in Firestore
      const userData: any = await createOrUpdateUser(firebaseUser);
      let detectedRole = userData?.role || 'user';

      // 2. If user role is still 'user', cross-check if they own a business or professional listing
      if (detectedRole === 'user') {
        try {
          const [bizSnap, proSnap] = await Promise.all([
            getDocs(query(collection(db, 'businesses'), where('ownerUid', '==', firebaseUser.uid))),
            getDocs(query(collection(db, 'professionals'), where('userId', '==', firebaseUser.uid))),
          ]);
          if (!bizSnap.empty) {
            detectedRole = 'business';
          } else if (!proSnap.empty) {
            detectedRole = 'professional';
          }
        } catch (roleQueryErr) {
          console.warn('Role check warning:', roleQueryErr);
        }
      }

      // 3. Save session
      const sessionUser = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Kurnool Resident',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        role: detectedRole,
        loginTimestamp: Date.now(),
      };
      await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
      resolveAndNavigate(detectedRole, firebaseUser.uid);
    } catch (err: any) {
      console.error('Post Google Auth error:', err);
      resolveAndNavigate('user', firebaseUser.uid);
    } finally {
      setLoading(false);
    }
  };

  const [showReviewerModal, setShowReviewerModal] = useState(false);
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerPassword, setReviewerPassword] = useState('');
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [tapCounter, setTapCounter] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastTap < 600) {
      const nextCount = tapCounter + 1;
      setTapCounter(nextCount);
      if (nextCount >= 3) {
        setTapCounter(0);
        setShowReviewerModal(true);
      }
    } else {
      setTapCounter(1);
    }
    setLastTap(now);
  };

  const handleReviewerSignIn = async () => {
    if (!reviewerEmail.trim() || !reviewerPassword.trim()) {
      Alert.alert('Required Fields', 'Please enter your reviewer email and password.');
      return;
    }
    setReviewerLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        reviewerEmail.trim().toLowerCase(),
        reviewerPassword.trim()
      );
      setShowReviewerModal(false);
      await handlePostGoogleAuth(userCred.user);
    } catch (err: any) {
      console.error('Reviewer Sign-In error:', err);
      let msg = 'Failed to sign in. Please verify your email and password.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        msg = 'Incorrect reviewer email or password.';
      } else if (err?.code === 'auth/user-not-found') {
        msg = 'No reviewer account found with this email.';
      }
      Alert.alert('Reviewer Login Failed', msg);
    } finally {
      setReviewerLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setLoading(true);

    try {
      // Web platform fallback
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        await handlePostGoogleAuth(res.user);
        return;
      }

      // Standalone Android Native Google Sign-In
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      const idToken = (signInResult as any)?.data?.idToken || (signInResult as any)?.idToken;

      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth, credential);
        await handlePostGoogleAuth(userCred.user);
        return;
      } else {
        throw new Error('Google Sign-In completed but no idToken was received.');
      }
    } catch (error: any) {
      console.error('handleGoogleLogin error:', error);
      setLoading(false);

      if (error?.code === statusCodes?.SIGN_IN_CANCELLED) {
        return;
      }
      if (error?.code === statusCodes?.IN_PROGRESS) {
        return;
      }
      if (error?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services is not available or outdated.');
        setAuthError('Google Play Services unavailable on this device.');
        return;
      }

      const isCode10 =
        String(error?.code) === '10' ||
        String(error?.message).includes('10') ||
        String(error?.message).includes('DEVELOPER_ERROR');

      if (isCode10) {
        Alert.alert(
          'Google Sign-In Configuration Required (Code 10)',
          'DEVELOPER_ERROR (Code 10):\n\nThe APK SHA-1 certificate fingerprint is not registered in Firebase Console.\n\nRelease Keystore SHA-1:\n4F:E0:5C:7D:0C:32:91:26:D4:F1:18:C4:1A:5B:61:F3:BC:DC:ED:95\n\nAdd this SHA-1 to Firebase Console -> Project Settings -> Your Android Apps (com.kurnoolone) to complete Google Sign-In.',
          [
            { text: 'Use Reviewer/Test Login', onPress: () => setShowReviewerModal(true) },
            { text: 'OK' },
          ]
        );
        setAuthError('Code 10 (DEVELOPER_ERROR): SHA-1 fingerprint needs to be registered in Firebase Console.');
      } else {
        Alert.alert('Google Sign-In Failed', `${error?.message || 'Authentication failed'} (${error?.code || 'ERR'})`);
        setAuthError(error?.message || 'Google Sign-In was cancelled or failed.');
      }
    }
  };

  const openTerms = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://kurnool-kaburlu.web.app/terms');
    } catch {
      Alert.alert('Terms of Service', 'Please visit https://kurnoolone.com/terms in your browser.');
    }
  };

  const openPrivacy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://kurnool-kaburlu.web.app/privacy');
    } catch {
      Alert.alert('Privacy Policy', 'Please visit https://kurnoolone.com/privacy in your browser.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <TouchableOpacity
            style={styles.logoWrapper}
            onPress={handleLogoTap}
            onLongPress={() => setShowReviewerModal(true)}
            delayLongPress={500}
            activeOpacity={0.85}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.appName}>Kurnool One</Text>
          <Text style={styles.appNameTe}>కర్నూలు వన్</Text>

          <View style={styles.taglineBadge}>
            <Ionicons name="sparkles" size={14} color="#1D4ED8" />
            <Text style={styles.taglineText}>Everything in One App</Text>
          </View>

          <Text style={styles.appDescription}>
            The official community platform for Kurnool Citizens, Local Businesses & Skilled Professionals.
          </Text>

          {/* Value Pills */}
          <View style={styles.pillRow}>
            <View style={styles.featurePill}>
              <Text style={styles.pillText}>🛍️ Local Shops</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.pillText}>🔧 Skilled Pros</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.pillText}>🏛️ City Services</Text>
            </View>
          </View>
        </View>

        {/* Error Alert Box */}
        {authError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {/* Single Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in to Kurnool One</Text>
          <Text style={styles.cardSubtitle}>
            One account connects Citizens, Businesses, and Professionals seamlessly.
          </Text>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1E293B" size="small" />
            ) : (
              <>
                <OfficialGoogleIcon size={22} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Legal Links (Terms & Privacy) */}
          <View style={styles.legalSection}>
            <Text style={styles.legalNote}>By continuing, you acknowledge and agree to:</Text>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity onPress={openTerms} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.legalLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}>•</Text>
              <TouchableOpacity onPress={openPrivacy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Government Non-Affiliation Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginTop: 2 }} />
          <Text style={styles.disclaimerText}>
            Kurnool One is an independent private digital city directory platform. It is not affiliated with or endorsed by the Government of Andhra Pradesh or the Kurnool Municipal Corporation.
          </Text>
        </View>
      </ScrollView>

      {/* Google Play Reviewer Login Modal (Hidden: 3-tap or long-press on logo) */}
      <Modal
        visible={showReviewerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
                <Text style={styles.modalTitle}>Play Reviewer Login</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReviewerModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Sign in with your authorized Google Play testing credentials to evaluate all modules.
            </Text>

            <View style={{ gap: 12, marginTop: 14 }}>
              <View>
                <Text style={styles.inputLabel}>Reviewer Email</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. reviewer@kurnoolone.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={reviewerEmail}
                  onChangeText={setReviewerEmail}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={reviewerPassword}
                  onChangeText={setReviewerPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, reviewerLoading && styles.buttonDisabled]}
                onPress={handleReviewerSignIn}
                disabled={reviewerLoading}
                activeOpacity={0.85}
              >
                {reviewerLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Sign In as Reviewer</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowReviewerModal(false)}
                style={{ paddingVertical: 8, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoWrapper: {
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appNameTe: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
    marginBottom: 10,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.3,
  },
  appDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 19,
    marginBottom: 14,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  featurePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C4043',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  legalSection: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  legalNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  legalDivider: {
    fontSize: 12,
    color: '#94A3B8',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

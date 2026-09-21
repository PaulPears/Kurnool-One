import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Alert, StatusBar, ScrollView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import type { User } from 'firebase/auth';
import { createOrUpdateUser, signInAnon } from '../services/firestoreService';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

type PortalType = 'business' | 'professional' | 'citizen';

export default function MobileFirebaseLogin({ navigation, route }: any) {
  const returnScreen = route?.params?.returnScreen;
  const initialPortal: PortalType = route?.params?.portal || 'citizen';

  const [portal, setPortal] = useState<PortalType>(initialPortal);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(true);

  // Email/Password state
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '77831467457-hspogpc77l8r6uollgce645qfi12utg6.apps.googleusercontent.com',
    androidClientId: '77831467457-du92qgvukkle89vvoic1kndmsn54drge.apps.googleusercontent.com',
    iosClientId: '77831467457-hspogpc77l8r6uollgce645qfi12utg6.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential).catch(error => {
          Alert.alert('Google Login Error', error.message);
        });
      }
    }
  }, [response]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userData: any = await createOrUpdateUser(firebaseUser);
          await AsyncStorage.setItem('user', JSON.stringify({
            uid:      firebaseUser.uid,
            id:       firebaseUser.uid,
            name:     userData?.name || firebaseUser.displayName || 'User',
            email:    firebaseUser.email || '',
            photoURL: userData?.photoURL || firebaseUser.photoURL || '',
            role:     userData?.role || 'user',
            location: userData?.location || '',
            bio:      userData?.bio || '',
          }));
        } catch (error) {
          console.error('Firestore sync error:', error);
        }
      } else {
        setUser(null);
        await AsyncStorage.multiRemove(['user', 'token']);
      }
    });
    return unsubscribe;
  }, []);

  const navigateAfterAuth = (userPortal: PortalType) => {
    if (returnScreen) {
      navigation.replace(returnScreen);
      return;
    }
    if (userPortal === 'business') {
      navigation.replace('ManageBusiness');
    } else if (userPortal === 'professional') {
      navigation.replace('ManageProfessional');
    } else {
      navigation.replace('Main');
    }
  };

  const handleEmailAuth = async () => {
    setAuthError('');
    if (!email.trim() || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    if (!isTermsAccepted) {
      Alert.alert('Terms and Conditions', 'Please accept the terms and conditions to continue.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          setAuthError(portal === 'business' ? 'Please enter Merchant / Business Owner Name.' : 'Please enter your Full Name.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, { displayName: name.trim() });
        await createOrUpdateUser({
          ...userCredential.user,
          displayName: name.trim(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      navigateAfterAuth(portal);
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: PortalType) => {
    setAuthError('');
    setLoading(true);

    const accounts = {
      business: { email: 'merchant@kurnoolone.com', pass: 'Password@123', name: 'Kurnool Merchant' },
      professional: { email: 'pro@kurnoolone.com', pass: 'Password@123', name: 'Dr. Srinivas Rao' },
      citizen: { email: 'demo@kurnoolone.com', pass: 'Password@123', name: 'Kurnool Citizen' },
    };

    const target = accounts[role];

    try {
      let loggedUser: any = null;
      try {
        const res = await signInWithEmailAndPassword(auth, target.email, target.pass);
        loggedUser = res.user;
      } catch (signInErr: any) {
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/wrong-password'
        ) {
          const createRes = await createUserWithEmailAndPassword(auth, target.email, target.pass);
          await updateProfile(createRes.user, { displayName: target.name });
          loggedUser = createRes.user;
        } else {
          throw signInErr;
        }
      }

      if (loggedUser) {
        await createOrUpdateUser({
          ...loggedUser,
          displayName: loggedUser.displayName || target.name,
        });

        navigateAfterAuth(role);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isTermsAccepted) {
      Alert.alert('Terms and Conditions', 'Please accept the terms and conditions to continue.');
      return;
    }
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        navigateAfterAuth(portal);
      } else {
        await promptAsync();
      }
    } catch (error: any) {
      Alert.alert('Google Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = async () => {
    setLoading(true);
    try {
      await signInAnon();
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.multiRemove(['user', 'token']);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  // Already signed in view
  if (user && !user.isAnonymous) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            borderWidth: 2, borderColor: '#BFDBFE'
          }}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={{ width: 80, height: 80, borderRadius: 40 }} />
            ) : (
              <Ionicons name="person" size={40} color="#2563EB" />
            )}
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 }}>
            Welcome back!
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2563EB', marginBottom: 4 }}>
            {user.displayName || 'Kurnool Resident'}
          </Text>
          <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            {user.email}
          </Text>

          {/* Quick Portal Switcher Cards */}
          <View style={{ width: '100%', gap: 10, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.replace('ManageBusiness')}
              style={styles.portalActionCard}
            >
              <Ionicons name="storefront" size={20} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.portalActionTitle}>Open Business Dashboard</Text>
                <Text style={styles.portalActionSub}>Shop timings, calls & post deals</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace('ManageProfessional')}
              style={[styles.portalActionCard, { borderColor: '#99F6E4' }]}
            >
              <Ionicons name="briefcase" size={20} color="#0D9488" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.portalActionTitle, { color: '#0F766E' }]}>Open Professional Dashboard</Text>
                <Text style={styles.portalActionSub}>Manage client rates & inquiries</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace('Main')}
              style={[styles.portalActionCard, { borderColor: '#E2E8F0' }]}
            >
              <Ionicons name="home-outline" size={20} color="#475569" />
              <View style={{ flex: 1 }}>
                <Text style={styles.portalActionTitle}>Browse Kurnool One</Text>
                <Text style={styles.portalActionSub}>Home, Directory & Events</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={{ width: '100%', backgroundColor: '#F1F5F9', padding: 14, borderRadius: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 14 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Configuration per portal type
  const portalConfig = {
    business: {
      themeColor: '#2563EB',
      lightBg: '#EFF6FF',
      borderColor: '#DBEAFE',
      icon: 'storefront' as const,
      badgeText: 'COMMERCIAL BUSINESS PORTAL',
      title: 'Business Login & Dashboard',
      subtitle: 'Manage your shop, set Monday–Sunday hours, post discount deals, and receive direct customer calls.',
      demoLabel: 'Instant Demo Merchant (1-Click)',
      demoRole: 'business' as const,
    },
    professional: {
      themeColor: '#0D9488',
      lightBg: '#F0FDFA',
      borderColor: '#CCFBF1',
      icon: 'briefcase' as const,
      badgeText: 'PROFESSIONAL & CREATOR PORTAL',
      title: 'Professional Login & Leads',
      subtitle: 'For Doctors, Influencers, IT specialists, Lawyers, Technicians, and Freelancers in Kurnool.',
      demoLabel: 'Instant Demo Pro (1-Click)',
      demoRole: 'professional' as const,
    },
    citizen: {
      themeColor: '#4F46E5',
      lightBg: '#EEF2FF',
      borderColor: '#E0E7FF',
      icon: 'person' as const,
      badgeText: 'CITIZEN & RESIDENT PORTAL',
      title: 'Citizen Sign In',
      subtitle: 'Explore Kurnool businesses, book professional services, discover deals, and browse events.',
      demoLabel: 'Instant Demo Citizen (1-Click)',
      demoRole: 'citizen' as const,
    },
  };

  const currentConfig = portalConfig[portal];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingVertical: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3-Way Portal Selector */}
        <View style={styles.portalSelector}>
          <TouchableOpacity
            onPress={() => { setPortal('business'); setAuthError(''); }}
            style={[styles.portalTab, portal === 'business' && styles.portalTabActiveBlue]}
          >
            <Ionicons name="storefront" size={14} color={portal === 'business' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.portalTabText, portal === 'business' && { color: '#2563EB', fontWeight: '800' }]}>
              Business
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setPortal('professional'); setAuthError(''); }}
            style={[styles.portalTab, portal === 'professional' && styles.portalTabActiveTeal]}
          >
            <Ionicons name="briefcase" size={14} color={portal === 'professional' ? '#0D9488' : '#64748B'} />
            <Text style={[styles.portalTabText, portal === 'professional' && { color: '#0D9488', fontWeight: '800' }]}>
              Professional
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setPortal('citizen'); setAuthError(''); }}
            style={[styles.portalTab, portal === 'citizen' && styles.portalTabActiveIndigo]}
          >
            <Ionicons name="person" size={14} color={portal === 'citizen' ? '#4F46E5' : '#64748B'} />
            <Text style={[styles.portalTabText, portal === 'citizen' && { color: '#4F46E5', fontWeight: '800' }]}>
              Citizen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Portal Header Badge */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={[styles.badgeWrap, { backgroundColor: currentConfig.lightBg, borderColor: currentConfig.borderColor }]}>
            <Ionicons name={currentConfig.icon} size={14} color={currentConfig.themeColor} />
            <Text style={[styles.badgeText, { color: currentConfig.themeColor }]}>
              {currentConfig.badgeText}
            </Text>
          </View>
          <Text style={styles.portalTitle}>{currentConfig.title}</Text>
          <Text style={styles.portalSubtitle}>{currentConfig.subtitle}</Text>
        </View>

        {/* Dedicated 1-Click Demo Login Button */}
        <View style={[styles.demoCard, { backgroundColor: currentConfig.lightBg, borderColor: currentConfig.borderColor }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flash" size={15} color="#D97706" />
              <Text style={styles.demoCardTitle}>{currentConfig.demoLabel}</Text>
            </View>
            <Text style={styles.demoTestTag}>Instant Test</Text>
          </View>

          <TouchableOpacity
            style={[styles.demoActionButton, { backgroundColor: currentConfig.themeColor }]}
            onPress={() => handleDemoLogin(currentConfig.demoRole)}
            disabled={loading}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.demoActionButtonText}>
              {loading ? 'Logging in...' : `1-Click ${currentConfig.demoRole.toUpperCase()} Login`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In vs Register Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, !isSignUp && styles.tabBtnActive]}
            onPress={() => { setIsSignUp(false); setAuthError(''); }}
          >
            <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, isSignUp && styles.tabBtnActive]}
            onPress={() => { setIsSignUp(true); setAuthError(''); }}
          >
            <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>
              {portal === 'business' ? 'Register Business' : portal === 'professional' ? 'Create Pro Account' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {authError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {/* Inputs */}
        {isSignUp && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {portal === 'business' ? 'Business Owner / Merchant Name' : 'Full Name / Handle'}
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setIsTermsAccepted(!isTermsAccepted)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isTermsAccepted ? 'checkbox' : 'square-outline'}
            size={20}
            color={isTermsAccepted ? currentConfig.themeColor : '#94A3B8'}
          />
          <Text style={styles.termsText}>
            I agree to the <Text style={{ color: currentConfig.themeColor, fontWeight: 'bold' }}>Terms and Conditions</Text>
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleEmailAuth}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: currentConfig.themeColor }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isSignUp ? `Register for ${portal.toUpperCase()}` : `Sign In to ${portal.toUpperCase()}`}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Auth */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={loading}
          style={styles.googleBtn}
        >
          <View style={styles.googleIconBox}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Skip Login for ALL Portals */}
        <TouchableOpacity
          onPress={() => navigateAfterAuth(portal)}
          disabled={loading}
          style={styles.guestBtn}
        >
          <Text style={[styles.guestBtnText, { color: currentConfig.themeColor, fontWeight: '700' }]}>
            {portal === 'business'
              ? 'Skip Login (Explore Business Dashboard as Guest) →'
              : portal === 'professional'
              ? 'Skip Login (Explore Pro Dashboard as Guest) →'
              : 'Skip Login (Explore Kurnool One as Guest) →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  portalSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
  },
  portalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 11,
  },
  portalTabActiveBlue: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  portalTabActiveTeal: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#99F6E4',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  portalTabActiveIndigo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  portalTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  portalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
  },
  demoCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 18,
  },
  demoCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  demoTestTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  demoActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  submitBtn: {
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
    marginBottom: 10,
  },
  googleIconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleIconText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  guestBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  guestBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  portalActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
  },
  portalActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  portalActionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});

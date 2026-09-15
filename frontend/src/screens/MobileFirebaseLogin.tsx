import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, Alert, StatusBar, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { Ionicons } from '@expo/vector-icons';
import type { User } from 'firebase/auth';
import { createOrUpdateUser, signInAnon } from '../services/firestoreService';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function MobileFirebaseLogin({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

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
          // Create/update user document in Firestore
          const userData: any = await createOrUpdateUser(firebaseUser);
          // Persist to AsyncStorage for quick access throughout the app
          await AsyncStorage.setItem('user', JSON.stringify({
            uid:      firebaseUser.uid,
            id:       firebaseUser.uid,
            name:     userData.name || firebaseUser.displayName,
            email:    firebaseUser.email,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            role:     userData.role || 'user',
            location: userData.location || '',
            bio:      userData.bio || '',
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
    if (!isTermsAccepted) {
      Alert.alert('Terms and Conditions', 'Please accept the terms and conditions to continue.');
      return;
    }
    setLoading(true);
    try {
      await signInAnon();
      // onAuthStateChanged will handle the rest
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

  // Already signed in — show continue screen
  if (user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Welcome!
          </Text>
          {user.photoURL && (
            <Image source={{ uri: user.photoURL }} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 16 }} />
          )}
          <Text style={{ fontSize: 18, color: '#1F2937', marginBottom: 8 }}>
            {user.isAnonymous ? 'Guest User' : (user.displayName || 'User')}
          </Text>
          {!user.isAnonymous && (
            <Text style={{ fontSize: 15, color: '#4B5563', marginBottom: 24 }}>{user.email}</Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.replace('Main')}
            style={{ width: '100%', backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Continue to App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ width: '100%', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#4B5563', fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>

        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{
            width: 110, height: 110, borderRadius: 30, backgroundColor: '#EFF6FF',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
          }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 80, height: 80, borderRadius: 20 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#1E3A8A', marginTop: 24, letterSpacing: -0.5 }}>
            Kurnool One
          </Text>
          <Text style={{ fontSize: 14, color: '#2563EB', fontWeight: '700', marginTop: 2 }}>
            కర్నూలు వన్
          </Text>
          <Text style={{ fontSize: 15, color: '#6B7280', marginTop: 6, textAlign: 'center', fontWeight: '500' }}>
            Discover businesses, services, and places in Kurnool.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => setIsTermsAccepted(!isTermsAccepted)}>
            <Ionicons name={isTermsAccepted ? 'checkbox' : 'square-outline'} size={24} color="#2563EB" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 12, color: '#4B5563', flex: 1, fontSize: 14 }}>
            I agree to the <Text style={{ color: '#2563EB', fontWeight: 'bold' }} onPress={() => Alert.alert('Terms and Conditions', 'By continuing, you agree to Kurnool One terms of service and privacy policy.')}>Terms and Conditions</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={loading}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB',
            borderRadius: 16, paddingVertical: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
          }}
        >
          <View style={{ width: 24, height: 24, marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#4285F4' }}>G</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          <Text style={{ marginHorizontal: 12, color: '#9CA3AF', fontSize: 13, fontWeight: '600' }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
        </View>

        <TouchableOpacity
          onPress={handleSkipLogin}
          disabled={loading}
          style={{
            width: '100%', backgroundColor: '#F3F4F6', paddingVertical: 18, borderRadius: 16,
            alignItems: 'center',
          }}
        >
          {loading
            ? <ActivityIndicator color="#6B7280" />
            : <Text style={{ color: '#4B5563', fontWeight: 'bold', fontSize: 16 }}>Explore as Guest</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

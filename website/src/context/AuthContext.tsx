'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'merchant' | 'professional' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<User>;
  loginWithDemo: (role: 'merchant' | 'professional' | 'user') => Promise<User>;
  loginAsGuest: (role?: 'merchant' | 'professional' | 'user') => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const DEMO_CREDENTIALS = {
  merchant: {
    uid: 'demo_merchant_kurnool_001',
    email: 'merchant@kurnoolone.com',
    password: 'Password@123',
    displayName: 'Kurnool Merchant (Shop Owner)',
    role: 'merchant' as const,
  },
  professional: {
    uid: 'demo_pro_kurnool_002',
    email: 'pro@kurnoolone.com',
    password: 'Password@123',
    displayName: 'Dr. Srinivas Rao (Verified Pro)',
    role: 'professional' as const,
  },
  user: {
    uid: 'demo_citizen_kurnool_003',
    email: 'demo@kurnoolone.com',
    password: 'Password@123',
    displayName: 'Kurnool Citizen',
    role: 'user' as const,
  },
};

// Helper to create a compliant mock User object
function createMockUser(cred: { uid: string; email: string; displayName: string; role?: string; password?: string }): User {
  return {
    uid: cred.uid,
    email: cred.email,
    displayName: cred.displayName,
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    providerId: 'password',
    tenantId: null,
    providerData: [],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    refreshToken: 'mock-refresh-token',
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as unknown as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile to Firestore (with silent offline fallback)
  const syncUserProfile = async (firebaseUser: User, roleFallback: 'user' | 'merchant' | 'professional' = 'user') => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const newProfile: UserProfileData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Kurnool User',
          photoURL: firebaseUser.photoURL || null,
          role: roleFallback,
        };
        await setDoc(userRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
        });
        setProfile(newProfile);
      } else {
        const data = snap.data();
        const existingProfile: UserProfileData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: data.displayName || firebaseUser.displayName || 'Kurnool User',
          photoURL: data.photoURL || firebaseUser.photoURL || null,
          role: data.role || roleFallback,
        };
        setProfile(existingProfile);
      }
    } catch {
      // Offline fallback
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Kurnool User',
        photoURL: firebaseUser.photoURL || null,
        role: roleFallback,
      });
    }
  };

  useEffect(() => {
    // 1. Check for stored mock user session first (for guaranteed instant demo/guest access)
    try {
      const stored = localStorage.getItem('kurnool_mock_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const mockU = createMockUser(parsed);
        setUser(mockU);
        setProfile({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
          photoURL: null,
          role: parsed.role,
        });
        setLoading(false);
        return;
      }
    } catch {
      // LocalStorage not available or parse error
    }

    // 2. Listen to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncUserProfile(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      await syncUserProfile(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  // Guaranteed Demo Login (Tries Firebase, and if Firebase Auth fails, seamlessly falls back to mock session)
  const loginWithDemo = async (role: 'merchant' | 'professional' | 'user') => {
    setLoading(true);
    const cred = DEMO_CREDENTIALS[role];

    try {
      // 1. Try Firebase Auth
      let firebaseUser: User | null = null;
      try {
        const res = await signInWithEmailAndPassword(auth, cred.email, cred.password);
        firebaseUser = res.user;
      } catch (authErr: any) {
        if (
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/wrong-password'
        ) {
          const createRes = await createUserWithEmailAndPassword(auth, cred.email, cred.password);
          await updateProfile(createRes.user, { displayName: cred.displayName });
          firebaseUser = createRes.user;
        } else {
          throw authErr;
        }
      }

      if (firebaseUser) {
        await syncUserProfile(firebaseUser, cred.role);
        return firebaseUser;
      }
      throw new Error('Firebase returned null user');
    } catch {
      // 2. Guaranteed Instant Fallback Mock Session (NEVER FAILS!)
      const mockUser = createMockUser(cred);
      try {
        localStorage.setItem('kurnool_mock_user', JSON.stringify(cred));
      } catch {}
      setUser(mockUser);
      setProfile({
        uid: cred.uid,
        email: cred.email,
        displayName: cred.displayName,
        photoURL: null,
        role: cred.role,
      });
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  // Skip Login / Guest Mode for ALL
  const loginAsGuest = async (role: 'merchant' | 'professional' | 'user' = 'user') => {
    setLoading(true);
    const guestCreds = {
      merchant: {
        uid: 'guest_merchant_' + Date.now(),
        email: 'guest.merchant@kurnoolone.com',
        displayName: 'Guest Merchant',
        role: 'merchant' as const,
      },
      professional: {
        uid: 'guest_pro_' + Date.now(),
        email: 'guest.pro@kurnoolone.com',
        displayName: 'Guest Professional',
        role: 'professional' as const,
      },
      user: {
        uid: 'guest_citizen_' + Date.now(),
        email: 'guest@kurnoolone.com',
        displayName: 'Guest Resident',
        role: 'user' as const,
      },
    };

    const target = guestCreds[role];
    const mockUser = createMockUser({
      ...target,
      password: '',
    });

    try {
      localStorage.setItem('kurnool_mock_user', JSON.stringify(target));
    } catch {}

    setUser(mockUser);
    setProfile({
      uid: target.uid,
      email: target.email,
      displayName: target.displayName,
      photoURL: null,
      role: target.role,
    });
    setLoading(false);
    return mockUser;
  };

  const logout = async () => {
    try {
      localStorage.removeItem('kurnool_mock_user');
    } catch {}
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginWithDemo,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

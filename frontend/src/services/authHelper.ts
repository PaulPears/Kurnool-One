import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

export interface AppUserSession {
  uid: string;
  displayName: string;
  phoneNumber: string;
  email?: string;
  photoURL?: string;
  role?: string;
}

/**
 * Resolves the active user session robustly by checking:
 * 1. Native Firebase Auth currentUser
 * 2. AsyncStorage 'user' payload (saved upon phone OTP, reviewer, or Google login)
 *
 * Prevents false "Login Required" alerts when native auth token is hydrating.
 */
export async function getAppUser(): Promise<AppUserSession | null> {
  // 1. Try Firebase Auth client
  if (auth.currentUser && auth.currentUser.uid) {
    return {
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || '',
      phoneNumber: auth.currentUser.phoneNumber || '',
      email: auth.currentUser.email || undefined,
      photoURL: auth.currentUser.photoURL || undefined,
    };
  }

  // 2. Fall back to persisted AsyncStorage session
  try {
    const stored = await AsyncStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.uid || parsed.id)) {
        return {
          uid: parsed.uid || parsed.id,
          displayName: parsed.name || parsed.displayName || '',
          phoneNumber: parsed.phone || parsed.phoneNumber || '',
          email: parsed.email,
          photoURL: parsed.photoURL,
          role: parsed.role,
        };
      }
    }
  } catch (err) {
    console.warn('getAppUser AsyncStorage error:', err);
  }

  return null;
}

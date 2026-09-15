import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBb5tMO26krt_1MMPzRiZAnKgicuTw-bp0",
  authDomain: "kurnool-kaburlu.firebaseapp.com",
  projectId: "kurnool-kaburlu",
  storageBucket: "kurnool-kaburlu.firebasestorage.app",
  messagingSenderId: "77831467457",
  appId: "1:77831467457:web:3d38bab86b189163dcbf40",
  measurementId: "G-5FDTF70HVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword };

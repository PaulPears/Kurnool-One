import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBb5tMO26krt_1MMPzRiZAnKgicuTw-bp0",
  authDomain: "kurnool-kaburlu.firebaseapp.com",
  projectId: "kurnool-kaburlu",
  storageBucket: "kurnool-kaburlu.firebasestorage.app",
  messagingSenderId: "77831467457",
  appId: "1:77831467457:web:3d38bab86b189163dcbf40"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setAdminRole() {
  try {
    // 1. Sign in as admin user
    const cred = await signInWithEmailAndPassword(auth, 'kurnoolone1@gmail.com', 'Admin@12345');
    console.log('Signed in as:', cred.user.email, cred.user.uid);

    // 2. Update role to super_admin
    const userRef = doc(db, 'users', cred.user.uid);
    await updateDoc(userRef, {
      role: 'super_admin',
      roles: ['super_admin', 'admin', 'user']
    });

    const snap = await getDoc(userRef);
    console.log('User document updated successfully! Current role:', snap.data()?.role);
  } catch (err) {
    console.error('Error setting admin role:', err);
  }
}

setAdminRole();


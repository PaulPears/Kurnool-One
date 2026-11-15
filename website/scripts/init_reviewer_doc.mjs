import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBb5tMO26krt_1MMPzRiZAnKgicuTw-bp0",
  authDomain: "kurnool-kaburlu.firebaseapp.com",
  projectId: "kurnool-kaburlu",
  storageBucket: "kurnool-kaburlu.firebasestorage.app",
  messagingSenderId: "77831467457",
  appId: "1:77831467457:web:3d38bab86b189163dcbf40"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initReviewerDoc() {
  await setDoc(doc(db, 'users', 't2wg5UdeddWlsjw68X3WeY2rcFo2'), {
    uid: 't2wg5UdeddWlsjw68X3WeY2rcFo2',
    email: 'reviewer@kurnoolone.com',
    displayName: 'Google Play Reviewer',
    role: 'user',
    phone: '+919999999999',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  console.log("Reviewer Firestore doc initialized!");
}

initReviewerDoc();


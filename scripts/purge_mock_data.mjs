import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

const TARGET_COLLECTIONS = [
  'places',
  'worship_places',
  'events',
  'promotions',
  'news',
  'house_rentals',
  'blood_donors',
  'marketplace',
  'marketplace_items'
];

async function purgeAll() {
  console.log('Authenticating as admin...');
  try {
    await signInWithEmailAndPassword(auth, 'pearsrobert174@gmail.com', 'Kurnool@2026');
    console.log('Authenticated successfully!');
  } catch (err) {
    console.warn('Auth note:', err.message);
  }

  for (const collName of TARGET_COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, collName));
      console.log(`Collection [${collName}]: found ${snap.size} documents.`);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, collName, d.id));
        console.log(`  Deleted doc ${d.id} from ${collName}`);
      }
    } catch (err) {
      console.error(`Error querying/deleting in ${collName}:`, err.message);
    }
  }

  console.log('Purge completed!');
  process.exit(0);
}

purgeAll();


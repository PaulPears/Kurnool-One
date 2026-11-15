const fs = require('fs');
const envText = fs.readFileSync('../website/.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
});
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, limit, getDocs } = require('firebase/firestore');
const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

async function testFetch() {
  try {
    const coll = collection(db, 'businesses');
    const q = query(coll, where('status', 'in', ['active', 'published', 'approved']), limit(100));
    const snap = await getDocs(q);
    console.log('Snap empty?', snap.empty, 'size:', snap.size);
    snap.forEach(d => console.log('item:', d.id, d.data().name_en));
  } catch (e) {
    console.error('Error fetching with where:', e);
  }
}
testFetch().then(() => process.exit(0));

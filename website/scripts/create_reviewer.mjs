import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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

const reviewerEmail = "reviewer@kurnoolone.com";
const reviewerPassword = "KurnoolReview@2026";

async function createReviewer() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, reviewerEmail, reviewerPassword);
    console.log("Successfully created reviewer user:", cred.user.uid, cred.user.email);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("Reviewer user already exists. Testing sign in...");
      const cred = await signInWithEmailAndPassword(auth, reviewerEmail, reviewerPassword);
      console.log("Sign-in test succeeded:", cred.user.uid, cred.user.email);
    } else {
      console.error("Error creating reviewer user:", err);
    }
  }
}

createReviewer();


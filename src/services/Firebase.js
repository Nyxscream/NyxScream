// Firebase Configuration & Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDemoKeyForNyxScream123456789',
  authDomain: 'nyxscream-fb.firebaseapp.com',
  projectId: 'nyxscream-fb',
  storageBucket: 'nyxscream-fb.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abc123def456ghi789jkl'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('◉ Persistence error:', error);
});

export default app;
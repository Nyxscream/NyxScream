// Firebase Configuration & Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validate required environment variables
if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  console.error('[Firebase] REACT_APP_FIREBASE_API_KEY is not set in .env file');
  console.error('[Firebase] See .env.example for required variables');
}

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'nyxscream-fb.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'nyxscream-fb',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'nyxscream-fb.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789012:web:abc123def456ghi789jkl'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence based on platform
const initializePersistence = async () => {
  try {
    const persistenceMode = Platform.select({
      web: browserLocalPersistence,
      default: getReactNativePersistence(AsyncStorage)
    });
    
    await setPersistence(auth, persistenceMode);
    console.log('[Firebase] Persistence initialized successfully');
  } catch (error) {
    console.error('[Firebase] Persistence error:', error.message);
    // Continue without persistence rather than failing
  }
};

initializePersistence();

export default app;

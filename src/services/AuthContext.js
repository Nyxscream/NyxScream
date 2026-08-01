// Authentication Context - User Management
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUser({ ...currentUser, ...userDocSnap.data() });
          } else {
            setUser(currentUser);
          }
        } catch (err) {
          console.error('◉ User profile fetch failed:', err);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        echo: email.split('@')[0], // Username
        email: email,
        name: name,
        avatar: null,
        role: 'user',
        essence: {
          tier: 'none',
          status: 'active',
          stripeShadowId: null,
          stripeEssenceId: null
        },
        shadowProfile: {
          channelName: null,
          whisper: null,
          shadowCount: 0,
          totalEchoes: 0,
          tributes: {
            voidAds: 0,
            shadowSubs: 0,
            echoTips: 0
          },
          streamKey: null,
          isScreaming: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setUser({ ...newUser });
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...updates, updatedAt: new Date() }, { merge: true });
      setUser({ ...user, ...updates });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
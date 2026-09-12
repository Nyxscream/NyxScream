// Authentication Context - User Management
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from './Firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

// Custom hook for safer context access
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('[useAuth] Must be used within AuthProvider');
  }
  return context;
};

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
const isStrongPassword = (password) => {
  return password.length >= 8;
};

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
          console.error('[AuthContext] User profile fetch failed:', err.message);
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

      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!isStrongPassword(password)) {
        throw new Error('Password must be at least 8 characters');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create standardized user document in Firestore
      const userDocRef = doc(db, 'users', newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        email: email,
        displayName: name,
        username: email.split('@')[0],
        avatar: null,
        role: 'user',
        // Standardized subscription field
        subscription: {
          tier: 'void',
          status: 'none',
          expiresAt: null
        },
        // Standardized creator profile
        profile: {
          bio: null,
          channelName: null,
          followers: 0,
          isCreator: false
        },
        creator: {
          verificationTier: 'none',
          subscribers: 0,
          totalStreams: 0,
          isStreaming: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setUser({ ...newUser });
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...updates, updatedAt: new Date() }, { merge: true });
      setUser({ ...user, ...updates });
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
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

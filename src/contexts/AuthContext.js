import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userObj = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            };
            
            // Update both state and storage
            await AsyncStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
          } else {
            // If no user data in Firestore, create it
            const newUser = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'member',
              createdAt: new Date().toISOString()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            
            const userObj = {
              uid: firebaseUser.uid,
              ...newUser
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
          }
        } else {
          // No user is signed in
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // On error, clear the user to be safe
        await AsyncStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign up a new user
  const signup = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore
      const userData = {
        email,
        name,
        role: 'member',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Update local state and storage
      const userObj = {
        uid: userCredential.user.uid,
        ...userData
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      
      return userObj;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found. Please contact support.');
      }
      
      const userData = userDoc.data();
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        ...userData
      };
      
      // Ensure AsyncStorage is updated
      await AsyncStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      
      return userObj;
    } catch (error) {
      console.error('Login error:', error);
      // Clear any potentially invalid auth state
      await AsyncStorage.removeItem('user');
      setUser(null);
      setError(error.message || 'Failed to login. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      setLoading(true);
      
      // Update in Firestore
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      
      // Update local state and storage
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        updateUserProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Checking for existing user session...');
        const userJson = await AsyncStorage.getItem('user');
        console.log('User from storage:', userJson);
        if (userJson) {
          const user = JSON.parse(userJson);
          console.log('Loaded user from storage:', user);
          setUser(user);
        } else {
          console.log('No user found in storage');
        }
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email });
    try {
      setLoading(true);
      setError(null);
      
      // Get test users from AsyncStorage
      const testUsersJson = await AsyncStorage.getItem('testUsers');
      console.log('Test users from storage:', testUsersJson);
      
      if (!testUsersJson) {
        throw new Error('No test users found. Please restart the app to initialize test data.');
      }
      
      const testUsers = JSON.parse(testUsersJson);
      const user = testUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (user) {
        // Remove password before storing user
        const { password, ...userWithoutPassword } = user;
        console.log('Login successful, user:', userWithoutPassword);
        await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        return true; // Return true on success
      } else {
        console.log('Invalid credentials for email:', email);
        setError('Invalid email or password');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}>
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
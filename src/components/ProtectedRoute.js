import React, { useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  roles = [], // Array of allowed roles (e.g., ['manager'])
  loadingComponent = null 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading indicator while checking auth state
  if (loading) {
    return loadingComponent || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Please log in to access this page</Text>
      </View>
    );
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          You don't have permission to access this page
        </Text>
      </View>
    );
  }

  // User is authenticated and has required role
  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProtectedRoute;

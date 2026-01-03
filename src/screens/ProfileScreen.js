import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

// Theme colors based on user role
const THEME = {
  member: {
    primary: '#4a90e2', // Blue for members
    light: '#e3f2fd',
    dark: '#1976d2',
  },
  manager: {
    primary: '#2e7d32', // Darker green to match ManagerDashboardScreen
    light: '#e8f5e9',
    dark: '#1b5e20',  // Slightly darker shade for better contrast
  },
  default: {
    primary: '#4CAF50',
    light: '#e8f5e9',
    dark: '#388e3c',
  },
};

const getTheme = (role = 'member') => {
  const roleKey = role ? role.toLowerCase() : 'member';
  return THEME[roleKey] || THEME.default;
};

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  
  // Get theme based on user role
  const theme = getTheme(user?.role);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data found. Please login again.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Login')}>
          Go to Login
        </Button>
      </View>
    );
  }

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: `${theme.light}40`, // Add transparency
      padding: 15,
      paddingTop: 60,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 30,
      backgroundColor: theme.primary,
      borderRadius: 10,
      marginBottom: 15,
      elevation: 2,
    },
    avatar: {
      backgroundColor: '#fff',
      marginBottom: 15,
      color: theme.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#fff',
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    email: {
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 10,
    },
    role: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderRadius: 15,
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      overflow: 'hidden',
    },
    roleBadge: {
      backgroundColor: theme.light,
      color: theme.dark,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      fontSize: 12,
      textAlign: 'center',
      alignSelf: 'flex-end',
      fontWeight: '600',
    },
    button: {
      marginVertical: 8,
      paddingVertical: 6,
      backgroundColor: theme.primary,
    },
  });

  const styles = StyleSheet.create({
    card: {
      marginBottom: 20,
      borderRadius: 10,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    label: {
      fontSize: 16,
      color: '#666',
      flex: 1,
    },
    value: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1.5,
      textAlign: 'right',
    },
    buttonContainer: {
      marginTop: 10,
      paddingHorizontal: 10,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    logoutButton: {
      borderColor: '#f44336',
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    logoutButtonLabel: {
      color: '#f44336',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Avatar.Icon 
          size={100} 
          icon="account" 
          style={dynamicStyles.avatar} 
        />
        <Title style={dynamicStyles.name}>{user.name || 'User'}</Title>
        <Text style={dynamicStyles.email}>{user.email}</Text>
        <Text style={dynamicStyles.role}>
          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: theme.dark }}>Account Information</Title>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.name || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={[styles.value, dynamicStyles.roleBadge]}>
              {user.role || 'member'}
            </Text>
          </View>
          {user.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Member since:</Text>
              <Text style={styles.value}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('EditProfile')}
          style={[dynamicStyles.button, { backgroundColor: theme.primary }]}
          labelStyle={styles.buttonLabel}
        >
          Edit Profile
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={[dynamicStyles.button, styles.logoutButton]}
          labelStyle={[styles.buttonLabel, styles.logoutButtonLabel]}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

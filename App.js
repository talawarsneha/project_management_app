import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailsScreen from './src/screens/ProjectDetailsScreen';
import AddProjectScreen from './src/screens/AddProjectScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import MemberDashboardScreen from './src/screens/MemberDashboardScreen';
import ManagerDashboardScreen from './src/screens/ManagerDashboardScreen';

const Stack = createNativeStackNavigator();

// Initialize sample data if no projects exist
const initializeData = async () => {
  // Initialize test users if they don't exist
  try {
    const testUsers = [
      {
        id: 'manager1',
        email: 'manager@example.com',
        name: 'Project Manager',
        role: 'manager',
        password: 'manager123' // In a real app, this should be hashed
      },
      {
        id: 'member1',
        email: 'member@example.com',
        name: 'Team Member',
        role: 'member',
        password: 'member123' // In a real app, this should be hashed
      }
    ];
    
    await AsyncStorage.setItem('testUsers', JSON.stringify(testUsers));
  } catch (error) {
    console.error('Error initializing test users:', error);
  }
  
  try {
    const hasData = await AsyncStorage.getItem('hasInitialData');
    if (!hasData) {
      const sampleProjects = [
        {
          id: '1',
          name: 'Website Redesign',
          description: 'Redesign the company website with modern UI/UX',
          members: [
            { userId: 'manager1', email: 'manager@example.com', role: 'manager' },
            { userId: 'member1', email: 'member@example.com', role: 'member' }
          ],
          tasks: [
            {
              id: '101',
              title: 'Create wireframes',
              description: 'Design wireframes for all main pages',
              assignedTo: 'member@example.com',
              createdBy: 'manager@example.com',
              status: 'In Progress',
              priority: 'High',
              dueDate: '2023-06-15',
              createdAt: '2023-05-01T10:00:00Z',
              comments: []
            }
          ],
          createdAt: '2023-05-01T09:00:00Z'
        }
      ];
      await AsyncStorage.setItem('projects', JSON.stringify(sampleProjects));
      await AsyncStorage.setItem('hasInitialData', 'true');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Initialize data when app starts
initializeData();

// Main App Navigator
const AppNavigator = () => {
  const { user, loading, logout } = useAuth();
  console.log('AppNavigator - Auth state:', { user, loading });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderHeaderRight = () => (
    <TouchableOpacity 
      style={{ marginRight: 15 }}
      onPress={handleLogout}
    >
      <Text style={{ color: '#4a90e2', fontSize: 16 }}>Logout</Text>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // User is logged in
          user.role === 'manager' ? (
            // Manager routes
            <>
              <Stack.Screen 
                name="ManagerDashboard" 
                component={ManagerDashboardScreen} 
                options={{ 
                  title: 'Manager Dashboard',
                  headerRight: renderHeaderRight 
                }} 
              />
              <Stack.Screen 
                name="Projects" 
                component={ProjectsScreen} 
                options={{ 
                  title: 'Projects',
                  headerRight: renderHeaderRight 
                }} 
              />
              <Stack.Screen 
                name="ProjectDetails" 
                component={ProjectDetailsScreen} 
                options={{ title: 'Project Details' }}
              />
              <Stack.Screen 
                name="AddProject" 
                component={AddProjectScreen} 
                options={{ title: 'Add Project' }}
              />
              <Stack.Screen 
                name="AddTask" 
                component={AddTaskScreen} 
                options={{ title: 'Add Task' }}
              />
            </>
          ) : (
            // Member routes
            <Stack.Screen 
              name="MemberDashboard" 
              component={MemberDashboardScreen} 
              options={{ 
                title: 'My Dashboard',
                headerRight: renderHeaderRight
              }}
            />
          )
        ) : (
          // Auth Screens
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Wrapper component to provide auth context
const App = () => {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;

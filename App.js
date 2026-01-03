import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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
import TeamManagementScreen from './src/screens/TeamManagementScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Manager Tabs
const ManagerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'ManagerDashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Team') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Projects') {
          iconName = focused ? 'folder' : 'folder-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2e7d32',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
      tabBarStyle: { paddingBottom: 5 },
      contentStyle: { paddingTop: 10 }
    })}
  >
    <Tab.Screen 
      name="ManagerDashboard" 
      component={ManagerDashboardScreen} 
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen 
      name="Team" 
      component={TeamManagementScreen} 
      options={{ title: 'Team' }}
    />
    <Tab.Screen 
      name="Projects" 
      component={ProjectsScreen} 
      options={{ title: 'Projects' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Member Tabs
const MemberTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'MemberDashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'MyTasks') {
          iconName = focused ? 'list' : 'list-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4a90e2',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
      tabBarStyle: { paddingBottom: 5 },
      contentStyle: { paddingTop: 10 }
    })}
  >
    <Tab.Screen 
      name="MemberDashboard" 
      component={MemberDashboardScreen} 
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen 
      name="MyTasks" 
      component={MemberDashboardScreen} 
      options={{ title: 'My Tasks' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Initialize sample data if no projects exist
const initializeData = async () => {
  // Initialize test users if they don't exist
  try {
    const users = [
      {
        id: 'manager1',
        email: 'manager@example.com',
        name: 'Project Manager',
        role: 'manager',
        password: 'manager123', // In a real app, this should be hashed
        createdAt: new Date().toISOString()
      },
      {
        id: 'member1',
        email: 'member@example.com',
        name: 'Team Member',
        role: 'member',
        password: 'member123', // In a real app, this should be hashed
        createdAt: new Date().toISOString()
      }
    ];
    
    // Check if users already exist to prevent overwriting
    const existingUsers = await AsyncStorage.getItem('users');
    if (!existingUsers) {
      await AsyncStorage.setItem('users', JSON.stringify(users));
    }
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
            // Manager tabs
            <Stack.Screen 
              name="ManagerTabs" 
              component={ManagerTabs}
              options={{
                headerShown: false
              }}
            />
          ) : (
            // Member tabs
            <Stack.Screen 
              name="MemberTabs" 
              component={MemberTabs}
              options={{
                headerShown: false
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
        
        {/* Common screens that can be navigated to from both manager and member tabs */}
        <Stack.Screen 
          name="AddProject" 
          component={AddProjectScreen} 
          options={{
            title: 'New Project',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#ffffff',
              elevation: 0, // Remove shadow on Android
              shadowOpacity: 0, // Remove shadow on iOS
              borderBottomWidth: 0,
            },
            headerTintColor: '#1b5e20',
            headerTitleStyle: {
              fontWeight: '700',
              color: '#1b5e20',
            },
            headerBackTitle: 'Back',
            presentation: 'card', // Change from modal to card
          }} 
        />
        <Stack.Screen 
          name="ProjectDetails" 
          component={ProjectDetailsScreen} 
          options={({ route }) => ({ 
            title: route.params?.projectName || 'Project Details',
            presentation: 'card'
          })} 
        />
        <Stack.Screen 
          name="AddTask" 
          component={AddTaskScreen} 
          options={{ 
            title: 'Add New Task',
            presentation: 'modal'
          }} 
        />
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

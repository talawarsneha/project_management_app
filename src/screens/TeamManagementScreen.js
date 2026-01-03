import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const TeamManagementScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const users = await AsyncStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        // Filter out admin/manager accounts if needed
        const teamMembers = parsedUsers.filter(user => user.role === 'member');
        setMembers(teamMembers);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      Alert.alert('Error', 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsAdding(true);
      
      // Check if user already exists
      const existingUsers = await AsyncStorage.getItem('users');
      let users = [];
      
      if (existingUsers) {
        users = JSON.parse(existingUsers);
        const userExists = users.some(user => user.email === email);
        if (userExists) {
          Alert.alert('Error', 'A user with this email already exists');
          return;
        }
      }

      // Add new member
      const newMember = {
        id: Date.now().toString(),
        email: email.trim().toLowerCase(),
        password: password, // In a real app, hash the password
        role: 'member',
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newMember];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update UI
      setMembers(prev => [...prev, newMember]);
      setEmail('');
      setPassword('');
      
      Alert.alert('Success', 'Team member added successfully');
    } catch (error) {
      console.error('Error adding team member:', error);
      Alert.alert('Error', 'Failed to add team member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      Alert.alert(
        'Remove Member',
        'Are you sure you want to remove this team member?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: async () => {
              const updatedMembers = members.filter(member => member.id !== memberId);
              
              // Update in AsyncStorage
              const existingUsers = await AsyncStorage.getItem('users');
              if (existingUsers) {
                const users = JSON.parse(existingUsers);
                const updatedUsers = users.filter(user => user.id !== memberId);
                await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
              }
              
              // Update UI
              setMembers(updatedMembers);
              Alert.alert('Success', 'Team member removed successfully');
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error removing team member:', error);
      Alert.alert('Error', 'Failed to remove team member');
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <MaterialIcons name="person" size={24} color="#2e7d32" />
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleRemoveMember(item.id)}
        style={styles.removeButton}
      >
        <MaterialIcons name="delete" size={22} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add Team Member</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter member's email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Temporary Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a temporary password"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <Text style={styles.hint}>
              Member will be asked to change this password on first login
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isAdding && styles.buttonDisabled]}
            onPress={handleAddMember}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Add Team Member</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.membersContainer}>
          <Text style={styles.sectionTitle}>Team Members ({members.length})</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#2e7d32" style={styles.loader} />
          ) : members.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No team members added yet</Text>
            </View>
          ) : (
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f5',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 40, // Increased padding to move content further down
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a531b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a531b',
    backgroundColor: '#f1f8e9',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#81c784',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  membersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a531b',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberEmail: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});

export default TeamManagementScreen;

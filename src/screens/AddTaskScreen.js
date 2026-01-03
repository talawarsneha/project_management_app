import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const AddTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: 'Add New Task',
    });
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@gmail\.com$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    if (assignedTo && !validateEmail(assignedTo)) {
      Alert.alert('Error', 'Please enter a valid Gmail address');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Adding task to project ID:', projectId);
      
      // Get current projects
      const savedProjects = await AsyncStorage.getItem('projects');
      console.log('Current projects in storage:', savedProjects);
      
      if (!savedProjects || savedProjects === 'undefined') {
        throw new Error('No projects found in storage');
      }
      
      // Parse projects
      let projects;
      try {
        projects = JSON.parse(savedProjects);
        if (!Array.isArray(projects)) {
          throw new Error('Projects data is not an array');
        }
      } catch (e) {
        console.error('Error parsing projects:', e);
        throw new Error('Error reading project data');
      }
      
      // Find the project index
      const projectIndex = projects.findIndex(p => p && p.id === projectId);
      console.log('Found project at index:', projectIndex);
      
      if (projectIndex === -1) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo.trim(),
        status: status || 'To Do',
        dueDate: dueDate.trim() || '',
        createdAt: new Date().toISOString(),
      };
      
      console.log('New task to add:', newTask);

      // Create updated projects array with the new task
      const updatedProjects = [...projects];
      
      // Ensure tasks array exists
      if (!updatedProjects[projectIndex].tasks || !Array.isArray(updatedProjects[projectIndex].tasks)) {
        updatedProjects[projectIndex].tasks = [];
      }
      
      // Add new task to the project's tasks
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        tasks: [...updatedProjects[projectIndex].tasks, newTask]
      };
      
      console.log('Updated projects:', updatedProjects);
      
      // Save back to storage
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      console.log('Task added successfully');
      
      // Navigate back to project details
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Task Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Assigned To (Gmail)</Text>
        <TextInput
          style={styles.input}
          value={assignedTo}
          onChangeText={setAssignedTo}
          placeholder="user@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            style={styles.picker}
            onValueChange={(itemValue) => setStatus(itemValue)}
          >
            <Picker.Item label="To Do" value="To Do" />
            <Picker.Item label="In Progress" value="In Progress" />
            <Picker.Item label="Completed" value="Completed" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTaskScreen;

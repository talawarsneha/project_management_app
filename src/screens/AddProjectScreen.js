import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AddProjectScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const newProject = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        tasks: [],
        createdAt: new Date().toISOString(),
      };

      const savedProjects = await AsyncStorage.getItem('projects');
      let projects = [];
      
      if (savedProjects && savedProjects !== 'undefined') {
        try {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed)) {
            projects = parsed;
          } else {
            console.warn('Existing projects data was not an array, initializing new array');
          }
        } catch (e) {
          console.error('Error parsing saved projects:', e);
        }
      }
      
      const updatedProjects = [...projects, newProject];
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Project Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter project name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter project description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Create Project'}
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
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
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

export default AddProjectScreen;

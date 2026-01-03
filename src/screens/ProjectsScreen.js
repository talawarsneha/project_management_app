import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const savedProjects = await AsyncStorage.getItem('projects');
      if (savedProjects && savedProjects !== 'undefined') {
        const parsedProjects = JSON.parse(savedProjects);
        if (Array.isArray(parsedProjects)) {
          setProjects(parsedProjects);
        } else {
          console.warn('Invalid projects data format, initializing with empty array');
          setProjects([]);
        }
      } else {
        console.log('No projects found, initializing with empty array');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const handleProjectPress = (project) => {
    if (!project || !project.id) {
      console.error('Invalid project data:', project);
      Alert.alert('Error', 'Cannot open project: Invalid project data');
      return;
    }
    
    navigation.navigate('ProjectDetails', { 
      projectId: project.id,
      projectName: project.name // Pass project name for the header
    });
  };

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectItem}
      onPress={() => handleProjectPress(item)}
    >
      <Text style={styles.projectName}>{item.name}</Text>
      <Text style={styles.taskCount}>{item.tasks?.length || 0} tasks</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProject')}
        >
          <Text style={styles.addButtonText}>+ New Project</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 60, // Add extra padding at the top to account for header
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  projectItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProjectsScreen;

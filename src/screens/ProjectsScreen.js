import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>Manage your work and tasks</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProject')}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {projects.reduce((total, project) => total + (project.tasks?.length || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Your Projects</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a531b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#2e7d32',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a531b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a531b',
  },
  seeAll: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 30,
  },
  projectItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskCount: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default ProjectsScreen;

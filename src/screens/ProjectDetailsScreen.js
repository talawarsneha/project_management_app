import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProjectDetailsScreen = ({ route, navigation }) => {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const { projectId } = route.params;

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const savedProjects = await AsyncStorage.getItem('projects');
      console.log('Saved projects:', savedProjects);
      
      if (!savedProjects || savedProjects === 'undefined') {
        console.warn('No projects found in storage');
        Alert.alert('Error', 'No projects found');
        navigation.goBack();
        return;
      }

      let projects;
      try {
        projects = JSON.parse(savedProjects);
        if (!Array.isArray(projects)) {
          throw new Error('Projects data is not an array');
        }
      } catch (e) {
        console.error('Error parsing projects:', e);
        Alert.alert('Error', 'Invalid project data format');
        navigation.goBack();
        return;
      }

      const currentProject = projects.find(p => p && p.id === projectId);
      if (!currentProject) {
        console.warn(`Project with ID ${projectId} not found`);
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
        return;
      }

      console.log('Current project:', currentProject);
      setProject(currentProject);
      
      // Ensure tasks is always an array
      const projectTasks = Array.isArray(currentProject.tasks) ? currentProject.tasks : [];
      console.log('Project tasks:', projectTasks);
      setTasks(projectTasks);
      
      // Set the title from the route params or from project data
      navigation.setOptions({ 
        title: route.params?.projectName || currentProject.name || 'Project Details' 
      });
      
    } catch (error) {
      console.error('Error in loadProject:', error);
      Alert.alert('Error', 'Failed to load project: ' + error.message);
      navigation.goBack();
    }
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask', { projectId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return '#ffc107';
      case 'In Progress':
        return '#17a2b8';
      case 'Completed':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const renderTaskItem = ({ item }) => {
    if (!item) return null;
    
    return (
      <View style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskName}>{item.title || 'Untitled Task'}</Text>
          {item.status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
        </View>
        {item.assignedTo && (
          <Text style={styles.assignedTo}>
            Assigned to: {item.assignedTo}
          </Text>
        )}
        <Text style={styles.dueDate}>
          Due: {item.dueDate || 'No due date'}
        </Text>
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    );
  };

  if (!project) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading project...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.projectDescription}>{project.description || 'No description'}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks yet. Add your first task!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  projectDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskItem: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  assignedTo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProjectDetailsScreen;

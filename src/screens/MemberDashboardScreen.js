import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  SectionList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

const MemberDashboardScreen = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadMemberProjects();
    }, [])
  );

  const loadMemberProjects = async (isPullToRefresh = false) => {
    try {
      if (!isPullToRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Get current user
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.log('No user data found');
        return;
      }
      
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Get all projects
      const savedProjects = await AsyncStorage.getItem('projects');
      if (!savedProjects) {
        console.log('No projects found');
        setProjects([]);
        return;
      }
      
      const allProjects = JSON.parse(savedProjects);
      
      // Filter projects where user is a member and has assigned tasks
      const memberProjects = allProjects.filter(project => {
        // Check if user is a member of this project
        const isMember = project.members?.some(member => member.email === user.email);
        if (!isMember) return false;
        
        // Check if there are tasks assigned to this user in the project
        const hasAssignedTasks = project.tasks?.some(task => task.assignedTo === user.email);
        return hasAssignedTasks;
      });
      
      // Add tasks to each project
      const projectsWithTasks = memberProjects.map(project => ({
        ...project,
        tasks: project.tasks.filter(task => task.assignedTo === user.email)
      }));
      
      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleStatusChange = async (projectId, taskId, newStatus) => {
    try {
      // Get all projects
      const savedProjects = await AsyncStorage.getItem('projects');
      if (!savedProjects) return;
      
      const projects = JSON.parse(savedProjects);
      
      // Find and update the task
      const updatedProjects = projects.map(project => {
        if (project.id === projectId && project.tasks) {
          const updatedTasks = project.tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          return { ...project, tasks: updatedTasks };
        }
        return project;
      });
      
      // Save updated projects
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              tasks: project.tasks.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
              )
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };
  
  const onRefresh = () => {
    loadMemberProjects(true);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return '#ffc107'; // Yellow
      case 'In Progress': return '#17a2b8'; // Teal
      case 'Completed': return '#28a745'; // Green
      default: return '#6c757d'; // Gray
    }
  };
  
  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return '#dc3545'; // Red
      case 'medium': return '#fd7e14'; // Orange
      case 'low': return '#28a745'; // Green
      default: return '#6c757d'; // Gray for normal/undefined
    }
  };
  
  const getTextColorForPriority = (priority) => {
    return ['high', 'medium', 'low'].includes((priority || '').toLowerCase()) 
      ? '#fff' 
      : '#212529';
  };
  
  const renderStatusModal = () => (
    <Modal
      transparent={true}
      visible={!!selectedTask}
      animationType="fade"
      onRequestClose={() => setSelectedTask(null)}
    >
      <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Task Status</Text>
            <Text style={styles.taskTitle} numberOfLines={1}>{selectedTask?.title}</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTask?.status}
                onValueChange={(itemValue) => {
                  if (selectedTask) {
                    handleStatusChange(selectedTask.id, itemValue);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="To Do" value="To Do" />
                <Picker.Item label="In Progress" value="In Progress" />
                <Picker.Item label="Completed" value="Completed" />
              </Picker>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedTask(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderTask = (task, projectId) => (
    <Card style={styles.taskCard} key={task.id}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <Title style={styles.taskTitle}>{task.title}</Title>
          <View style={[styles.statusContainer, { borderColor: getStatusColor(task.status) }]}>
            <Picker
              selectedValue={task.status}
              onValueChange={(value) => handleStatusChange(projectId, task.id, value)}
              style={[styles.statusPicker, { color: getStatusColor(task.status) }]}
              dropdownIconColor={getStatusColor(task.status)}
              mode="dropdown"
            >
              <Picker.Item 
                label="To Do" 
                value="To Do"
                style={styles.pickerItem}
              />
              <Picker.Item 
                label="In Progress" 
                value="In Progress"
                style={styles.pickerItem}
              />
              <Picker.Item 
                label="Completed" 
                value="Completed"
                style={styles.pickerItem}
              />
            </Picker>
          </View>
        </View>
        
        <Paragraph style={styles.taskDescription} numberOfLines={2}>
          {task.description || 'No description provided'}
        </Paragraph>
        
        <View style={styles.taskFooter}>
          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due:</Text>
              <Text style={[styles.metaValue, styles.dueDate]}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority:</Text>
              <Text 
                style={[
                  styles.priorityBadge, 
                  { 
                    backgroundColor: getPriorityColor(task.priority),
                    color: getTextColorForPriority(task.priority)
                  }
                ]}
              >
                {task.priority || 'Normal'}
              </Text>
            </View>
          </View>
          
          {task.status === 'Completed' && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderProject = (projectOrItem) => {
    // Handle both direct call and { item } pattern
    const project = projectOrItem.item || projectOrItem;
    return (
      <Card style={styles.projectCard} key={project.id}>
        <TouchableOpacity onPress={() => toggleProjectExpand(project.id)}>
          <Card.Title
            title={project.name}
            subtitle={`${project.tasks.length} tasks`}
            right={() => (
              <Button 
                icon={expandedProject === project.id ? 'chevron-up' : 'chevron-down'}
                onPress={() => toggleProjectExpand(project.id)}
              />
            )}
          />
        </TouchableOpacity>
        
        {expandedProject === project.id && (
          <Card.Content>
            <Text style={styles.projectDescription}>
              {project.description || 'No description provided'}
            </Text>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Tasks</Text>
            </View>
            
            {project.tasks.length > 0 ? (
              project.tasks.map(task => renderTask(task, project.id))
            ) : (
              <Text style={styles.noTasksText}>No tasks assigned to you in this project.</Text>
            )}
          </Card.Content>
        )}
      </Card>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a90e2']}
            tintColor="#4a90e2"
          />
        }
      >
        {projects.length > 0 ? (
          projects.map(project => renderProject({ item: project }))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No Projects Found</Text>
            <Text style={styles.emptyStateText}>
              You don't have any tasks assigned in any projects yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  projectCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: '#fff',
  },
  projectDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  priority: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  statusContainer: {
    borderRadius: 15,
    borderWidth: 1,
    minWidth: 120,
    overflow: 'hidden',
  },
  statusPicker: {
    height: 32,
    width: '100%',
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  pickerItem: {
    fontSize: 14,
  },
  taskMeta: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    overflow: 'hidden',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
  noTasksText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f7fa',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2c3e50',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
});

export default MemberDashboardScreen;

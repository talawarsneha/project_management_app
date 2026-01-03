import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TextInput,
  Animated,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Card, Title, Paragraph, Button, Searchbar, Avatar } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 100;

const MemberDashboardScreen = () => {
  // Core state
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    todo: 0
  });
  
  // UI state
  const [showSearch, setShowSearch] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);
  const navigation = useNavigation();
  
  // Animated values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, (HEADER_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  const headerTitleSmallOpacity = scrollY.interpolate({
    inputRange: [0, (HEADER_HEIGHT - HEADER_MIN_HEIGHT) / 2, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Tasks', icon: 'view-list' },
    { id: 'todo', label: 'To Do', icon: 'checkbox-blank-outline' },
    { id: 'inProgress', label: 'In Progress', icon: 'progress-clock' },
    { id: 'completed', label: 'Completed', icon: 'check-circle-outline' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadMemberProjects();
    }, [])
  );

  // Calculate task statistics
  const calculateStats = (projects) => {
    let totalTasks = 0;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;

    projects.forEach(project => {
      project.tasks.forEach(task => {
        totalTasks++;
        if (task.status === 'Completed') completed++;
        else if (task.status === 'In Progress') inProgress++;
        else todo++;
      });
    });

    return { totalTasks, completed, inProgress, todo };
  };

  // Filter and search projects
  const filterAndSearchProjects = (projects, query = '', filter = 'all') => {
    return projects.map(project => {
      const filteredTasks = project.tasks.filter(task => {
        // Apply search query
        const matchesSearch = 
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(query.toLowerCase()));
        
        // Apply status filter
        const matchesFilter = 
          filter === 'all' || 
          (filter === 'completed' && task.status === 'Completed') ||
          (filter === 'inProgress' && task.status === 'In Progress') ||
          (filter === 'todo' && (task.status === 'To Do' || !task.status));
        
        return matchesSearch && matchesFilter;
      });

      return { ...project, tasks: filteredTasks };
    }).filter(project => project.tasks.length > 0);
  };

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
        setFilteredProjects([]);
        setStats({ totalTasks: 0, completed: 0, inProgress: 0, todo: 0 });
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
      
      // Calculate initial stats
      const newStats = calculateStats(projectsWithTasks);
      setStats(newStats);
      
      // Apply search and filter to the projects
      const filtered = filterAndSearchProjects(projectsWithTasks, searchQuery, activeFilter);
      
      setProjects(projectsWithTasks);
      setFilteredProjects(filtered);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Toggle project expansion with haptic feedback
  const toggleProjectExpand = (projectId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Handle task status change
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
      
      // Update local state with the updated projects
      const updatedProjectsWithTasks = updatedProjects
        .filter(project => 
          project.members?.some(member => member.email === currentUser?.email) &&
          project.tasks?.some(task => task.assignedTo === currentUser?.email)
        )
        .map(project => ({
          ...project,
          tasks: project.tasks.filter(task => task.assignedTo === currentUser?.email)
        }));
      
      // Update stats
      const newStats = calculateStats(updatedProjectsWithTasks);
      setStats(newStats);
      
      // Apply current search and filter
      const filtered = filterAndSearchProjects(updatedProjectsWithTasks, searchQuery, activeFilter);
      
      setProjects(updatedProjectsWithTasks);
      setFilteredProjects(filtered);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  // Handle search query change
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = filterAndSearchProjects(projects, query, activeFilter);
    setFilteredProjects(filtered);
  };
  
  // Handle filter change
  const handleFilterChange = (filterId) => {
    Haptics.selectionAsync();
    setActiveFilter(filterId);
    const filtered = filterAndSearchProjects(projects, searchQuery, filterId);
    setFilteredProjects(filtered);
  };
  
  // Toggle search bar visibility
  const toggleSearch = () => {
    Haptics.selectionAsync();
    setShowSearch(!showSearch);
    if (!showSearch && searchInputRef.current) {
      // Focus the search input when showing search
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    const filtered = filterAndSearchProjects(projects, '', activeFilter);
    setFilteredProjects(filtered);
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
  
  // Render the header with stats and search
  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <Animated.View 
        style={[
          styles.headerContent, 
          { opacity: headerTitleOpacity }
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.dashboardTitle}>Task Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={toggleSearch}
            >
              <MaterialIcons 
                name={showSearch ? 'close' : 'search'} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getStatusColor('To Do') }]}>
              {stats.todo}
            </Text>
            <Text style={styles.statLabel}>To Do</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getStatusColor('In Progress') }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getStatusColor('Completed') }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Small header that appears on scroll */}
      <Animated.View 
        style={[
          styles.smallHeader, 
          { opacity: headerTitleSmallOpacity }
        ]}
      >
        <Text style={styles.smallHeaderTitle}>Task Dashboard</Text>
        <TouchableOpacity onPress={toggleSearch}>
          <MaterialIcons 
            name={showSearch ? 'close' : 'search'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
  
  // Render search bar
  const renderSearchBar = () => (
    <Animated.View 
      style={[
        styles.searchContainer,
        { 
          height: showSearch ? 'auto' : 0,
          paddingVertical: showSearch ? 10 : 0,
          opacity: showSearch ? 1 : 0 
        }
      ]}
    >
      <View style={styles.searchInputContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <MaterialIcons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
  
  // Render filter tabs
  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {filterOptions.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterTab,
            activeFilter === filter.id && styles.activeFilterTab
          ]}
          onPress={() => handleFilterChange(filter.id)}
        >
          <MaterialCommunityIcons 
            name={filter.icon} 
            size={16} 
            color={activeFilter === filter.id ? '#4a90e2' : '#666'} 
            style={styles.filterIcon}
          />
          <Text 
            style={[
              styles.filterText,
              activeFilter === filter.id && styles.activeFilterText
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <SkeletonPlaceholder key={item} backgroundColor="#e0e0e0" highlightColor="#f5f5f5">
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonHeader} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonFooter} />
          </View>
        </SkeletonPlaceholder>
      ))}
    </View>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={searchQuery || activeFilter !== 'all' ? 'search-off' : 'assignment'} 
        size={60} 
        color="#ccc" 
        style={styles.emptyStateIcon} 
      />
      <Text style={styles.emptyStateTitle}>
        {searchQuery 
          ? 'No tasks found' 
          : activeFilter !== 'all'
            ? `No ${activeFilter} tasks`
            : 'No tasks assigned'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? 'Try a different search term'
          : activeFilter !== 'all'
            ? `You don't have any ${activeFilter} tasks at the moment.`
            : 'You have no tasks assigned to you yet. Check back later or contact your manager.'}
      </Text>
      {(searchQuery || activeFilter !== 'all') && (
        <Button 
          mode="outlined" 
          onPress={() => {
            setSearchQuery('');
            setActiveFilter('all');
            const filtered = filterAndSearchProjects(projects, '', 'all');
            setFilteredProjects(filtered);
          }}
          style={styles.clearFiltersButton}
          labelStyle={styles.clearFiltersButtonText}
        >
          Clear Filters
        </Button>
      )}
    </View>
  );
  
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

  // Group tasks by status for Kanban view
  const groupTasksByStatus = () => {
    const tasksByStatus = {
      'To Do': [],
      'In Progress': [],
      'Completed': []
    };

    filteredProjects.forEach(project => {
      project.tasks.forEach(task => {
        const status = task.status || 'To Do';
        if (tasksByStatus[status]) {
          tasksByStatus[status].push({ ...task, projectId: project.id, projectName: project.name });
        }
      });
    });

    return tasksByStatus;
  };

  const renderTaskList = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6fa5" />
        </View>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="assignment" size={48} color="#d1d5db" />
          <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>
            {searchQuery ? 'No matching tasks found' : 'No tasks assigned to you yet'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.projectsContainer}>
        {filteredProjects.map((project, index) => (
          <View 
            key={project.id} 
            style={[
              styles.card,
              index === 0 && { marginTop: 8 },
              { opacity: loading ? 0.7 : 1 }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{project.name}</Text>
              <Text style={styles.projectTaskCount}>
                {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
              </Text>
            </View>
            
            {project.description && (
              <Text style={styles.description} numberOfLines={2}>
                {project.description}
              </Text>
            )}

            {project.tasks.length > 0 ? (
              <View style={styles.tasksList}>
                {project.tasks.map((task, taskIndex) => (
                  <TouchableOpacity 
                    key={`${project.id}-${task.id}`} 
                    style={[
                      styles.taskCard,
                      { 
                        borderLeftColor: getStatusColor(task.status),
                        marginTop: taskIndex === 0 ? 0 : 8
                      }
                    ]}
                    activeOpacity={0.9}
                    onPress={() => setSelectedTask({ ...task, projectId: project.id })}
                  >
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <View 
                        style={[
                          styles.statusBadge,
                          { 
                            backgroundColor: `${getStatusColor(task.status)}1a`,
                          }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.statusText, 
                            { color: getStatusColor(task.status) }
                          ]}
                        >
                          {task.status || 'Not Started'}
                        </Text>
                      </View>
                    </View>
                    
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    
                    <View style={styles.taskFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons 
                          name="event" 
                          size={14} 
                          color="#9ca3af" 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.dueDate}>
                          {task.dueDate 
                            ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'No due date'}
                        </Text>
                      </View>
                      
                      {task.priority && (
                        <View 
                          style={[
                            styles.priorityTag,
                            { 
                              backgroundColor: `${getPriorityColor(task.priority)}1a`,
                            }
                          ]}
                        >
                          <MaterialIcons 
                            name="flag" 
                            size={12} 
                            color={getPriorityColor(task.priority)} 
                            style={{ marginRight: 4 }}
                          />
                          <Text style={{ 
                            color: getPriorityColor(task.priority),
                            fontSize: 12,
                            fontWeight: '600',
                          }}>
                            {task.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { padding: 16 }]} >
                <MaterialIcons name="assignment-late" size={32} color="#e5e7eb" />
                <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>
                  No tasks in this project
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Main render method
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      <View style={styles.content}>
        {renderTaskList()}
      </View>
      {renderStatusModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4a6fa5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    paddingTop: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  smallHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  smallHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
  },
  projectTaskCount: {
    backgroundColor: '#e9f0f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#4a6fa5',
    fontWeight: '600',
  },
  description: {
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  tasksList: {
    marginTop: 8,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4a6fa5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f4f8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    color: '#7f8c8d',
    fontSize: 14,
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
  priorityTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default MemberDashboardScreen;

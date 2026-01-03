import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      setSelectedDate(selectedDate);
      setDueDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const clearDate = () => {
    setDueDate('');
    setSelectedDate(new Date());
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1b5e20" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Form Card */}
          <View style={styles.card}>
            {/* Task Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Title <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, !title && styles.inputEmpty]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter task title"
                  placeholderTextColor="#9e9e9e"
                  autoFocus={true}
                />
                {title ? (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setTitle('')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="clear" size={18} color="#9e9e9e" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter task description"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {description ? (
                  <TouchableOpacity 
                    style={[styles.clearButton, styles.clearTextAreaButton]}
                    onPress={() => setDescription('')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="clear" size={18} color="#9e9e9e" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Assigned To */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Assigned To (Gmail)</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#2e7d32" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.withIcon]}
                  value={assignedTo}
                  onChangeText={setAssignedTo}
                  placeholder="user@gmail.com"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoCompleteType="email"
                />
                {assignedTo ? (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setAssignedTo('')}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="clear" size={18} color="#9e9e9e" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <MaterialIcons name="flag" size={20} color="#2e7d32" style={styles.pickerIcon} />
                <Picker
                  selectedValue={status}
                  onValueChange={(itemValue) => {
                    console.log('Status changed to:', itemValue);
                    setStatus(itemValue);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#2e7d32"
                  mode="dropdown"
                >
                  <Picker.Item label="To Do" value="To Do" />
                  <Picker.Item label="In Progress" value="In Progress" />
                  <Picker.Item label="Completed" value="Completed" />
                </Picker>
              </View>
            </View>

            {/* Due Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity 
                style={styles.dateInputContainer}
                onPress={openDatePicker}
                activeOpacity={0.7}
              >
                <MaterialIcons name="event" size={20} color="#2e7d32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !dueDate && styles.placeholderText]}>
                  {dueDate || 'Select a date'}
                </Text>
                {dueDate ? (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      clearDate();
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="clear" size={18} color="#9e9e9e" />
                  </TouchableOpacity>
                ) : (
                  <MaterialCommunityIcons 
                    name="calendar-month-outline" 
                    size={20} 
                    color="#9e9e9e" 
                    style={styles.calendarIcon} 
                  />
                )}
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              <Text style={styles.hint}>Tap to select a date</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? (
              <Text>
                <MaterialIcons name="hourglass-empty" size={16} color="#ffffff" /> Saving...
              </Text>
            ) : (
              <Text>
                <MaterialIcons name="save" size={16} color="#ffffff" /> Save Task
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  formGroup: {
    marginBottom: 22,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  required: {
    color: '#e53935',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 50,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    fontWeight: '400',
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  inputEmpty: {
    borderColor: '#e0e0e0',
  },
  inputFocused: {
    borderColor: '#2e7d32',
    backgroundColor: '#f8f9f8',
  },
  withIcon: {
    paddingLeft: 48,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    padding: 5,
  },
  clearTextAreaButton: {
    top: 10,
    right: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#9e9e9e',
  },
  calendarIcon: {
    marginLeft: 'auto',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
    paddingLeft: 16,
    paddingRight: 40,
    lineHeight: 23,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  hint: {
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 4,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  pickerContainer: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#1a1a1a',
    marginLeft: 8,
    marginTop: Platform.OS === 'android' ? -8 : 0,
    fontSize: 15,
  },
  pickerIcon: {
    marginRight: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 0,
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#b9d7ba',
    shadowOpacity: 0,
    borderColor: '#a5d6a7',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  required: {
    color: '#f44336',
    fontSize: 16,
    lineHeight: 16,
  },
});

export default AddTaskScreen;

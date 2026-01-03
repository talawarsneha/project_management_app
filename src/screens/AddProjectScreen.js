import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const AddProjectScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
  };

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
        dueDate: dueDate ? dueDate.toISOString() : null,
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setSelectedDate(selectedDate);
    setDueDate(selectedDate);
  };

  const clearDate = () => {
    setDueDate(null);
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
            {/* Project Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Project Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, !name && styles.inputEmpty]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter project name"
                  placeholderTextColor="#9e9e9e"
                  autoFocus={true}
                />
                {name ? (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setName('')}
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
                  placeholder="Enter project description"
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

            {/* Due Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity 
                style={styles.dateInputContainer}
                onPress={handleShowDatePicker}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateText, !dueDate && styles.placeholderText]}>
                  {dueDate ? dueDate.toLocaleDateString() : 'Select a date'}
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
              <Text style={styles.hint}>Tap to select a date</Text>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, (!name || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!name || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? (
              <><MaterialIcons name="hourglass-empty" size={16} color="#ffffff" /> Creating...</>
            ) : (
              <><MaterialIcons name="add" size={16} color="#ffffff" /> Create Project</>
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
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
  required: {
    color: '#f44336',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    fontWeight: '400',
  },
  inputEmpty: {
    color: '#9e9e9e',
  },
  clearButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  clearTextAreaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#9e9e9e',
  },
  calendarIcon: {
    marginLeft: 12,
  },
  hint: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
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
    backgroundColor: '#a5d6a7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddProjectScreen;

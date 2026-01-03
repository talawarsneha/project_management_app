import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ManagerDashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton]}
          onPress={() => navigation.navigate('AddProject')}
        >
          <Text style={styles.buttonText}>Add New Project</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.viewButton]}
          onPress={() => navigation.navigate('Projects')}
        >
          <Text style={styles.buttonText}>View All Projects</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  viewButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManagerDashboardScreen;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ManagerDashboardScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Project Management</Text>
      </View>
      
      <View style={styles.cardsContainer}>
        {/* New Project Card */}
        <TouchableOpacity 
          style={[styles.card, styles.primaryCard]}
          onPress={() => navigation.navigate('AddProject')}
        >
          <View style={styles.cardIconContainer}>
            <MaterialIcons name="create-new-folder" size={32} color="#2e7d32" />
          </View>
          <Text style={styles.cardTitle}>New Project</Text>
          <Text style={styles.cardSubtitle}>Start a new project from scratch</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardAction}>Create Now</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#2e7d32" />
          </View>
        </TouchableOpacity>

        {/* View Projects Card */}
        <TouchableOpacity 
          style={[styles.card, styles.secondaryCard]}
          onPress={() => navigation.navigate('Projects')}
        >
          <View style={[styles.cardIconContainer, styles.secondaryIconContainer]}>
            <MaterialIcons name="folder-open" size={32} color="#1e88e5" />
          </View>
          <Text style={[styles.cardTitle, styles.secondaryCardTitle]}>My Projects</Text>
          <Text style={[styles.cardSubtitle, styles.secondaryCardSubtitle]}>View and manage all your projects</Text>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardAction, styles.secondaryCardAction]}>View All</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#1e88e5" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#f8faf9',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a531b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  secondaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryIconContainer: {
    backgroundColor: '#e3f2fd',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a531b',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  cardAction: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryCardTitle: {
    color: '#0d47a1',
  },
  secondaryCardSubtitle: {
    color: '#666',
  },
  secondaryCardAction: {
    color: '#1e88e5',
  },
});

export default ManagerDashboardScreen;

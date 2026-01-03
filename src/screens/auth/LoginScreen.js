import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Attempting to login with:', { email, password });
      await login(email, password);
      
      // Reset form on successful login
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a531b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a531b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a531b',
    backgroundColor: '#f1f8e9',
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#81c784',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#2e7d32',
  },
  footerLink: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  demoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  demoTitle: {
    color: '#1b5e20',
    fontWeight: '600',
    marginBottom: 8,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a531b',
    fontSize: 16,
  },
  demoText: {
    color: '#2e7d32',
    color: '#495057',
    marginBottom: 6,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#a5d6a7',
    marginVertical: 10,
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 12,
  },
  note: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#2e7d32',
    marginTop: 12,
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default LoginScreen;

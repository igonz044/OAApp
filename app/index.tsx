import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../utils/authContext';

export default function LoginScreen() {
  const { login, signup, isLoading, isAuthenticated } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [error, setError] = useState('');

  // Let auth context handle navigation for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      // Auth context will handle navigation based on subscription status
      console.log('User is authenticated - auth context will handle navigation');
    }
  }, [isAuthenticated]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    const response = await login(email, password);
    
    if (!response.success) {
      setError(response.error || 'Login failed');
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender || !mainGoal) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    const response = await signup({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      date_of_birth: dateOfBirth,
      gender,
      main_goal: mainGoal
    });
    
    if (!response.success) {
      setError(response.error || 'Signup failed');
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E0C68B" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.phoneContainer}>
          <View style={styles.header}>
              <Text style={styles.logo}>OusAuris</Text>
            <Text style={styles.tagline}>Your wellness journey starts here</Text>
          </View>
          
          <View style={styles.content}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {isSignup && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your first name"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your last name"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="male/female/other"
                      placeholderTextColor="#9CA3AF"
                      value={gender}
                      onChangeText={setGender}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Main Goal</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Describe your main wellness goal"
                      placeholderTextColor="#9CA3AF"
                      value={mainGoal}
                      onChangeText={setMainGoal}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </>
              )}
              
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={isSignup ? handleSignup : handleSignIn}
                disabled={isLoading}
              >
                <Text style={styles.btnPrimaryText}>
                  {isLoading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
                </Text>
            </TouchableOpacity>
            
              <TouchableOpacity style={styles.btnSecondary} onPress={toggleMode}>
                <Text style={styles.btnSecondaryText}>
                  {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#C4B8DD',
    fontSize: 16,
    marginTop: 10,
  },
  phoneContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#2E2C58',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 10,
  },
  tagline: {
    color: '#C4B8DD',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: '#C4B8DD',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#C4B8DD',
    borderRadius: 12,
    backgroundColor: '#F9F8F4',
    color: '#2E2C58',
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  btnSecondary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B8DD',
  },
});

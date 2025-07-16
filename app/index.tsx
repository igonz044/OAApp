import { router } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // In a real app, you would authenticate here
    router.push('/paywall');
  };

  const handleCreateAccount = () => {
    // In a real app, this would navigate to registration
    Alert.alert('Coming Soon', 'Account creation will be available soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.phoneContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>AusOuris</Text>
            <Text style={styles.tagline}>Your wellness journey starts here</Text>
          </View>
          
          <View style={styles.content}>
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
            
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSignIn}>
              <Text style={styles.btnPrimaryText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnSecondary} onPress={handleCreateAccount}>
              <Text style={styles.btnSecondaryText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
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

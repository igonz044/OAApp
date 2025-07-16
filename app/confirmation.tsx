import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ConfirmationScreen() {
  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  const handleGoToCoach = () => {
    router.push('/(tabs)/coach');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.confirmation}>
        <Text style={styles.title}>✅ Appointment Scheduled!</Text>
        
        <View style={styles.confirmationDetails}>
          <Text style={styles.message}>
            Your wellness coaching session has been successfully scheduled.
          </Text>
          <Text style={styles.reminder}>
            You'll receive a reminder 30 minutes before your session.
          </Text>
        </View>
        
        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary]} 
            onPress={handleGoHome}
          >
            <Text style={styles.btnPrimaryText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary]} 
            onPress={handleGoToCoach}
          >
            <Text style={styles.btnSecondaryText}>Coach</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
    justifyContent: 'center',
  },
  confirmation: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    color: '#A9C3B1',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmationDetails: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  message: {
    color: '#F9F8F4',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  reminder: {
    marginTop: 15,
    color: '#C4B8DD',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#E0C68B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4B8DD',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B8DD',
  },
}); 
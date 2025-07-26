import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSession } from '../utils/sessionContext';
import { useSessions } from '../utils/sessionsContext';

export default function ReviewScreen() {
  const { sessionData, clearSessionData } = useSession();
  const { addSession } = useSessions();

  const handleApprove = async () => {
    if (sessionData) {
      try {
        // Add the session to the sessions list
        await addSession({
          goal: sessionData.goal,
          date: sessionData.date,
          time: sessionData.time,
          recurring: sessionData.recurring,
          sessionType: sessionData.sessionType,
          fullDate: sessionData.fullDate!,
          displayTime: sessionData.displayTime!,
        });
        
        console.log('Session approved and added:', sessionData);
        clearSessionData(); // Clear the session data after approval
        router.push('/confirmation');
      } catch (error) {
        console.error('Error adding session:', error);
        Alert.alert('Error', 'Failed to schedule session. Please try again.');
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getRecurringLabel = (recurring: string) => {
    switch (recurring) {
      case 'none': return 'One-time session';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return recurring;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Voice Call';
      case 'chat': return 'Text Chat';
      default: return type;
    }
  };

  if (!sessionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>No Session Data</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>No session data found. Please start over.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/goal-selection')}>
            <Text style={styles.btnPrimaryText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Review & Approve</Text>
        <Text style={styles.subtitle}>Please review your session details before confirming</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.confirmationDetails}>
          <Text style={styles.detailsTitle}>Session Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Goal:</Text>
            <Text style={styles.detailValue}>{sessionData.goal}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{sessionData.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{sessionData.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recurring:</Text>
            <Text style={styles.detailValue}>{getRecurringLabel(sessionData.recurring)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Session Type:</Text>
            <Text style={styles.detailValue}>{getSessionTypeLabel(sessionData.sessionType)}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.btnPrimary} onPress={handleApprove}>
          <Text style={styles.btnPrimaryText}>Approve & Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  backBtnText: {
    color: '#C4B8DD',
    fontSize: 16,
  },
  header: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  screenTitle: {
    color: '#E0C68B',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#C4B8DD',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  confirmationDetails: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  detailsTitle: {
    color: '#E0C68B',
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#F9F8F4',
    fontSize: 16,
  },
  detailValue: {
    color: '#C4B8DD',
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnPrimary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
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
}); 
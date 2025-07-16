import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CoachScreen() {
  const handleScheduleNewCoaching = () => {
    router.push('/goal-selection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Coaching Sessions</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.coachSection}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionTopic}>Study Habits Improvement</Text>
              <Text style={styles.sessionTime}>Tomorrow, 2:00 PM</Text>
            </View>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionTopic}>Exercise Planning</Text>
              <Text style={styles.sessionTime}>Friday, 10:00 AM</Text>
            </View>
          </View>
          
          <View style={styles.coachSection}>
            <Text style={styles.sectionTitle}>Previous Sessions</Text>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionTopic}>Procrastination Solutions</Text>
              <Text style={styles.sessionTime}>Last Monday, 3:00 PM</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={handleScheduleNewCoaching}
          >
            <Text style={styles.btnPrimaryText}>Schedule New Wellness Coaching</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#E0C68B',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  coachSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#E0C68B',
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E0C68B',
  },
  sessionTopic: {
    fontWeight: 'bold',
    color: '#F9F8F4',
    marginBottom: 5,
    fontSize: 16,
  },
  sessionTime: {
    color: '#C4B8DD',
    fontSize: 14,
  },
  btnPrimary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
    marginBottom: 20,
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
    textAlign: 'center',
  },
}); 
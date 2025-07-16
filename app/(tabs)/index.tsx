import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi Sarah! 👋</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Goals Set</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
          
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTopic}>Your next session</Text>
            <Text style={styles.sessionTime}>Tomorrow at 2:00 PM - Study Habits</Text>
          </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 5,
  },
  statLabel: {
    color: '#C4B8DD',
    fontSize: 14,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 15,
    borderRadius: 12,
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
}); 
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

export default function ReviewScreen() {
  const handleApprove = () => {
    router.push('/confirmation');
  };

  const handleBack = () => {
    router.back();
  };

  // In a real app, these would come from app state/context
  const sessionDetails = {
    goal: 'Exercise',
    date: 'Wed 17',
    time: '2:00 PM',
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Review & Approve</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.confirmationDetails}>
          <Text style={styles.detailsTitle}>Session Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Goal:</Text>
            <Text style={styles.detailValue}>{sessionDetails.goal}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{sessionDetails.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{sessionDetails.time}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.btnPrimary} onPress={handleApprove}>
          <Text style={styles.btnPrimaryText}>Approve</Text>
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
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#F9F8F4',
    fontSize: 16,
  },
  detailValue: {
    color: '#C4B8DD',
    fontSize: 16,
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
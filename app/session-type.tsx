import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type SessionType = 'text' | 'voice' | '';

export default function SessionTypeScreen() {
  const [selectedType, setSelectedType] = useState<SessionType>('');

  const handleTypeSelect = (type: SessionType) => {
    setSelectedType(type);
  };

  const handleNext = () => {
    if (!selectedType) {
      Alert.alert('Please select a session type', 'You need to choose how you want to communicate with your coach.');
      return;
    }
    // In a real app, you would store this selection
    router.push('/calendar');
  };

  const handleBack = () => {
    router.back();
  };

  const sessionTypes = [
    { 
      id: 'text' as SessionType, 
      emoji: '💬', 
      title: 'Text Chat', 
      description: 'Type messages with your AI coach',
      features: ['Real-time messaging', 'Easy to review', 'No background noise']
    },
    { 
      id: 'voice' as SessionType, 
      emoji: '🎤', 
      title: 'Voice Chat', 
      description: 'Speak directly with your AI coach',
      features: ['Natural conversation', 'Faster communication', 'Voice recognition']
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>How would you like to chat?</Text>
        <Text style={styles.subtitle}>Choose your preferred communication method</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.typeOptions}>
          {sessionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeOption,
                selectedType === type.id && styles.typeOptionSelected,
              ]}
              onPress={() => handleTypeSelect(type.id)}
            >
              <View style={styles.typeHeader}>
                <Text style={styles.typeEmoji}>{type.emoji}</Text>
                <View style={styles.typeText}>
                  <Text style={styles.typeTitle}>{type.title}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
              </View>
              
              <View style={styles.featuresList}>
                {type.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.btnPrimary,
            !selectedType && styles.btnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedType}
        >
          <Text style={[
            styles.btnPrimaryText,
            !selectedType && styles.btnDisabledText,
          ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
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
  typeOptions: {
    marginBottom: 30,
  },
  typeOption: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  typeOptionSelected: {
    borderColor: '#E0C68B',
    backgroundColor: 'rgba(224, 198, 139, 0.1)',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  typeText: {
    flex: 1,
  },
  typeTitle: {
    color: '#F9F8F4',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeDescription: {
    color: '#C4B8DD',
    fontSize: 14,
  },
  featuresList: {
    marginLeft: 47, // Align with text content
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureBullet: {
    color: '#E0C68B',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#C4B8DD',
    fontSize: 14,
    flex: 1,
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
  btnDisabled: {
    backgroundColor: '#6B7280',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  btnDisabledText: {
    color: '#9CA3AF',
  },
}); 
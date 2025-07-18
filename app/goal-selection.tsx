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
import { useSession } from '../utils/sessionContext';

type Goal = 'exercise' | 'study' | 'eat' | 'hydrate' | '';

export default function GoalSelectionScreen() {
  const [selectedGoal, setSelectedGoal] = useState<Goal>('');
  const { setSessionData } = useSession();

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleNext = () => {
    if (!selectedGoal) {
      Alert.alert('Please select a goal', 'You need to choose a wellness goal to continue.');
      return;
    }
    
    // Store the goal in session context
    const goalLabel = goals.find(g => g.id === selectedGoal)?.title || selectedGoal;
    setSessionData({
      goal: goalLabel,
      date: '',
      time: '',
      recurring: 'none',
      sessionType: 'chat',
    });
    
    router.push('/calendar');
  };

  const handleBack = () => {
    router.back();
  };

  const goals = [
    { id: 'exercise' as Goal, emoji: '💪', title: 'Exercise' },
    { id: 'study' as Goal, emoji: '📚', title: 'Study Better' },
    { id: 'eat' as Goal, emoji: '🥗', title: 'Eat Healthy' },
    { id: 'hydrate' as Goal, emoji: '💧', title: 'Hydrate' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>What is your Goal?</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.goalOptions}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalOption,
                selectedGoal === goal.id && styles.goalOptionSelected,
              ]}
              onPress={() => handleGoalSelect(goal.id)}
            >
              <Text style={styles.goalEmoji}>{goal.emoji}</Text>
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.btnPrimary,
            !selectedGoal && styles.btnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedGoal}
        >
          <Text style={[
            styles.btnPrimaryText,
            !selectedGoal && styles.btnDisabledText,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  goalOption: {
    width: '48%',
    padding: 20,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  goalOptionSelected: {
    borderColor: '#E0C68B',
    backgroundColor: 'rgba(224, 198, 139, 0.1)',
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  goalTitle: {
    color: '#F9F8F4',
    fontSize: 16,
    textAlign: 'center',
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
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type DateOption = {
  id: string;
  day: string;
  date: string;
};

type TimeSlot = string;

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot>('');

  const handleDateSelect = (dateId: string) => {
    setSelectedDate(dateId);
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Please select date and time', 'You need to choose both a date and time slot to continue.');
      return;
    }
    // In a real app, you would store these selections
    router.push('/review');
  };

  const handleBack = () => {
    router.back();
  };

  const dateOptions: DateOption[] = [
    { id: 'mon15', day: 'Mon', date: '15' },
    { id: 'tue16', day: 'Tue', date: '16' },
    { id: 'wed17', day: 'Wed', date: '17' },
    { id: 'thu18', day: 'Thu', date: '18' },
    { id: 'fri19', day: 'Fri', date: '19' },
    { id: 'sat20', day: 'Sat', date: '20' },
    { id: 'sun21', day: 'Sun', date: '21' },
  ];

  const timeSlots: TimeSlot[] = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Schedule a Day/Time</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.calendarGrid}>
            {dateOptions.map((dateOption) => (
              <TouchableOpacity
                key={dateOption.id}
                style={[
                  styles.calendarDay,
                  selectedDate === dateOption.id && styles.calendarDaySelected,
                ]}
                onPress={() => handleDateSelect(dateOption.id)}
              >
                <Text style={[
                  styles.dateNumber,
                  selectedDate === dateOption.id && styles.dateNumberSelected,
                ]}>
                  {dateOption.date}
                </Text>
                <Text style={[
                  styles.dayName,
                  selectedDate === dateOption.id && styles.dayNameSelected,
                ]}>
                  {dateOption.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.timeSlotTextSelected,
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.btnPrimary,
            (!selectedDate || !selectedTime) && styles.btnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={[
            styles.btnPrimaryText,
            (!selectedDate || !selectedTime) && styles.btnDisabledText,
          ]}>
            Next
          </Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#E0C68B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
  },
  calendarDaySelected: {
    backgroundColor: '#E0C68B',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9F8F4',
  },
  dateNumberSelected: {
    color: '#2E2C58',
  },
  dayName: {
    fontSize: 10,
    color: '#C4B8DD',
  },
  dayNameSelected: {
    color: '#2E2C58',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeSlot: {
    width: '30%',
    padding: 10,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  timeSlotText: {
    color: '#F9F8F4',
    fontSize: 14,
  },
  timeSlotTextSelected: {
    color: '#2E2C58',
    fontWeight: 'bold',
  },
  btnPrimary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
    marginVertical: 20,
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
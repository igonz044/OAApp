import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { formatTimeInTimezone } from '../utils/timezone';

type DateOption = {
  id: string;
  day: string;
  date: string;
  fullDate: Date;
};

type TimeSlot = {
  time: string;
  displayTime: string;
  fullDate: Date;
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate dates for the current week
  useEffect(() => {
    generateDateOptions();
  }, [currentWeek]);

  const generateDateOptions = () => {
    const today = new Date();
    const options: DateOption[] = [];
    
    // Calculate the start of the selected week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (currentWeek * 7));
    
    // Generate 7 days for the selected week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate().toString();
      const id = `${dayName.toLowerCase()}${dayNumber}`;
      
      options.push({
        id,
        day: dayName,
        date: dayNumber,
        fullDate: date,
      });
    }
    
    setDateOptions(options);
  };

  const generateTimeSlots = (selectedDateObj: Date) => {
    const slots: TimeSlot[] = [];
    const baseHours = [9, 10, 11, 14, 15, 16]; // 9 AM, 10 AM, 11 AM, 2 PM, 3 PM, 4 PM
    
    baseHours.forEach(hour => {
      const timeDate = new Date(selectedDateObj);
      timeDate.setHours(hour, 0, 0, 0);
      
      const displayTime = formatTimeInTimezone(timeDate);
      const timeId = `${hour}:00`;
      
      slots.push({
        time: timeId,
        displayTime,
        fullDate: timeDate,
      });
    });
    
    setTimeSlots(slots);
  };

  const handleDateSelect = (dateId: string) => {
    setSelectedDate(dateId);
    setSelectedTime(''); // Reset time when date changes
    
    const selectedDateObj = dateOptions.find(option => option.id === dateId)?.fullDate;
    if (selectedDateObj) {
      generateTimeSlots(selectedDateObj);
    }
  };

  const handleTimeSelect = (timeId: string) => {
    setSelectedTime(timeId);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Please select date and time', 'You need to choose both a date and time slot to continue.');
      return;
    }
    
    const selectedDateObj = dateOptions.find(option => option.id === selectedDate)?.fullDate;
    const selectedTimeObj = timeSlots.find(slot => slot.time === selectedTime)?.fullDate;
    
    if (selectedDateObj && selectedTimeObj) {
      console.log('Selected date/time:', {
        date: selectedDateObj.toISOString(),
        time: selectedTimeObj.toISOString(),
        displayTime: formatTimeInTimezone(selectedTimeObj)
      });
    }
    
    // In a real app, you would store these selections
    router.push('/review');
  };

  const handleBack = () => {
    router.back();
  };

  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
      setSelectedDate(''); // Reset selection when changing weeks
      setSelectedTime('');
    }
  };

  const handleNextWeek = () => {
    // Allow navigation to future weeks (no limit)
    setCurrentWeek(currentWeek + 1);
    setSelectedDate(''); // Reset selection when changing weeks
    setSelectedTime('');
  };

  const formatWeekRange = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (currentWeek * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  const getWeekLabel = () => {
    if (currentWeek === 0) return 'This Week';
    if (currentWeek === 1) return 'Next Week';
    return `Week ${currentWeek + 1}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Schedule Your Session</Text>
        
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity 
            style={[styles.weekNavBtn, currentWeek === 0 && styles.weekNavBtnDisabled]}
            onPress={handlePreviousWeek}
            disabled={currentWeek === 0}
          >
            <Text style={[styles.weekNavBtnText, currentWeek === 0 && styles.weekNavBtnTextDisabled]}>
              ← Previous
            </Text>
          </TouchableOpacity>
          
          <View style={styles.weekInfo}>
            <Text style={styles.weekLabel}>{getWeekLabel()}</Text>
            <Text style={styles.weekRange}>{formatWeekRange()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.weekNavBtn}
            onPress={handleNextWeek}
          >
            <Text style={styles.weekNavBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeSlots}>
              {timeSlots.map((timeSlot) => (
                <TouchableOpacity
                  key={timeSlot.time}
                  style={[
                    styles.timeSlot,
                    selectedTime === timeSlot.time && styles.timeSlotSelected,
                  ]}
                  onPress={() => handleTimeSelect(timeSlot.time)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === timeSlot.time && styles.timeSlotTextSelected,
                  ]}>
                    {timeSlot.displayTime}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
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
    marginBottom: 20,
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  weekNavBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(224, 198, 139, 0.3)',
    borderWidth: 2,
    borderColor: '#E0C68B',
    minWidth: 100,
    alignItems: 'center',
  },
  weekNavBtnDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6B7280',
  },
  weekNavBtnText: {
    color: '#E0C68B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekNavBtnTextDisabled: {
    color: '#6B7280',
  },
  weekInfo: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
    paddingVertical: 10,
  },
  weekLabel: {
    color: '#E0C68B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  weekRange: {
    color: '#C4B8DD',
    fontSize: 16,
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
    gap: 8,
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
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
    marginTop: 2,
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
    padding: 12,
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
    fontWeight: '500',
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
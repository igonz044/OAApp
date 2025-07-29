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
    Modal,
    Platform,
    Dimensions,
} from 'react-native';
import { formatTimeInTimezone } from '../utils/timezone';
import { useSession } from '../utils/sessionContext';

type DateOption = {
  id: string;
  day: string;
  date: string;
  fullDate: Date;
};

// Removed TimeSlot type - no longer using predefined time slots

type RecurringOption = 'none' | 'daily' | 'weekly' | 'monthly';

export default function CalendarScreen() {
  const { width: screenWidth } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 400;
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  // const [selectedRecurring, setSelectedRecurring] = useState<RecurringOption>('none'); // Commented out - all sessions are one-time only
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  // Removed showTimePicker state - no longer using modal
  const [customHour, setCustomHour] = useState(9);
  const [customMinute, setCustomMinute] = useState(0);
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('AM');
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const { sessionData, setSessionData } = useSession();

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

  // Removed generateTimeSlots - users will use dropdown menus instead

  const handleDateSelect = (dateId: string) => {
    setSelectedDate(dateId);
    setSelectedTime(''); // Reset time when date changes
    // setSelectedRecurring('none'); // Reset recurring when date changes - commented out
    
    // Auto-set to next available time slot
    const selectedDateObj = dateOptions.find(option => option.id === dateId)?.fullDate;
    if (selectedDateObj) {
      const now = new Date();
      const isToday = selectedDateObj.toDateString() === now.toDateString();
      
      if (isToday) {
        // For today, set to next available time slot
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Find next available time slot (round up to next 15-minute interval)
        let nextMinute = Math.ceil(currentMinute / 15) * 15;
        let nextHour = currentHour;
        
        if (nextMinute >= 60) {
          nextMinute = 0;
          nextHour += 1;
        }
        
        // Convert to 12-hour format for display
        let displayHour = nextHour;
        let period: 'AM' | 'PM' = 'AM';
        
        if (nextHour === 0) {
          displayHour = 12;
          period = 'AM';
        } else if (nextHour > 12) {
          displayHour = nextHour - 12;
          period = 'PM';
        } else if (nextHour === 12) {
          period = 'PM';
        }
        
        setCustomHour(displayHour);
        setCustomMinute(nextMinute);
        setCustomPeriod(period);
        
        // Set the selected time
        const timeId = `custom_${nextHour}_${nextMinute}`;
        setSelectedTime(timeId);
      } else {
        // For future dates, set to a reasonable default (9:00 AM)
        setCustomHour(9);
        setCustomMinute(0);
        setCustomPeriod('AM');
        
        const timeId = 'custom_9_0';
        setSelectedTime(timeId);
      }
    }
  };

  // Removed handleTimeSelect - users will use dropdown menus instead

  // Removed handleCustomTimeSelect - no longer using modal

  // Removed handleCustomTimeConfirm - no longer using modal confirmation

  // Recurring selection handler - commented out for future implementation
  /*
  const handleRecurringSelect = (option: RecurringOption) => {
    setSelectedRecurring(option);
  };
  */

  // Check if a time is in the past
  const isTimeInPast = (date: Date, hour: number, minute: number): boolean => {
    const now = new Date();
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, minute, 0, 0);
    
    return selectedDateTime <= now;
  };

  // Check if a specific time option should be disabled
  const isTimeOptionDisabled = (hour: number, minute: number): boolean => {
    if (!selectedDate) return false;
    
    const selectedDateObj = dateOptions.find(option => option.id === selectedDate)?.fullDate;
    if (!selectedDateObj) return false;
    
    // Convert 12-hour to 24-hour for comparison
    let hour24 = hour;
    if (customPeriod === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    } else if (customPeriod === 'AM' && hour === 12) {
      hour24 = 0;
    }
    
    return isTimeInPast(selectedDateObj, hour24, minute);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Please select date and time', 'You need to choose both a date and time to continue.');
      return;
    }
    
    const selectedDateObj = dateOptions.find(option => option.id === selectedDate)?.fullDate;
    let selectedTimeObj: Date | undefined;
    
    if (selectedTime.startsWith('custom_')) {
      // Handle custom time
      const [_, hour24, minute] = selectedTime.split('_');
      selectedTimeObj = new Date(selectedDateObj!);
      selectedTimeObj.setHours(parseInt(hour24), parseInt(minute), 0, 0);
      
      // Check if selected time is in the past
      if (isTimeInPast(selectedDateObj!, parseInt(hour24), parseInt(minute))) {
        Alert.alert(
          'Cannot Book in the Past',
          'Please select a time that is in the future. You cannot book sessions in the past.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    }
    
    if (selectedDateObj && selectedTimeObj) {
      const displayTime = formatTimeInTimezone(selectedTimeObj);
      const dateLabel = selectedDateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Update session data with calendar selections
      // All sessions are one-time only for now (recurring: 'none')
      setSessionData({
        ...sessionData!,
        date: dateLabel,
        time: displayTime,
        recurring: 'none', // Always set to 'none' since recurring options are disabled
        fullDate: selectedTimeObj, // Use the time-specific date
        displayTime: displayTime,
      });
      
      console.log('Updated session data:', {
        date: dateLabel,
        time: displayTime,
        recurring: 'none' // All sessions are one-time only
      });
    }
    
    router.push('/session-type');
  };

  const handleBack = () => {
    router.back();
  };

  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
      setSelectedDate(''); // Reset selection when changing weeks
      setSelectedTime('');
      // setSelectedRecurring('none'); // Commented out
    }
  };

  const handleNextWeek = () => {
    // Allow navigation to future weeks (no limit)
    setCurrentWeek(currentWeek + 1);
          setSelectedDate(''); // Reset selection when changing weeks
      setSelectedTime('');
      // setSelectedRecurring('none'); // Commented out
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

  // Removed getWeekLabel function - no longer needed

  const getSelectedTimeDisplay = () => {
    if (!selectedTime) return 'Select a time';
    
    if (selectedTime.startsWith('custom_')) {
      const [_, hour, minute] = selectedTime.split('_');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      return formatTimeInTimezone(timeDate);
    }
    
    return 'Select a time';
  };

  const getCurrentTimeDisplay = () => {
    // Convert 24-hour to 12-hour for display
    let displayHour = customHour;
    let displayPeriod = customPeriod;
    
    if (customHour === 0) {
      displayHour = 12;
      displayPeriod = 'AM';
    } else if (customHour > 12) {
      displayHour = customHour - 12;
      displayPeriod = 'PM';
    }
    
    return `${displayHour}:${customMinute.toString().padStart(2, '0')} ${displayPeriod}`;
  };

  // Recurring options - commented out for future implementation
  /*
  const recurringOptions = [
    { id: 'none' as RecurringOption, label: 'One-time session', emoji: '📅' },
    { id: 'daily' as RecurringOption, label: 'Daily', emoji: '🌅' },
    { id: 'weekly' as RecurringOption, label: 'Weekly', emoji: '📆' },
    { id: 'monthly' as RecurringOption, label: 'Monthly', emoji: '🗓️' },
  ];
  */

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
            style={[
              styles.weekNavBtn, 
              currentWeek === 0 && styles.weekNavBtnDisabled,
              isSmallScreen && { minWidth: 35, paddingHorizontal: 8 }
            ]}
            onPress={handlePreviousWeek}
            disabled={currentWeek === 0}
          >
            <Text style={[
              styles.weekNavBtnText, 
              currentWeek === 0 && styles.weekNavBtnTextDisabled,
              isSmallScreen && { fontSize: 16 }
            ]}>
              ←
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.weekInfo, isSmallScreen && { marginHorizontal: 5 }]}>
            <Text style={[styles.weekRange, isSmallScreen && { fontSize: 14 }]}>{formatWeekRange()}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.weekNavBtn, isSmallScreen && { minWidth: 35, paddingHorizontal: 8 }]}
            onPress={handleNextWeek}
          >
            <Text style={[styles.weekNavBtnText, isSmallScreen && { fontSize: 16 }]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {/*<Text style={styles.sectionTitle}>Select Date</Text>*/}
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
                  styles.dayName,
                  selectedDate === dateOption.id && styles.dayNameSelected,
                ]}>
                  {dateOption.day}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate === dateOption.id && styles.dateNumberSelected,
                ]}>
                  {dateOption.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedDate && (
          <View style={styles.section}>
            {/*<Text style={styles.sectionTitle}>Select Time</Text>*/}
            
            {/* Direct Time Picker */}
            <View style={styles.directTimePicker}>
              <Text style={styles.currentTimeDisplay}>{getCurrentTimeDisplay()}</Text>
              
              {/*Helpful message about past time prevention
              <Text style={styles.timeHelpText}>
                ⏰ Times in the past are automatically disabled to prevent booking sessions in the past.
              </Text>*/}
              
              <View style={styles.dropdownRow}>
                {/* Hour Dropdown */}
                <View style={styles.dropdownColumn}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => {
                      setShowHourDropdown(!showHourDropdown);
                      setShowMinuteDropdown(false);
                      setShowPeriodDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {customHour === 0 ? '12' : customHour > 12 ? (customHour - 12).toString() : customHour.toString()}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  
                  {showHourDropdown && (
                    <View style={styles.dropdownMenu}>
                      <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
                          const isDisabled = isTimeOptionDisabled(hour, customMinute);
                          return (
                            <TouchableOpacity
                              key={hour}
                              style={[
                                styles.dropdownOption,
                                customHour === hour && styles.dropdownOptionSelected,
                                isDisabled && styles.dropdownOptionDisabled,
                              ]}
                              onPress={() => {
                                if (isDisabled) return; // Prevent selection of disabled times
                                setCustomHour(hour);
                                setShowHourDropdown(false);
                                // Auto-set selected time when hour is chosen
                                // Convert 12-hour to 24-hour for the time ID
                                let hour24 = hour;
                                if (customPeriod === 'PM' && hour !== 12) {
                                  hour24 = hour + 12;
                                } else if (customPeriod === 'AM' && hour === 12) {
                                  hour24 = 0;
                                }
                                const timeId = `custom_${hour24}_${customMinute}`;
                                setSelectedTime(timeId);
                              }}
                              disabled={isDisabled}
                            >
                              <Text style={[
                                styles.dropdownOptionText,
                                customHour === hour && styles.dropdownOptionTextSelected,
                                isDisabled && styles.dropdownOptionTextDisabled,
                              ]}>
                                {hour}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minute Dropdown */}
                <View style={styles.dropdownColumn}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => {
                      setShowMinuteDropdown(!showMinuteDropdown);
                      setShowHourDropdown(false);
                      setShowPeriodDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {customMinute.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  
                  {showMinuteDropdown && (
                    <View style={styles.dropdownMenu}>
                      <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                        {[0, 15, 30, 45].map((minute) => {
                          const isDisabled = isTimeOptionDisabled(customHour, minute);
                          return (
                            <TouchableOpacity
                              key={minute}
                              style={[
                                styles.dropdownOption,
                                customMinute === minute && styles.dropdownOptionSelected,
                                isDisabled && styles.dropdownOptionDisabled,
                              ]}
                              onPress={() => {
                                if (isDisabled) return; // Prevent selection of disabled times
                                setCustomMinute(minute);
                                setShowMinuteDropdown(false);
                                // Auto-set selected time when minute is chosen
                                // Convert 12-hour to 24-hour for the time ID
                                let hour24 = customHour;
                                if (customPeriod === 'PM' && customHour !== 12) {
                                  hour24 = customHour + 12;
                                } else if (customPeriod === 'AM' && customHour === 12) {
                                  hour24 = 0;
                                }
                                const timeId = `custom_${hour24}_${minute}`;
                                setSelectedTime(timeId);
                              }}
                              disabled={isDisabled}
                            >
                              <Text style={[
                                styles.dropdownOptionText,
                                customMinute === minute && styles.dropdownOptionTextSelected,
                                isDisabled && styles.dropdownOptionTextDisabled,
                              ]}>
                                {minute.toString().padStart(2, '0')}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Period Dropdown */}
                <View style={styles.dropdownColumn}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => {
                      setShowPeriodDropdown(!showPeriodDropdown);
                      setShowHourDropdown(false);
                      setShowMinuteDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownTriggerText}>
                      {customPeriod}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  
                                    {showPeriodDropdown && (
                    <View style={styles.dropdownMenu}>
                      {['AM', 'PM'].map((period) => {
                        // Check if this period would make the time in the past
                        const isDisabled = (() => {
                          if (!selectedDate) return false;
                          const selectedDateObj = dateOptions.find(option => option.id === selectedDate)?.fullDate;
                          if (!selectedDateObj) return false;
                          
                          let hour24 = customHour;
                          if (period === 'PM' && customHour !== 12) {
                            hour24 = customHour + 12;
                          } else if (period === 'AM' && customHour === 12) {
                            hour24 = 0;
                          }
                          
                          return isTimeInPast(selectedDateObj, hour24, customMinute);
                        })();
                        
                        return (
                          <TouchableOpacity
                            key={period}
                            style={[
                              styles.dropdownOption,
                              customPeriod === period && styles.dropdownOptionSelected,
                              isDisabled && styles.dropdownOptionDisabled,
                            ]}
                            onPress={() => {
                              if (isDisabled) return; // Prevent selection of disabled times
                              setCustomPeriod(period as 'AM' | 'PM');
                              setShowPeriodDropdown(false);
                              // Auto-set selected time when period is chosen
                              // Convert 12-hour to 24-hour for the time ID
                              let hour24 = customHour;
                              if (period === 'PM' && customHour !== 12) {
                                hour24 = customHour + 12;
                              } else if (period === 'AM' && customHour === 12) {
                                hour24 = 0;
                              }
                              const timeId = `custom_${hour24}_${customMinute}`;
                              setSelectedTime(timeId);
                            }}
                            disabled={isDisabled}
                          >
                            <Text style={[
                              styles.dropdownOptionText,
                              customPeriod === period && styles.dropdownOptionTextSelected,
                              isDisabled && styles.dropdownOptionTextDisabled,
                            ]}>
                              {period}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recurring Options - Commented out for future implementation
        {selectedDate && selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recurring Options</Text>
            <View style={styles.recurringOptions}>
              {recurringOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.recurringOption,
                    selectedRecurring === option.id && styles.recurringOptionSelected,
                  ]}
                  onPress={() => handleRecurringSelect(option.id)}
                >
                  <Text style={styles.recurringEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.recurringText,
                    selectedRecurring === option.id && styles.recurringTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        */}
        
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

      {/* Removed modal dropdown - now using direct time picker */}
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
    paddingHorizontal: 5,
  },
  weekNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(224, 198, 139, 0.3)',
    borderWidth: 1,
    borderColor: '#E0C68B',
    minWidth: 40,
    alignItems: 'center',
  },
  weekNavBtnDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6B7280',
  },
  weekNavBtnText: {
    color: '#E0C68B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekNavBtnTextDisabled: {
    color: '#6B7280',
  },
  weekInfo: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 5,
  },
  // Removed weekLabel styles - no longer needed
  weekRange: {
    color: '#E0C68B',
    fontSize: 16,
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
  // Removed timeSlots styles - no longer needed
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
  recurringOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  recurringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    minWidth: '45%', // Adjust as needed for spacing
  },
  recurringOptionSelected: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  recurringEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  recurringText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9F8F4',
  },
  recurringTextSelected: {
    color: '#2E2C58',
    fontWeight: 'bold',
  },
  // Removed customTimeButton styles - replaced with timeSelectionButton
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2E2C58',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: '#E0C68B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    color: '#C4B8DD',
    fontSize: 14,
    marginBottom: 10,
  },
  pickerScroll: {
    width: '100%',
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    marginVertical: 5,
  },
  pickerOptionSelected: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  pickerOptionText: {
    color: '#F9F8F4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerOptionTextSelected: {
    color: '#2E2C58',
  },
  pickerSeparator: {
    color: '#C4B8DD',
    fontSize: 24,
    marginHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: '#E0C68B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonConfirm: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  modalButtonTextConfirm: {
    color: '#2E2C58',
  },
  // Dropdown styles
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: '#2E2C58',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '80%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.2)',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0C68B',
  },
  dropdownCloseButton: {
    padding: 5,
  },
  dropdownCloseText: {
    fontSize: 18,
    color: '#C4B8DD',
    fontWeight: 'bold',
  },
  timeGrid: {
    flex: 1,
  },
  quickTimesSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C4B8DD',
    marginBottom: 10,
  },
  quickTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickTimeOption: {
    width: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 221, 0.3)',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickTimeOptionSelected: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  quickTimeText: {
    fontSize: 14,
    color: '#F9F8F4',
    fontWeight: '500',
  },
  quickTimeTextSelected: {
    color: '#2E2C58',
    fontWeight: 'bold',
  },
  customTimeSection: {
    marginBottom: 20,
  },
  customTimePicker: {
    backgroundColor: 'rgba(196, 184, 221, 0.05)',
    borderRadius: 8,
    padding: 15,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dropdownFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 184, 221, 0.2)',
  },
  dropdownButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dropdownButtonConfirm: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B8DD',
  },
  dropdownButtonTextConfirm: {
    color: '#2E2C58',
  },
  // New dropdown styles
  currentTimeDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0C68B',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownColumn: {
    flex: 1,
    marginHorizontal: 5,
    position: 'relative',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    borderRadius: 8,
  },
  dropdownTriggerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F9F8F4',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#C4B8DD',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2E2C58',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    borderRadius: 8,
    marginTop: 2,
    zIndex: 1001,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.1)',
  },
  dropdownOptionSelected: {
    backgroundColor: '#E0C68B',
  },
  dropdownOptionDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    opacity: 0.5,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#F9F8F4',
    textAlign: 'center',
  },
  dropdownOptionTextSelected: {
    color: '#2E2C58',
    fontWeight: 'bold',
  },
  dropdownOptionTextDisabled: {
    color: '#6B7280',
    opacity: 0.6,
  },
  timeSeparator: {
    fontSize: 20,
    color: '#C4B8DD',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  // New time selection button styles
  timeSelectionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderWidth: 2,
    borderColor: '#C4B8DD',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  timeSelectionButtonSelected: {
    backgroundColor: '#E0C68B',
    borderColor: '#E0C68B',
  },
  timeSelectionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C4B8DD',
  },
  timeSelectionButtonTextSelected: {
    color: '#2E2C58',
  },
  // Direct time picker styles
  directTimePicker: {
    backgroundColor: 'rgba(196, 184, 221, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 221, 0.2)',
  },
  timeHelpText: {
    color: '#C4B8DD',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    opacity: 0.8,
  },
}); 
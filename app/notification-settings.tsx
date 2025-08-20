import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { notificationService } from '../utils/notificationService';

export default function NotificationSettingsScreen() {
  const [notificationPreferences, setNotificationPreferences] = useState({
    enabled: true,
    reminderTimes: [30],
    sound: true,
    vibration: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);

  // Load notification preferences on mount
  useEffect(() => {
    loadNotificationPreferences();
    loadScheduledNotifications();
  }, []);

  const loadNotificationPreferences = () => {
    const preferences = notificationService.getPreferences();
    setNotificationPreferences(preferences);
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await notificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const updateNotificationPreferences = async (updates: Partial<typeof notificationPreferences>) => {
    const newPreferences = { ...notificationPreferences, ...updates };
    setNotificationPreferences(newPreferences);
    await notificationService.updatePreferences(newPreferences);
  };

  const handleTestNotification = async () => {
    try {
      setIsLoading(true);
      await notificationService.sendTestNotification();
      Alert.alert('Test Notification', 'A test notification has been sent! Check your device for the notification.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification. Please check your notification permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugNotifications = async () => {
    try {
      setIsLoading(true);
      await notificationService.debugScheduledNotifications();
      await loadScheduledNotifications(); // Refresh the list
      Alert.alert('Debug Complete', 'Check the console for detailed notification information.');
    } catch (error) {
      Alert.alert('Error', 'Failed to debug notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await notificationService.cancelAllNotifications();
              await loadScheduledNotifications(); // Refresh the list
              Alert.alert('Success', 'All scheduled notifications have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getReminderTimeText = (minutes: number) => {
    if (minutes === 60) return '1 hour';
    if (minutes === 1440) return '1 day';
    return `${minutes} minutes`;
  };

  const formatNotificationTime = (trigger: any) => {
    if (trigger.date) {
      return new Date(trigger.date).toLocaleString();
    }
    if (trigger.seconds) {
      const date = new Date(Date.now() + trigger.seconds * 1000);
      return date.toLocaleString();
    }
    return 'Unknown time';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Master Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Turn on or off all notifications for coaching sessions
                </Text>
              </View>
              <Switch
                value={notificationPreferences.enabled}
                onValueChange={(value) => updateNotificationPreferences({ enabled: value })}
                trackColor={{ false: '#767577', true: '#A9C3B1' }}
                thumbColor={notificationPreferences.enabled ? '#E0C68B' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Notification Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound</Text>
                <Text style={styles.settingDescription}>
                  Play sound when notifications arrive
                </Text>
              </View>
              <Switch
                value={notificationPreferences.sound}
                onValueChange={(value) => updateNotificationPreferences({ sound: value })}
                trackColor={{ false: '#767577', true: '#A9C3B1' }}
                thumbColor={notificationPreferences.sound ? '#E0C68B' : '#f4f3f4'}
                disabled={!notificationPreferences.enabled}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Text style={styles.settingDescription}>
                  Vibrate device when notifications arrive
                </Text>
              </View>
              <Switch
                value={notificationPreferences.vibration}
                onValueChange={(value) => updateNotificationPreferences({ vibration: value })}
                trackColor={{ false: '#767577', true: '#A9C3B1' }}
                thumbColor={notificationPreferences.vibration ? '#E0C68B' : '#f4f3f4'}
                disabled={!notificationPreferences.enabled}
              />
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Reminder Time',
                  'Choose when to be reminded before your coaching sessions:',
                  [
                    { text: '15 minutes', onPress: () => updateNotificationPreferences({ reminderTimes: [15] }) },
                    { text: '30 minutes', onPress: () => updateNotificationPreferences({ reminderTimes: [30] }) },
                    { text: '1 hour', onPress: () => updateNotificationPreferences({ reminderTimes: [60] }) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reminder Time</Text>
                <Text style={styles.settingDescription}>
                  Currently set to {getReminderTimeText(notificationPreferences.reminderTimes[0])} before sessions
                </Text>
              </View>
              <View style={styles.reminderTimeDisplay}>
                <Text style={styles.reminderTimeText}>
                  {getReminderTimeText(notificationPreferences.reminderTimes[0])}
                </Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Testing & Debug */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Testing & Debug</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.testButton]}
              onPress={handleTestNotification}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Send Test Notification</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.debugButton]}
              onPress={handleDebugNotifications}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Debug Notifications</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClearAllNotifications}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Clear All Notifications</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Scheduled Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Scheduled Notifications ({scheduledNotifications.length})
            </Text>
            
            {scheduledNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No scheduled notifications</Text>
                <Text style={styles.emptyStateDescription}>
                  Notifications will appear here when you have upcoming coaching sessions
                </Text>
              </View>
            ) : (
              scheduledNotifications.map((notification, index) => (
                <View key={notification.identifier} style={styles.notificationItem}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>
                      {notification.content.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {notification.content.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      Scheduled for: {formatNotificationTime(notification.trigger)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>Session Reminders</Text>
              <Text style={styles.infoDescription}>
                You'll receive notifications before your scheduled coaching sessions to help you prepare and join on time.
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>Notification Timing</Text>
              <Text style={styles.infoDescription}>
                Notifications are only scheduled for future sessions. Past sessions won't trigger notifications.
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>Permissions</Text>
              <Text style={styles.infoDescription}>
                Make sure to allow notifications in your device settings to receive session reminders.
              </Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#E0C68B',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    color: '#E0C68B',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#F9F8F4',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.2)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#F9F8F4',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#C4B8DD',
    lineHeight: 18,
  },
  reminderTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reminderTimeText: {
    fontSize: 14,
    color: '#C4B8DD',
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
    color: '#C4B8DD',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#A9C3B1',
  },
  debugButton: {
    backgroundColor: '#4A90E2',
  },
  clearButton: {
    backgroundColor: '#E8B4B8',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#C4B8DD',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    backgroundColor: 'rgba(169, 195, 177, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#F9F8F4',
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#C4B8DD',
    marginBottom: 8,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoItem: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: '#E0C68B',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#C4B8DD',
    lineHeight: 20,
  },
});

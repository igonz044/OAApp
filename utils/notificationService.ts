import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { CoachingSession } from './sessionsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  enabled: boolean;
  reminderTimes: number[]; // minutes before session
  sound: boolean;
  vibration: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences = {
    enabled: true,
    reminderTimes: [30], // 30 minutes before
    sound: true,
    vibration: true,
  };
  private readonly PREFERENCES_KEY = 'notification_preferences';

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification permissions and settings
  async initialize(): Promise<boolean> {
    try {
      // Load saved preferences
      await this.loadPreferences();

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('coaching-sessions', {
          name: 'Coaching Sessions',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  // Load preferences from AsyncStorage
  private async loadPreferences(): Promise<void> {
    try {
      const savedPreferences = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      if (savedPreferences) {
        this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
        console.log('Loaded notification preferences:', this.preferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  // Save preferences to AsyncStorage
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(this.preferences));
      console.log('Saved notification preferences:', this.preferences);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  // Schedule notifications for a coaching session
  async scheduleSessionNotifications(session: CoachingSession): Promise<void> {
    const now = new Date();
    const sessionTime = session.fullDate;
    
    console.log('🔔 Scheduling notifications for session:', {
      id: session.id,
      goal: session.goal,
      sessionTime: sessionTime.toISOString(),
      sessionTimeReadable: sessionTime.toLocaleString(),
      sessionTimeHours: sessionTime.getHours(),
      sessionTimeMinutes: sessionTime.getMinutes(),
      sessionTimeDate: sessionTime.toDateString(),
      currentTime: now.toISOString(),
      currentTimeReadable: now.toLocaleString(),
      currentTimeHours: now.getHours(),
      currentTimeMinutes: now.getMinutes(),
      currentTimeDate: now.toDateString(),
      reminderTimes: this.preferences.reminderTimes,
      timeDifference: sessionTime.getTime() - now.getTime(),
      timeDifferenceMinutes: Math.round((sessionTime.getTime() - now.getTime()) / (1000 * 60))
    });

    if (!this.preferences.enabled) {
      console.log('❌ Notifications disabled, skipping scheduling');
      return;
    }

    // Check if session is in the future
    if (sessionTime <= now) {
      console.log('❌ Session is in the past or happening now - no notifications scheduled');
      console.log('❌ Session time:', sessionTime.toLocaleString());
      console.log('❌ Current time:', now.toLocaleString());
      console.log('❌ Time difference (ms):', sessionTime.getTime() - now.getTime());
      return;
    }

    // Add a minimum buffer to prevent immediate notifications
    const minimumBufferMinutes = 5; // Don't schedule notifications if session is less than 5 minutes away
    const timeUntilSession = (sessionTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (timeUntilSession < minimumBufferMinutes) {
      console.log(`❌ Session is too soon (${Math.round(timeUntilSession)} minutes away) - no notifications scheduled`);
      console.log(`❌ Minimum buffer required: ${minimumBufferMinutes} minutes`);
      return;
    }

    try {
      // Cancel any existing notifications for this session
      await this.cancelSessionNotifications(session.id);
      
      // Debug: Check all scheduled notifications before scheduling new ones
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`🔍 Found ${existingNotifications.length} existing scheduled notifications before scheduling new ones`);
      existingNotifications.forEach((notification, index) => {
        console.log(`🔍 Existing notification ${index + 1}:`, {
          identifier: notification.identifier,
          title: notification.content.title,
          trigger: notification.trigger
        });
      });

      // Schedule notifications for each reminder time
      for (const minutesBefore of this.preferences.reminderTimes) {
        const notificationTime = new Date(sessionTime.getTime() - (minutesBefore * 60 * 1000));
        
        console.log(`⏰ Calculating ${minutesBefore}min reminder:`, {
          sessionTime: sessionTime.toISOString(),
          notificationTime: notificationTime.toISOString(),
          notificationTimeReadable: notificationTime.toLocaleString(),
          currentTime: now.toISOString(),
          isInFuture: notificationTime > now
        });
        
        // Only schedule if the notification time is in the future
        if (notificationTime > now) {
          await this.scheduleNotification(session, notificationTime, minutesBefore);
          console.log(`✅ Scheduled ${minutesBefore}min reminder successfully for ${notificationTime.toLocaleString()}`);
        } else {
          console.log(`⏭️ Skipping ${minutesBefore}min reminder - notification time (${notificationTime.toLocaleString()}) is in the past`);
          console.log(`⏭️ Notification time: ${notificationTime.toLocaleString()}`);
          console.log(`⏭️ Current time: ${now.toLocaleString()}`);
          console.log(`⏭️ Time difference: ${(notificationTime.getTime() - now.getTime()) / (1000 * 60)} minutes`);
        }
      }

      console.log(`🎉 All notifications scheduled for session: ${session.goal}`);
    } catch (error) {
      console.error('❌ Error scheduling session notifications:', error);
    }
  }

  // Schedule a single notification
  private async scheduleNotification(
    session: CoachingSession, 
    notificationTime: Date, 
    minutesBefore: number
  ): Promise<void> {
    const now = new Date();
    const timeUntilNotification = (notificationTime.getTime() - now.getTime()) / (1000 * 60);
    
    console.log(`🔔 Scheduling notification details:`, {
      sessionId: session.id,
      sessionGoal: session.goal,
      sessionTime: session.fullDate.toLocaleString(),
      notificationTime: notificationTime.toLocaleString(),
      notificationTimeISO: notificationTime.toISOString(),
      currentTime: now.toLocaleString(),
      currentTimeISO: now.toISOString(),
      minutesBefore,
      timeUntilNotification: Math.round(timeUntilNotification),
      notificationBody: this.getNotificationBody(session, minutesBefore)
    });

    // Double-check that notification time is in the future
    if (notificationTime <= now) {
      console.log(`❌ ERROR: Attempting to schedule notification for past time!`);
      console.log(`❌ Notification time: ${notificationTime.toLocaleString()}`);
      console.log(`❌ Current time: ${now.toLocaleString()}`);
      console.log(`❌ Time difference: ${timeUntilNotification} minutes`);
      return;
    }

    try {
      // Try scheduling with a simpler trigger first
      const notificationRequest = {
        content: {
          title: `Coaching Session Reminder`,
          body: this.getNotificationBody(session, minutesBefore),
          data: {
            sessionId: session.id,
            sessionType: session.sessionType,
            goal: session.goal,
            minutesBefore,
          },
          sound: this.preferences.sound ? 'default' : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: 'date' as const,
          date: notificationTime,
        },
      };

      console.log(`🔔 Attempting to schedule notification with request:`, {
        trigger: notificationRequest.trigger,
        content: {
          title: notificationRequest.content.title,
          body: notificationRequest.content.body,
          data: notificationRequest.content.data
        }
      });

      const identifier = await Notifications.scheduleNotificationAsync(notificationRequest as any);

      console.log(`✅ Successfully scheduled notification ${identifier} for ${minutesBefore} minutes before session`);
      console.log(`✅ Notification will fire at: ${notificationTime.toLocaleString()}`);
      console.log(`✅ Time until notification: ${Math.round(timeUntilNotification)} minutes`);
      
      // Verify the scheduled notification immediately
      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log(`🔍 Found ${scheduledNotifications.length} total scheduled notifications`);
        
        const thisNotification = scheduledNotifications.find(n => n.identifier === identifier);
        if (thisNotification) {
          console.log(`🔍 Verification - Scheduled notification found:`, {
            identifier: thisNotification.identifier,
            trigger: thisNotification.trigger,
            content: thisNotification.content.title,
            scheduledFor: thisNotification.trigger && 'date' in thisNotification.trigger ? new Date(thisNotification.trigger.date).toLocaleString() : 'Unknown'
          });
        } else {
          console.log(`❌ Verification - Scheduled notification not found!`);
          console.log(`❌ Available notifications:`, scheduledNotifications.map(n => ({
            identifier: n.identifier,
            title: n.content.title,
            trigger: n.trigger
          })));
        }
      } catch (verifyError) {
        console.error(`❌ Error verifying scheduled notification:`, verifyError);
      }
    } catch (error) {
      console.error(`❌ Error scheduling notification:`, error);
      console.error(`❌ Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    }
  }

  // Get notification body text
  private getNotificationBody(session: CoachingSession, minutesBefore: number): string {
    const timeText = minutesBefore === 30 ? '30 minutes' : 
                    minutesBefore === 60 ? '1 hour' : 
                    minutesBefore === 1440 ? '1 day' : 
                    `${minutesBefore} minutes`;

    const sessionTypeText = session.sessionType === 'call' ? 'Voice Call' : 'Text Chat';
    
    return `Your ${session.goal} ${sessionTypeText} starts in ${timeText}. Tap to join!`;
  }

  // Cancel all notifications for a specific session
  async cancelSessionNotifications(sessionId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.sessionId === sessionId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Cancelled notification: ${notification.identifier}`);
        }
      }
    } catch (error) {
      console.error('Error cancelling session notifications:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    console.log('Updated notification preferences:', this.preferences);
    await this.savePreferences();
  }

  // Get current preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Test notification (for debugging)
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🧪 Sending test notification...');
      
      // Test with immediate trigger
      const testNotification = {
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from your wellness app!',
          data: { test: true },
        },
        trigger: { 
          type: 'timeInterval' as const,
          seconds: 5 
        }, // 5 seconds from now
      };

      console.log('🧪 Scheduling test notification with trigger:', testNotification.trigger);
      
      const identifier = await Notifications.scheduleNotificationAsync(testNotification as any);
      console.log('✅ Test notification scheduled successfully with ID:', identifier);
      
      // Verify the test notification was scheduled
      setTimeout(async () => {
        try {
          const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
          const testNotification = scheduledNotifications.find(n => n.identifier === identifier);
          if (testNotification) {
            console.log('🧪 Test notification verification successful:', {
              identifier: testNotification.identifier,
              trigger: testNotification.trigger
            });
          } else {
            console.log('❌ Test notification not found in scheduled notifications!');
          }
        } catch (error) {
          console.error('❌ Error verifying test notification:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    }
  }

  // Debug function to list all scheduled notifications
  async debugScheduledNotifications(): Promise<void> {
    try {
      console.log('🔍 Checking notification system status...');
      
      // Check permissions
      const permissions = await Notifications.getPermissionsAsync();
      console.log('🔍 Notification permissions:', permissions);
      
      // Check if notifications are enabled (this method might not exist in all versions)
      console.log('🔍 Notification settings check not available in this version');
      
      // Check scheduled notifications
      const notifications = await this.getScheduledNotifications();
      console.log(`📋 Found ${notifications.length} scheduled notifications:`);
      
      notifications.forEach((notification, index) => {
        const data = notification.content.data;
        console.log(`${index + 1}. ID: ${notification.identifier}`);
        console.log(`   Title: ${notification.content.title}`);
        console.log(`   Body: ${notification.content.body}`);
        console.log(`   Data:`, data);
        console.log(`   Trigger:`, notification.trigger);
        if (notification.trigger && 'date' in notification.trigger) {
          console.log(`   Scheduled for: ${new Date(notification.trigger.date).toLocaleString()}`);
        }
        console.log('---');
      });
      
      // Check user preferences
      console.log('🔍 User notification preferences:', this.preferences);
      
    } catch (error) {
      console.error('❌ Error checking scheduled notifications:', error);
    }
  }

  // Handle notification response (when user taps notification)
  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;
    
    if (data?.test) {
      console.log('Test notification tapped');
      return;
    }

    if (data?.sessionId) {
      console.log('Session notification tapped:', data);
      // Navigate to the coach screen where user can join the session
      // The coach screen will show the join button if the session is active
      // This navigation will be handled by the app's routing system
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { CoachingSession } from './sessionsContext';

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

  // Schedule notifications for a coaching session
  async scheduleSessionNotifications(session: CoachingSession): Promise<void> {
    console.log('🔔 Scheduling notifications for session:', {
      id: session.id,
      goal: session.goal,
      sessionTime: session.fullDate.toISOString(),
      reminderTimes: this.preferences.reminderTimes
    });

    if (!this.preferences.enabled) {
      console.log('❌ Notifications disabled, skipping scheduling');
      return;
    }

    try {
      // Cancel any existing notifications for this session
      await this.cancelSessionNotifications(session.id);

      // Schedule notifications for each reminder time
      for (const minutesBefore of this.preferences.reminderTimes) {
        const notificationTime = new Date(session.fullDate.getTime() - (minutesBefore * 60 * 1000));
        
        console.log(`⏰ Scheduling ${minutesBefore}min reminder for:`, notificationTime.toISOString());
        
        // Only schedule if the notification time is in the future
        if (notificationTime > new Date()) {
          await this.scheduleNotification(session, notificationTime, minutesBefore);
          console.log(`✅ Scheduled ${minutesBefore}min reminder successfully`);
        } else {
          console.log(`⏭️ Skipping ${minutesBefore}min reminder - time has passed`);
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
    const identifier = await Notifications.scheduleNotificationAsync({
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
        date: notificationTime,
        channelId: 'coaching-sessions',
      },
    });

    console.log(`Scheduled notification ${identifier} for ${minutesBefore} minutes before session`);
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
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    console.log('Updated notification preferences:', this.preferences);
  }

  // Get current preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Test notification (for debugging)
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🧪 Sending test notification...');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from your wellness app!',
          data: { test: true },
        },
        trigger: { seconds: 2 },
      } as any);
      console.log('✅ Test notification scheduled successfully');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }

  // Debug function to list all scheduled notifications
  async debugScheduledNotifications(): Promise<void> {
    try {
      console.log('🔍 Checking scheduled notifications...');
      const notifications = await this.getScheduledNotifications();
      console.log(`📋 Found ${notifications.length} scheduled notifications:`);
      
      notifications.forEach((notification, index) => {
        const data = notification.content.data;
        console.log(`${index + 1}. ID: ${notification.identifier}`);
        console.log(`   Title: ${notification.content.title}`);
        console.log(`   Body: ${notification.content.body}`);
        console.log(`   Data:`, data);
        console.log(`   Trigger:`, notification.trigger);
        console.log('---');
      });
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
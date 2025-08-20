import AsyncStorage from '@react-native-async-storage/async-storage';
import { simplePaymentService } from './simplePaymentService';

export interface FreeTrialStatus {
  isActive: boolean;
  messagesUsedToday: number;
  dailyLimit: number;
  trialStartDate: string | null;
  trialEndDate: string | null;
}

class FreeTrialService {
  private readonly DAILY_MESSAGE_LIMIT = 10;
  private readonly TRIAL_DURATION_DAYS = 7;
  private readonly MESSAGE_COUNT_KEY = 'free_trial_messages_today';
  private readonly TRIAL_START_KEY = 'free_trial_start_date';
  private readonly LAST_RESET_DATE_KEY = 'last_message_reset_date';

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const response = await simplePaymentService.getSubscriptionDetails();
      return response.data?.status === 'active';
    } catch (error) {
      console.log('No active subscription found:', error);
      return false;
    }
  }

  // Check if user is on free trial
  async isOnFreeTrial(): Promise<boolean> {
    try {
      // First check if user has active subscription - if yes, no free trial
      const hasSubscription = await this.hasActiveSubscription();
      if (hasSubscription) {
        console.log('User has active subscription - no free trial access');
        return false;
      }

      const trialStartDate = await AsyncStorage.getItem(this.TRIAL_START_KEY);
      if (!trialStartDate) return false;

      const startDate = new Date(trialStartDate);
      const endDate = new Date(startDate.getTime() + (this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000));
      const now = new Date();

      return now < endDate;
    } catch (error) {
      console.error('Error checking free trial status:', error);
      return false;
    }
  }

  // Start free trial
  async startFreeTrial(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user has active subscription
      const hasSubscription = await this.hasActiveSubscription();
      if (hasSubscription) {
        return {
          success: false,
          error: 'You already have an active subscription. Free trial is not available.'
        };
      }

      const now = new Date();
      await AsyncStorage.setItem(this.TRIAL_START_KEY, now.toISOString());
      await AsyncStorage.setItem(this.MESSAGE_COUNT_KEY, '0');
      await AsyncStorage.setItem(this.LAST_RESET_DATE_KEY, now.toISOString());
      console.log('Free trial started');
      return { success: true };
    } catch (error) {
      console.error('Error starting free trial:', error);
      return {
        success: false,
        error: 'Failed to start free trial'
      };
    }
  }

  // Get current message count for today
  async getMessagesUsedToday(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(this.MESSAGE_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  // Check if daily limit is reached
  async isDailyLimitReached(): Promise<boolean> {
    try {
      const messagesUsed = await this.getMessagesUsedToday();
      return messagesUsed >= this.DAILY_MESSAGE_LIMIT;
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return false;
    }
  }

  // Increment message count
  async incrementMessageCount(): Promise<void> {
    try {
      const currentCount = await this.getMessagesUsedToday();
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(this.MESSAGE_COUNT_KEY, newCount.toString());
      console.log(`Message count: ${newCount}/${this.DAILY_MESSAGE_LIMIT}`);
    } catch (error) {
      console.error('Error incrementing message count:', error);
    }
  }

  // Reset daily message count (called at midnight)
  async resetDailyMessageCount(): Promise<void> {
    try {
      const lastResetDate = await AsyncStorage.getItem(this.LAST_RESET_DATE_KEY);
      const now = new Date();
      
      if (lastResetDate) {
        const lastReset = new Date(lastResetDate);
        const isNewDay = now.getDate() !== lastReset.getDate() || 
                        now.getMonth() !== lastReset.getMonth() || 
                        now.getFullYear() !== lastReset.getFullYear();
        
        if (isNewDay) {
          await AsyncStorage.setItem(this.MESSAGE_COUNT_KEY, '0');
          await AsyncStorage.setItem(this.LAST_RESET_DATE_KEY, now.toISOString());
          console.log('Daily message count reset');
        }
      }
    } catch (error) {
      console.error('Error resetting daily message count:', error);
    }
  }

  // Get free trial status
  async getFreeTrialStatus(): Promise<FreeTrialStatus> {
    try {
      const isActive = await this.isOnFreeTrial();
      const messagesUsed = await this.getMessagesUsedToday();
      const trialStartDate = await AsyncStorage.getItem(this.TRIAL_START_KEY);
      
      let trialEndDate = null;
      if (trialStartDate) {
        const startDate = new Date(trialStartDate);
        const endDate = new Date(startDate.getTime() + (this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000));
        trialEndDate = endDate.toISOString();
      }

      return {
        isActive,
        messagesUsedToday: messagesUsed,
        dailyLimit: this.DAILY_MESSAGE_LIMIT,
        trialStartDate,
        trialEndDate,
      };
    } catch (error) {
      console.error('Error getting free trial status:', error);
      return {
        isActive: false,
        messagesUsedToday: 0,
        dailyLimit: this.DAILY_MESSAGE_LIMIT,
        trialStartDate: null,
        trialEndDate: null,
      };
    }
  }

  // Clear free trial data (for testing)
  async clearFreeTrialData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TRIAL_START_KEY);
      await AsyncStorage.removeItem(this.MESSAGE_COUNT_KEY);
      await AsyncStorage.removeItem(this.LAST_RESET_DATE_KEY);
      console.log('Free trial data cleared');
    } catch (error) {
      console.error('Error clearing free trial data:', error);
    }
  }

  // Clear free trial when user gets active subscription
  async clearFreeTrialOnSubscription(): Promise<void> {
    try {
      await this.clearFreeTrialData();
      console.log('Free trial data cleared due to active subscription');
    } catch (error) {
      console.error('Error clearing free trial data on subscription:', error);
    }
  }
}

export const freeTrialService = new FreeTrialService(); 
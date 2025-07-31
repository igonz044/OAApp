import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityData {
  lastActiveDate: string;
  activeDays: string[];
  totalSessions: number;
}

export const userActivityService = {
  // Track when user opens the app
  async trackActivity(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const activityData = await this.getActivityData();
      
      // Update last active date
      activityData.lastActiveDate = today;
      
      // Add today to active days if not already present
      if (!activityData.activeDays.includes(today)) {
        activityData.activeDays.push(today);
      }
      
      await this.saveActivityData(activityData);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  },

  // Get the number of days the user has been active
  async getDaysActive(): Promise<number> {
    try {
      const activityData = await this.getActivityData();
      return activityData.activeDays.length;
    } catch (error) {
      console.error('Error getting days active:', error);
      return 0;
    }
  },

  // Get total sessions completed
  async getTotalSessions(): Promise<number> {
    try {
      const activityData = await this.getActivityData();
      return activityData.totalSessions;
    } catch (error) {
      console.error('Error getting total sessions:', error);
      return 0;
    }
  },

  // Increment session count when a session is completed
  async incrementSessionCount(): Promise<void> {
    try {
      const activityData = await this.getActivityData();
      activityData.totalSessions += 1;
      await this.saveActivityData(activityData);
    } catch (error) {
      console.error('Error incrementing session count:', error);
    }
  },

  // Get activity data from storage
  async getActivityData(): Promise<ActivityData> {
    try {
      const data = await AsyncStorage.getItem('userActivityData');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading activity data:', error);
    }
    
    // Return default data if none exists
    return {
      lastActiveDate: '',
      activeDays: [],
      totalSessions: 0
    };
  },

  // Save activity data to storage
  async saveActivityData(data: ActivityData): Promise<void> {
    try {
      await AsyncStorage.setItem('userActivityData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving activity data:', error);
    }
  },

  // Reset activity data (useful for testing or user logout)
  async resetActivityData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userActivityData');
    } catch (error) {
      console.error('Error resetting activity data:', error);
    }
  }
}; 
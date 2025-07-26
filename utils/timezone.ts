import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TimezoneInfo {
  timezone: string;
  offset: number;
  region: string;
  city: string;
}

/**
 * Detect user's timezone and return detailed timezone information
 */
export const detectUserTimezone = (): TimezoneInfo => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const offset = now.getTimezoneOffset(); // Offset in minutes

  // Parse timezone string to get region and city
  const parts = timezone.split('/');
  const region = parts[0] || 'Unknown';
  const city = parts[1] || 'Unknown';

  return {
    timezone,
    offset,
    region,
    city,
  };
};

/**
 * Save timezone information to local storage
 */
export const saveTimezoneToStorage = async (timezoneInfo: TimezoneInfo): Promise<void> => {
  try {
    await AsyncStorage.setItem('userTimezone', JSON.stringify(timezoneInfo));
    console.log('Timezone saved:', timezoneInfo);
  } catch (error) {
    console.error('Error saving timezone:', error);
  }
};

/**
 * Get timezone information from local storage
 */
export const getTimezoneFromStorage = async (): Promise<TimezoneInfo | null> => {
  try {
    const timezoneData = await AsyncStorage.getItem('userTimezone');
    if (timezoneData) {
      return JSON.parse(timezoneData);
    }
    return null;
  } catch (error) {
    console.error('Error getting timezone:', error);
    return null;
  }
};

/**
 * Initialize timezone on app startup or user sign in
 */
export const initializeTimezone = async (): Promise<TimezoneInfo> => {
  // Check if we already have timezone stored
  const storedTimezone = await getTimezoneFromStorage();
  
  if (storedTimezone) {
    console.log('Using stored timezone:', storedTimezone);
    return storedTimezone;
  }

  // Detect and store new timezone
  const timezoneInfo = detectUserTimezone();
  await saveTimezoneToStorage(timezoneInfo);
  
  // TODO: Send to backend when user signs up
  // await sendTimezoneToBackend(timezoneInfo);
  
  return timezoneInfo;
};

/**
 * Convert local date to UTC
 */
export const localToUTC = (date: Date): Date => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
};

/**
 * Convert UTC date to local
 */
export const utcToLocal = (utcDate: Date): Date => {
  const localDate = new Date(utcDate);
  return new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));
};

/**
 * Format time for display in user's timezone
 */
export const formatTimeInTimezone = (date: Date, timezone?: string): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

/**
 * TODO: Send timezone to backend (for when you add Supabase or other backend)
 */
export const sendTimezoneToBackend = async (timezoneInfo: TimezoneInfo, userId?: string): Promise<void> => {
  // This would be implemented when you add a backend
  console.log('Would send timezone to backend:', { timezoneInfo, userId });
  
  // Example API call:
  // try {
  //   await fetch('/api/users/timezone', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       user_id: userId,
  //       timezone: timezoneInfo.timezone,
  //       timezone_offset: timezoneInfo.offset,
  //       timezone_region: timezoneInfo.region,
  //       timezone_city: timezoneInfo.city,
  //     }),
  //   });
  // } catch (error) {
  //   console.error('Error saving timezone to backend:', error);
  // }
}; 
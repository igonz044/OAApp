import { STRIPE_CONFIG } from './stripeConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  main_goal: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserData;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export const authService = {
  async signup(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    date_of_birth: string;
    gender: string;
    main_goal: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${STRIPE_CONFIG.baseUrl}/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in signup:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Store tokens and user data
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
      
      return {
        success: true,
        user: data.data.user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: (error as Error).message || 'Signup failed. Please try again.'
      };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${STRIPE_CONFIG.baseUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in login:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens and user data
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
      
      return {
        success: true,
        user: data.data.user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: (error as Error).message || 'Login failed. Please check your credentials.'
      };
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Attempting token refresh...');
      
      const response = await fetch(`${STRIPE_CONFIG.baseUrl}/api/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in refreshToken:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('Token refresh response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}: Token refresh failed`);
      }

      // Update stored tokens
      await AsyncStorage.setItem('accessToken', data.data.access_token);
      await AsyncStorage.setItem('refreshToken', data.data.refresh_token);
      
      console.log('Token refresh successful');
      
      return {
        success: true,
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: (error as Error).message || 'Token refresh failed'
      };
    }
  },

  async getUserProfile(): Promise<AuthResponse> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${STRIPE_CONFIG.baseUrl}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in getUserProfile:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return {
        success: true,
        user: data.data
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: 'Failed to get user profile'
      };
    }
  },

  async updateUserProfile(updates: Partial<UserData>): Promise<AuthResponse> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${STRIPE_CONFIG.baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in updateUserProfile:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(data.data));

      return {
        success: true,
        user: data.data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      return null;
    }
  },

  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return false;
      
      // Basic token validation (check if it's expired)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token is expired, attempting refresh...');
          const refreshResult = await this.refreshToken();
          return refreshResult.success;
        }
        return true;
      } catch (error) {
        console.log('Token validation failed:', error);
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}; 
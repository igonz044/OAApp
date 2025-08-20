import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserData, AuthResponse } from './authService';
import { router } from 'expo-router';
import { simplePaymentService } from './simplePaymentService';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    date_of_birth: string;
    gender: string;
    main_goal: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateSubscriptionStatus: (subscriptionData: {
    status: string;
    tier: string;
    currentPeriodEnd: number;
  }) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        
        if (authenticated) {
          const [userData, accessToken] = await Promise.all([
            authService.getUserData(),
            authService.getAccessToken()
          ]);
          
          setUser(userData);
          setToken(accessToken);
          setIsAuthenticated(true);
          
          // Check if user has active subscription and navigate accordingly
          try {
            const subscriptionResponse = await simplePaymentService.getSubscriptionDetails();
            if (subscriptionResponse.data?.status === 'active') {
              // User has active subscription - go directly to main app
              console.log('User has active subscription - navigating to main app');
              router.replace('/(tabs)');
            } else {
              // No active subscription - go to paywall
              console.log('No active subscription - navigating to paywall');
              router.replace('/paywall');
            }
          } catch (subscriptionError) {
            console.log('Error checking subscription status, defaulting to paywall:', subscriptionError);
            // If we can't check subscription status, default to paywall
            router.replace('/paywall');
          }
        }
      } catch (error) {
        console.error('Auth status check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success && response.user && response.accessToken) {
        setUser(response.user);
        setToken(response.accessToken);
        setIsAuthenticated(true);
        
        // Check if user has active subscription
        try {
          const subscriptionResponse = await simplePaymentService.getSubscriptionDetails();
          if (subscriptionResponse.data?.status === 'active') {
            // User has active subscription - go directly to main app
            console.log('User has active subscription - navigating to main app');
            router.replace('/(tabs)');
          } else {
            // No active subscription - go to paywall
            console.log('No active subscription - navigating to paywall');
            router.replace('/paywall');
          }
        } catch (subscriptionError) {
          console.log('Error checking subscription status, defaulting to paywall:', subscriptionError);
          // If we can't check subscription status, default to paywall
          router.replace('/paywall');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    date_of_birth: string;
    gender: string;
    main_goal: string;
  }): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.signup(userData);
      
      if (response.success && response.user && response.accessToken) {
        setUser(response.user);
        setToken(response.accessToken);
        setIsAuthenticated(true);
        
        // New users always go to paywall (they won't have subscriptions yet)
        console.log('New user - navigating to paywall');
        router.replace('/paywall');
      }
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Signup failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Navigate back to login screen
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      const response = await authService.getUserProfile();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Refresh user data error:', error);
    }
  };

  const updateSubscriptionStatus = async (subscriptionData: {
    status: string;
    tier: string;
    currentPeriodEnd: number;
  }): Promise<AuthResponse> => {
    try {
      const response = await authService.updateSubscriptionStatus(subscriptionData);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Update subscription status error:', error);
      return {
        success: false,
        error: 'Failed to update subscription status'
      };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUserData,
    updateSubscriptionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
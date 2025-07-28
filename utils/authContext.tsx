import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserData, AuthResponse } from './authService';
import { router } from 'expo-router';

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
        
        // Navigate to paywall after successful login
        router.replace('/paywall');
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
        
        // Navigate to paywall after successful signup
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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUserData
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
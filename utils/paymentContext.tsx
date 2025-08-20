import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { simplePaymentService } from './simplePaymentService';
import { authService } from './authService';
import { freeTrialService } from './freeTrialService';

// Simple subscription status interface
interface SubscriptionStatus {
  isActive: boolean;
  tier: string;
  status: string;
  currentPeriodEnd: number;
}

interface PaymentContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  updateSubscriptionStatus: (status: SubscriptionStatus) => void;
  isDevMode: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);

  const refreshSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we're in test mode
      const testMode = simplePaymentService.isTestMode();
      setIsDevMode(testMode);
      
      if (testMode) {
        console.log('Running in test mode - using mock data');
        // Set default status for test mode
        const status: SubscriptionStatus = {
          isActive: false,
          tier: '',
          status: 'inactive',
          currentPeriodEnd: 0,
        };
        setSubscriptionStatus(status);
        return;
      }
      
      // Try to get real subscription status from API
      try {
        const response = await simplePaymentService.getSubscriptionDetails();
        if (response.data) {
          const status: SubscriptionStatus = {
            isActive: response.data.status === 'active',
            tier: response.data.tier || '',
            status: response.data.status || 'inactive',
            currentPeriodEnd: response.data.currentPeriodEnd || 0,
          };
          setSubscriptionStatus(status);
          
          // Update user profile with subscription status
          await authService.updateSubscriptionStatus({
            status: response.data.status || 'inactive',
            tier: response.data.tier || '',
            currentPeriodEnd: response.data.currentPeriodEnd || 0,
          });

          // Clear free trial data if user has active subscription
          if (response.data.status === 'active') {
            await freeTrialService.clearFreeTrialOnSubscription();
          }
        } else {
          // No subscription found
          const noSubscriptionStatus = {
            isActive: false,
            tier: '',
            status: 'inactive',
            currentPeriodEnd: 0,
          };
          setSubscriptionStatus(noSubscriptionStatus);
          
          // Update user profile to clear subscription status
          await authService.updateSubscriptionStatus({
            status: 'inactive',
            tier: '',
            currentPeriodEnd: 0,
          });
        }
      } catch (apiError) {
        console.log('No active subscription found or API error:', apiError);
        // Set default status when no subscription exists
        const defaultStatus = {
          isActive: false,
          tier: '',
          status: 'inactive',
          currentPeriodEnd: 0,
        };
        setSubscriptionStatus(defaultStatus);
        
        // Update user profile to clear subscription status
        await authService.updateSubscriptionStatus({
          status: 'inactive',
          tier: '',
          currentPeriodEnd: 0,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription status';
      setError(errorMessage);
      console.error('Error refreshing subscription status:', err);
      
      // Set default status on error
      setSubscriptionStatus({
        isActive: false,
        tier: '',
        status: 'inactive',
        currentPeriodEnd: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionStatus = (status: SubscriptionStatus) => {
    setSubscriptionStatus(status);
    setError(null); // Clear any previous errors
  };

  useEffect(() => {
    refreshSubscriptionStatus();
  }, []);

  const value: PaymentContextType = {
    subscriptionStatus,
    isLoading,
    error,
    refreshSubscriptionStatus,
    updateSubscriptionStatus,
    isDevMode,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}; 
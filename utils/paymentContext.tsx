import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { simplePaymentService } from './simplePaymentService';

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
      }
      
      // For now, return a default status since we're using the simple service
      const status: SubscriptionStatus = {
        isActive: false,
        tier: '',
        status: 'inactive',
        currentPeriodEnd: 0,
      };
      setSubscriptionStatus(status);
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
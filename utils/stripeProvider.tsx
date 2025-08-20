import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_SIMPLE_CONFIG } from './stripeSimpleConfig';

interface StripeAppProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

export function StripeAppProvider({ children }: StripeAppProviderProps) {
  return (
    <StripeProvider
      publishableKey={STRIPE_SIMPLE_CONFIG.publishableKey}
      merchantIdentifier="merchant.com.ousauris.app" // Optional: for Apple Pay
    >
      {children}
    </StripeProvider>
  );
}

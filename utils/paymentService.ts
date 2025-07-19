import { STRIPE_CONFIG, SUBSCRIPTION_TIERS } from './stripeConfig';

export interface SubscriptionResponse {
  subscriptionId: string;
  status: string;
  currentPeriodEnd: number;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: string;
  status: string;
  currentPeriodEnd: number;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  tier: string;
  currentPeriodEnd: number;
  usage: any;
}

class PaymentService {
  private baseUrl: string;
  private isDevelopmentMode: boolean;

  constructor() {
    this.baseUrl = STRIPE_CONFIG.baseUrl;
    // Check if we're in development mode (no real backend)
    this.isDevelopmentMode = this.baseUrl === 'https://your-backend-api.com' || 
                            this.baseUrl.includes('localhost') ||
                            this.baseUrl.includes('127.0.0.1');
  }

  // Create a subscription
  async createSubscription(
    priceId: string,
    customerId?: string
  ): Promise<SubscriptionResponse> {
    if (this.isDevelopmentMode) {
      // Mock response for development
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysFromNow = now + (30 * 24 * 60 * 60); // 30 days from now
      
      return {
        subscriptionId: 'sub_mock_' + Date.now(),
        status: 'active',
        currentPeriodEnd: thirtyDaysFromNow,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${STRIPE_CONFIG.apiEndpoints.createSubscription}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication header here
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Get subscription details
  async getSubscriptionDetails(): Promise<SubscriptionDetails> {
    if (this.isDevelopmentMode) {
      // Mock response for development
      return {
        id: 'sub_mock_123',
        status: 'inactive',
        tier: '',
        currentPeriodEnd: 0,
        usage: {},
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${STRIPE_CONFIG.apiEndpoints.getSubscriptionDetails}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication header here
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (this.isDevelopmentMode) {
      // Mock response for development
      console.log('Mock: Subscription cancelled:', subscriptionId);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}${STRIPE_CONFIG.apiEndpoints.cancelSubscription}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication header here
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Reactivate a subscription
  async reactivateSubscription(subscriptionId: string): Promise<void> {
    if (this.isDevelopmentMode) {
      // Mock response for development
      console.log('Mock: Subscription reactivated:', subscriptionId);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}${STRIPE_CONFIG.apiEndpoints.reactivateSubscription}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication header here
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // Get usage statistics
  async getUsageStatistics(): Promise<any> {
    if (this.isDevelopmentMode) {
      // Mock response for development
      return {
        totalSessions: 0,
        totalChats: 0,
        currentPeriod: '2024-01',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${STRIPE_CONFIG.apiEndpoints.getUsageStatistics}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication header here
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting usage statistics:', error);
      throw error;
    }
  }

  // Get subscription status (converted from details)
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (this.isDevelopmentMode) {
      // Mock response for development - no active subscription
      return {
        isActive: false,
        tier: '',
        status: 'inactive',
        currentPeriodEnd: 0,
      };
    }

    try {
      const details = await this.getSubscriptionDetails();
      return {
        isActive: details.status === 'active',
        tier: details.tier,
        status: details.status,
        currentPeriodEnd: details.currentPeriodEnd,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      // Return default inactive status instead of throwing
      return {
        isActive: false,
        tier: '',
        status: 'inactive',
        currentPeriodEnd: 0,
      };
    }
  }

  // Get subscription tier by ID
  getSubscriptionTier(tierId: string) {
    switch (tierId) {
      case 'tier1':
        return SUBSCRIPTION_TIERS.starter;
      case 'tier2':
        return SUBSCRIPTION_TIERS.premium;
      case 'tier3':
        return SUBSCRIPTION_TIERS.elite;
      default:
        throw new Error(`Unknown tier ID: ${tierId}`);
    }
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
  }

  // Parse amount from string
  parseAmount(amountString: string): number {
    return Math.round(parseFloat(amountString.replace('$', '')) * 100);
  }

  // Check if we're in development mode
  isDevMode(): boolean {
    return this.isDevelopmentMode;
  }
}

export const paymentService = new PaymentService(); 
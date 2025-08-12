import { STRIPE_SIMPLE_CONFIG, SIMPLE_PRODUCTS, SIMPLE_API_ENDPOINTS } from './stripeSimpleConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple payment service - we'll build this step by step
export class SimplePaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = STRIPE_SIMPLE_CONFIG.backendUrl;
  }

  // Create a subscription (for recurring payments)
  async createSubscription(priceId: string) {
    try {
      console.log('🔄 Creating subscription for price:', priceId);
      
      // For now, use the mock backend
      // const data = await simpleBackendMock.createSubscription(priceId);
      // console.log('🔐 SUBSCRIPTION API RESPONSE:', JSON.stringify(data, null, 2));
      // console.log('✅ Subscription created:', data);
      // return data;
      
      // TODO: Uncomment this when you have a real backend
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.createSubscription}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          priceId,
          successUrl: 'https://google.com/',
          cancelUrl: 'https://youtube.com/',
        }),
      });
      
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Subscription creation failed:', errorText);
      throw new Error(`Subscription creation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
      console.log('🔐🔐🔐🔐🔐 SUBSCRIPTION API RESPONSE:', JSON.stringify(data, null, 2));
      console.log('✅ Subscription created:', data);
      return data;


    } catch (error) {
      console.error('❌ Subscription creation error:', error);
      throw error;
    }
  }

  // Get product information
  getProduct(productId: keyof typeof SIMPLE_PRODUCTS) {
    return SIMPLE_PRODUCTS[productId];
  }

  // Format price for display
  formatPrice(amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
  }

  // Validate test mode
  isTestMode(): boolean {
    return STRIPE_SIMPLE_CONFIG.isTestMode;
  }

  // Get test card information
  getTestCards() {
    return {
      success: '4242 4242 4242 4242',
      declined: '4000 0000 0000 0002',
      insufficient: '4000 0000 0000 9995',
      expired: '4000 0000 0000 0069',
    };
  }

  // Get subscription details
  async getSubscriptionDetails() {
    try {
      console.log('📋 Getting subscription details...');
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.getSubscriptionDetails}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get subscription details failed:', errorText);
        throw new Error(`Get subscription details failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔐 SUBSCRIPTION DETAILS API RESPONSE:', JSON.stringify(data, null, 2));
      console.log('✅ Subscription details retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ Get subscription details error:', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription() {
    try {
      console.log('🔄 Reactivating subscription...');
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.reactivateSubscription}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Reactivate subscription failed:', errorText);
        throw new Error(`Reactivate subscription failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔐 REACTIVATE SUBSCRIPTION API RESPONSE:', JSON.stringify(data, null, 2));
      console.log('✅ Subscription reactivated:', data);
      return data;
    } catch (error) {
      console.error('❌ Reactivate subscription error:', error);
      throw error;
    }
  }

  // Get usage statistics
  async getUsageStatistics() {
    try {
      console.log('📊 Getting usage statistics...');
      
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.getUsageStatistics}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Get usage statistics failed:', errorText);
        throw new Error(`Get usage statistics failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔐 USAGE STATISTICS API RESPONSE:', JSON.stringify(data, null, 2));
      console.log('✅ Usage statistics retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ Get usage statistics error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const simplePaymentService = new SimplePaymentService();

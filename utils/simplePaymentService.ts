import { STRIPE_SIMPLE_CONFIG, SIMPLE_PRODUCTS, SIMPLE_API_ENDPOINTS } from './stripeSimpleConfig';
import { simpleBackendMock } from './simpleBackendMock';

// Simple payment service - we'll build this step by step
export class SimplePaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = STRIPE_SIMPLE_CONFIG.backendUrl;
  }

  // Step 1: Create a payment intent (for one-time payments)
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      console.log('💰 Creating payment intent for:', amount, currency);
      
      // For now, use the mock backend
      const data = await simpleBackendMock.createPaymentIntent(amount, currency);
      console.log('✅ Payment intent created:', data);
      return data;
      
      // TODO: Uncomment this when you have a real backend
      /*
      const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.createPaymentIntent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment intent creation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Payment intent created:', data);
      return data;
      */
    } catch (error) {
      console.error('❌ Payment intent creation error:', error);
      throw error;
    }
  }

  // Step 2: Create a subscription (for recurring payments)
  async createSubscription(priceId: string) {
    try {
      console.log('🔄 Creating subscription for price:', priceId);
      
      // For now, use the mock backend
      const data = await simpleBackendMock.createSubscription(priceId);
      console.log('✅ Subscription created:', data);
      return data;
      
      // TODO: Uncomment this when you have a real backend
      /*
      const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.createSubscription}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.log('✅ Subscription created:', data);
      return data;
      */
    } catch (error) {
      console.error('❌ Subscription creation error:', error);
      throw error;
    }
  }

  // Step 3: Get product information
  getProduct(productId: keyof typeof SIMPLE_PRODUCTS) {
    return SIMPLE_PRODUCTS[productId];
  }

  // Step 4: Format price for display
  formatPrice(amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
  }

  // Step 5: Validate test mode
  isTestMode(): boolean {
    return STRIPE_SIMPLE_CONFIG.isTestMode;
  }

  // Step 6: Get test card information
  getTestCards() {
    return {
      success: '4242 4242 4242 4242',
      declined: '4000 0000 0000 0002',
      insufficient: '4000 0000 0000 9995',
      expired: '4000 0000 0000 0069',
    };
  }
}

// Create a singleton instance
export const simplePaymentService = new SimplePaymentService();

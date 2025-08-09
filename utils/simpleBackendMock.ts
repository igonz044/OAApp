// Simple Backend Mock for Testing Stripe Integration
// This simulates what your backend should do

export class SimpleBackendMock {
  // Mock payment intent creation
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    console.log('🔧 Mock: Creating payment intent for', amount, currency);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      clientSecret: 'pi_test_secret_' + Math.random().toString(36).substr(2, 9),
      id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
      amount,
      currency,
      status: 'requires_payment_method',
    };
  }

  // Mock subscription creation
  async createSubscription(priceId: string) {
    console.log('🔧 Mock: Creating subscription for', priceId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      subscriptionId: 'sub_test_' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      checkoutUrl: 'https://checkout.stripe.com/test', // Mock checkout URL
    };
  }

  // Mock payment confirmation
  async confirmPayment(paymentIntentId: string) {
    console.log('🔧 Mock: Confirming payment', paymentIntentId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      paymentIntent: {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 999,
        currency: 'usd',
      },
    };
  }
}

// Create singleton instance
export const simpleBackendMock = new SimpleBackendMock();

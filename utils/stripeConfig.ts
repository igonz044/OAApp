// Stripe Configuration
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publishableKey: 'pk_test_51RkVNsQF5FabzjVCK4dN4Q8g61pBiwzhyZqwYOr1H4TLvo3H1qc96BE2iSNnFGRj7q0sds8rWjz3cU1ZPs6InhwJ00CXbx1G9f',
  
  // Backend API endpoints - Updated to match actual backend
  apiEndpoints: {
    createSubscription: '/api/subscriptions/create',
    getSubscriptionDetails: '/api/subscriptions/details',
    cancelSubscription: '/api/subscriptions/cancel',
    reactivateSubscription: '/api/subscriptions/reactivate',
    getUsageStatistics: '/api/subscriptions/usage',
  },
  
  // Base URL for your backend API
  baseUrl: 'https://ousauris-backend-production.up.railway.app',
};

// Subscription tier configurations
export const SUBSCRIPTION_TIERS = {
  starter: {
    id: 'price_1RljHBQF5FabzjVCXAjMtMZZ', // Starter plan price ID
    name: 'Starter',
    price: 999, // $9.99 in cents
    period: 'month',
    features: [
      'Limited coaching chats per week',
      'Basic text-based responses',
      'Core goal tracking',
    ],
  },
  premium: {
    id: 'price_1RmS1EQF5FabzjVCzBbBYDqb', // Premium plan price ID
    name: 'Premium',
    price: 1999, // $19.99 in cents
    period: 'month',
    features: [
      'Unlimited chats',
      'Goal tracking & analytics',
      'Basic voice notes',
      'Priority support',
      'All Starter Features',
    ],
  },
  elite: {
    id: 'price_1RmS4QQF5FabzjVCZQBlKVI7', // Elite plan price ID
    name: 'Elite',
    price: 4999, // $49.99 in cents
    period: 'month',
    features: [
      'Calls from Eleven Labs API',
      'Advanced goal customization',
      'Journaling prompts',
      'AI Generated Wellness Reports',
      'All Premium Features',
    ],
  },
};

// Payment error messages
export const PAYMENT_ERRORS = {
  CARD_DECLINED: 'Your card was declined. Please try a different card.',
  INSUFFICIENT_FUNDS: 'Your card has insufficient funds.',
  EXPIRED_CARD: 'Your card has expired. Please update your payment method.',
  INVALID_CVC: 'The security code is incorrect.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}; 
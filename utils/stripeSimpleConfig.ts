// Simple Stripe Configuration - Step by Step Integration

// 1. Basic Stripe Configuration
export const STRIPE_SIMPLE_CONFIG = {
  // Your Stripe publishable key (get this from your Stripe dashboard)
  publishableKey: 'pk_test_51RkVNsQF5FabzjVCK4dN4Q8g61pBiwzhyZqwYOr1H4TLvo3H1qc96BE2iSNnFGRj7q0sds8rWjz3cU1ZPs6InhwJ00CXbx1G9f',
  
  // Test mode flag
  isTestMode: true,
  
  // Your backend URL (we'll build this later)
  backendUrl: 'https://ousauris-backend-production.up.railway.app',
};

// 2. Simple Product Configuration - Just the $9.99 plan
export const SIMPLE_PRODUCTS = {
  starter: {
    id: 'prod_starter',
    name: 'Starter Plan',
    price: 999, // $9.99 in cents
    priceId: 'price_1RljHBQF5FabzjVCXAjMtMZZ', // Your Stripe price ID
    description: 'Basic coaching features',
  },
};

// 3. Test Card Numbers
export const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  declined: '4000 0000 0000 0002',
  insufficient: '4000 0000 0000 9995',
  expired: '4000 0000 0000 0069',
};

// 4. Simple API Endpoints (we'll build these)
export const SIMPLE_API_ENDPOINTS = {
  createSubscription: '/api/subscriptions/create',
  getSubscriptionDetails: '/api/subscriptions/details',
  reactivateSubscription: '/api/subscriptions/reactivate',
  getUsageStatistics: '/api/subscriptions/usage',
};

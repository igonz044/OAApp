# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for the AusOuris app.

## 🚀 Quick Start

### 1. Install Dependencies
The Stripe React Native SDK has already been installed:
```bash
npm install @stripe/stripe-react-native
```

### 2. Configure Stripe Keys

Update the `utils/stripeConfig.ts` file with your actual Stripe credentials:

```typescript
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publishableKey: 'pk_test_your_actual_publishable_key_here',
  
  // Update with your backend API URL
  baseUrl: 'https://your-backend-api.com',
  
  // API endpoints (should match your backend)
  apiEndpoints: {
    createSubscription: '/api/subscriptions/create',
    getSubscriptionDetails: '/api/subscriptions/details',
    cancelSubscription: '/api/subscriptions/cancel',
    reactivateSubscription: '/api/subscriptions/reactivate',
    getUsageStatistics: '/api/subscriptions/usage',
  },
};
```

### 3. Set Up Stripe Products & Prices

In your Stripe Dashboard, create the following products and prices:

#### Starter Plan
- **Product Name**: AusOuris Starter
- **Price ID**: `price_starter_monthly`
- **Amount**: $9.99/month

#### Premium Plan
- **Product Name**: AusOuris Premium
- **Price ID**: `price_premium_monthly`
- **Amount**: $19.99/month

#### Elite Plan
- **Product Name**: AusOuris Elite
- **Price ID**: `price_elite_monthly`
- **Amount**: $49.99/month

### 4. Backend API Requirements

Your backend needs to implement these endpoints:

#### POST `/api/subscriptions/create`
```json
{
  "priceId": "price_starter_monthly",
  "customerId": "cus_xxx"
}
```

Response:
```json
{
  "subscriptionId": "sub_xxx",
  "status": "active",
  "currentPeriodEnd": 1640995200
}
```

#### GET `/api/subscriptions/details`
Response:
```json
{
  "id": "sub_xxx",
  "status": "active",
  "tier": "tier1",
  "currentPeriodEnd": 1640995200,
  "usage": {
    "totalSessions": 5,
    "totalChats": 25
  }
}
```

#### POST `/api/subscriptions/cancel`
```json
{
  "subscriptionId": "sub_xxx"
}
```

#### POST `/api/subscriptions/reactivate`
```json
{
  "subscriptionId": "sub_xxx"
}
```

#### GET `/api/subscriptions/usage`
Response:
```json
{
  "totalSessions": 5,
  "totalChats": 25,
  "currentPeriod": "2024-01"
}
```

### 5. Webhook Configuration

Your backend already has a webhook endpoint at `/stripe-webhook`. Configure it in Stripe Dashboard to handle:

- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🔧 Testing

### Test Card Numbers
Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

### Test CVC
Use any 3-digit number (e.g., `123`)

### Test Expiry
Use any future date (e.g., `12/25`)

## 📱 App Flow

1. **Paywall Screen**: Users select a subscription tier
2. **Subscription Creation**: Direct subscription creation (no payment intent)
3. **Success**: User is redirected to main app with active subscription
4. **Settings**: Shows subscription status and management options

## 🔒 Security Notes

- Never expose your Stripe secret key in the frontend
- Always validate payments on your backend
- Use webhooks to keep subscription status in sync
- Implement proper error handling for failed payments

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid publishable key"**: Check your Stripe publishable key
2. **"Network error"**: Verify your backend API is running
3. **"Subscription failed"**: Check Stripe Dashboard for error details
4. **"Subscription not created"**: Verify webhook configuration

### Debug Mode

The app automatically detects development mode when the backend URL is not configured. In development mode:
- Mock data is used instead of real API calls
- No actual payments are processed
- "DEV MODE" badges are shown throughout the app

## 📚 Additional Resources

- [Stripe React Native Documentation](https://stripe.com/docs/stripe-react-native)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing) 
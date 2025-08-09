# Stripe Integration Guide - Step by Step

## 🚀 Overview

This guide will help you integrate Stripe payments into your React Native app step by step. We'll start with a simple implementation and gradually build up to a full-featured payment system.

## 📋 Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Stripe Dashboard Access**: Get your publishable and secret keys
3. **React Native App**: Your existing app (OAApp)

## 🔧 Step 1: Install Dependencies

```bash
npm install @stripe/stripe-react-native
```

## 🔑 Step 2: Get Your Stripe Keys

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode) - **Keep this secret!**

## 🏗️ Step 3: Basic Setup

### 3.1 Update Configuration

Edit `utils/stripeSimpleConfig.ts`:

```typescript
export const STRIPE_SIMPLE_CONFIG = {
  // Replace with your actual publishable key
  publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE',
  isTestMode: true,
  backendUrl: 'https://your-backend-url.com',
};
```

### 3.2 Add Stripe Provider

The Stripe provider is already added to your `app/_layout.tsx`. This wraps your app with Stripe functionality.

## 🧪 Step 4: Test the Basic Integration

1. **Navigate to the test screen**: Go to `/simple-payment` in your app
2. **Test with mock backend**: The current setup uses a mock backend for testing
3. **Try the payment flow**: Use test card numbers provided on the screen

## 🔄 Step 5: Connect to Real Backend

### 5.1 Backend Requirements

Your backend needs these endpoints:

#### POST `/api/payment-intents/create`
```json
{
  "amount": 999,
  "currency": "usd"
}
```

Response:
```json
{
  "clientSecret": "pi_test_secret_...",
  "id": "pi_test_...",
  "amount": 999,
  "currency": "usd"
}
```

#### POST `/api/subscriptions/create`
```json
{
  "priceId": "price_123",
  "successUrl": "https://google.com/",
  "cancelUrl": "https://youtube.com/"
}
```

Response:
```json
{
  "subscriptionId": "sub_test_...",
  "status": "active",
  "currentPeriodEnd": 1640995200,
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### 5.2 Update Payment Service

Edit `utils/simplePaymentService.ts` and uncomment the real backend calls:

```typescript
// Remove the mock calls and uncomment the real backend calls
const response = await fetch(`${this.baseUrl}${SIMPLE_API_ENDPOINTS.createPaymentIntent}`, {
  // ... real implementation
});
```

## 🎯 Step 6: Create Products in Stripe

1. Go to your Stripe Dashboard → **Products**
2. Create products for your subscription tiers:

### Starter Plan
- **Name**: Starter Plan
- **Price**: $9.99/month
- **Price ID**: Copy this ID and update `SIMPLE_PRODUCTS.starter.priceId`

### Premium Plan
- **Name**: Premium Plan  
- **Price**: $19.99/month
- **Price ID**: Copy this ID and update `SIMPLE_PRODUCTS.premium.priceId`

## 🔐 Step 7: Backend Implementation

### 7.1 Install Stripe SDK (Backend)

```bash
npm install stripe
```

### 7.2 Basic Backend Code

```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

// Create payment intent
app.post('/api/payment-intents/create', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
app.post('/api/subscriptions/create', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    res.json({
      subscriptionId: session.id,
      status: 'pending',
      checkoutUrl: session.url,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 Step 8: Testing

### 8.1 Test Cards

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

### 8.2 Test CVC and Expiry
- **CVC**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)

## 🔄 Step 9: Production Setup

### 9.1 Switch to Live Mode

1. Update your Stripe keys to live keys
2. Set `isTestMode: false` in config
3. Update price IDs to live price IDs

### 9.2 Security Considerations

- Never expose secret keys in frontend code
- Always validate payments on backend
- Use webhooks for subscription status updates
- Implement proper error handling

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid publishable key"**
   - Check your Stripe publishable key
   - Ensure it starts with `pk_test_` (test) or `pk_live_` (live)

2. **"Network error"**
   - Verify your backend URL is correct
   - Check if backend is running
   - Test with Postman first

3. **"Payment failed"**
   - Check Stripe Dashboard for error details
   - Verify test card numbers
   - Check backend logs

4. **"Subscription not created"**
   - Verify price IDs exist in Stripe
   - Check webhook configuration
   - Ensure backend is in same mode (test/live)

## 📱 Next Steps

1. **Test the basic integration** with the mock backend
2. **Set up your real backend** with the provided code
3. **Create products in Stripe** and update price IDs
4. **Test with real backend** connection
5. **Add webhook handling** for subscription updates
6. **Implement subscription management** (cancel, upgrade, etc.)

## 🎉 Success!

Once you've completed these steps, you'll have a working Stripe integration that can:
- Process one-time payments
- Create subscriptions
- Handle test and live environments
- Provide proper error handling

The integration is modular, so you can easily extend it with additional features like:
- Apple Pay/Google Pay
- Multiple currencies
- Subscription management
- Usage-based billing

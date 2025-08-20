import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Linking,
    AppState,
} from 'react-native';
import { usePayment } from '../utils/paymentContext';
import { useAuth } from '../utils/authContext';
import { freeTrialService } from '../utils/freeTrialService';
import { simplePaymentService } from '../utils/simplePaymentService';

export default function PaywallScreen() {
  const [selectedTier, setSelectedTier] = useState<string>('starter'); // Auto-select the only plan
  const { subscriptionStatus, refreshSubscriptionStatus } = usePayment();
  const { isAuthenticated, user } = useAuth();
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);

  // Redirect to login if not authenticated, or to main app if has active subscription
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    } else if (subscriptionStatus?.isActive) {
      // User has active subscription - redirect to main app
      console.log('User has active subscription - redirecting to main app');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, subscriptionStatus]);

  // Monitor app state changes to detect return from Stripe
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('🔄 App state changed:', nextAppState);
      
      if (nextAppState === 'active' && isRedirectingToStripe) {
        console.log('📱 App became active - user may have returned from Stripe');
        console.log('🔍 Checking subscription status after Stripe redirect...');
        
        // Wait a moment for Stripe webhook to process
        setTimeout(async () => {
          try {
            console.log('🔍 Polling subscription status...');
            await checkSubscriptionStatusAfterStripe();
          } catch (error) {
            console.error('❌ Error checking subscription status after Stripe:', error);
          }
        }, 2000); // Wait 2 seconds for webhook processing
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRedirectingToStripe]);

  // Function to check subscription status after Stripe redirect
  const checkSubscriptionStatusAfterStripe = async () => {
    try {
      console.log('🔍 Checking subscription status after Stripe redirect...');
      
      // Refresh subscription status
      await refreshSubscriptionStatus();
      
      // Get detailed subscription info
      const subscriptionDetails = await simplePaymentService.getSubscriptionDetails();
      console.log('📊 Subscription details after Stripe:', JSON.stringify(subscriptionDetails, null, 2));
      
      if (subscriptionDetails.data?.status === 'active') {
        console.log('✅ Subscription is now active!');
        console.log('🎉 User successfully completed Stripe checkout');
        
        // Clear redirect state
        setIsRedirectingToStripe(false);
        setStripeSessionId(null);
        
        // Navigate to success screen
        console.log('🎉 Navigating to subscription success screen');
        router.replace('/subscription-success');
      } else {
        console.log('❌ Subscription not yet active:', subscriptionDetails.data?.status);
        console.log('⏳ This might be normal if webhook is still processing...');
        
        // Poll again after a delay
        setTimeout(async () => {
          console.log('🔄 Polling again for subscription status...');
          await checkSubscriptionStatusAfterStripe();
        }, 3000); // Poll again in 3 seconds
      }
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
      
      // Clear redirect state on error
      setIsRedirectingToStripe(false);
      setStripeSessionId(null);
    }
  };

  const handleSubscribe = async () => {
    console.log('handleSubscribe called, selectedTier:', selectedTier);
    
    if (!selectedTier) {
      console.log('No tier selected');
      return;
    }

    const selectedTierData = tiers.find(tier => tier.id === selectedTier);
    if (!selectedTierData) {
      console.log('Tier data not found for:', selectedTier);
      return;
    }

    console.log('Creating subscription for:', {
      tierId: selectedTier,
      tierName: selectedTierData.name,
      price: selectedTierData.price,
    });

    try {
      // Create subscription using simple payment service
      const subscription = await simplePaymentService.createSubscription(selectedTierData.priceId);
      console.log('🔐🔐🔐🔐🔐 SUBSCRIPTION CREATION RESPONSE:', JSON.stringify(subscription, null, 2));
      
      // Store session ID for tracking
      if (subscription.data?.id) {
        setStripeSessionId(subscription.data.id);
        console.log('🔑 Stripe Session ID:', subscription.data.id);
      }

      // Check if we got a checkout URL (for real Stripe flow)
      if (subscription.data?.checkout_url) {
        console.log('🔗🔗🔗🔗 REDIRECTING TO STRIPE CHECKOUT');
        console.log('🔗 Checkout URL:', subscription.data.checkout_url);
        
        // Set redirect state
        setIsRedirectingToStripe(true);
        
        const supported = await Linking.canOpenURL(subscription.data.checkout_url);
        if (supported) {
          console.log('✅ Opening Stripe checkout in browser...');
          await Linking.openURL(subscription.data.checkout_url);
          
          // Show info message
          Alert.alert(
            'Redirecting to Payment',
            'You will be redirected to Stripe to complete your payment. Please return to the app after completing the payment.',
            [{ text: 'OK' }]
          );
        } else {
          console.error('❌ Cannot open Stripe checkout URL');
          setIsRedirectingToStripe(false);
          Alert.alert('Error', 'Cannot open payment page. Please try again.');
        }
      } else {
        // Mock subscription (test mode)
        console.log('🔗 MOCK SUBSCRIPTION - TEST MODE');
        // Navigate to success screen for mock subscriptions too
        router.replace('/subscription-success');
      }
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      setIsRedirectingToStripe(false);
      Alert.alert('Error', 'Failed to create subscription. Please try again.');
    }
  };

  const handleSkip = async () => {
    try {
      // Start free trial
      const result = await freeTrialService.startFreeTrial();
      
      if (result.success) {
        console.log('Free trial started successfully');
        // Navigate to main app with limited access
        router.push('/(tabs)');
      } else {
        console.error('Free trial failed:', result.error);
        Alert.alert('Free Trial Unavailable', result.error || 'Failed to start free trial. Please try again.');
      }
    } catch (error) {
      console.error('Error starting free trial:', error);
      Alert.alert('Error', 'Failed to start free trial. Please try again.');
    }
  };

  const handleTestBackend = async () => {
    try {
      // Test the simple payment service
      const testCards = simplePaymentService.getTestCards();
      console.log('Test cards available:', testCards);
      Alert.alert('Test Complete', 'Check console for test card information');
    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Test Error', 'Failed to test payment service.');
    }
  };

  const handleCheckSubscriptionStatus = async () => {
    try {
      console.log('🔍 MANUAL CHECK: Checking subscription status...');
      await checkSubscriptionStatusAfterStripe();
    } catch (error) {
      console.error('❌ Manual check error:', error);
      Alert.alert('Error', 'Failed to check subscription status.');
    }
  };

  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$9.99',
      priceId: 'price_1RljHBQF5FabzjVCXAjMtMZZ', // Your Stripe price ID
      period: 'month',
      features: [
        'Limited coaching chats per week',
        'Basic text-based responses',
        'Core goal tracking',
      ],
      popular: true,
    },
  ];

  // If user already has an active subscription, show subscription status
  if (subscriptionStatus?.isActive) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.phoneContainer}>
            <View style={styles.header}>
              <Text style={styles.logo}>AusOuris</Text>
              <Text style={styles.subtitle}>Subscription Active</Text>
            </View>
            
            <View style={styles.content}>
              <View style={styles.activeSubscriptionCard}>
                <Text style={styles.activeTitle}>✅ Active Subscription</Text>
                <Text style={styles.activeTier}>{subscriptionStatus.tier}</Text>
                <Text style={styles.activeStatus}>Status: {subscriptionStatus.status}</Text>
                <Text style={styles.activeDate}>
                  Renews: {new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString()}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.btnContinue} onPress={() => router.push('/(tabs)')}>
                <Text style={styles.btnContinueText}>Continue to App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.phoneContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>AusOuris</Text>
            <Text style={styles.subtitle}>Choose Your Wellness Journey</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Starter Plan</Text>
            <Text style={styles.description}>
              Get started with basic coaching features for just $9.99/month.
            </Text>
            
            {/* Single Plan Card */}
            <View style={styles.singlePlanCard}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
              
              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{tiers[0].name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{tiers[0].price}</Text>
                  <Text style={styles.period}>/{tiers[0].period}</Text>
                </View>
              </View>
              
              <View style={styles.features}>
                {tiers[0].features && tiers[0].features.length > 0 ? (
                  tiers[0].features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.featureText}>No features available</Text>
                )}
              </View>
            </View>
            
            {/* Start Free Trial Button - Only show if no active subscription */}
            {!subscriptionStatus?.isActive && (
              <TouchableOpacity style={styles.btnFreeTrial} onPress={handleSkip}>
                <Text style={styles.btnFreeTrialText}>Start Free Trial</Text>
              </TouchableOpacity>
            )}
            
            {/* Subscribe Button */}
            <TouchableOpacity style={styles.btnSubscribe} onPress={handleSubscribe}>
              <Text style={styles.btnSubscribeText}>
                Subscribe
              </Text>
            </TouchableOpacity>
            
            {/* Test Backend Button */}
            <TouchableOpacity style={styles.btnTestBackend} onPress={handleTestBackend}>
              <Text style={styles.btnTestBackendText}>Test Backend Subscription</Text>
            </TouchableOpacity>
            
            {/* Manual Check Subscription Status Button */}
            {isRedirectingToStripe && (
              <TouchableOpacity style={styles.btnCheckStatus} onPress={handleCheckSubscriptionStatus}>
                <Text style={styles.btnCheckStatusText}>Check Subscription Status</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 768; // Tablet breakpoint
const isVerySmallScreen = screenWidth < 400; // Very small mobile breakpoint

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  phoneContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#2E2C58',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0C68B',
  },
  subtitle: {
    fontSize: 16,
    color: '#C4B8DD',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#E0C68B',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#C4B8DD',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  activeSubscriptionCard: {
    backgroundColor: 'rgba(169, 195, 177, 0.1)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#A9C3B1',
    alignItems: 'center',
    width: '100%',
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A9C3B1',
    marginBottom: 16,
  },
  activeTier: {
    fontSize: 20,
    color: '#E0C68B',
    marginBottom: 8,
  },
  activeStatus: {
    fontSize: 16,
    color: '#C4B8DD',
    marginBottom: 8,
  },
  activeDate: {
    fontSize: 16,
    color: '#C4B8DD',
  },
  btnContinue: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#A9C3B1',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnContinueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  singlePlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(169, 195, 177, 0.3)',
    width: '85%',
    maxWidth: 320,
    position: 'relative',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  paidPlanCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? (isVerySmallScreen ? 12 : 15) : 15,
    borderWidth: 2,
    borderColor: 'rgba(196, 184, 221, 0.3)',
    width: isSmallScreen ? '31%' : '30%',
    position: 'relative',
    minHeight: isSmallScreen ? (isVerySmallScreen ? 320 : 350) : 400,
  },
  selectedCard: {
    borderColor: '#E0C68B',
    backgroundColor: 'rgba(224, 198, 139, 0.1)',
  },
  popularCard: {
    borderColor: '#A9C3B1',
    backgroundColor: 'rgba(169, 195, 177, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: isSmallScreen ? -10 : -12,
    right: isSmallScreen ? (isVerySmallScreen ? 12 : 16) : 16,
    backgroundColor: '#E0C68B',
    paddingHorizontal: isSmallScreen ? (isVerySmallScreen ? 8 : 12) : 12,
    paddingVertical: isSmallScreen ? 4 : 6,
    borderRadius: isSmallScreen ? 12 : 16,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularText: {
    color: '#2E2C58',
    fontSize: isSmallScreen ? (isVerySmallScreen ? 9 : 10) : 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? (isVerySmallScreen ? 16 : 20) : 24,
  },
  tierName: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 16 : 18) : 20,
    fontWeight: '700',
    color: '#E0C68B',
    marginBottom: isSmallScreen ? 6 : 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 20 : 24) : 28,
    fontWeight: '700',
    color: '#E0C68B',
    letterSpacing: 0.5,
  },
  period: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 12 : 14) : 16,
    color: '#C4B8DD',
    marginLeft: 4,
    fontWeight: '500',
  },
  features: {
    marginBottom: isSmallScreen ? (isVerySmallScreen ? 16 : 20) : 24,
    width: '100%',
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? (isVerySmallScreen ? 4 : 6) : 8,
    marginBottom: isSmallScreen ? (isVerySmallScreen ? 8 : 10) : 12,
    width: '100%',
  },
  checkmark: {
    color: '#A9C3B1',
    fontWeight: '700',
    marginRight: isSmallScreen ? 8 : 10,
    fontSize: isSmallScreen ? (isVerySmallScreen ? 12 : 14) : 16,
    marginTop: 0,
  },
  featureText: {
    color: '#C4B8DD',
    fontSize: isSmallScreen ? (isVerySmallScreen ? 12 : 14) : 16,
    flex: 1,
    lineHeight: isSmallScreen ? (isVerySmallScreen ? 16 : 18) : 20,
    fontWeight: '500',
    textAlign: 'left',
  },
  btnPrimary: {
    width: '100%',
    padding: isSmallScreen ? (isVerySmallScreen ? 10 : 12) : 10,
    borderRadius: isSmallScreen ? 6 : 8,
    backgroundColor: 'rgba(224, 198, 139, 0.2)',
    borderWidth: 1,
    borderColor: '#E0C68B',
    alignItems: 'center',
  },
  btnPrimarySelected: {
    backgroundColor: '#E0C68B',
  },
  btnPrimaryText: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 9 : 10) : 12,
    fontWeight: 'bold',
    color: '#E0C68B',
  },
  btnFreeTrial: {
    width: '85%',
    maxWidth: 320,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  btnFreeTrialText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2C58',
    letterSpacing: 0.5,
  },
  btnSubscribe: {
    width: '85%',
    maxWidth: 320,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#A9C3B1',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  btnSubscribeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2C58',
    letterSpacing: 0.5,
  },
  btnTestBackend: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    marginTop: 10,
  },
  btnTestBackendText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  btnCheckStatus: {
    width: '85%',
    maxWidth: 320,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnCheckStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { usePayment } from '../utils/paymentContext';

export default function PaywallScreen() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const { subscriptionStatus } = usePayment();

  const handleSubscribe = () => {
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

    console.log('Navigating to payment checkout with:', {
      tierId: selectedTier,
      tierName: selectedTierData.name,
      price: selectedTierData.price,
    });

    // Navigate to payment checkout with tier details
    router.push({
      pathname: '/payment-checkout',
      params: {
        tierId: selectedTier,
        tierName: selectedTierData.name,
        price: selectedTierData.price,
      },
    });
  };

  const handleSkip = () => {
    // Navigate to main app with limited access
    router.push('/(tabs)');
  };

  const tiers = [
    {
      id: 'tier1',
      name: 'Starter',
      price: '$9.99',
      period: 'month',
      features: [
        'Limited coaching chats per week',
        'Basic text-based responses',
        'Core goal tracking',
      ],
      popular: false,
    },
    {
      id: 'tier2',
      name: 'Premium',
      price: '$19.99',
      period: 'month',
      features: [
        'Unlimited chats',
        'Goal tracking & analytics',
        'Basic voice notes',
        'Priority support',
        'All Starter Features',
      ],
      popular: true,
    },
    {
      id: 'tier3',
      name: 'Elite',
      price: '$49.99',
      period: 'month',
      features: [
        'Calls from Eleven Labs API',
        'Advanced goal customization',
        'Journaling prompts',
        'AI Generated Wellness Reports',
        'All Premium Features',
      ],
      popular: false,
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
            <Text style={styles.title}>Subscription Tiers</Text>
            <Text style={styles.description}>
              Choose the plan that fits your wellness goals and unlock your potential.
            </Text>
            
            {/* Paid Plans - Responsive layout */}
            <View style={styles.paidPlansContainer}>
              {tiers.map((tier) => (
                <TouchableOpacity
                  key={tier.id}
                  style={[
                    styles.paidPlanCard,
                    selectedTier === tier.id && styles.selectedCard,
                    tier.popular && styles.popularCard,
                  ]}
                  onPress={() => setSelectedTier(tier.id)}
                >
                  {tier.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  
                  <View style={styles.tierHeader}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{tier.price}</Text>
                      <Text style={styles.period}>/{tier.period}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.features}>
                    {tier.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.checkmark}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={[
                      styles.btnPrimary,
                      selectedTier === tier.id && styles.btnPrimarySelected
                    ]} 
                    onPress={() => setSelectedTier(tier.id)}
                  >
                    <Text style={styles.btnPrimaryText}>
                      {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Start Free Trial Button */}
            <TouchableOpacity style={styles.btnFreeTrial} onPress={handleSkip}>
              <Text style={styles.btnFreeTrialText}>Start Free Trial</Text>
            </TouchableOpacity>
            
            {/* Subscribe Button for selected paid plan */}
            {selectedTier && (
              <TouchableOpacity style={styles.btnSubscribe} onPress={handleSubscribe}>
                <Text style={styles.btnSubscribeText}>
                  Subscribe to {tiers.find(t => t.id === selectedTier)?.name} Plan
                </Text>
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
  paidPlansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    gap: isSmallScreen ? 8 : 0,
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
    top: isSmallScreen ? -8 : -10,
    right: isSmallScreen ? (isVerySmallScreen ? 8 : 12) : 10,
    backgroundColor: '#A9C3B1',
    paddingHorizontal: isSmallScreen ? (isVerySmallScreen ? 6 : 8) : 8,
    paddingVertical: isSmallScreen ? 3 : 4,
    borderRadius: isSmallScreen ? 8 : 12,
    zIndex: 1,
  },
  popularText: {
    color: '#2E2C58',
    fontSize: isSmallScreen ? (isVerySmallScreen ? 8 : 9) : 10,
    fontWeight: 'bold',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? (isVerySmallScreen ? 10 : 12) : 15,
  },
  tierName: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 14 : 16) : 18,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: isSmallScreen ? 3 : 5,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 18 : 20) : 24,
    fontWeight: 'bold',
    color: '#E0C68B',
  },
  period: {
    fontSize: isSmallScreen ? (isVerySmallScreen ? 10 : 12) : 14,
    color: '#C4B8DD',
    marginLeft: 2,
  },
  features: {
    marginBottom: isSmallScreen ? (isVerySmallScreen ? 10 : 12) : 15,
    flex: isSmallScreen ? 0 : 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: isSmallScreen ? (isVerySmallScreen ? 3 : 4) : 4,
    marginBottom: isSmallScreen ? (isVerySmallScreen ? 6 : 8) : 8,
  },
  checkmark: {
    color: '#A9C3B1',
    fontWeight: 'bold',
    marginRight: isSmallScreen ? 6 : 8,
    fontSize: isSmallScreen ? (isVerySmallScreen ? 9 : 10) : 12,
    marginTop: 2,
  },
  featureText: {
    color: '#C4B8DD',
    fontSize: isSmallScreen ? (isVerySmallScreen ? 9 : 10) : 12,
    flex: 1,
    lineHeight: isSmallScreen ? (isVerySmallScreen ? 12 : 14) : 16,
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
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  btnFreeTrialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  btnSubscribe: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#A9C3B1',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  btnSubscribeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
}); 
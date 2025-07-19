import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaywallScreen() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleSubscribe = () => {
    // In a real app, this would handle payment processing for the selected tier
    router.push('/(tabs)');
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
            
            {/* Paid Plans in horizontal row */}
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
  paidPlansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  paidPlanCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 2,
    borderColor: 'rgba(196, 184, 221, 0.3)',
    width: '30%',
    position: 'relative',
    minHeight: 400,
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
    top: -10,
    right: 10,
    backgroundColor: '#A9C3B1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#2E2C58',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 5,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0C68B',
  },
  period: {
    fontSize: 14,
    color: '#C4B8DD',
    marginLeft: 2,
  },
  features: {
    marginBottom: 15,
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    marginBottom: 8,
  },
  checkmark: {
    color: '#A9C3B1',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 12,
    marginTop: 2,
  },
  featureText: {
    color: '#C4B8DD',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  btnPrimary: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(224, 198, 139, 0.2)',
    borderWidth: 1,
    borderColor: '#E0C68B',
    alignItems: 'center',
  },
  btnPrimarySelected: {
    backgroundColor: '#E0C68B',
  },
  btnPrimaryText: {
    fontSize: 12,
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
  },
  btnSubscribeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
}); 
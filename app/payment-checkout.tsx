import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { STRIPE_CONFIG, PAYMENT_ERRORS } from '../utils/stripeConfig';
import { paymentService } from '../utils/paymentService';
import { usePayment } from '../utils/paymentContext';
import { useAuth } from '../utils/authContext';

export default function PaymentCheckoutScreen() {
  const { tierId, tierName, price } = useLocalSearchParams<{
    tierId: string;
    tierName: string;
    price: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const { updateSubscriptionStatus, isDevMode } = usePayment();
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Create subscription directly (no payment intent needed)
      const tier = paymentService.getSubscriptionTier(tierId);
      const subscription = await paymentService.createSubscription(tier.id);
      
      // Update subscription status in context
      updateSubscriptionStatus({
        isActive: true,
        tier: tierId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      });

      Alert.alert(
        'Subscription Created!',
        `Welcome to ${tierName}! Your subscription is now active.`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Subscription</Text>
          <Text style={styles.subtitle}>{tierName} Plan</Text>
          {isDevMode && (
            <View style={styles.devModeBadge}>
              <Text style={styles.devModeText}>DEV MODE - Mock Subscription</Text>
            </View>
          )}
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Subscription Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{tierName} Plan</Text>
              <Text style={styles.summaryValue}>{price}/month</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{price}/month</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.featuresList}>
              {paymentService.getSubscriptionTier(tierId).features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.payButton,
                isLoading && styles.payButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#2E2C58" />
              ) : (
                <Text style={styles.payButtonText}>
                  {isDevMode ? 'Create Mock Subscription' : `Subscribe for ${price}/month`}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#C4B8DD',
    marginBottom: 8,
  },
  devModeBadge: {
    backgroundColor: '#A9C3B1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  devModeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  paymentCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 221, 0.3)',
  },
  orderSummary: {
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#C4B8DD',
    fontSize: 16,
  },
  summaryValue: {
    color: '#E0C68B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(196, 184, 221, 0.3)',
    marginVertical: 12,
  },
  infoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkmark: {
    color: '#A9C3B1',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 14,
    marginTop: 2,
  },
  featureText: {
    color: '#C4B8DD',
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  payButton: {
    backgroundColor: '#E0C68B',
    padding: 16,
    borderRadius: 12,
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
  payButtonDisabled: {
    backgroundColor: 'rgba(224, 198, 139, 0.5)',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C4B8DD',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B8DD',
  },
}); 
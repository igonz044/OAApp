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
  ActivityIndicator,
} from 'react-native';
import { usePayment } from '../utils/paymentContext';
import { simplePaymentService } from '../utils/simplePaymentService';

interface SubscriptionDetails {
  id: string;
  status: string;
  tier: string;
  currentPeriodEnd: number;
  currentPeriodStart: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: number;
}

export default function SubscriptionDetailsScreen() {
  const { subscriptionStatus } = usePayment();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionDetails();
  }, []);

  const loadSubscriptionDetails = async () => {
    try {
      setIsLoading(true);
      const response = await simplePaymentService.getSubscriptionDetails();
      
      if (response.data) {
        setSubscriptionDetails({
          id: response.data.id || '',
          status: response.data.status || 'active',
          tier: response.data.tier || subscriptionStatus?.tier || 'Unknown',
          currentPeriodEnd: response.data.currentPeriodEnd || subscriptionStatus?.currentPeriodEnd || 0,
          currentPeriodStart: response.data.currentPeriodStart || 0,
          cancelAtPeriodEnd: response.data.cancelAtPeriodEnd || false,
          canceledAt: response.data.canceledAt,
        });
      }
    } catch (error) {
      console.error('Error loading subscription details:', error);
      Alert.alert('Error', 'Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              await simplePaymentService.cancelSubscription();
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled. You will have access until the end of your current billing period.',
                [{ text: 'OK', onPress: () => loadSubscriptionDetails() }]
              );
            } catch (error) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsActionLoading(true);
      await simplePaymentService.reactivateSubscription();
      Alert.alert(
        'Subscription Reactivated',
        'Your subscription has been reactivated successfully!',
        [{ text: 'OK', onPress: () => loadSubscriptionDetails() }]
      );
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#A9C3B1';
      case 'canceled':
      case 'cancelled':
        return '#E0C68B';
      case 'past_due':
        return '#E8B4B8';
      default:
        return '#C4B8DD';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'canceled':
      case 'cancelled':
        return 'Canceled';
      case 'past_due':
        return 'Past Due';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E0C68B" />
          <Text style={styles.loadingText}>Loading subscription details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Subscription Details</Text>
        </View>

        <View style={styles.content}>
          {/* Plan Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plan Type:</Text>
              <Text style={styles.infoValue}>{subscriptionDetails?.tier || 'Unknown'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: getStatusColor(subscriptionDetails?.status || '') }]}>
                {getStatusText(subscriptionDetails?.status || '')}
              </Text>
            </View>
          </View>

          {/* Billing Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Billing Date:</Text>
              <Text style={styles.infoValue}>
                {formatDate(subscriptionDetails?.currentPeriodStart || 0)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Renewal Date:</Text>
              <Text style={styles.infoValue}>
                {formatDate(subscriptionDetails?.currentPeriodEnd || 0)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            {subscriptionDetails?.status === 'active' && !subscriptionDetails?.cancelAtPeriodEnd && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelSubscription}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                )}
              </TouchableOpacity>
            )}

            {subscriptionDetails?.cancelAtPeriodEnd && (
              <TouchableOpacity
                style={[styles.actionButton, styles.reactivateButton]}
                onPress={handleReactivateSubscription}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.reactivateButtonText}>Reactivate Subscription</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Cancelation Note */}
            {subscriptionDetails?.cancelAtPeriodEnd && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteText}>
                  If you cancel now, you can still access your subscription until{' '}
                  <Text style={styles.noteHighlight}>
                    {formatDate(subscriptionDetails?.currentPeriodEnd || 0)}
                  </Text>
                  .
                </Text>
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#C4B8DD',
    fontSize: 16,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#E0C68B',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    color: '#E0C68B',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#F9F8F4',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.2)',
  },
  infoLabel: {
    fontSize: 16,
    color: '#C4B8DD',
  },
  infoValue: {
    fontSize: 16,
    color: '#F9F8F4',
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#E8B4B8',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactivateButton: {
    backgroundColor: '#A9C3B1',
  },
  reactivateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContainer: {
    backgroundColor: 'rgba(224, 198, 139, 0.1)',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E0C68B',
  },
  noteText: {
    color: '#C4B8DD',
    fontSize: 14,
    lineHeight: 20,
  },
  noteHighlight: {
    color: '#E0C68B',
    fontWeight: 'bold',
  },
});

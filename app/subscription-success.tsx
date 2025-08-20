import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { usePayment } from '../utils/paymentContext';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 768;

export default function SubscriptionSuccessScreen() {
  const { subscriptionStatus } = usePayment();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Log when success screen loads
  useEffect(() => {
    console.log('🎉 SUBSCRIPTION SUCCESS SCREEN LOADED');
    console.log('📊 Current subscription status:', subscriptionStatus);
  }, []);

  useEffect(() => {
    // Animate in the success screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      console.log('⏰ Auto-navigating to main app after 3 seconds');
      router.replace('/(tabs)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    console.log('👆 User clicked continue button');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>You're Pro!</Text>
          <Text style={styles.subtitle}>Enjoy unlimited access</Text>
          <Text style={styles.description}>
            Welcome to AusOuris Premium! You now have access to unlimited coaching sessions, 
            personalized wellness guidance, and all premium features.
          </Text>
        </View>

        {/* Subscription Details */}
        {subscriptionStatus && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan:</Text>
              <Text style={styles.detailValue}>{subscriptionStatus.tier} Plan</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>Active</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next billing:</Text>
              <Text style={styles.detailValue}>
                {new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>

        {/* Auto-navigate indicator */}
        <Text style={styles.autoNavigateText}>
          Automatically continuing in a few seconds...
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  checkmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A9C3B1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmark: {
    fontSize: 50,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: isSmallScreen ? 32 : 36,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallScreen ? 18 : 20,
    color: '#A9C3B1',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#C4B8DD',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : 24,
    paddingHorizontal: 10,
  },
  detailsContainer: {
    backgroundColor: 'rgba(169, 195, 177, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.2)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#C4B8DD',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#F9F8F4',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#E0C68B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
    textAlign: 'center',
  },
  autoNavigateText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

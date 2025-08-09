import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { simplePaymentService } from '../utils/simplePaymentService';
import { SIMPLE_PRODUCTS } from '../utils/stripeSimpleConfig';

export default function SimplePaymentScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const { confirmPayment } = useStripe();

  const handlePayment = async (productId: keyof typeof SIMPLE_PRODUCTS) => {
    try {
      setIsLoading(true);
      
      const product = simplePaymentService.getProduct(productId);
      console.log('💳 Processing payment for:', product.name);
      
      // Step 1: Create payment intent on backend
      const paymentIntent = await simplePaymentService.createPaymentIntent(product.price);
      
      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await confirmPayment(
        paymentIntent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        console.error('❌ Payment failed:', error);
        Alert.alert('Payment Failed', error.message);
      } else {
        console.log('✅ Payment successful:', confirmedPaymentIntent);
        Alert.alert('Payment Successful', `Thank you for subscribing to ${product.name}!`);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscription = async (productId: keyof typeof SIMPLE_PRODUCTS) => {
    try {
      setIsLoading(true);
      
      const product = simplePaymentService.getProduct(productId);
      console.log('🔄 Creating subscription for:', product.name);
      
      // Create subscription (this will redirect to Stripe checkout)
      const subscription = await simplePaymentService.createSubscription(product.priceId);
      
      if (subscription.checkoutUrl) {
        Alert.alert(
          'Subscription Created',
          'Please complete your subscription in the browser.',
          [
            {
              text: 'OK',
              onPress: () => {
                // You could open the checkout URL here
                console.log('Checkout URL:', subscription.checkoutUrl);
              },
            },
          ]
        );
      } else {
        Alert.alert('Subscription Created', `Welcome to ${product.name}!`);
      }
    } catch (error) {
      console.error('❌ Subscription error:', error);
      Alert.alert('Error', 'Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Simple Stripe Integration</Text>
          <Text style={styles.subtitle}>Test Payment Flow</Text>
          {simplePaymentService.isTestMode() && (
            <View style={styles.testModeBadge}>
              <Text style={styles.testModeText}>TEST MODE</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Cards</Text>
          <Text style={styles.sectionDescription}>
            Use these test card numbers:
          </Text>
          <View style={styles.testCards}>
            <Text style={styles.testCard}>Success: 4242 4242 4242 4242</Text>
            <Text style={styles.testCard}>Declined: 4000 0000 0000 0002</Text>
            <Text style={styles.testCard}>CVC: Any 3 digits</Text>
            <Text style={styles.testCard}>Expiry: Any future date</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <CardField
            postalCodeEnabled={false}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardField}
            style={styles.cardFieldContainer}
            onCardChange={(cardDetails) => {
              setCardComplete(cardDetails.complete);
            }}
          />
        </View>

                  <View style={styles.section}>
            <Text style={styles.sectionTitle}>Starter Plan</Text>
            
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>Starter Plan</Text>
                <Text style={styles.productPrice}>$9.99</Text>
                <Text style={styles.productDescription}>Basic coaching features</Text>
              </View>
              
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.button, styles.payButton]}
                  onPress={() => handlePayment('starter')}
                  disabled={isLoading || !cardComplete}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Pay Now</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.subscribeButton]}
                  onPress={() => handleSubscription('starter')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Subscribe</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C4B8DD',
  },
  testModeBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  testModeText: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 221, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#C4B8DD',
    marginBottom: 16,
  },
  testCards: {
    gap: 8,
  },
  testCard: {
    fontSize: 12,
    color: '#A9C3B1',
    fontFamily: 'monospace',
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 8,
  },
  cardField: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  productCard: {
    backgroundColor: 'rgba(224, 198, 139, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(224, 198, 139, 0.3)',
  },
  productInfo: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#C4B8DD',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#A9C3B1',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#E0C68B',
  },
  subscribeButton: {
    backgroundColor: '#A9C3B1',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
});

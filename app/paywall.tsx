import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaywallScreen() {
  const handleSubscribe = () => {
    // In a real app, this would handle payment processing
    router.push('/(tabs)');
  };

  const handleSkip = () => {
    // Navigate to main app with limited access
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.phoneContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>AusOuris</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Choose Your Plan</Text>
            
            <View style={styles.pricingCard}>
              <Text style={styles.price}>$9.99/month</Text>
              
              <View style={styles.features}>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Unlimited AI coaching sessions</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Voice & text chat</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Goal tracking & analytics</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>Priority support</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSubscribe}>
                <Text style={styles.btnPrimaryText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.btnSecondary} onPress={handleSkip}>
              <Text style={styles.btnSecondaryText}>Skip for now (3 free sessions)</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#E0C68B',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  pricingCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#C4B8DD',
    width: '100%',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 20,
    textAlign: 'center',
  },
  features: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkmark: {
    color: '#A9C3B1',
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16,
  },
  featureText: {
    color: '#C4B8DD',
    fontSize: 16,
    flex: 1,
  },
  btnPrimary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
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
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
  },
  btnSecondary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4B8DD',
    textAlign: 'center',
  },
}); 
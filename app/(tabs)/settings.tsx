import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
} from 'react-native';
import { usePayment } from '../../utils/paymentContext';
import { useAuth } from '../../utils/authContext';
import { notificationService } from '../../utils/notificationService';

export default function SettingsScreen() {
  const { subscriptionStatus, isLoading } = usePayment();
  const { user, logout } = useAuth();

  const handleSettingPress = (setting: string) => {
    if (setting === 'Profile') {
      router.push('/profile');
    } else if (setting === 'Privacy') {
      const privacyUrl = 'https://heady-mapusaurus-720.notion.site/Privacy-Policy-2329c5c9eb10808bbd28c0a913a75ce8?pvs=143';
      Linking.openURL(privacyUrl).catch((err) => {
        Alert.alert('Error', 'Unable to open Privacy Policy');
      });
    } else if (setting === 'Help & Support') {
      const supportEmail = 'ousauris@gmail.com';
      const subject = 'OusAuris App Support';
      const body = 'Hello,\n\nI need help with the OusAuris app.\n\n[Please describe your issue here]';
      const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      Linking.openURL(mailtoUrl).catch((err) => {
        Alert.alert('Error', 'Unable to open email app. Please email us at ousauris@gmail.com');
      });
    } else {
      Alert.alert('Coming Soon', `${setting} will be available soon`);
    }
  };

  const handleSubscriptionPress = () => {
    if (subscriptionStatus?.isActive) {
      // Show subscription details
      Alert.alert(
        'Subscription Details',
        `Plan: ${subscriptionStatus.tier}\nStatus: ${subscriptionStatus.status}\nRenews: ${new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString()}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Manage Subscription', 
            onPress: () => {
              // Navigate to subscription management
              Alert.alert('Coming Soon', 'Subscription management will be available soon');
            }
          }
        ]
      );
    } else {
      // Navigate to paywall
      router.push('/paywall');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to log in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              console.log('User signed out successfully');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };



  const getSubscriptionText = () => {
    if (isLoading) {
      return 'Loading...';
    }
    if (subscriptionStatus?.isActive) {
      return `${subscriptionStatus.tier} Plan (Active)`;
    }
    return 'No Active Subscription';
  };

  const getSubscriptionColor = () => {
    if (isLoading) {
      return '#C4B8DD';
    }
    if (subscriptionStatus?.isActive) {
      return '#A9C3B1';
    }
    return '#E0C68B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Settings</Text>
          {user && (
            <Text style={styles.userInfo}>
              {user.first_name} {user.last_name}
            </Text>
          )}
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Profile')}
          >
            <Text style={styles.settingsText}>Profile</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Privacy')}
          >
            <Text style={styles.settingsText}>Privacy</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={handleSubscriptionPress}
          >
            <Text style={styles.settingsText}>Subscription</Text>
            <Text style={[styles.subscriptionStatus, { color: getSubscriptionColor() }]}>
              {getSubscriptionText()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Help & Support')}
          >
            <Text style={styles.settingsText}>Help & Support</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingsItem, styles.lastItem]}
            onPress={handleSignOut}
          >
            <Text style={[styles.settingsText, styles.signOutText]}>Sign Out</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#E0C68B',
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 16,
    color: '#C4B8DD',
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.2)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingsText: {
    fontSize: 16,
    color: '#F9F8F4',
  },
  subscriptionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  signOutText: {
    color: '#E0C68B',
  },
  arrow: {
    fontSize: 16,
    color: '#C4B8DD',
  },
}); 
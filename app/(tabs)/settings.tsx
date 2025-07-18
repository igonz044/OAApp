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
} from 'react-native';

export default function SettingsScreen() {
  const handleSettingPress = (setting: string) => {
    Alert.alert('Coming Soon', `${setting} will be available soon`);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to log in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            console.log('User confirmed sign out, navigating to login...');
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Settings</Text>
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
            onPress={() => handleSettingPress('Notifications')}
          >
            <Text style={styles.settingsText}>Notifications</Text>
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
            onPress={() => handleSettingPress('Subscription')}
          >
            <Text style={styles.settingsText}>Subscription</Text>
            <Text style={styles.arrow}>→</Text>
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
  signOutText: {
    color: '#E0C68B',
  },
  arrow: {
    fontSize: 16,
    color: '#C4B8DD',
  },
}); 
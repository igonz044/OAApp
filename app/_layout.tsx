import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { initializeTimezone } from '../utils/timezone';
import { SessionProvider } from '../utils/sessionContext';
import { SessionsProvider } from '../utils/sessionsContext';
import { PaymentProvider } from '../utils/paymentContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Initialize timezone when app loads
      initializeTimezone().catch(console.error);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaymentProvider>
      <SessionProvider>
        <SessionsProvider>
          <StatusBar style="light" backgroundColor="#2E2C58" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.container,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="paywall" />
            <Stack.Screen name="payment-checkout" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="goal-selection" />
            <Stack.Screen name="session-type" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="review" />
            <Stack.Screen name="confirmation" />
          </Stack>
        </SessionsProvider>
      </SessionProvider>
    </PaymentProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E2C58',
  },
});

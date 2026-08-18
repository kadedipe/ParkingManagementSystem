// ============================================================================
// App - Main Application Component
// ============================================================================

// parking-management-system/mobile/src/App.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  StatusBar,
  LogBox,
  Platform,
  AppState,
  AppStateStatus,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Sentry from 'sentry-expo';

// Redux Store
import { store, persistor } from './store';

// Navigation
import AppNavigator from './navigation/AppNavigator';
import { NavigationService } from './navigation/NavigationService';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BookingProvider } from './contexts/BookingContext';

// Hooks
import { useAuth, useAppState, useNetwork } from './hooks';

// Constants
import { APP_CONSTANTS } from './utils/constants';

// Styles
import { COLORS } from './constants/colors';

// Services
import WebsocketService from './api/services/websocket.service';
import { FontLoader } from './assets/fonts/loader';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Remote debugger',
  'Require cycle:',
  'Possible Unhandled Promise Rejection',
  'Setting a timer',
]);

// Initialize Sentry
if (APP_CONSTANTS.ENVIRONMENT !== 'development') {
  Sentry.init({
    dsn: APP_CONSTANTS.SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: false,
  });
}

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

interface AppProps {
  skipLoading?: boolean;
}

const AppContent = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const appState = useRef(AppState.currentState);
  const { isConnected } = useNetwork();

  useEffect(() => {
    initializeApp();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Load fonts
      setLoadingMessage('Loading fonts...');
      await FontLoader.loadFonts({
        onProgress: (progress) => {
          console.log(`Font loading progress: ${progress}%`);
        },
        onComplete: () => {
          console.log('Fonts loaded successfully');
        },
        onError: (error) => {
          console.error('Error loading fonts:', error);
        },
      });
      setFontsLoaded(true);

      // Initialize WebSocket
      setLoadingMessage('Connecting to services...');
      await initializeWebSocket();

      // Register for push notifications
      setLoadingMessage('Setting up notifications...');
      await registerForPushNotifications();

      // Mark app as ready
      setAppReady(true);

      // Hide splash screen
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error initializing app:', error);
      // Still hide splash screen to prevent getting stuck
      await SplashScreen.hideAsync();
    }
  };

  const initializeWebSocket = async () => {
    try {
      const tokens = await Storage.getAuthTokens();
      if (tokens) {
        const user = await Storage.getUserData();
        if (user) {
          WebsocketService.initialize(tokens.accessToken, user.id);
        }
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push notification token:', token);

      // Store token for later use
      await Storage.setNotificationToken(token);

      // Register token with server (if user is authenticated)
      const user = await Storage.getUserData();
      if (user) {
        await notificationService.registerDevice({
          token,
          platform: Platform.OS,
          deviceId: Constants.deviceId,
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      console.log('App came to foreground');
      // Refresh data if needed
    }
    appState.current = nextAppState;
  };

  if (!fontsLoaded || !appReady) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.gray600 }}>
          {loadingMessage}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <AuthProvider>
          <NotificationProvider>
            <BookingProvider>
              <NavigationContainer
                ref={NavigationService.setTopLevelNavigator}
                theme={{
                  colors: {
                    primary: COLORS.primary,
                    background: COLORS.background,
                    card: '#FFFFFF',
                    text: COLORS.text,
                    border: COLORS.border,
                  },
                }}
              >
                <AppNavigator />
                {!isConnected && (
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: COLORS.danger,
                    padding: 8,
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                      No internet connection
                    </Text>
                  </View>
                )}
              </NavigationContainer>
            </BookingProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

/**
 * Main App Component
 */
const App: React.FC<AppProps> = ({ skipLoading = false }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
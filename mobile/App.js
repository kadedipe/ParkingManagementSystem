// ============================================================================
// App Entry Point
// ============================================================================

/**
 * Main App component for the Parking Management System mobile app.
 * 
 * This component sets up:
 * - Navigation container
 * - Redux store with persistence
 * - Theme provider
 * - Authentication state
 * - Notification handling
 * - Deep linking
 * - Error boundaries
 * - Performance monitoring
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  LogBox,
  AppState,
  Platform,
  YellowBox,
} from 'react-native';
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

// Import store
import { store, persistor } from './src/store';

// Import navigation
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef, onNavigationReady } from './src/navigation/RootNavigation';

// Import contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { SocketProvider } from './src/contexts/SocketContext';

// Import components
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { NetworkStatus } from './src/components/common/NetworkStatus';

// Import utils
import { configurePushNotifications } from './src/utils/notifications';
import { trackAppOpen, trackScreenView } from './src/utils/analytics';
import { initSentry } from './src/utils/sentry';
import { getDeepLink } from './src/utils/deepLinking';
import { logger } from './src/utils/logger';

// Import constants
import { COLORS, THEME } from './src/constants/theme';
import { APP } from './src/constants/app';

// ============================================================================
// Ignore Warnings (Development Only)
// ============================================================================

if (__DEV__) {
  LogBox.ignoreLogs([
    'Remote debugger',
    'Warning: ...',
    'Require cycle:',
    'VirtualizedList:',
    'ViewPropTypes will be removed',
    'ColorPropType will be removed',
    'Sending `onAnimatedValueUpdate` with no listeners',
    '`new NativeEventEmitter()` was called with a non-null argument',
  ]);
  
  // Ignore YellowBox warnings
  YellowBox.ignoreWarnings([
    'Require cycle:',
    'ViewPropTypes will be removed',
  ]);
}

// ============================================================================
// React Query Client
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: !__DEV__,
      refetchOnReconnect: true,
      keepPreviousData: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================================================
// Main App Component
// ============================================================================

const App = () => {
  // ==========================================================================
  // State
  // ==========================================================================

  const [isLoading, setIsLoading] = useState(true);
  const [isNetworkConnected, setIsNetworkConnected] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [initialRoute, setInitialRoute] = useState(null);

  // ==========================================================================
  // Color Scheme
  // ==========================================================================

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // ==========================================================================
  // Theme
  // ==========================================================================

  const paperTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      accent: COLORS.accent,
      error: COLORS.error,
      warning: COLORS.warning,
      info: COLORS.info,
      success: COLORS.success,
    },
  };

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        handleAppForeground();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Handle network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsNetworkConnected(state.isConnected);
      if (state.isConnected) {
        handleNetworkReconnect();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ==========================================================================
  // Initialization Functions
  // ==========================================================================

  const initializeApp = async () => {
    try {
      logger.info('Initializing app...');

      // Initialize Sentry (if configured)
      await initSentry();

      // Configure push notifications
      configurePushNotifications();

      // Request notification permissions
      await requestNotificationPermissions();

      // Check for deep link
      const deepLink = await getDeepLink();
      if (deepLink) {
        setInitialRoute(deepLink);
      }

      // Track app open
      trackAppOpen();

      // Log app info
      logger.info('App initialized successfully', {
        version: APP.VERSION,
        environment: APP.ENVIRONMENT,
        platform: Platform.OS,
        platformVersion: Platform.Version,
      });

    } catch (error) {
      logger.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // Notification Functions
  // ==========================================================================

  const requestNotificationPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          logger.info('Notification permissions granted');
        } else {
          logger.warn('Notification permissions denied');
        }
      } else {
        // Android auto requests permissions
        const enabled = await messaging().hasPermission();
        if (!enabled) {
          await messaging().requestPermission();
        }
      }
    } catch (error) {
      logger.error('Failed to request notification permissions:', error);
    }
  };

  // ==========================================================================
  // App Event Handlers
  // ==========================================================================

  const handleAppForeground = () => {
    logger.info('App came to foreground');
    trackScreenView('foreground');
    // Refresh data if needed
  };

  const handleNetworkReconnect = () => {
    logger.info('Network reconnected');
    // Refresh data or retry failed requests
  };

  // ==========================================================================
  // Deep Linking
  // ==========================================================================

  const linking = {
    prefixes: [
      'parkingsystem://',
      'https://parking-system.com',
      'https://api.parking-system.com',
    ],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Register: 'register',
            ForgotPassword: 'forgot-password',
            ResetPassword: 'reset-password/:token',
          },
        },
        Main: {
          screens: {
            Dashboard: 'dashboard',
            Parking: {
              screens: {
                Search: 'parking/search',
                Details: 'parking/:id',
                Booking: 'parking/booking/:id',
              },
            },
            Charging: {
              screens: {
                Stations: 'charging/stations',
                Session: 'charging/session/:id',
              },
            },
            Profile: 'profile',
            Bookings: 'bookings',
            BookingDetails: 'bookings/:id',
            VehicleDetails: 'vehicles/:id',
            Payment: 'payment',
            PaymentSuccess: 'payment/success',
            PaymentCancel: 'payment/cancel',
          },
        },
        NotFound: '*',
      },
    },
    getStateFromPath: async (path) => {
      // Custom path handling if needed
      return null;
    },
  };

  // ==========================================================================
  // Render Loading State
  // ==========================================================================

  if (isLoading) {
    return <LoadingScreen />;
  }

  // ==========================================================================
  // Render App
  // ==========================================================================

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <PersistGate
          loading={<LoadingScreen />}
          persistor={persistor}
        >
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <PaperProvider theme={paperTheme}>
                  <ThemeProvider>
                    <AuthProvider>
                      <NotificationProvider>
                        <SocketProvider>
                          <NavigationContainer
                            ref={navigationRef}
                            onReady={onNavigationReady}
                            linking={linking}
                            theme={{
                              colors: {
                                background: isDarkMode ? '#121212' : '#f5f5f5',
                                card: isDarkMode ? '#1e1e1e' : '#ffffff',
                                text: isDarkMode ? '#ffffff' : '#1a1a1a',
                                border: isDarkMode ? '#333333' : '#e0e0e0',
                                primary: COLORS.primary,
                              },
                            }}
                          >
                            <StatusBar
                              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                              backgroundColor="transparent"
                              translucent
                            />
                            <SafeAreaView style={{ flex: 1 }}>
                              <AppNavigator initialRoute={initialRoute} />
                              <NetworkStatus />
                            </SafeAreaView>
                          </NavigationContainer>
                        </SocketProvider>
                      </NotificationProvider>
                    </AuthProvider>
                  </ThemeProvider>
                </PaperProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </QueryClientProvider>
        </PersistGate>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

// ============================================================================
// Export
// ============================================================================

export default App;
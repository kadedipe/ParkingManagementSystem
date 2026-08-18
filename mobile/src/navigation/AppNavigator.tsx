// ============================================================================
// AppNavigator - Main Application Navigator
// ============================================================================

// parking-management-system/mobile/src/navigation/AppNavigator.tsx

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, ROUTES } from '../constants';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ParkingScreen from '../screens/main/ParkingScreen';
import ChargingScreen from '../screens/main/ChargingScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Parking Screens
import ParkingDetailsScreen from '../screens/parking/ParkingDetailsScreen';
import ParkingMapScreen from '../screens/parking/ParkingMapScreen';
import ParkingSpotSelectorScreen from '../screens/parking/ParkingSpotSelectorScreen';
import ParkingReviewsScreen from '../screens/parking/ParkingReviewsScreen';
import AddParkingReviewScreen from '../screens/parking/AddParkingReviewScreen';

// Charging Screens
import ChargingDetailsScreen from '../screens/charging/ChargingDetailsScreen';
import ChargingSessionScreen from '../screens/charging/ChargingSessionScreen';
import ChargingHistoryScreen from '../screens/charging/ChargingHistoryScreen';
import ChargingReservationScreen from '../screens/charging/ChargingReservationScreen';

// Booking Screens
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import CreateBookingScreen from '../screens/booking/CreateBookingScreen';
import ConfirmBookingScreen from '../screens/booking/ConfirmBookingScreen';
import BookingQRCodeScreen from '../screens/booking/BookingQRCodeScreen';

// Payment Screens
import PaymentMethodsScreen from '../screens/payment/PaymentMethodsScreen';
import ProcessPaymentScreen from '../screens/payment/ProcessPaymentScreen';
import PaymentHistoryScreen from '../screens/payment/PaymentHistoryScreen';
import PaymentReceiptScreen from '../screens/payment/PaymentReceiptScreen';
import WalletScreen from '../screens/payment/WalletScreen';

// Profile Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileVehiclesScreen from '../screens/profile/ProfileVehiclesScreen';
import AddVehicleScreen from '../screens/profile/AddVehicleScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import LoyaltyScreen from '../screens/profile/LoyaltyScreen';

// Notification Screens
import NotificationListScreen from '../screens/notification/NotificationListScreen';
import NotificationDetailsScreen from '../screens/notification/NotificationDetailsScreen';

// Common Screens
import LoadingScreen from '../screens/common/LoadingScreen';
import ErrorScreen from '../screens/common/ErrorScreen';
import NotFoundScreen from '../screens/common/NotFoundScreen';

// Types
import { RootStackParamList, RootTabParamList } from './types';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Main Tab Navigator
 */
const MainTabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? colors.background : '#FFFFFF',
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: TYPOGRAPHY.fontFamily.medium,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.APP.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name={focused ? 'home' : 'home'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.APP.PARKING}
        component={ParkingScreen}
        options={{
          tabBarLabel: 'Parking',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name={focused ? 'grid' : 'grid'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.APP.CHARGING}
        component={ChargingScreen}
        options={{
          tabBarLabel: 'Charging',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name={focused ? 'zap' : 'zap'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.APP.BOOKINGS}
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name={focused ? 'calendar' : 'calendar'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.APP.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name={focused ? 'user' : 'user'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Auth Stack Navigator
 */
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name={ROUTES.ONBOARDING.WELCOME} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.AUTH.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.AUTH.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name={ROUTES.AUTH.RESET_PASSWORD} component={ResetPasswordScreen} />
      <Stack.Screen name={ROUTES.AUTH.VERIFY_EMAIL} component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
};

/**
 * Main App Stack Navigator
 */
const AppStackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Parking Screens */}
      <Stack.Screen
        name={ROUTES.PARKING.DETAILS}
        component={ParkingDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Parking Details',
          headerBackTitle: 'Back',
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.MAP}
        component={ParkingMapScreen}
        options={{
          headerShown: true,
          headerTitle: 'Parking Map',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.SPOT_SELECTOR}
        component={ParkingSpotSelectorScreen}
        options={{
          headerShown: true,
          headerTitle: 'Select Spot',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.REVIEWS}
        component={ParkingReviewsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Reviews',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.ADD_REVIEW}
        component={AddParkingReviewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Add Review',
          headerBackTitle: 'Back',
        }}
      />

      {/* Charging Screens */}
      <Stack.Screen
        name={ROUTES.CHARGING.DETAILS}
        component={ChargingDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Charging Station',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.CHARGING.SESSION}
        component={ChargingSessionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Charging Session',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.CHARGING.HISTORY}
        component={ChargingHistoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Charging History',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.CHARGING.RESERVATION}
        component={ChargingReservationScreen}
        options={{
          headerShown: true,
          headerTitle: 'Reserve Station',
          headerBackTitle: 'Back',
        }}
      />

      {/* Booking Screens */}
      <Stack.Screen
        name={ROUTES.BOOKING.DETAILS}
        component={BookingDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Booking Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING.CREATE}
        component={CreateBookingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Booking',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING.CONFIRM}
        component={ConfirmBookingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Confirm Booking',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING.QR_CODE}
        component={BookingQRCodeScreen}
        options={{
          headerShown: true,
          headerTitle: 'QR Code',
          headerBackTitle: 'Back',
        }}
      />

      {/* Payment Screens */}
      <Stack.Screen
        name={ROUTES.PAYMENT.METHODS}
        component={PaymentMethodsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Methods',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.PROCESS}
        component={ProcessPaymentScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.HISTORY}
        component={PaymentHistoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment History',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.RECEIPT}
        component={PaymentReceiptScreen}
        options={{
          headerShown: true,
          headerTitle: 'Receipt',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.WALLET}
        component={WalletScreen}
        options={{
          headerShown: true,
          headerTitle: 'Wallet',
          headerBackTitle: 'Back',
        }}
      />

      {/* Profile Screens */}
      <Stack.Screen
        name={ROUTES.PROFILE.EDIT}
        component={EditProfileScreen}
        options={{
          headerShown: true,
          headerTitle: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.VEHICLES}
        component={ProfileVehiclesScreen}
        options={{
          headerShown: true,
          headerTitle: 'My Vehicles',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.ADD_VEHICLE}
        component={AddVehicleScreen}
        options={{
          headerShown: true,
          headerTitle: 'Add Vehicle',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.SETTINGS}
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          headerTitle: 'Change Password',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.NOTIFICATION_SETTINGS}
        component={NotificationSettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.LOYALTY}
        component={LoyaltyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Loyalty Points',
          headerBackTitle: 'Back',
        }}
      />

      {/* Notification Screens */}
      <Stack.Screen
        name={ROUTES.NOTIFICATION.LIST}
        component={NotificationListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name={ROUTES.NOTIFICATION.DETAILS}
        component={NotificationDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notification',
          headerBackTitle: 'Back',
        }}
      />

      {/* Common Screens */}
      <Stack.Screen
        name={ROUTES.COMMON.LOADING}
        component={LoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.COMMON.ERROR}
        component={ErrorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.COMMON.NOT_FOUND}
        component={NotFoundScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

/**
 * Root Navigator - Decides which navigator to show based on auth state
 */
const RootNavigator = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const { colors, isDark } = useTheme();

  // Show loading screen while checking auth
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

/**
 * Main App Navigator
 */
const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default AppNavigator;
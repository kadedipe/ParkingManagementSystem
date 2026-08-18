// ============================================================================
// MainStack - Main Application Stack Navigator
// ============================================================================

// parking-management-system/mobile/src/navigation/MainStack.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES } from '../constants/routes';

// Main Tabs
import MainTabs from './MainTabs';

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

// Types
import { MainStackParamList } from './types';

// Create stack navigator
const Stack = createStackNavigator<MainStackParamList>();

/**
 * Main Stack Navigator - Handles all authenticated app screens
 */
export const MainStack = () => {
  const { colors, isDark } = useTheme();

  // Default screen options
  const defaultScreenOptions = {
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: colors.primary,
    headerStyle: {
      backgroundColor: colors.background,
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTitleStyle: {
      fontWeight: '600',
    },
    cardStyle: {
      backgroundColor: colors.background,
    },
    gestureEnabled: true,
    ...Platform.select({
      ios: {
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontSize: 16,
        },
        ...TransitionPresets.SlideFromRightIOS,
      },
      android: {
        headerBackTitle: '',
        ...TransitionPresets.FadeFromBottomAndroid,
      },
    }),
  };

  // Modal screen options
  const modalScreenOptions = {
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: colors.primary,
    headerStyle: {
      backgroundColor: colors.background,
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTitleStyle: {
      fontWeight: '600',
    },
    cardStyle: {
      backgroundColor: colors.background,
    },
    presentation: 'modal' as const,
    ...Platform.select({
      ios: {
        ...TransitionPresets.ModalSlideFromBottomIOS,
      },
      android: {
        ...TransitionPresets.FadeFromBottomAndroid,
      },
    }),
  };

  // No header options
  const noHeaderOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={defaultScreenOptions}
    >
      {/* Main Tabs */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={noHeaderOptions}
      />

      {/* Parking Screens */}
      <Stack.Screen
        name={ROUTES.PARKING.DETAILS}
        component={ParkingDetailsScreen}
        options={{
          headerTitle: 'Parking Details',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.MAP}
        component={ParkingMapScreen}
        options={{
          headerTitle: 'Parking Map',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.SPOT_SELECTOR}
        component={ParkingSpotSelectorScreen}
        options={{
          headerTitle: 'Select Parking Spot',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.REVIEWS}
        component={ParkingReviewsScreen}
        options={{
          headerTitle: 'Reviews',
        }}
      />
      <Stack.Screen
        name={ROUTES.PARKING.ADD_REVIEW}
        component={AddParkingReviewScreen}
        options={modalScreenOptions}
      />

      {/* Charging Screens */}
      <Stack.Screen
        name={ROUTES.CHARGING.DETAILS}
        component={ChargingDetailsScreen}
        options={{
          headerTitle: 'Charging Station',
        }}
      />
      <Stack.Screen
        name={ROUTES.CHARGING.SESSION}
        component={ChargingSessionScreen}
        options={{
          headerTitle: 'Charging Session',
        }}
      />
      <Stack.Screen
        name={ROUTES.CHARGING.HISTORY}
        component={ChargingHistoryScreen}
        options={{
          headerTitle: 'Charging History',
        }}
      />
      <Stack.Screen
        name={ROUTES.CHARGING.RESERVATION}
        component={ChargingReservationScreen}
        options={{
          headerTitle: 'Reserve Charging Station',
        }}
      />

      {/* Booking Screens */}
      <Stack.Screen
        name={ROUTES.BOOKING.DETAILS}
        component={BookingDetailsScreen}
        options={{
          headerTitle: 'Booking Details',
        }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING.CREATE}
        component={CreateBookingScreen}
        options={{
          headerTitle: 'Create Booking',
        }}
      />
      <Stack.Screen
        name={ROUTES.BOOKING.CONFIRM}
        component={ConfirmBookingScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.BOOKING.QR_CODE}
        component={BookingQRCodeScreen}
        options={modalScreenOptions}
      />

      {/* Payment Screens */}
      <Stack.Screen
        name={ROUTES.PAYMENT.METHODS}
        component={PaymentMethodsScreen}
        options={{
          headerTitle: 'Payment Methods',
        }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.PROCESS}
        component={ProcessPaymentScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.HISTORY}
        component={PaymentHistoryScreen}
        options={{
          headerTitle: 'Payment History',
        }}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.RECEIPT}
        component={PaymentReceiptScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT.WALLET}
        component={WalletScreen}
        options={{
          headerTitle: 'Wallet',
        }}
      />

      {/* Profile Screens */}
      <Stack.Screen
        name={ROUTES.PROFILE.EDIT}
        component={EditProfileScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.VEHICLES}
        component={ProfileVehiclesScreen}
        options={{
          headerTitle: 'My Vehicles',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.ADD_VEHICLE}
        component={AddVehicleScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.SETTINGS}
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.NOTIFICATION_SETTINGS}
        component={NotificationSettingsScreen}
        options={{
          headerTitle: 'Notification Settings',
        }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.LOYALTY}
        component={LoyaltyScreen}
        options={{
          headerTitle: 'Loyalty Points',
        }}
      />

      {/* Notification Screens */}
      <Stack.Screen
        name={ROUTES.NOTIFICATION.LIST}
        component={NotificationListScreen}
        options={{
          headerTitle: 'Notifications',
        }}
      />
      <Stack.Screen
        name={ROUTES.NOTIFICATION.DETAILS}
        component={NotificationDetailsScreen}
        options={{
          headerTitle: 'Notification',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
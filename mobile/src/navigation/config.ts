// ============================================================================
// Navigation Config - Navigation Configuration
// ============================================================================

// parking-management-system/mobile/src/navigation/config.ts

import { HeaderStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { COLORS } from '../constants';

/**
 * Default screen options for stack navigator
 */
export const stackScreenOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerTintColor: COLORS.primary,
  headerTitleStyle: {
    fontWeight: '600',
  },
  headerStyle: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'transparent',
    elevation: 0,
  },
  cardStyle: {
    backgroundColor: '#FFFFFF',
  },
  gestureEnabled: true,
  ...Platform.select({
    ios: {
      headerBackTitle: 'Back',
      headerBackTitleStyle: {
        fontSize: 16,
      },
    },
    android: {
      headerBackTitle: '',
    },
  }),
};

/**
 * Modal screen options
 */
export const modalScreenOptions = {
  headerShown: true,
  presentation: 'modal',
  cardStyle: { backgroundColor: 'transparent' },
  cardOverlayEnabled: true,
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
};

/**
 * Transition configurations
 */
export const transitions = {
  slideFromRight: {
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: TransitionSpecs.TransitionIOSSpec,
      close: TransitionSpecs.TransitionIOSSpec,
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forSlideRight,
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
      const translateX = current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [layouts.screen.width, 0],
      });

      return {
        cardStyle: {
          transform: [{ translateX }],
        },
      };
    },
  },
  fade: {
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: TransitionSpecs.FadeInFromBottomAndroidSpec,
      close: TransitionSpecs.FadeOutToBottomAndroidSpec,
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
    cardStyleInterpolator: ({ current }: any) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
  },
  modal: {
    gestureDirection: 'vertical',
    transitionSpec: {
      open: TransitionSpecs.TransitionIOSSpec,
      close: TransitionSpecs.TransitionIOSSpec,
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forNoAnimation,
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    }),
  },
};

/**
 * Tab navigator options
 */
export const tabScreenOptions = {
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.textSecondary,
  tabBarShowLabel: true,
  tabBarStyle: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 85 : 65,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  tabBarHideOnKeyboard: true,
};

/**
 * Deep linking configuration
 */
export const deepLinkingConfig = {
  prefixes: ['parkingapp://', 'https://parkingapp.com'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ResetPassword: 'reset-password/:token',
      VerifyEmail: 'verify-email/:token',
      MainTabs: {
        screens: {
          Home: 'home',
          Parking: {
            screens: {
              ParkingDetails: 'parking/:parkingId',
              ParkingMap: 'map',
            },
          },
          Booking: {
            screens: {
              BookingDetails: 'booking/:bookingId',
            },
          },
        },
      },
    },
  },
};

/**
 * Protected routes that require authentication
 */
export const protectedRoutes = [
  'MainTabs',
  'ParkingDetails',
  'ParkingMap',
  'ParkingSpotSelector',
  'ParkingReviews',
  'AddParkingReview',
  'ChargingDetails',
  'ChargingSession',
  'ChargingHistory',
  'ChargingReservation',
  'BookingDetails',
  'CreateBooking',
  'ConfirmBooking',
  'BookingQRCode',
  'PaymentMethods',
  'ProcessPayment',
  'PaymentHistory',
  'PaymentReceipt',
  'Wallet',
  'EditProfile',
  'ProfileVehicles',
  'AddVehicle',
  'Settings',
  'ChangePassword',
  'NotificationSettings',
  'Loyalty',
  'NotificationList',
  'NotificationDetails',
];

export default {
  stackScreenOptions,
  modalScreenOptions,
  transitions,
  tabScreenOptions,
  deepLinkingConfig,
  protectedRoutes,
};
// ============================================================================
// Navigation Types - Type Definitions for Navigation
// ============================================================================

// parking-management-system/mobile/src/navigation/types.ts

import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ROUTES } from '../constants/routes';

// Root Stack Param List
export type RootStackParamList = {
  // Auth Stack
  [ROUTES.ONBOARDING.WELCOME]: undefined;
  [ROUTES.AUTH.LOGIN]: { redirectTo?: string; email?: string } | undefined;
  [ROUTES.AUTH.REGISTER]: { email?: string; referralCode?: string } | undefined;
  [ROUTES.AUTH.FORGOT_PASSWORD]: { email?: string } | undefined;
  [ROUTES.AUTH.RESET_PASSWORD]: { token: string } | undefined;
  [ROUTES.AUTH.VERIFY_EMAIL]: { token: string; email?: string } | undefined;

  // Main Tabs
  MainTabs: NavigatorScreenParams<RootTabParamList>;

  // Parking Screens
  [ROUTES.PARKING.DETAILS]: { parkingId: string; from?: string } | undefined;
  [ROUTES.PARKING.MAP]: { parkingId?: string } | undefined;
  [ROUTES.PARKING.SPOT_SELECTOR]: {
    parkingId: string;
    spots?: any[];
    maxSelectable?: number;
  } | undefined;
  [ROUTES.PARKING.REVIEWS]: { parkingId: string } | undefined;
  [ROUTES.PARKING.ADD_REVIEW]: { parkingId: string } | undefined;

  // Charging Screens
  [ROUTES.CHARGING.DETAILS]: { stationId: string } | undefined;
  [ROUTES.CHARGING.SESSION]: { sessionId: string } | undefined;
  [ROUTES.CHARGING.HISTORY]: undefined;
  [ROUTES.CHARGING.RESERVATION]: {
    stationId: string;
    startTime?: string;
  } | undefined;

  // Booking Screens
  [ROUTES.BOOKING.DETAILS]: { bookingId: string } | undefined;
  [ROUTES.BOOKING.CREATE]: {
    parkingId?: string;
    spotId?: string;
    startTime?: string;
    endTime?: string;
  } | undefined;
  [ROUTES.BOOKING.CONFIRM]: { bookingData: any } | undefined;
  [ROUTES.BOOKING.QR_CODE]: { bookingId: string } | undefined;

  // Payment Screens
  [ROUTES.PAYMENT.METHODS]: undefined;
  [ROUTES.PAYMENT.PROCESS]: {
    amount: number;
    bookingId?: string;
    currency?: string;
  } | undefined;
  [ROUTES.PAYMENT.HISTORY]: undefined;
  [ROUTES.PAYMENT.RECEIPT]: { paymentId: string } | undefined;
  [ROUTES.PAYMENT.WALLET]: undefined;

  // Profile Screens
  [ROUTES.PROFILE.EDIT]: { userId?: string } | undefined;
  [ROUTES.PROFILE.VEHICLES]: {
    selectMode?: boolean;
    onSelect?: (vehicle: any) => void;
  } | undefined;
  [ROUTES.PROFILE.ADD_VEHICLE]: { vehicleData?: any } | undefined;
  [ROUTES.PROFILE.SETTINGS]: undefined;
  [ROUTES.PROFILE.CHANGE_PASSWORD]: undefined;
  [ROUTES.PROFILE.NOTIFICATION_SETTINGS]: undefined;
  [ROUTES.PROFILE.LOYALTY]: undefined;

  // Notification Screens
  [ROUTES.NOTIFICATION.LIST]: undefined;
  [ROUTES.NOTIFICATION.DETAILS]: { notificationId: string } | undefined;

  // Common Screens
  [ROUTES.COMMON.LOADING]: undefined;
  [ROUTES.COMMON.ERROR]: { error: string; retry?: () => void } | undefined;
  [ROUTES.COMMON.NOT_FOUND]: { resource?: string } | undefined;
};

// Tab Param List
export type RootTabParamList = {
  [ROUTES.APP.HOME]: undefined;
  [ROUTES.APP.PARKING]: undefined;
  [ROUTES.APP.CHARGING]: undefined;
  [ROUTES.APP.BOOKINGS]: undefined;
  [ROUTES.APP.PROFILE]: undefined;
};

// Navigation Props Types
export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  StackNavigationProp<RootStackParamList, T>;

export type RootTabNavigationProp<T extends keyof RootTabParamList> =
  BottomTabNavigationProp<RootTabParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;

export type RootTabRouteProp<T extends keyof RootTabParamList> = RouteProp<
  RootTabParamList,
  T
>;

// Screen Props
export interface ScreenProps<T extends keyof RootStackParamList> {
  navigation: RootStackNavigationProp<T>;
  route: RootStackRouteProp<T>;
}

export interface TabScreenProps<T extends keyof RootTabParamList> {
  navigation: RootTabNavigationProp<T>;
  route: RootTabRouteProp<T>;
}

// Navigation Service Type
export interface NavigationService {
  navigate<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ): void;
  goBack(): void;
  resetTo<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ): void;
  push<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ): void;
  pop(count?: number): void;
  popToTop(): void;
}
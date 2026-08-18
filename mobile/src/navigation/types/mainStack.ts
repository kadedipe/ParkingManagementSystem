// ============================================================================
// MainStack Types - Type Definitions
// ============================================================================

// parking-management-system/mobile/src/navigation/types/mainStack.ts

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { MainTabParamList } from './mainTabs';

/**
 * Main Stack Param List
 */
export type MainStackParamList = {
  // Main Tabs
  MainTabs: NavigatorScreenParams<MainTabParamList>;

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
};

/**
 * Main Stack Navigation Prop
 */
export type MainStackNavigationProp<T extends keyof MainStackParamList> =
  StackNavigationProp<MainStackParamList, T>;

/**
 * Main Stack Route Prop
 */
export type MainStackRouteProp<T extends keyof MainStackParamList> =
  RouteProp<MainStackParamList, T>;

/**
 * Main Screen Props
 */
export interface MainScreenProps<T extends keyof MainStackParamList> {
  navigation: MainStackNavigationProp<T>;
  route: MainStackRouteProp<T>;
}

/**
 * Main Screen Props with No Params
 */
export type MainScreenWithoutParams<T extends keyof MainStackParamList> =
  MainScreenProps<T> & {
    route: Omit<MainStackRouteProp<T>, 'params'> & {
      params?: undefined;
    };
  };

export default MainStackParamList;
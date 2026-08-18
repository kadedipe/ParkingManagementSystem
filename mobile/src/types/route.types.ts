// ============================================================================
// Route Types - Navigation Type Definitions
// ============================================================================

// parking-management-system/mobile/src/types/route.types.ts

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

/**
 * Auth Stack Param List
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: { step?: number } | undefined;
  Login: { redirectTo?: string; email?: string } | undefined;
  Register: { email?: string; referralCode?: string } | undefined;
  ForgotPassword: { email?: string } | undefined;
  ResetPassword: { token: string } | undefined;
  VerifyEmail: { token: string; email?: string } | undefined;
  TwoFactorAuth: { email?: string; method?: string } | undefined;
  SocialLogin: { provider: string; token?: string } | undefined;
};

/**
 * Main Stack Param List
 */
export type MainStackParamList = {
  // Main Tabs
  MainTabs: undefined;
  
  // Parking Screens
  ParkingDetails: { parkingId: string; from?: string };
  ParkingMap: { parkingId?: string };
  ParkingSpotSelector: { parkingId: string; spots?: any[]; maxSelectable?: number };
  ParkingReviews: { parkingId: string };
  AddParkingReview: { parkingId: string };
  
  // Charging Screens
  ChargingDetails: { stationId: string };
  ChargingSession: { sessionId: string };
  ChargingHistory: undefined;
  ChargingReservation: { stationId: string; startTime?: string };
  
  // Booking Screens
  BookingDetails: { bookingId: string };
  CreateBooking: { parkingId?: string; spotId?: string; startTime?: string; endTime?: string };
  ConfirmBooking: { bookingData: any };
  BookingQRCode: { bookingId: string };
  
  // Payment Screens
  PaymentMethods: undefined;
  ProcessPayment: { amount: number; bookingId?: string; currency?: string };
  PaymentHistory: undefined;
  PaymentReceipt: { paymentId: string };
  Wallet: undefined;
  
  // Profile Screens
  EditProfile: { userId?: string };
  ProfileVehicles: { selectMode?: boolean; onSelect?: (vehicle: any) => void };
  AddVehicle: { vehicleData?: any };
  Settings: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  Loyalty: undefined;
  
  // Notification Screens
  NotificationList: undefined;
  NotificationDetails: { notificationId: string };
};

/**
 * Tab Param List
 */
export type TabParamList = {
  Home: undefined;
  Parking: undefined;
  Charging: undefined;
  Bookings: undefined;
  Profile: undefined;
};

/**
 * Navigation Props Types
 */
export type AuthStackNavigationProp<T extends keyof AuthStackParamList> = 
  StackNavigationProp<AuthStackParamList, T>;

export type MainStackNavigationProp<T extends keyof MainStackParamList> = 
  StackNavigationProp<MainStackParamList, T>;

export type TabNavigationProp<T extends keyof TabParamList> = 
  BottomTabNavigationProp<TabParamList, T>;

export type AuthStackRouteProp<T extends keyof AuthStackParamList> = 
  RouteProp<AuthStackParamList, T>;

export type MainStackRouteProp<T extends keyof MainStackParamList> = 
  RouteProp<MainStackParamList, T>;

export type TabRouteProp<T extends keyof TabParamList> = 
  RouteProp<TabParamList, T>;

/**
 * Screen Props
 */
export interface AuthScreenProps<T extends keyof AuthStackParamList> {
  navigation: AuthStackNavigationProp<T>;
  route: AuthStackRouteProp<T>;
}

export interface MainScreenProps<T extends keyof MainStackParamList> {
  navigation: MainStackNavigationProp<T>;
  route: MainStackRouteProp<T>;
}

export interface TabScreenProps<T extends keyof TabParamList> {
  navigation: TabNavigationProp<T>;
  route: TabRouteProp<T>;
}
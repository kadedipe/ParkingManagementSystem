// ============================================================================
// Navigation Types - TypeScript Type Definitions for Navigation
// ============================================================================

// parking-management-system/mobile/src/types/navigation.types.ts

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// ============================================================================
// Auth Stack Types
// ============================================================================

/**
 * Auth Stack Param List
 * Defines all screens in the authentication flow with their parameters
 */
export type AuthStackParamList = {
  // Onboarding
  Welcome: undefined;
  Onboarding: { step?: number } | undefined;
  OnboardingComplete: undefined;
  
  // Authentication
  Login: { 
    redirectTo?: string; 
    email?: string;
    from?: string;
  } | undefined;
  
  Register: { 
    email?: string; 
    referralCode?: string;
    from?: string;
  } | undefined;
  
  ForgotPassword: { 
    email?: string;
  } | undefined;
  
  ResetPassword: { 
    token: string;
    email?: string;
  } | undefined;
  
  VerifyEmail: { 
    token: string; 
    email?: string;
    from?: string;
  } | undefined;
  
  TwoFactorAuth: { 
    email?: string;
    method?: 'authenticator' | 'sms' | 'email';
    from?: string;
  } | undefined;
  
  SocialLogin: { 
    provider: 'google' | 'apple' | 'facebook' | 'twitter';
    token?: string;
    from?: string;
  } | undefined;
};

/**
 * Auth Stack Navigation Prop
 */
export type AuthStackNavigationProp<T extends keyof AuthStackParamList> = 
  StackNavigationProp<AuthStackParamList, T>;

/**
 * Auth Stack Route Prop
 */
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = 
  RouteProp<AuthStackParamList, T>;

/**
 * Auth Screen Props
 */
export interface AuthScreenProps<T extends keyof AuthStackParamList> {
  navigation: AuthStackNavigationProp<T>;
  route: AuthStackRouteProp<T>;
}

// ============================================================================
// Main Stack Types
// ============================================================================

/**
 * Main Stack Param List
 * Defines all screens in the main app with their parameters
 */
export type MainStackParamList = {
  // Main Tabs
  MainTabs: undefined;
  
  // Parking Screens
  ParkingDetails: { 
    parkingId: string; 
    from?: string;
    showBooking?: boolean;
  } | undefined;
  
  ParkingMap: { 
    parkingId?: string;
    initialRegion?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
  } | undefined;
  
  ParkingSpotSelector: { 
    parkingId: string; 
    spots?: any[]; 
    maxSelectable?: number;
    selectedSpots?: string[];
  } | undefined;
  
  ParkingReviews: { 
    parkingId: string;
    rating?: number;
  } | undefined;
  
  AddParkingReview: { 
    parkingId: string;
    bookingId?: string;
  } | undefined;
  
  // Charging Screens
  ChargingDetails: { 
    stationId: string;
    from?: string;
  } | undefined;
  
  ChargingSession: { 
    sessionId: string;
    stationId?: string;
  } | undefined;
  
  ChargingHistory: { 
    stationId?: string;
  } | undefined;
  
  ChargingReservation: { 
    stationId: string; 
    startTime?: string;
    endTime?: string;
  } | undefined;
  
  ChargingMap: { 
    stationId?: string;
  } | undefined;
  
  // Booking Screens
  BookingDetails: { 
    bookingId: string;
    from?: string;
  } | undefined;
  
  CreateBooking: { 
    parkingId?: string; 
    spotId?: string; 
    startTime?: string; 
    endTime?: string;
    vehicleId?: string;
  } | undefined;
  
  ConfirmBooking: { 
    bookingData: any;
    from?: string;
  } | undefined;
  
  BookingQRCode: { 
    bookingId: string;
    showDetails?: boolean;
  } | undefined;
  
  // Payment Screens
  PaymentMethods: { 
    selectMode?: boolean;
    onSelect?: (method: any) => void;
  } | undefined;
  
  AddPaymentMethod: { 
    redirect?: string;
  } | undefined;
  
  ProcessPayment: { 
    amount: number; 
    bookingId?: string; 
    currency?: string;
    description?: string;
    paymentMethodId?: string;
  } | undefined;
  
  PaymentHistory: { 
    bookingId?: string;
  } | undefined;
  
  PaymentReceipt: { 
    paymentId: string;
    showPrint?: boolean;
  } | undefined;
  
  Wallet: { 
    showAddFunds?: boolean;
  } | undefined;
  
  AddFunds: { 
    suggestedAmount?: number;
  } | undefined;
  
  // Profile Screens
  EditProfile: { 
    userId?: string;
    from?: string;
  } | undefined;
  
  ProfileVehicles: { 
    selectMode?: boolean; 
    onSelect?: (vehicle: any) => void;
    selectedId?: string;
  } | undefined;
  
  AddVehicle: { 
    vehicleData?: any;
    editId?: string;
  } | undefined;
  
  EditVehicle: { 
    vehicleId: string;
  } | undefined;
  
  Settings: undefined;
  
  ChangePassword: { 
    requireCurrent?: boolean;
  } | undefined;
  
  NotificationSettings: undefined;
  
  Loyalty: undefined;
  
  Referrals: undefined;
  
  // Notification Screens
  NotificationList: { 
    filter?: string;
  } | undefined;
  
  NotificationDetails: { 
    notificationId: string;
  } | undefined;
  
  // Report Screens
  ReportList: undefined;
  ReportDetails: { reportId: string };
  GenerateReport: { 
    type?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  } | undefined;
  
  // Support Screens
  HelpCenter: { 
    topic?: string;
  } | undefined;
  
  FAQ: { 
    category?: string;
  } | undefined;
  
  ContactSupport: { 
    subject?: string;
    bookingId?: string;
  } | undefined;
  
  Feedback: { 
    type?: 'general' | 'bug' | 'feature' | 'rating';
    rating?: number;
  } | undefined;
  
  // About Screens
  About: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  OpenSource: undefined;
  
  // Common Screens
  Loading: { 
    message?: string;
    timeout?: number;
  } | undefined;
  
  Error: { 
    error: string;
    retry?: () => void;
    statusCode?: number;
  } | undefined;
  
  NotFound: { 
    resource?: string;
    message?: string;
  } | undefined;
  
  Maintenance: undefined;
  UpdateRequired: { 
    minVersion: string;
    currentVersion: string;
  } | undefined;
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

// ============================================================================
// Tab Types
// ============================================================================

/**
 * Tab Param List
 * Defines all tabs in the bottom tab navigator
 */
export type TabParamList = {
  Home: { 
    refresh?: boolean;
    tab?: string;
  } | undefined;
  
  Parking: { 
    search?: string;
    filter?: any;
    showMap?: boolean;
  } | undefined;
  
  Charging: { 
    stationId?: string;
    showMap?: boolean;
  } | undefined;
  
  Bookings: { 
    filter?: string;
    bookingId?: string;
  } | undefined;
  
  Profile: { 
    userId?: string;
    tab?: string;
  } | undefined;
};

/**
 * Tab Navigation Prop
 */
export type TabNavigationProp<T extends keyof TabParamList> = 
  BottomTabNavigationProp<TabParamList, T>;

/**
 * Tab Route Prop
 */
export type TabRouteProp<T extends keyof TabParamList> = 
  RouteProp<TabParamList, T>;

/**
 * Tab Screen Props
 */
export interface TabScreenProps<T extends keyof TabParamList> {
  navigation: TabNavigationProp<T>;
  route: TabRouteProp<T>;
}

// ============================================================================
// Composite Navigation Types
// ============================================================================

/**
 * Composite Navigation Prop for screens inside tabs
 */
export type CompositeNavigationProp<
  T extends keyof TabParamList,
  S extends keyof MainStackParamList
> = CompositeNavigationProp<
  TabNavigationProp<T>,
  MainStackNavigationProp<S>
>;

/**
 * Composite Screen Props
 */
export interface CompositeScreenProps<
  T extends keyof TabParamList,
  S extends keyof MainStackParamList
> {
  navigation: CompositeNavigationProp<T, S>;
  route: TabRouteProp<T>;
}

// ============================================================================
// Navigation Service Types
// ============================================================================

/**
 * Navigation Service Interface
 */
export interface NavigationService {
  navigate<T extends keyof MainStackParamList>(
    name: T,
    params?: MainStackParamList[T]
  ): void;
  
  navigateToAuth<T extends keyof AuthStackParamList>(
    name: T,
    params?: AuthStackParamList[T]
  ): void;
  
  goBack(): void;
  resetTo<T extends keyof MainStackParamList>(
    name: T,
    params?: MainStackParamList[T]
  ): void;
  push<T extends keyof MainStackParamList>(
    name: T,
    params?: MainStackParamList[T]
  ): void;
  pop(count?: number): void;
  popToTop(): void;
  getCurrentRoute(): string | null;
  isMounted(): boolean;
  
  // Navigation helpers
  goToParkingDetails(parkingId: string, from?: string): void;
  goToBookingDetails(bookingId: string, from?: string): void;
  goToPayment(amount: number, bookingId: string): void;
  goToChargingSession(sessionId: string): void;
  goToEditProfile(from?: string): void;
  goToProfileVehicles(selectMode?: boolean, onSelect?: (vehicle: any) => void): void;
  goToSettings(): void;
  goToNotifications(filter?: string): void;
  goToLogin(redirectTo?: string): void;
  goToHome(tab?: string): void;
  goToParking(search?: string): void;
  goToCharging(stationId?: string): void;
  goToBookings(filter?: string): void;
  goToProfile(userId?: string): void;
}

// ============================================================================
// Navigation Route Types
// ============================================================================

/**
 * Route Name Type
 */
export type RouteName = keyof MainStackParamList | keyof AuthStackParamList | keyof TabParamList;

/**
 * Route Params Type
 */
export type RouteParams<T extends RouteName> = 
  T extends keyof MainStackParamList ? MainStackParamList[T] :
  T extends keyof AuthStackParamList ? AuthStackParamList[T] :
  T extends keyof TabParamList ? TabParamList[T] :
  undefined;

/**
 * Navigation State
 */
export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  history: string[];
}

// ============================================================================
// Deep Link Types
// ============================================================================

/**
 * Deep Link Config
 */
export interface DeepLinkConfig {
  prefixes: string[];
  config: {
    screens: {
      [key: string]: string | {
        screens: {
          [key: string]: string;
        };
      };
    };
  };
}

/**
 * Deep Link Route
 */
export interface DeepLinkRoute {
  routeName: RouteName;
  params?: any;
}

// ============================================================================
// Navigation Options Types
// ============================================================================

/**
 * Screen Options
 */
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerBackTitle?: string;
  headerBackTitleVisible?: boolean;
  headerTintColor?: string;
  headerStyle?: any;
  headerTitleStyle?: any;
  gestureEnabled?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
}

/**
 * Tab Options
 */
export interface TabOptions {
  title?: string;
  tabBarIcon?: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
  tabBarLabel?: string;
  tabBarBadge?: string | number;
  tabBarAccessibilityLabel?: string;
  tabBarTestID?: string;
}

// ============================================================================
// Navigation Route Helpers
// ============================================================================

/**
 * Check if route is in auth stack
 */
export const isAuthRoute = (routeName: string): boolean => {
  const authRoutes: string[] = [
    'Welcome',
    'Onboarding',
    'Login',
    'Register',
    'ForgotPassword',
    'ResetPassword',
    'VerifyEmail',
    'TwoFactorAuth',
    'SocialLogin',
  ];
  return authRoutes.includes(routeName);
};

/**
 * Check if route requires authentication
 */
export const requiresAuth = (routeName: string): boolean => {
  const publicRoutes: string[] = [
    'Welcome',
    'Onboarding',
    'Login',
    'Register',
    'ForgotPassword',
    'ResetPassword',
    'VerifyEmail',
    'TwoFactorAuth',
    'SocialLogin',
    'Loading',
    'Error',
    'NotFound',
    'Maintenance',
    'UpdateRequired',
  ];
  return !publicRoutes.includes(routeName);
};

/**
 * Get route group
 */
export const getRouteGroup = (routeName: string): string => {
  const groups: { [key: string]: string[] } = {
    auth: ['Welcome', 'Onboarding', 'Login', 'Register', 'ForgotPassword', 'ResetPassword', 'VerifyEmail', 'TwoFactorAuth', 'SocialLogin'],
    parking: ['ParkingDetails', 'ParkingMap', 'ParkingSpotSelector', 'ParkingReviews', 'AddParkingReview'],
    charging: ['ChargingDetails', 'ChargingSession', 'ChargingHistory', 'ChargingReservation', 'ChargingMap'],
    booking: ['BookingDetails', 'CreateBooking', 'ConfirmBooking', 'BookingQRCode'],
    payment: ['PaymentMethods', 'AddPaymentMethod', 'ProcessPayment', 'PaymentHistory', 'PaymentReceipt', 'Wallet', 'AddFunds'],
    profile: ['EditProfile', 'ProfileVehicles', 'AddVehicle', 'EditVehicle', 'Settings', 'ChangePassword', 'NotificationSettings', 'Loyalty', 'Referrals'],
    notification: ['NotificationList', 'NotificationDetails'],
    report: ['ReportList', 'ReportDetails', 'GenerateReport'],
    support: ['HelpCenter', 'FAQ', 'ContactSupport', 'Feedback'],
    about: ['About', 'Terms', 'PrivacyPolicy', 'OpenSource'],
    common: ['Loading', 'Error', 'NotFound', 'Maintenance', 'UpdateRequired'],
  };
  
  for (const [group, routes] of Object.entries(groups)) {
    if (routes.includes(routeName)) {
      return group;
    }
  }
  return 'unknown';
};

// ============================================================================
// Navigation Types Index Export
// ============================================================================

export default {
  AuthStackParamList,
  MainStackParamList,
  TabParamList,
  AuthScreenProps,
  MainScreenProps,
  TabScreenProps,
  CompositeScreenProps,
  NavigationService,
  isAuthRoute,
  requiresAuth,
  getRouteGroup,
};
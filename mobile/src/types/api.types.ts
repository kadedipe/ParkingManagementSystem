// ============================================================================
// API Types - TypeScript Type Definitions
// ============================================================================

// parking-management-system/mobile/src/types/api.types.ts

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'apple' | 'facebook' | 'twitter';
  token: string;
  email?: string;
  name?: string;
}

export interface TwoFactorAuthRequest {
  code: string;
}

export interface TwoFactorAuthResponse {
  secret: string;
  qrCode: string;
  message: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  loyaltyPoints: number;
  vehicles?: Vehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: 'car' | 'suv' | 'truck' | 'motorcycle' | 'bicycle';
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

export interface UserStats {
  totalBookings: number;
  activeBookings: number;
  totalVehicles: number;
  loyaltyPoints: number;
  totalChargingSessions: number;
}

// ============================================================================
// Parking Types
// ============================================================================

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  pricePerHour: number;
  pricePerDay?: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
  phone?: string;
  email?: string;
  openingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpot {
  id: string;
  number: string;
  level: number;
  type: 'standard' | 'ev_charging' | 'handicap' | 'premium';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isCovered: boolean;
  dimensions?: {
    width: number;
    length: number;
    height?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParkingLotStats {
  occupancy: {
    current: number;
    capacity: number;
    percentage: number;
  };
  dailyStats: {
    date: string;
    occupancy: number;
    revenue: number;
  }[];
  peakHours: string[];
  averageDuration: number;
  totalRevenue: number;
  popularSpots: string[];
}

export interface ParkingReview {
  id: string;
  parkingLotId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParkingReviewRequest {
  rating: number;
  comment: string;
  images?: string[];
}

export interface ParkingSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  amenities?: string[];
  minRating?: number;
  maxPrice?: number;
  availability?: 'available' | 'reserved' | 'all';
  sortBy?: 'distance' | 'price' | 'rating' | 'availability';
  page?: number;
  limit?: number;
}

export interface ParkingListResponse {
  lots: ParkingLot[];
  pagination: Pagination;
}

// ============================================================================
// Charging Types
// ============================================================================

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: ChargingConnector[];
  powerLevel: 'standard' | 'fast' | 'rapid';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  pricePerKwh: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChargingConnector {
  id: string;
  type: 'type1' | 'type2' | 'ccs' | 'chademo' | 'tesla';
  power: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  estimatedTime: string;
}

export interface ChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  connectorId: string;
  connectorType: string;
  vehicleId: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  energyUsed?: number;
  cost?: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  batteryPercentage?: number;
  estimatedCompletion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChargingSessionRequest {
  stationId: string;
  connectorId: string;
  vehicleId: string;
}

export interface ChargingReservationRequest {
  stationId: string;
  startTime: string;
  endTime: string;
  vehicleId: string;
}

export interface ChargingHistoryResponse {
  sessions: ChargingSession[];
  pagination: Pagination;
}

// ============================================================================
// Booking Types
// ============================================================================

export interface Booking {
  id: string;
  parkingLotId: string;
  parkingLotName: string;
  parkingLotAddress?: string;
  spotId: string;
  spotNumber: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  vehicleId: string;
  vehiclePlate: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  qrCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  parkingLotId: string;
  spotId: string;
  startTime: string;
  endTime: string;
  vehicleId: string;
  notes?: string;
}

export interface BookingExtensionRequest {
  additionalHours: number;
}

export interface BookingCancelRequest {
  reason?: string;
}

export interface BookingCheckInRequest {
  vehiclePlate?: string;
  notes?: string;
}

export interface BookingCheckOutRequest {
  notes?: string;
  rating?: number;
}

export interface BookingListResponse {
  bookings: Booking[];
  pagination: Pagination;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank';
  cardType?: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  bookingId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  description: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  amount: number;
  currency?: string;
  paymentMethodId: string;
  bookingId?: string;
  description?: string;
}

export interface PaymentRefundRequest {
  amount?: number;
  reason: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface AddFundsRequest {
  amount: number;
  paymentMethodId: string;
}

export interface WithdrawFundsRequest {
  amount: number;
  paymentMethodId: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'parking' | 'charging' | 'system' | 'promotion';
  data?: any;
  isRead: boolean;
  isPushed: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  bookingUpdates: boolean;
  paymentUpdates: boolean;
  parkingAlerts: boolean;
  chargingUpdates: boolean;
  promotions: boolean;
  systemUpdates: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface DeviceRegistration {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface Report {
  id: string;
  type: 'revenue' | 'occupancy' | 'booking' | 'user' | 'vehicle' | 'charging' | 'payment';
  name: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: 'generating' | 'ready' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRequest {
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
  format: 'pdf' | 'excel' | 'csv';
  filters?: any;
}

export interface RevenueReport {
  totalRevenue: number;
  bookingRevenue: number;
  chargingRevenue: number;
  paymentFeeRevenue: number;
  dailyData: {
    date: string;
    revenue: number;
    bookings: number;
  }[];
}

export interface OccupancyReport {
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  occupancyRate: number;
  hourlyData: {
    hour: string;
    occupancy: number;
  }[];
}

// ============================================================================
// Common Types
// ============================================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
  timestamp: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  formatted: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  id?: string;
}

export interface WebSocketAuthMessage {
  type: 'auth';
  payload: {
    token: string;
    userId: string;
  };
}

export interface WebSocketSubscription {
  channel: string;
  filters?: any;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type OmitTimestamp<T> = Omit<T, 'createdAt' | 'updatedAt'>;
export type OmitId<T> = Omit<T, 'id'>;
export type PartialWithId<T> = Partial<T> & { id: string };

export type StatusType = 'idle' | 'loading' | 'succeeded' | 'failed';
export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

// ============================================================================
// Environment Types
// ============================================================================

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  WS_URL: string;
  ENCRYPTION_KEY: string;
  SENTRY_DSN?: string;
  GOOGLE_MAPS_API_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  APP_VERSION: string;
  BUILD_NUMBER: string;
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface NavigationParams {
  [key: string]: any;
}

export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ComponentProps {
  className?: string;
  style?: any;
  testID?: string;
  accessibilityLabel?: string;
}

export interface InputProps extends ComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface ButtonProps extends ComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

// ============================================================================
// Theme Types
// ============================================================================

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  success: string;
  successLight: string;
  successDark: string;
  danger: string;
  dangerLight: string;
  dangerDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textLight: string;
  textInverse: string;
  border: string;
  borderLight: string;
  borderDark: string;
  shadow: string;
  shadowDark: string;
  overlay: string;
  card: string;
  cardShadow: string;
  inputBackground: string;
  inputBorder: string;
  inputFocus: string;
  inputError: string;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
    thin: string;
    italic: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
    '6xl': number;
    '7xl': number;
    '8xl': number;
    '9xl': number;
    '10xl': number;
  };
  lineHeight: {
    none: number;
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  fontWeight: {
    thin: string;
    extralight: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
  };
}

export interface ThemeSpacing {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
  '7xl': number;
  '8xl': number;
  '9xl': number;
  '10xl': number;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    full: number;
  };
  shadows: {
    none: any;
    xs: any;
    sm: any;
    md: any;
    lg: any;
    xl: any;
    '2xl': any;
    '3xl': any;
  };
}

// ============================================================================
// API Service Types
// ============================================================================

export interface ApiService {
  get: <T = any>(url: string, params?: any) => Promise<T>;
  post: <T = any>(url: string, data?: any) => Promise<T>;
  put: <T = any>(url: string, data?: any) => Promise<T>;
  patch: <T = any>(url: string, data?: any) => Promise<T>;
  delete: <T = any>(url: string) => Promise<T>;
  upload: <T = any>(url: string, file: FormData) => Promise<T>;
}

export interface WebSocketService {
  connect: () => void;
  disconnect: () => void;
  send: (message: WebSocketMessage) => void;
  subscribe: (channel: string, callback: (data: any) => void) => void;
  unsubscribe: (channel: string) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

// ============================================================================
// Store Types
// ============================================================================

export interface StoreState {
  auth: {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
  };
  booking: {
    bookings: Booking[];
    activeBooking: Booking | null;
    selectedBooking: Booking | null;
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;
  };
  parking: {
    parkingLots: ParkingLot[];
    selectedParking: ParkingLot | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      search: string;
      amenities: string[];
      minRating: number;
      maxPrice: number;
      sortBy: string;
    };
    pagination: Pagination;
  };
  ui: {
    isLoading: boolean;
    isNetworkConnected: boolean;
    theme: ThemeMode;
    modal: {
      isVisible: boolean;
      type: string;
      data: any;
    };
    toast: {
      isVisible: boolean;
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
    };
    bottomSheet: {
      isVisible: boolean;
      content: React.ReactNode | null;
      snapPoints: string[];
    };
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  api: {
    url: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
  };
  storage: {
    prefix: string;
    encrypt: boolean;
  };
  features: {
    enableBiometric: boolean;
    enableSocialLogin: boolean;
    enableTwoFactor: boolean;
    enableDarkMode: boolean;
    enablePushNotifications: boolean;
  };
  limits: {
    maxBookingsPerDay: number;
    maxVehicles: number;
    maxLoyaltyPoints: number;
    maxSearchRadius: number;
  };
}

// ============================================================================
// Constants Types
// ============================================================================

export type ColorKey = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'background'
  | 'text'
  | 'textSecondary'
  | 'border';

export type FontSizeKey = 
  | 'xs'
  | 'sm'
  | 'md'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'
  | '10xl';

export type SpacingKey = 
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'
  | '10xl';

export type RouteName =
  | 'Login'
  | 'Register'
  | 'ForgotPassword'
  | 'ResetPassword'
  | 'Home'
  | 'Parking'
  | 'Charging'
  | 'Bookings'
  | 'Profile'
  | 'Settings'
  | 'Notifications';

export default {
  // Auth types
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthTokens,
  User,
  Vehicle,
  
  // Parking types
  ParkingLot,
  ParkingSpot,
  ParkingReview,
  ParkingSearchParams,
  
  // Charging types
  ChargingStation,
  ChargingSession,
  
  // Booking types
  Booking,
  
  // Payment types
  PaymentMethod,
  Payment,
  Wallet,
  
  // Common types
  Pagination,
  ApiResponse,
  ApiError,
  Coordinates,
  Address,
  
  // Utility types
  ThemeColors,
  ThemeTypography,
  Theme,
};
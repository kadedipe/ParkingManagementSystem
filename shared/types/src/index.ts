// ============================================================================
// Shared Types - Main Export Index
// ============================================================================

// parking-management-system/shared/types/src/index.ts

// ============================================================================
// API Types
// ============================================================================
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  SortParams,
  RequestOptions,
} from './api.types';

// ============================================================================
// Authentication Types
// ============================================================================
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthTokens,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  SocialLoginRequest,
  TwoFactorAuthRequest,
  TwoFactorAuthResponse,
  AuthState,
} from './auth.types';

// ============================================================================
// User Types
// ============================================================================
export type {
  User,
  UserPreferences,
  NotificationPreferences,
  UpdateProfileRequest,
  UserStats,
  UserActivity,
} from './user.types';

export { UserRole, UserStatus } from './user.types';

// ============================================================================
// Vehicle Types
// ============================================================================
export type {
  Vehicle,
  VehicleMake,
  VehicleModel,
  VehicleType as VehicleTypeDef,
  VehicleFeature,
  VehicleImage,
  VehicleOwnership,
  VehicleStatus,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleListResponse,
  VehicleSearchParams,
} from './vehicle.types';

export { VehicleType as VehicleTypeEnum, VehicleOwnership as VehicleOwnershipEnum } from './vehicle.types';

// ============================================================================
// Parking Types
// ============================================================================
export type {
  ParkingLot,
  ParkingSpot,
  ParkingReview,
  ParkingAvailability,
  OperatingHours,
  DayHours,
} from './parking.types';

export {
  ParkingLotStatus,
  ParkingLotType,
  ParkingSpotStatus,
  ParkingSpotType,
} from './parking.types';

// ============================================================================
// Booking Types
// ============================================================================
export type {
  Booking,
  BookingRequest,
  BookingExtensionRequest,
  BookingCancelRequest,
  BookingCheckInRequest,
  BookingCheckOutRequest,
  BookingListResponse,
  BookingStats,
} from './booking.types';

export { BookingStatus } from './booking.types';

// ============================================================================
// Payment Types
// ============================================================================
export type {
  PaymentMethod,
  Payment,
  PaymentRequest,
  PaymentRefundRequest,
  Wallet,
  WalletTransaction,
  AddFundsRequest,
  WithdrawFundsRequest,
  PaymentMethodRequest,
  PaymentMethodResponse,
  PaymentListResponse,
} from './payment.types';

export { PaymentStatus, PaymentMethod as PaymentMethodEnum } from './payment.types';

// ============================================================================
// Charging Types
// ============================================================================
export type {
  ChargingStation,
  ChargingConnector,
  ChargingSession,
  ChargingSessionRequest,
  ChargingReservationRequest,
  ChargingHistoryResponse,
  ChargingStats,
  ChargingStationStatus,
} from './charging.types';

export { ChargingStatus, ConnectorType, ChargingProfile } from './charging.types';

// ============================================================================
// Notification Types
// ============================================================================
export type {
  Notification,
  NotificationSettings,
  NotificationPreferences as NotificationPrefs,
  DeviceRegistration,
  NotificationTemplate,
  NotificationLog,
  NotificationStats,
} from './notification.types';

export { NotificationType, NotificationPriority } from './notification.types';

// ============================================================================
// Report Types
// ============================================================================
export type {
  Report,
  ReportRequest,
  RevenueReport,
  OccupancyReport,
  BookingReport,
  UserReport,
  VehicleReport,
  ChargingReport,
  PaymentReport,
  ReportFilter,
} from './report.types';

export { ReportStatus, ReportFormat, ReportType } from './report.types';

// ============================================================================
// Common Types
// ============================================================================
export type {
  Address,
  Location,
  Money,
  DateRange,
  Contact,
  Image,
  Metadata,
  ID,
  Timestamp,
  Nullable,
  Optional,
  PartialBy,
  RequiredBy,
  DeepPartial,
  DeepRequired,
  PickByType,
  OmitByType,
} from './common.types';

// ============================================================================
// Configuration Types
// ============================================================================
export type {
  AppConfig,
  ApiConfig,
  DatabaseConfig,
  RedisConfig,
  AuthConfig,
  LoggingConfig,
  FeatureConfig,
  LimitsConfig,
  SecurityConfig,
} from './config.types';

export { Environment } from './config.types';

// ============================================================================
// Event Types
// ============================================================================
export type {
  DomainEvent,
  EventHandler,
  EventBus,
  EventMetadata,
  BookingCreatedEvent,
  BookingCancelledEvent,
  PaymentProcessedEvent,
  ParkingLotCreatedEvent,
  ChargingSessionStartedEvent,
  ChargingSessionCompletedEvent,
  UserRegisteredEvent,
  NotificationSentEvent,
} from './event.types';

// ============================================================================
// WebSocket Types
// ============================================================================
export type {
  WebSocketMessage,
  WebSocketAuthMessage,
  WebSocketSubscription,
  WebSocketEvent,
  WebSocketConnection,
  WebSocketHandler,
} from './websocket.types';

// ============================================================================
// Error Types
// ============================================================================
export type {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError,
} from './error.types';

export { ErrorCode, ErrorSeverity } from './error.types';

// ============================================================================
// Utility Types
// ============================================================================
export type {
  DeepPartial as DeepPartialUtil,
  DeepRequired as DeepRequiredUtil,
  DeepReadonly,
  KeysOfType,
  OmitByType as OmitByTypeUtil,
  PickByType as PickByTypeUtil,
  NullableProperties,
  OptionalProperties,
  ArrayItem,
  PromiseType,
  ReturnType as ReturnTypeUtil,
  Parameters as ParametersUtil,
  NonNullableObject,
  Prettify,
  Merge,
  Override,
  NonNullableAll,
  LiteralUnion,
  ValueOf,
  KeyOf,
} from './utils';

// ============================================================================
// Enums
// ============================================================================
export {
  // User Enums
  UserRole,
  UserStatus,
  
  // Vehicle Enums
  VehicleType as VehicleTypeEnum,
  VehicleOwnership as VehicleOwnershipEnum,
  
  // Parking Enums
  ParkingLotStatus,
  ParkingLotType,
  ParkingSpotStatus,
  ParkingSpotType,
  
  // Booking Enums
  BookingStatus,
  
  // Payment Enums
  PaymentStatus,
  PaymentMethod as PaymentMethodEnum,
  
  // Charging Enums
  ChargingStatus,
  ConnectorType,
  ChargingProfile,
  
  // Notification Enums
  NotificationType,
  NotificationPriority,
  
  // Report Enums
  ReportStatus,
  ReportFormat,
  ReportType,
  
  // Common Enums
  Environment,
  Language,
  Currency,
} from './enums';

// ============================================================================
// All-In-One Export
// ============================================================================

/**
 * All types exported as a single namespace
 */
export * as SharedTypes from './index';

// ============================================================================
// Version Information
// ============================================================================
export const VERSION = '2.0.0';

// ============================================================================
// Package Metadata
// ============================================================================
export const PACKAGE_NAME = '@parking-system/shared-types';

/**
 * Type guard to check if an object is an API response
 */
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj === 'object' && 'success' in obj && 'data' in obj;
}

/**
 * Type guard to check if an object is an API error
 */
export function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj === 'object' && 'code' in obj && 'message' in obj && 'status' in obj;
}

/**
 * Type guard to check if an object is a paginated response
 */
export function isPaginatedResponse<T>(obj: any): obj is PaginatedResponse<T> {
  return obj && typeof obj === 'object' && 'items' in obj && 'total' in obj && 'page' in obj;
}

/**
 * Create a successful API response
 */
export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error API response
 */
export function createApiError(
  code: string,
  message: string,
  status: number = 400,
  details?: any,
): ApiError {
  return {
    code,
    message,
    status,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

// ============================================================================
// Default Export
// ============================================================================

// Export all types as default
export default {
  // Types
  ...require('./api.types'),
  ...require('./auth.types'),
  ...require('./user.types'),
  ...require('./vehicle.types'),
  ...require('./parking.types'),
  ...require('./booking.types'),
  ...require('./payment.types'),
  ...require('./charging.types'),
  ...require('./notification.types'),
  ...require('./report.types'),
  ...require('./common.types'),
  ...require('./config.types'),
  ...require('./event.types'),
  ...require('./websocket.types'),
  ...require('./error.types'),
  ...require('./utils'),
  
  // Enums
  ...require('./enums'),
  
  // Constants
  VERSION: '2.0.0',
  PACKAGE_NAME: '@parking-system/shared-types',
  
  // Utility Functions
  isApiResponse,
  isApiError,
  isPaginatedResponse,
  createApiResponse,
  createApiError,
  createPaginatedResponse,
};

// ============================================================================
// Re-export all types from sub-modules
// ============================================================================

// This is handled by the individual exports above

// ============================================================================
// Ensure all exports are properly typed
// ============================================================================

/**
 * Type for the entire shared types module
 */
export interface SharedTypesModule {
  // API Types
  ApiResponse: ApiResponse;
  ApiError: ApiError;
  PaginationParams: PaginationParams;
  PaginatedResponse: PaginatedResponse;
  FilterParams: FilterParams;
  SortParams: SortParams;
  RequestOptions: RequestOptions;
  
  // Auth Types
  LoginRequest: LoginRequest;
  LoginResponse: LoginResponse;
  RegisterRequest: RegisterRequest;
  RegisterResponse: RegisterResponse;
  AuthTokens: AuthTokens;
  RefreshTokenRequest: RefreshTokenRequest;
  RefreshTokenResponse: RefreshTokenResponse;
  ForgotPasswordRequest: ForgotPasswordRequest;
  ResetPasswordRequest: ResetPasswordRequest;
  ChangePasswordRequest: ChangePasswordRequest;
  VerifyEmailRequest: VerifyEmailRequest;
  SocialLoginRequest: SocialLoginRequest;
  TwoFactorAuthRequest: TwoFactorAuthRequest;
  TwoFactorAuthResponse: TwoFactorAuthResponse;
  AuthState: AuthState;
  
  // User Types
  User: User;
  UserPreferences: UserPreferences;
  NotificationPreferences: NotificationPreferences;
  UpdateProfileRequest: UpdateProfileRequest;
  UserStats: UserStats;
  UserActivity: UserActivity;
  
  // Vehicle Types
  Vehicle: Vehicle;
  VehicleMake: VehicleMake;
  VehicleModel: VehicleModel;
  VehicleTypeDef: VehicleTypeDef;
  VehicleFeature: VehicleFeature;
  VehicleImage: VehicleImage;
  VehicleOwnership: VehicleOwnership;
  VehicleStatus: VehicleStatus;
  CreateVehicleRequest: CreateVehicleRequest;
  UpdateVehicleRequest: UpdateVehicleRequest;
  VehicleListResponse: VehicleListResponse;
  VehicleSearchParams: VehicleSearchParams;
  
  // Parking Types
  ParkingLot: ParkingLot;
  ParkingSpot: ParkingSpot;
  ParkingReview: ParkingReview;
  ParkingAvailability: ParkingAvailability;
  OperatingHours: OperatingHours;
  DayHours: DayHours;
  
  // Booking Types
  Booking: Booking;
  BookingRequest: BookingRequest;
  BookingExtensionRequest: BookingExtensionRequest;
  BookingCancelRequest: BookingCancelRequest;
  BookingCheckInRequest: BookingCheckInRequest;
  BookingCheckOutRequest: BookingCheckOutRequest;
  BookingListResponse: BookingListResponse;
  BookingStats: BookingStats;
  
  // Payment Types
  PaymentMethod: PaymentMethod;
  Payment: Payment;
  PaymentRequest: PaymentRequest;
  PaymentRefundRequest: PaymentRefundRequest;
  Wallet: Wallet;
  WalletTransaction: WalletTransaction;
  AddFundsRequest: AddFundsRequest;
  WithdrawFundsRequest: WithdrawFundsRequest;
  PaymentMethodRequest: PaymentMethodRequest;
  PaymentMethodResponse: PaymentMethodResponse;
  PaymentListResponse: PaymentListResponse;
  
  // Charging Types
  ChargingStation: ChargingStation;
  ChargingConnector: ChargingConnector;
  ChargingSession: ChargingSession;
  ChargingSessionRequest: ChargingSessionRequest;
  ChargingReservationRequest: ChargingReservationRequest;
  ChargingHistoryResponse: ChargingHistoryResponse;
  ChargingStats: ChargingStats;
  ChargingStationStatus: ChargingStationStatus;
  
  // Notification Types
  Notification: Notification;
  NotificationSettings: NotificationSettings;
  NotificationPrefs: NotificationPrefs;
  DeviceRegistration: DeviceRegistration;
  NotificationTemplate: NotificationTemplate;
  NotificationLog: NotificationLog;
  NotificationStats: NotificationStats;
  
  // Report Types
  Report: Report;
  ReportRequest: ReportRequest;
  RevenueReport: RevenueReport;
  OccupancyReport: OccupancyReport;
  BookingReport: BookingReport;
  UserReport: UserReport;
  VehicleReport: VehicleReport;
  ChargingReport: ChargingReport;
  PaymentReport: PaymentReport;
  ReportFilter: ReportFilter;
  
  // Common Types
  Address: Address;
  Location: Location;
  Money: Money;
  DateRange: DateRange;
  Contact: Contact;
  Image: Image;
  Metadata: Metadata;
  ID: ID;
  Timestamp: Timestamp;
  Nullable: Nullable;
  Optional: Optional;
  PartialBy: PartialBy;
  RequiredBy: RequiredBy;
  DeepPartial: DeepPartial;
  DeepRequired: DeepRequired;
  PickByType: PickByType;
  OmitByType: OmitByType;
  
  // Configuration Types
  AppConfig: AppConfig;
  ApiConfig: ApiConfig;
  DatabaseConfig: DatabaseConfig;
  RedisConfig: RedisConfig;
  AuthConfig: AuthConfig;
  LoggingConfig: LoggingConfig;
  FeatureConfig: FeatureConfig;
  LimitsConfig: LimitsConfig;
  SecurityConfig: SecurityConfig;
  
  // Event Types
  DomainEvent: DomainEvent;
  EventHandler: EventHandler;
  EventBus: EventBus;
  EventMetadata: EventMetadata;
  BookingCreatedEvent: BookingCreatedEvent;
  BookingCancelledEvent: BookingCancelledEvent;
  PaymentProcessedEvent: PaymentProcessedEvent;
  ParkingLotCreatedEvent: ParkingLotCreatedEvent;
  ChargingSessionStartedEvent: ChargingSessionStartedEvent;
  ChargingSessionCompletedEvent: ChargingSessionCompletedEvent;
  UserRegisteredEvent: UserRegisteredEvent;
  NotificationSentEvent: NotificationSentEvent;
  
  // WebSocket Types
  WebSocketMessage: WebSocketMessage;
  WebSocketAuthMessage: WebSocketAuthMessage;
  WebSocketSubscription: WebSocketSubscription;
  WebSocketEvent: WebSocketEvent;
  WebSocketConnection: WebSocketConnection;
  WebSocketHandler: WebSocketHandler;
  
  // Error Types
  AppError: AppError;
  ValidationError: ValidationError;
  NotFoundError: NotFoundError;
  UnauthorizedError: UnauthorizedError;
  ForbiddenError: ForbiddenError;
  ConflictError: ConflictError;
  RateLimitError: RateLimitError;
  ServiceUnavailableError: ServiceUnavailableError;
  DatabaseError: DatabaseError;
  ExternalServiceError: ExternalServiceError;
  
  // Utility Types
  DeepPartialUtil: DeepPartialUtil;
  DeepRequiredUtil: DeepRequiredUtil;
  DeepReadonly: DeepReadonly;
  KeysOfType: KeysOfType;
  OmitByTypeUtil: OmitByTypeUtil;
  PickByTypeUtil: PickByTypeUtil;
  NullableProperties: NullableProperties;
  OptionalProperties: OptionalProperties;
  ArrayItem: ArrayItem;
  PromiseType: PromiseType;
  ReturnTypeUtil: ReturnTypeUtil;
  ParametersUtil: ParametersUtil;
  NonNullableObject: NonNullableObject;
  Prettify: Prettify;
  Merge: Merge;
  Override: Override;
  NonNullableAll: NonNullableAll;
  LiteralUnion: LiteralUnion;
  ValueOf: ValueOf;
  KeyOf: KeyOf;
  
  // Enums
  UserRole: UserRole;
  UserStatus: UserStatus;
  VehicleTypeEnum: VehicleTypeEnum;
  VehicleOwnershipEnum: VehicleOwnershipEnum;
  ParkingLotStatus: ParkingLotStatus;
  ParkingLotType: ParkingLotType;
  ParkingSpotStatus: ParkingSpotStatus;
  ParkingSpotType: ParkingSpotType;
  BookingStatus: BookingStatus;
  PaymentStatus: PaymentStatus;
  PaymentMethodEnum: PaymentMethodEnum;
  ChargingStatus: ChargingStatus;
  ConnectorType: ConnectorType;
  ChargingProfile: ChargingProfile;
  NotificationType: NotificationType;
  NotificationPriority: NotificationPriority;
  ReportStatus: ReportStatus;
  ReportFormat: ReportFormat;
  ReportType: ReportType;
  Environment: Environment;
  Language: Language;
  Currency: Currency;
  
  // Constants
  VERSION: string;
  PACKAGE_NAME: string;
}
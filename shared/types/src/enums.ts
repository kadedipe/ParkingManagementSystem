// ============================================================================
// Enums - Shared Enum Definitions
// ============================================================================

// parking-management-system/shared/types/src/enums.ts

/**
 * Booking status enum
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK = 'bank',
  CRYPTO = 'crypto',
}

/**
 * Notification type enum
 */
export enum NotificationType {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  PARKING = 'parking',
  CHARGING = 'charging',
  SYSTEM = 'system',
  PROMOTION = 'promotion',
  REMINDER = 'reminder',
}

/**
 * Notification priority enum
 */
export enum NotificationPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

/**
 * Charging status enum
 */
export enum ChargingStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CHARGING = 'charging',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

/**
 * Connector type enum
 */
export enum ConnectorType {
  TYPE1 = 'type1',
  TYPE2 = 'type2',
  CCS = 'ccs',
  CHADEMO = 'chademo',
  TESLA = 'tesla',
}

/**
 * Charging profile enum
 */
export enum ChargingProfile {
  STANDARD = 'standard',
  FAST = 'fast',
  RAPID = 'rapid',
  ULTRA_RAPID = 'ultra_rapid',
}

/**
 * Vehicle type enum
 */
export enum VehicleType {
  CAR = 'car',
  SUV = 'suv',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
  BICYCLE = 'bicycle',
  VAN = 'van',
}

/**
 * Environment enum
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Language enum
 */
export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  RU = 'ru',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
}

/**
 * Currency enum
 */
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  INR = 'INR',
  CAD = 'CAD',
  AUD = 'AUD',
  BRL = 'BRL',
}
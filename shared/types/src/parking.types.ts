// ============================================================================
// Parking Types - Parking Domain Type Definitions
// ============================================================================

// parking-management-system/shared/types/src/parking.types.ts

import { Address, Location, Money, Image, Contact, Metadata } from './common.types';
import { User } from './user.types';

// ============================================================================
// Enums
// ============================================================================

/**
 * Parking lot status enum
 */
export enum ParkingLotStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
  PENDING_APPROVAL = 'pending_approval',
}

/**
 * Parking lot type enum
 */
export enum ParkingLotType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  VALET = 'valet',
  EV_CHARGING = 'ev_charging',
  MULTI_LEVEL = 'multi_level',
  UNDERGROUND = 'underground',
  ROOFTOP = 'rooftop',
  OPEN = 'open',
}

/**
 * Parking spot status enum
 */
export enum ParkingSpotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  BLOCKED = 'blocked',
}

/**
 * Parking spot type enum
 */
export enum ParkingSpotType {
  STANDARD = 'standard',
  COMPACT = 'compact',
  HANDICAP = 'handicap',
  EV_CHARGING = 'ev_charging',
  PREMIUM = 'premium',
  VALET = 'valet',
  MOTORCYCLE = 'motorcycle',
  LARGE = 'large',
  FAMILY = 'family',
  VIP = 'vip',
}

/**
 * Parking reservation status enum
 */
export enum ParkingReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  NO_SHOW = 'no_show',
}

/**
 * Parking payment type enum
 */
export enum ParkingPaymentType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  FIXED = 'fixed',
}

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Parking lot entity
 */
export interface ParkingLot {
  id: string;
  name: string;
  description?: string;
  type: ParkingLotType;
  status: ParkingLotStatus;
  address: Address;
  location: Location;
  totalSpots: number;
  availableSpots: number;
  reservedSpots: number;
  basePricePerHour: Money;
  basePricePerDay?: Money;
  basePricePerWeek?: Money;
  basePricePerMonth?: Money;
  pricePerHourPeak?: Money;
  pricePerHourOffPeak?: Money;
  amenities: string[];
  features: string[];
  operatingHours?: OperatingHours;
  contact: Contact;
  website?: string;
  rating: number;
  reviewCount: number;
  images: Image[];
  isVerified: boolean;
  isFeatured: boolean;
  maxHeight?: number;
  maxWeight?: number;
  securityFeatures?: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
}

/**
 * Parking spot entity
 */
export interface ParkingSpot {
  id: string;
  parkingLotId: string;
  number: string;
  level: number;
  type: ParkingSpotType;
  status: ParkingSpotStatus;
  width?: number;
  length?: number;
  height?: number;
  weightLimit?: number;
  isCovered: boolean;
  isHandicap: boolean;
  isEvCharging: boolean;
  isReserved: boolean;
  isPremium: boolean;
  connectorType?: string;
  chargingPower?: number;
  chargingPrice?: Money;
  vehicleId?: string;
  vehiclePlate?: string;
  reservedUntil?: string;
  occupiedSince?: string;
  lastOccupiedAt?: string;
  priceMultiplier: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
}

/**
 * Parking reservation entity
 */
export interface ParkingReservation {
  id: string;
  parkingLotId: string;
  spotId: string;
  userId: string;
  vehicleId: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  status: ParkingReservationStatus;
  amount: Money;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  qrCode?: string;
  checkInTime?: string;
  checkOutTime?: string;
  isExtended: boolean;
  extensionCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
}

/**
 * Parking review entity
 */
export interface ParkingReview {
  id: string;
  parkingLotId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  bookingId?: string;
  rating: number;
  title?: string;
  comment: string;
  images: Image[];
  isVerified: boolean;
  helpfulCount: number;
  reportedCount: number;
  status: 'published' | 'pending' | 'hidden' | 'reported';
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
}

// ============================================================================
// Value Objects
// ============================================================================

/**
 * Operating hours
 */
export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  holidays?: HolidayHours[];
}

/**
 * Day hours
 */
export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

/**
 * Holiday hours
 */
export interface HolidayHours {
  date: string;
  name: string;
  open: string;
  close: string;
  isOpen: boolean;
}

/**
 * Parking availability
 */
export interface ParkingAvailability {
  parkingLotId: string;
  totalSpots: number;
  availableSpots: number;
  reservedSpots: number;
  occupiedSpots: number;
  occupancyRate: number;
  isFull: boolean;
  isAlmostFull: boolean; // > 80% occupancy
  hasAvailability: boolean;
  spots: ParkingSpot[];
  peakHours: PeakHours[];
  estimatedWaitTime?: number; // in minutes
  lastUpdated: string;
}

/**
 * Peak hours
 */
export interface PeakHours {
  day: string;
  start: string;
  end: string;
  occupancyRate: number;
}

/**
 * Parking pricing
 */
export interface ParkingPricing {
  parkingLotId: string;
  spotType?: ParkingSpotType;
  basePrice: Money;
  currentPrice: Money;
  priceBreakdown: PriceBreakdown[];
  discounts: Discount[];
  estimatedTotal: Money;
  currency: string;
}

/**
 * Price breakdown
 */
export interface PriceBreakdown {
  type: string;
  rate: number;
  quantity: number;
  subtotal: Money;
  description?: string;
}

/**
 * Discount
 */
export interface Discount {
  id: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  code?: string;
  expiresAt?: string;
}

/**
 * Parking statistics
 */
export interface ParkingStatistics {
  parkingLotId: string;
  dateRange: DateRange;
  totalBookings: number;
  totalRevenue: Money;
  averageOccupancy: number;
  peakOccupancy: number;
  peakTime: string;
  averageDuration: number;
  totalHours: number;
  revenueByHour: RevenueByHour[];
  occupancyByHour: OccupancyByHour[];
  popularSpots: PopularSpot[];
  customerRetention: number;
  averageRating: number;
}

/**
 * Revenue by hour
 */
export interface RevenueByHour {
  hour: string;
  revenue: Money;
  bookings: number;
}

/**
 * Occupancy by hour
 */
export interface OccupancyByHour {
  hour: string;
  occupancy: number;
  totalSpots: number;
}

/**
 * Popular spot
 */
export interface PopularSpot {
  spotId: string;
  number: string;
  usageCount: number;
  totalHours: number;
  revenue: Money;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Create parking lot request
 */
export interface CreateParkingLotRequest {
  name: string;
  description?: string;
  type: ParkingLotType;
  address: Address;
  location: Location;
  totalSpots: number;
  basePricePerHour: Money;
  basePricePerDay?: Money;
  basePricePerWeek?: Money;
  basePricePerMonth?: Money;
  amenities: string[];
  features: string[];
  operatingHours?: OperatingHours;
  contact: Contact;
  website?: string;
  images?: Image[];
  maxHeight?: number;
  maxWeight?: number;
  securityFeatures?: string[];
  metadata?: Metadata;
}

/**
 * Update parking lot request
 */
export interface UpdateParkingLotRequest {
  name?: string;
  description?: string;
  type?: ParkingLotType;
  status?: ParkingLotStatus;
  address?: Address;
  location?: Location;
  totalSpots?: number;
  basePricePerHour?: Money;
  basePricePerDay?: Money;
  basePricePerWeek?: Money;
  basePricePerMonth?: Money;
  amenities?: string[];
  features?: string[];
  operatingHours?: OperatingHours;
  contact?: Contact;
  website?: string;
  images?: Image[];
  maxHeight?: number;
  maxWeight?: number;
  securityFeatures?: string[];
  metadata?: Metadata;
}

/**
 * Create parking spot request
 */
export interface CreateParkingSpotRequest {
  number: string;
  level: number;
  type: ParkingSpotType;
  width?: number;
  length?: number;
  height?: number;
  weightLimit?: number;
  isCovered: boolean;
  isHandicap: boolean;
  isEvCharging: boolean;
  isPremium: boolean;
  connectorType?: string;
  chargingPower?: number;
  chargingPrice?: Money;
  priceMultiplier?: number;
  notes?: string;
  metadata?: Metadata;
}

/**
 * Update parking spot request
 */
export interface UpdateParkingSpotRequest {
  number?: string;
  level?: number;
  type?: ParkingSpotType;
  status?: ParkingSpotStatus;
  width?: number;
  length?: number;
  height?: number;
  weightLimit?: number;
  isCovered?: boolean;
  isHandicap?: boolean;
  isEvCharging?: boolean;
  isPremium?: boolean;
  connectorType?: string;
  chargingPower?: number;
  chargingPrice?: Money;
  priceMultiplier?: number;
  notes?: string;
  metadata?: Metadata;
}

/**
 * Parking search parameters
 */
export interface ParkingSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  amenities?: string[];
  features?: string[];
  minRating?: number;
  maxPrice?: number;
  availability?: 'available' | 'reserved' | 'all';
  sortBy?: 'distance' | 'price' | 'rating' | 'availability';
  page?: number;
  limit?: number;
}

/**
 * Parking list response
 */
export interface ParkingListResponse {
  lots: ParkingLot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create parking review request
 */
export interface CreateParkingReviewRequest {
  rating: number;
  title?: string;
  comment: string;
  images?: Image[];
  bookingId?: string;
}

/**
 * Update parking review request
 */
export interface UpdateParkingReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  images?: Image[];
  status?: 'published' | 'hidden' | 'reported';
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Parking lot response
 */
export interface ParkingLotResponse extends ParkingLot {
  distance?: number;
  estimatedArrival?: string;
  isOpen: boolean;
  currentOccupancy: number;
  peakPricing: boolean;
}

/**
 * Parking spot response
 */
export interface ParkingSpotResponse extends ParkingSpot {
  parkingLotName: string;
  parkingLotAddress: string;
  price: Money;
  isReservable: boolean;
}

/**
 * Parking reservation response
 */
export interface ParkingReservationResponse extends ParkingReservation {
  parkingLotName: string;
  parkingLotAddress: string;
  spotNumber: string;
  user: User;
  canCancel: boolean;
  canExtend: boolean;
  timeRemaining?: number;
  totalCost: Money;
}

/**
 * Parking availability response
 */
export interface ParkingAvailabilityResponse {
  lotId: string;
  name: string;
  address: string;
  availability: ParkingAvailability;
  pricing: ParkingPricing;
  nearbyLots?: ParkingLot[];
}

// ============================================================================
// WebSocket Events
// ============================================================================

/**
 * Parking spot update event
 */
export interface ParkingSpotUpdateEvent {
  lotId: string;
  spotId: string;
  spotNumber: string;
  oldStatus: ParkingSpotStatus;
  newStatus: ParkingSpotStatus;
  vehicleId?: string;
  vehiclePlate?: string;
  timestamp: string;
}

/**
 * Parking occupancy update event
 */
export interface ParkingOccupancyUpdateEvent {
  lotId: string;
  totalSpots: number;
  availableSpots: number;
  reservedSpots: number;
  occupiedSpots: number;
  occupancyRate: number;
  timestamp: string;
}

/**
 * Parking reservation event
 */
export interface ParkingReservationEvent {
  reservationId: string;
  lotId: string;
  spotId: string;
  userId: string;
  status: ParkingReservationStatus;
  startTime: string;
  endTime: string;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Parking lot with availability
 */
export type ParkingLotWithAvailability = ParkingLot & {
  availability: ParkingAvailability;
  pricing: ParkingPricing;
};

/**
 * Parking spot with lot info
 */
export type ParkingSpotWithLot = ParkingSpot & {
  parkingLot: Pick<ParkingLot, 'id' | 'name' | 'address' | 'location'>;
};

/**
 * Parking reservation with details
 */
export type ParkingReservationWithDetails = ParkingReservation & {
  parkingLot: Pick<ParkingLot, 'id' | 'name' | 'address' | 'location'>;
  spot: Pick<ParkingSpot, 'id' | 'number' | 'type' | 'level'>;
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a parking lot is open
 */
export function isParkingLotOpen(lot: ParkingLot): boolean {
  if (lot.status !== ParkingLotStatus.ACTIVE) {
    return false;
  }
  
  if (!lot.operatingHours) {
    return true;
  }
  
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = dayNames[dayOfWeek] as keyof OperatingHours;
  const hours = lot.operatingHours[dayKey];
  
  if (!hours || !hours.isOpen) {
    return false;
  }
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = parseInt(hours.open.split(':')[0]) * 60 + parseInt(hours.open.split(':')[1]);
  const closeTime = parseInt(hours.close.split(':')[0]) * 60 + parseInt(hours.close.split(':')[1]);
  
  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Check if a parking spot is available
 */
export function isParkingSpotAvailable(spot: ParkingSpot): boolean {
  return spot.status === ParkingSpotStatus.AVAILABLE;
}

/**
 * Check if a parking reservation is active
 */
export function isParkingReservationActive(reservation: ParkingReservation): boolean {
  return reservation.status === ParkingReservationStatus.ACTIVE;
}

/**
 * Check if a parking reservation is cancellable
 */
export function isParkingReservationCancellable(reservation: ParkingReservation): boolean {
  if (reservation.status !== ParkingReservationStatus.CONFIRMED) {
    return false;
  }
  
  const now = new Date();
  const startTime = new Date(reservation.startTime);
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilStart > 2; // Can cancel at least 2 hours before
}

/**
 * Check if a parking reservation is extendable
 */
export function isParkingReservationExtendable(reservation: ParkingReservation): boolean {
  if (reservation.status !== ParkingReservationStatus.ACTIVE) {
    return false;
  }
  
  const now = new Date();
  const endTime = new Date(reservation.endTime);
  const hoursRemaining = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursRemaining > 0 && hoursRemaining < 24;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a parking availability object
 */
export function createParkingAvailability(
  parkingLotId: string,
  totalSpots: number,
  availableSpots: number,
  reservedSpots: number,
  spots: ParkingSpot[],
): ParkingAvailability {
  const occupiedSpots = totalSpots - availableSpots - reservedSpots;
  const occupancyRate = totalSpots > 0 ? (occupiedSpots / totalSpots) * 100 : 0;
  
  return {
    parkingLotId,
    totalSpots,
    availableSpots,
    reservedSpots,
    occupiedSpots,
    occupancyRate,
    isFull: availableSpots === 0,
    isAlmostFull: occupancyRate > 80,
    hasAvailability: availableSpots > 0,
    spots,
    peakHours: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Create a parking pricing object
 */
export function createParkingPricing(
  parkingLotId: string,
  basePrice: Money,
  spotType?: ParkingSpotType,
  discounts?: Discount[],
): ParkingPricing {
  return {
    parkingLotId,
    spotType,
    basePrice,
    currentPrice: basePrice,
    priceBreakdown: [],
    discounts: discounts || [],
    estimatedTotal: basePrice,
    currency: basePrice.currency,
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Parking amenity types
 */
export const PARKING_AMENITIES = {
  EV_CHARGING: 'ev_charging',
  SECURITY: 'security',
  LIGHTING: 'lighting',
  COVERED: 'covered',
  VALET: 'valet',
  HANDICAP: 'handicap',
  RESTROOMS: 'restrooms',
  WIFI: 'wifi',
  CAFE: 'cafe',
  SHOP: 'shop',
  CAR_WASH: 'car_wash',
  TIRE_PRESSURE: 'tire_pressure',
  AIR_COMPRESSOR: 'air_compressor',
  CCTV: 'cctv',
  GUARD: 'guard',
  FENCED: 'fenced',
  LOCKED: 'locked',
  WELL_LIT: 'well_lit',
} as const;

/**
 * Parking feature types
 */
export const PARKING_FEATURES = {
  RESERVATION: 'reservation',
  PREMIUM: 'premium',
  MONTHLY: 'monthly',
  VALET: 'valet',
  SELF_PARK: 'self_park',
  CARD_PAYMENT: 'card_payment',
  CASH_PAYMENT: 'cash_payment',
  MOBILE_PAYMENT: 'mobile_payment',
  QR_CODE: 'qr_code',
  LICENSE_PLATE: 'license_plate',
} as const;

/**
 * Parking security features
 */
export const PARKING_SECURITY_FEATURES = {
  CCTV: 'cctv',
  GUARD: 'guard',
  FENCED: 'fenced',
  LOCKED: 'locked',
  WELL_LIT: 'well_lit',
  ACCESS_CONTROL: 'access_control',
  ALARM: 'alarm',
  PATROL: 'patrol',
} as const;

/**
 * Parking spot connector types
 */
export const PARKING_CONNECTOR_TYPES = {
  TYPE1: 'type1',
  TYPE2: 'type2',
  CCS: 'ccs',
  CHADEMO: 'chademo',
  TESLA: 'tesla',
} as const;
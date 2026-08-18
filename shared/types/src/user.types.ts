// ============================================================================
// User Types - User Type Definitions
// ============================================================================

// parking-management-system/shared/types/src/user.types.ts

import { Vehicle } from './vehicle.types';

/**
 * User role enum
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPER_ADMIN = 'super_admin',
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

/**
 * User entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  loyaltyPoints: number;
  vehicles?: Vehicle[];
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  currency?: string;
  timezone?: string;
  notifications?: NotificationPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  bookingUpdates: boolean;
  paymentUpdates: boolean;
  parkingAlerts: boolean;
  chargingUpdates: boolean;
  promotions: boolean;
  systemUpdates: boolean;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * User statistics
 */
export interface UserStats {
  totalBookings: number;
  activeBookings: number;
  totalVehicles: number;
  loyaltyPoints: number;
  totalChargingSessions: number;
  totalPayments: number;
  totalSpent: number;
}

/**
 * User activity log
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
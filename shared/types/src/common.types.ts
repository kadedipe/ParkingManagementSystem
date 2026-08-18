// ============================================================================
// Common Types - Shared Common Type Definitions
// ============================================================================

// parking-management-system/shared/types/src/common.types.ts

/**
 * Address
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formatted?: string;
}

/**
 * Location (coordinates)
 */
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
}

/**
 * Money
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Date range
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Contact information
 */
export interface Contact {
  name?: string;
  phone?: string;
  email?: string;
}

/**
 * Image
 */
export interface Image {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
  order?: number;
}

/**
 * Metadata
 */
export interface Metadata {
  [key: string]: any;
}

/**
 * ID type
 */
export type ID = string;

/**
 * Timestamp type
 */
export type Timestamp = string;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Partial by keys
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required by keys
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Pick by type
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Omit by type
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};
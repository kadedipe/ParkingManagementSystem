// ============================================================================
// Utility Types - Shared Utility Type Definitions
// ============================================================================

// parking-management-system/shared/types/src/utils.ts

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract keys of a certain type
 */
export type KeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * Omit properties of a certain type
 */
export type OmitByType<T, U> = Pick<T, Exclude<keyof T, KeysOfType<T, U>>>;

/**
 * Pick properties of a certain type
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Make properties nullable
 */
export type NullableProperties<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Make properties optional
 */
export type OptionalProperties<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Extract array item type
 */
export type ArrayItem<T> = T extends Array<infer U> ? U : never;

/**
 * Extract promise type
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract function return type
 */
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Extract function parameters type
 */
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Non-nullable object
 */
export type NonNullableObject<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Prettify type (expand object)
 */
export type Prettify<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

/**
 * Merge two types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Override properties
 */
export type Override<T, U> = Omit<T, keyof U> & U;

/**
 * Exclude null and undefined
 */
export type NonNullableAll<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract literal value type
 */
export type LiteralUnion<T extends string> = T | string;

/**
 * Extract value type from object
 */
export type ValueOf<T> = T[keyof T];

/**
 * Extract key type from object
 */
export type KeyOf<T> = keyof T;
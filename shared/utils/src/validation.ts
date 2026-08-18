// ============================================================================
// Validation Utilities - Input Validation Functions
// ============================================================================

// parking-management-system/shared/utils/src/validation.ts

import validator from 'validator';
import * as z from 'zod';

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string, countryCode: string = 'US'): boolean {
  return validator.isMobilePhone(phone, countryCode as any);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password)) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/\d/.test(password)) {
    score++;
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0 && password.length >= 8,
    errors,
    score: Math.min(score, 5),
  };
}

/**
 * Validate credit card number
 */
export function validateCreditCard(cardNumber: string): boolean {
  return validator.isCreditCard(cardNumber);
}

/**
 * Validate CVV
 */
export function validateCVV(cvv: string): boolean {
  return /^[0-9]{3,4}$/.test(cvv);
}

/**
 * Validate expiry date
 */
export function validateExpiryDate(month: string, year: string): boolean {
  const m = parseInt(month);
  const y = parseInt(year);
  
  if (m < 1 || m > 12) return false;
  if (y < 0 || y > 99) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  
  return true;
}

/**
 * Validate postal code
 */
export function validatePostalCode(postalCode: string, countryCode: string = 'US'): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    AU: /^\d{4}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    IN: /^\d{6}$/,
  };
  
  const pattern = patterns[countryCode];
  if (!pattern) return true;
  
  return pattern.test(postalCode);
}

/**
 * Validate required field
 */
export function validateRequired(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  return validator.isURL(url);
}

/**
 * Validate date format
 */
export function validateDateFormat(date: string, format: string = 'YYYY-MM-DD'): boolean {
  return validator.isDate(date);
}

/**
 * Validate JSON
 */
export function validateJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): boolean {
  return validator.isUUID(uuid);
}

/**
 * Validate IBAN
 */
export function validateIBAN(iban: string): boolean {
  return validator.isIBAN(iban);
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Create Zod validation schemas
 */
export const schemas = {
  // Email schema
  email: z.string().email('Invalid email address'),
  
  // Phone schema
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  
  // Password schema
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain lowercase letters')
    .regex(/[A-Z]/, 'Password must contain uppercase letters')
    .regex(/\d/, 'Password must contain numbers')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain special characters'),
  
  // UUID schema
  uuid: z.string().uuid('Invalid UUID'),
  
  // URL schema
  url: z.string().url('Invalid URL'),
  
  // Date schema
  date: z.string().datetime('Invalid date format'),
  
  // Number schema
  number: z.number().finite('Must be a number'),
  
  // Integer schema
  integer: z.number().int('Must be an integer'),
  
  // Positive number schema
  positive: z.number().positive('Must be a positive number'),
  
  // Non-negative number schema
  nonNegative: z.number().min(0, 'Must be a non-negative number'),
  
  // Credit card schema
  creditCard: z.string()
    .regex(/^[0-9]{13,19}$/, 'Invalid credit card number')
    .refine((val) => validateCreditCard(val), 'Invalid credit card number'),
  
  // CVV schema
  cvv: z.string()
    .regex(/^[0-9]{3,4}$/, 'Invalid CVV'),
};

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
}

/**
 * Validate object against schema
 */
export function validateObject<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): ValidationResult {
  try {
    schema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { _global: 'Validation failed' } };
  }
}

/**
 * Create a validation function from a schema
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): ValidationResult => {
    return validateObject<T>(data, schema);
  };
}
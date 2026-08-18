// ============================================================================
// Validators - Validation Utility Functions
// ============================================================================

// parking-management-system/mobile/src/utils/validators.ts

import { parseISO, isValid as isDateValid } from 'date-fns';

/**
 * Validation Result Interface
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Validation Rule Interface
 */
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

/**
 * Common Validators
 */
export const CommonValidators = {
  /**
   * Required field validator
   */
  required: (value: any): ValidationResult => {
    if (value === undefined || value === null || value === '') {
      return { valid: false, message: 'This field is required' };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { valid: false, message: 'This field is required' };
    }
    if (typeof value === 'string' && value.trim() === '') {
      return { valid: false, message: 'This field is required' };
    }
    return { valid: true };
  },

  /**
   * Min length validator
   */
  minLength: (min: number): ValidationRule => ({
    validate: (value: string) => value && value.length >= min,
    message: `Must be at least ${min} characters`,
  }),

  /**
   * Max length validator
   */
  maxLength: (max: number): ValidationRule => ({
    validate: (value: string) => !value || value.length <= max,
    message: `Must be at most ${max} characters`,
  }),

  /**
   * Exact length validator
   */
  exactLength: (length: number): ValidationRule => ({
    validate: (value: string) => value && value.length === length,
    message: `Must be exactly ${length} characters`,
  }),

  /**
   * Min value validator
   */
  minValue: (min: number): ValidationRule => ({
    validate: (value: number) => value !== undefined && value !== null && value >= min,
    message: `Must be at least ${min}`,
  }),

  /**
   * Max value validator
   */
  maxValue: (max: number): ValidationRule => ({
    validate: (value: number) => value === undefined || value === null || value <= max,
    message: `Must be at most ${max}`,
  }),

  /**
   * Between validator
   */
  between: (min: number, max: number): ValidationRule => ({
    validate: (value: number) => value !== undefined && value !== null && value >= min && value <= max,
    message: `Must be between ${min} and ${max}`,
  }),

  /**
   * Pattern validator
   */
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => !value || regex.test(value),
    message,
  }),

  /**
   * Email validator
   */
  email: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  /**
   * Password validator
   */
  password: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Password is required' };
    }
    if (value.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (value.length > 32) {
      return { valid: false, message: 'Password must be less than 32 characters' };
    }
    return { valid: true };
  },

  /**
   * Strong password validator
   */
  strongPassword: (value: string): ValidationResult => {
    const passwordValidation = CommonValidators.password(value);
    if (!passwordValidation.valid) return passwordValidation;

    let errors: Record<string, string> = {};
    if (!/[a-z]/.test(value)) {
      errors.lowercase = 'Must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(value)) {
      errors.uppercase = 'Must contain at least one uppercase letter';
    }
    if (!/\d/.test(value)) {
      errors.number = 'Must contain at least one number';
    }
    if (!/[^a-zA-Z0-9]/.test(value)) {
      errors.special = 'Must contain at least one special character';
    }

    if (Object.keys(errors).length > 0) {
      return {
        valid: false,
        message: 'Password does not meet requirements',
        errors,
      };
    }

    return { valid: true };
  },

  /**
   * Confirm password validator
   */
  confirmPassword: (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
      return { valid: false, message: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true };
  },

  /**
   * Name validator
   */
  name: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Name is required' };
    }
    if (value.length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }
    if (value.length > 50) {
      return { valid: false, message: 'Name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return { valid: false, message: 'Name contains invalid characters' };
    }
    return { valid: true };
  },

  /**
   * Phone number validator
   */
  phone: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Phone number is required' };
    }
    const cleaned = value.replace(/[\s()-]/g, '');
    if (!/^[0-9]{10,15}$/.test(cleaned)) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }
    return { valid: true };
  },

  /**
   * License plate validator
   */
  licensePlate: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'License plate is required' };
    }
    if (value.length < 2 || value.length > 10) {
      return { valid: false, message: 'License plate must be 2-10 characters' };
    }
    if (!/^[A-Z0-9\s-]+$/.test(value.toUpperCase())) {
      return { valid: false, message: 'License plate contains invalid characters' };
    }
    return { valid: true };
  },

  /**
   * URL validator
   */
  url: (value: string): ValidationResult => {
    if (!value) return { valid: true };
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  },

  /**
   * Number validator
   */
  number: (value: any): ValidationResult => {
    if (value === undefined || value === null || value === '') {
      return { valid: false, message: 'Number is required' };
    }
    if (typeof value === 'number' && isNaN(value)) {
      return { valid: false, message: 'Please enter a valid number' };
    }
    if (typeof value === 'string' && isNaN(Number(value))) {
      return { valid: false, message: 'Please enter a valid number' };
    }
    return { valid: true };
  },

  /**
   * Integer validator
   */
  integer: (value: any): ValidationResult => {
    const numberValidation = CommonValidators.number(value);
    if (!numberValidation.valid) return numberValidation;
    
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(num)) {
      return { valid: false, message: 'Must be a whole number' };
    }
    return { valid: true };
  },

  /**
   * Positive number validator
   */
  positive: (value: any): ValidationResult => {
    const numberValidation = CommonValidators.number(value);
    if (!numberValidation.valid) return numberValidation;
    
    const num = typeof value === 'number' ? value : Number(value);
    if (num <= 0) {
      return { valid: false, message: 'Must be a positive number' };
    }
    return { valid: true };
  },

  /**
   * Date validator
   */
  date: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Date is required' };
    }
    const parsed = parseISO(value);
    if (!isDateValid(parsed)) {
      return { valid: false, message: 'Please enter a valid date' };
    }
    return { valid: true };
  },

  /**
   * Future date validator
   */
  futureDate: (value: string): ValidationResult => {
    const dateValidation = CommonValidators.date(value);
    if (!dateValidation.valid) return dateValidation;
    
    const parsed = parseISO(value);
    const now = new Date();
    if (parsed <= now) {
      return { valid: false, message: 'Date must be in the future' };
    }
    return { valid: true };
  },

  /**
   * Past date validator
   */
  pastDate: (value: string): ValidationResult => {
    const dateValidation = CommonValidators.date(value);
    if (!dateValidation.valid) return dateValidation;
    
    const parsed = parseISO(value);
    const now = new Date();
    if (parsed >= now) {
      return { valid: false, message: 'Date must be in the past' };
    }
    return { valid: true };
  },

  /**
   * Time validator
   */
  time: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Time is required' };
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return { valid: false, message: 'Please enter a valid time (HH:MM)' };
    }
    return { valid: true };
  },

  /**
   * Time range validator
   */
  timeRange: (start: string, end: string): ValidationResult => {
    const startValidation = CommonValidators.time(start);
    if (!startValidation.valid) return startValidation;
    
    const endValidation = CommonValidators.time(end);
    if (!endValidation.valid) return endValidation;
    
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    
    if (startTotal >= endTotal) {
      return { valid: false, message: 'End time must be after start time' };
    }
    return { valid: true };
  },

  /**
   * Date range validator
   */
  dateRange: (start: string, end: string): ValidationResult => {
    const startValidation = CommonValidators.date(start);
    if (!startValidation.valid) return startValidation;
    
    const endValidation = CommonValidators.date(end);
    if (!endValidation.valid) return endValidation;
    
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    if (startDate >= endDate) {
      return { valid: false, message: 'End date must be after start date' };
    }
    return { valid: true };
  },

  /**
   * Credit card number validator
   */
  creditCard: (value: string): ValidationResult => {
    const cleaned = value.replace(/\s/g, '');
    if (!cleaned) {
      return { valid: false, message: 'Credit card number is required' };
    }
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, message: 'Please enter a valid credit card number' };
    }
    
    // Luhn algorithm
    let sum = 0;
    let alternate = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let n = parseInt(cleaned[i]);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    if (sum % 10 !== 0) {
      return { valid: false, message: 'Please enter a valid credit card number' };
    }
    return { valid: true };
  },

  /**
   * CVV validator
   */
  cvv: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'CVV is required' };
    }
    if (!/^[0-9]{3,4}$/.test(value)) {
      return { valid: false, message: 'Please enter a valid CVV' };
    }
    return { valid: true };
  },

  /**
   * Expiry date validator
   */
  expiryDate: (month: string, year: string): ValidationResult => {
    if (!month || !year) {
      return { valid: false, message: 'Expiry date is required' };
    }
    const m = parseInt(month);
    const y = parseInt(year);
    if (m < 1 || m > 12) {
      return { valid: false, message: 'Please enter a valid month' };
    }
    if (y < 0 || y > 99) {
      return { valid: false, message: 'Please enter a valid year' };
    }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (y < currentYear || (y === currentYear && m < currentMonth)) {
      return { valid: false, message: 'Card has expired' };
    }
    return { valid: true };
  },

  /**
   * Postal code validator
   */
  postalCode: (value: string, country: string = 'US'): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Postal code is required' };
    }
    const patterns: { [key: string]: RegExp } = {
      US: /^\d{5}(-\d{4})?$/,
      GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
      AU: /^\d{4}$/,
      DE: /^\d{5}$/,
      FR: /^\d{5}$/,
      IN: /^\d{6}$/,
      JP: /^\d{3}-\d{4}$/,
      CN: /^\d{6}$/,
      BR: /^\d{5}-\d{3}$/,
    };
    const pattern = patterns[country] || /.*/;
    if (!pattern.test(value)) {
      return { valid: false, message: 'Please enter a valid postal code' };
    }
    return { valid: true };
  },

  /**
   * VIN validator (Vehicle Identification Number)
   */
  vin: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'VIN is required' };
    }
    if (value.length !== 17) {
      return { valid: false, message: 'VIN must be exactly 17 characters' };
    }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(value)) {
      return { valid: false, message: 'VIN contains invalid characters' };
    }
    return { valid: true };
  },

  /**
   * Zip code validator
   */
  zipCode: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'ZIP code is required' };
    }
    if (!/^\d{5}(-\d{4})?$/.test(value)) {
      return { valid: false, message: 'Please enter a valid ZIP code' };
    }
    return { valid: true };
  },
};

/**
 * Password Strength Validator
 */
export const PasswordStrength = {
  /**
   * Calculate password strength score
   */
  score: (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  },

  /**
   * Get password strength label
   */
  label: (score: number): string => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Fair';
    if (score <= 5) return 'Good';
    return 'Strong';
  },

  /**
   * Get password strength color
   */
  color: (score: number): string => {
    if (score <= 2) return '#FF4444';
    if (score <= 4) return '#FFA94D';
    if (score <= 5) return '#4ECDC4';
    return '#2ECC71';
  },

  /**
   * Get password strength requirements
   */
  requirements: (password: string): { met: boolean; text: string }[] => {
    return [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[a-z]/.test(password), text: 'Lowercase letters' },
      { met: /[A-Z]/.test(password), text: 'Uppercase letters' },
      { met: /\d/.test(password), text: 'Numbers' },
      { met: /[^a-zA-Z0-9]/.test(password), text: 'Special characters' },
    ];
  },
};

/**
 * Form Validator
 */
export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {};

  /**
   * Add validation rules for a field
   */
  addRules(field: string, rules: ValidationRule[]): void {
    this.rules[field] = rules;
  }

  /**
   * Validate a single field
   */
  validateField(field: string, value: any): ValidationResult {
    const rules = this.rules[field] || [];
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return { valid: false, message: rule.message };
      }
    }
    return { valid: true };
  }

  /**
   * Validate all fields
   */
  validateAll(values: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    for (const field of Object.keys(this.rules)) {
      results[field] = this.validateField(field, values[field]);
    }
    return results;
  }

  /**
   * Check if all fields are valid
   */
  isValid(values: Record<string, any>): boolean {
    const results = this.validateAll(values);
    return Object.values(results).every(result => result.valid);
  }

  /**
   * Get first error message
   */
  getFirstError(values: Record<string, any>): string | null {
    const results = this.validateAll(values);
    for (const result of Object.values(results)) {
      if (!result.valid && result.message) {
        return result.message;
      }
    }
    return null;
  }
}

/**
 * Combine multiple validators
 */
export const combineValidators = (...validators: ((value: any) => ValidationResult)[]) => {
  return (value: any): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
};

/**
 * Create a custom validator
 */
export const createValidator = (
  validate: (value: any) => boolean,
  message: string
): ValidationRule => ({
  validate,
  message,
});

/**
 * Export all validators
 */
export const Validators = {
  common: CommonValidators,
  passwordStrength: PasswordStrength,
  FormValidator,
  combineValidators,
  createValidator,
};

export default Validators;
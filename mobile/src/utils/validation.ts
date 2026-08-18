// ============================================================================
// Validation - Form Validation Utilities
// ============================================================================

// parking-management-system/mobile/src/utils/validation.ts

/**
 * Validation Rules
 */
export const VALIDATION = {
  // Email Validation
  email: (email: string): { valid: boolean; message?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { valid: false, message: 'Email is required' };
    }
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  // Password Validation
  password: (password: string): { valid: boolean; message?: string } => {
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (password.length > 32) {
      return { valid: false, message: 'Password must be less than 32 characters' };
    }
    return { valid: true };
  },

  // Confirm Password Validation
  confirmPassword: (password: string, confirmPassword: string): { valid: boolean; message?: string } => {
    if (!confirmPassword) {
      return { valid: false, message: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true };
  },

  // Name Validation
  name: (name: string): { valid: boolean; message?: string } => {
    if (!name) {
      return { valid: false, message: 'Name is required' };
    }
    if (name.length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }
    if (name.length > 50) {
      return { valid: false, message: 'Name must be less than 50 characters' };
    }
    return { valid: true };
  },

  // Phone Validation
  phone: (phone: string): { valid: boolean; message?: string } => {
    if (!phone) {
      return { valid: false, message: 'Phone number is required' };
    }
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (!phoneRegex.test(cleaned)) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }
    return { valid: true };
  },

  // License Plate Validation
  licensePlate: (plate: string): { valid: boolean; message?: string } => {
    if (!plate) {
      return { valid: false, message: 'License plate is required' };
    }
    if (plate.length < 2 || plate.length > 10) {
      return { valid: false, message: 'License plate must be 2-10 characters' };
    }
    return { valid: true };
  },

  // URL Validation
  url: (url: string): { valid: boolean; message?: string } => {
    if (!url) return { valid: true };
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  },

  // Number Validation
  number: (value: number, min?: number, max?: number): { valid: boolean; message?: string } => {
    if (value === undefined || value === null) {
      return { valid: false, message: 'Value is required' };
    }
    if (typeof value !== 'number') {
      return { valid: false, message: 'Value must be a number' };
    }
    if (min !== undefined && value < min) {
      return { valid: false, message: `Value must be at least ${min}` };
    }
    if (max !== undefined && value > max) {
      return { valid: false, message: `Value must be at most ${max}` };
    }
    return { valid: true };
  },

  // Date Validation
  date: (date: string): { valid: boolean; message?: string } => {
    if (!date) {
      return { valid: false, message: 'Date is required' };
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return { valid: false, message: 'Please enter a valid date' };
    }
    return { valid: true };
  },

  // Future Date Validation
  futureDate: (date: string): { valid: boolean; message?: string } => {
    const dateValidation = VALIDATION.date(date);
    if (!dateValidation.valid) return dateValidation;
    
    const d = new Date(date);
    const now = new Date();
    if (d <= now) {
      return { valid: false, message: 'Date must be in the future' };
    }
    return { valid: true };
  },

  // Past Date Validation
  pastDate: (date: string): { valid: boolean; message?: string } => {
    const dateValidation = VALIDATION.date(date);
    if (!dateValidation.valid) return dateValidation;
    
    const d = new Date(date);
    const now = new Date();
    if (d >= now) {
      return { valid: false, message: 'Date must be in the past' };
    }
    return { valid: true };
  },

  // Time Validation
  time: (time: string): { valid: boolean; message?: string } => {
    if (!time) {
      return { valid: false, message: 'Time is required' };
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return { valid: false, message: 'Please enter a valid time (HH:MM)' };
    }
    return { valid: true };
  },

  // Credit Card Validation
  creditCard: (number: string): { valid: boolean; message?: string } => {
    const cleaned = number.replace(/\s/g, '');
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

  // CVV Validation
  cvv: (cvv: string): { valid: boolean; message?: string } => {
    if (!cvv) {
      return { valid: false, message: 'CVV is required' };
    }
    if (!/^[0-9]{3,4}$/.test(cvv)) {
      return { valid: false, message: 'Please enter a valid CVV' };
    }
    return { valid: true };
  },

  // Expiry Date Validation
  expiryDate: (month: string, year: string): { valid: boolean; message?: string } => {
    if (!month || !year) {
      return { valid: false, message: 'Expiry date is required' };
    }
    const m = parseInt(month);
    const y = parseInt(year);
    if (m < 1 || m > 12) {
      return { valid: false, message: 'Please enter a valid month' };
    }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (y < currentYear || (y === currentYear && m < currentMonth)) {
      return { valid: false, message: 'Card has expired' };
    }
    return { valid: true };
  },

  // Postal Code Validation
  postalCode: (code: string, country: string = 'US'): { valid: boolean; message?: string } => {
    if (!code) {
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
    };
    const pattern = patterns[country] || /.*/;
    if (!pattern.test(code)) {
      return { valid: false, message: 'Please enter a valid postal code' };
    }
    return { valid: true };
  },

  // Required Field Validation
  required: (value: any): { valid: boolean; message?: string } => {
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

  // Min Length Validation
  minLength: (value: string, length: number): { valid: boolean; message?: string } => {
    if (!value) {
      return { valid: false, message: `Must be at least ${length} characters` };
    }
    if (value.length < length) {
      return { valid: false, message: `Must be at least ${length} characters` };
    }
    return { valid: true };
  },

  // Max Length Validation
  maxLength: (value: string, length: number): { valid: boolean; message?: string } => {
    if (!value) {
      return { valid: true };
    }
    if (value.length > length) {
      return { valid: false, message: `Must be at most ${length} characters` };
    }
    return { valid: true };
  },

  // Min Value Validation
  minValue: (value: number, min: number): { valid: boolean; message?: string } => {
    if (value === undefined || value === null) {
      return { valid: false, message: `Value must be at least ${min}` };
    }
    if (value < min) {
      return { valid: false, message: `Value must be at least ${min}` };
    }
    return { valid: true };
  },

  // Max Value Validation
  maxValue: (value: number, max: number): { valid: boolean; message?: string } => {
    if (value === undefined || value === null) {
      return { valid: false, message: `Value must be at most ${max}` };
    }
    if (value > max) {
      return { valid: false, message: `Value must be at most ${max}` };
    }
    return { valid: true };
  },

  // Password Strength Validation
  passwordStrength: (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    const checks = [
      { regex: /.{8,}/, points: 1 },
      { regex: /[a-z]/, points: 1 },
      { regex: /[A-Z]/, points: 1 },
      { regex: /\d/, points: 1 },
      { regex: /[^a-zA-Z0-9]/, points: 1 },
    ];
    
    checks.forEach(check => {
      if (check.regex.test(password)) {
        score += check.points;
      }
    });

    const levels = [
      { min: 0, label: 'Very Weak', color: '#FF4444' },
      { min: 1, label: 'Weak', color: '#FF6B6B' },
      { min: 2, label: 'Fair', color: '#FFA94D' },
      { min: 3, label: 'Good', color: '#4ECDC4' },
      { min: 4, label: 'Strong', color: '#45B7D1' },
      { min: 5, label: 'Very Strong', color: '#2ECC71' },
    ];

    const level = levels.reduce((prev, curr) => {
      return score >= curr.min ? curr : prev;
    }, levels[0]);

    return { score, label: level.label, color: level.color };
  },

  // Date Range Validation
  dateRange: (startDate: string, endDate: string): { valid: boolean; message?: string } => {
    const startValidation = VALIDATION.date(startDate);
    if (!startValidation.valid) return startValidation;
    
    const endValidation = VALIDATION.date(endDate);
    if (!endValidation.valid) return endValidation;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return { valid: false, message: 'End date must be after start date' };
    }
    
    return { valid: true };
  },

  // Time Range Validation
  timeRange: (startTime: string, endTime: string): { valid: boolean; message?: string } => {
    const startValidation = VALIDATION.time(startTime);
    if (!startValidation.valid) return startValidation;
    
    const endValidation = VALIDATION.time(endTime);
    if (!endValidation.valid) return endValidation;
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    
    if (startTotal >= endTotal) {
      return { valid: false, message: 'End time must be after start time' };
    }
    
    return { valid: true };
  },
};

export default VALIDATION;
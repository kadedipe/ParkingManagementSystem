// ============================================================================
// Validators Utility
// ============================================================================

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length === 0) return 'none';
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // Determine strength
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  return /^\+?[\d\s-]{10,15}$/.test(phone);
};

/**
 * Validate license plate
 */
export const validateLicensePlate = (plate) => {
  return /^[A-Z0-9]{1,8}$/.test(plate.toUpperCase());
};

/**
 * Validate VIN
 */
export const validateVIN = (vin) => {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase());
};

export default {
  validatePasswordStrength,
  validateEmail,
  validatePhone,
  validateLicensePlate,
  validateVIN,
};
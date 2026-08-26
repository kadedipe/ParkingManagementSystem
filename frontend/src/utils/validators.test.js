import { describe, expect, it } from 'vitest';

import {
  validateEmail,
  validateLicensePlate,
  validatePasswordStrength,
} from './validators';

describe('validators', () => {
  it('classifies password strength across representative inputs', () => {
    expect(validatePasswordStrength('')).toBe('none');
    expect(validatePasswordStrength('short')).toBe('weak');
    expect(validatePasswordStrength('LongerPass1!')).toBe('strong');
  });

  it('validates email addresses', () => {
    expect(validateEmail('driver@example.com')).toBe(true);
    expect(validateEmail('not-an-email')).toBe(false);
  });

  it('validates normalized license plates', () => {
    expect(validateLicensePlate('ABC123')).toBe(true);
    expect(validateLicensePlate('TOO-LONG-PLATE')).toBe(false);
  });
});

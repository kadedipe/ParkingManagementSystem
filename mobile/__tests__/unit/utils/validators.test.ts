// ============================================================================
// Validator Tests - Validation Utility Tests
// ============================================================================

// parking-management-system/mobile/__tests__/unit/utils/validators.test.ts

import { CommonValidators, PasswordStrength, FormValidator } from '../../../src/utils/validators';

describe('Validators', () => {
  describe('CommonValidators', () => {
    describe('required', () => {
      test('should validate required fields', () => {
        expect(CommonValidators.required('test')).toEqual({ valid: true });
        expect(CommonValidators.required(123)).toEqual({ valid: true });
        expect(CommonValidators.required([])).toEqual({ valid: false, message: 'This field is required' });
        expect(CommonValidators.required('')).toEqual({ valid: false, message: 'This field is required' });
        expect(CommonValidators.required(null)).toEqual({ valid: false, message: 'This field is required' });
        expect(CommonValidators.required(undefined)).toEqual({ valid: false, message: 'This field is required' });
      });
    });

    describe('email', () => {
      test('should validate email addresses', () => {
        expect(CommonValidators.email('test@example.com')).toEqual({ valid: true });
        expect(CommonValidators.email('user.name+tag@example.co.uk')).toEqual({ valid: true });
        expect(CommonValidators.email('invalid-email')).toEqual({ 
          valid: false, 
          message: 'Please enter a valid email address' 
        });
        expect(CommonValidators.email('')).toEqual({ 
          valid: false, 
          message: 'Email is required' 
        });
      });
    });

    describe('password', () => {
      test('should validate password requirements', () => {
        expect(CommonValidators.password('password123')).toEqual({ valid: true });
        expect(CommonValidators.password('12345678')).toEqual({ valid: true });
        expect(CommonValidators.password('short')).toEqual({ 
          valid: false, 
          message: 'Password must be at least 8 characters' 
        });
        expect(CommonValidators.password('')).toEqual({ 
          valid: false, 
          message: 'Password is required' 
        });
      });
    });

    describe('strongPassword', () => {
      test('should validate strong password requirements', () => {
        const result = CommonValidators.strongPassword('StrongP@ss123');
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();

        const weakResult = CommonValidators.strongPassword('weakpass');
        expect(weakResult.valid).toBe(false);
        expect(weakResult.errors).toBeDefined();
        expect(weakResult.errors?.lowercase).toBeUndefined();
        expect(weakResult.errors?.uppercase).toBeDefined();
        expect(weakResult.errors?.number).toBeDefined();
        expect(weakResult.errors?.special).toBeDefined();
      });
    });

    describe('confirmPassword', () => {
      test('should validate password confirmation', () => {
        expect(CommonValidators.confirmPassword('password123', 'password123')).toEqual({ valid: true });
        expect(CommonValidators.confirmPassword('password123', 'password456')).toEqual({ 
          valid: false, 
          message: 'Passwords do not match' 
        });
        expect(CommonValidators.confirmPassword('password123', '')).toEqual({ 
          valid: false, 
          message: 'Please confirm your password' 
        });
      });
    });

    describe('phone', () => {
      test('should validate phone numbers', () => {
        expect(CommonValidators.phone('1234567890')).toEqual({ valid: true });
        expect(CommonValidators.phone('(123) 456-7890')).toEqual({ valid: true });
        expect(CommonValidators.phone('123-456-7890')).toEqual({ valid: true });
        expect(CommonValidators.phone('12345')).toEqual({ 
          valid: false, 
          message: 'Please enter a valid phone number' 
        });
        expect(CommonValidators.phone('')).toEqual({ 
          valid: false, 
          message: 'Phone number is required' 
        });
      });
    });

    describe('name', () => {
      test('should validate names', () => {
        expect(CommonValidators.name('John Doe')).toEqual({ valid: true });
        expect(CommonValidators.name('J')).toEqual({ 
          valid: false, 
          message: 'Name must be at least 2 characters' 
        });
        expect(CommonValidators.name('')).toEqual({ 
          valid: false, 
          message: 'Name is required' 
        });
        expect(CommonValidators.name('John123')).toEqual({ 
          valid: false, 
          message: 'Name contains invalid characters' 
        });
      });
    });

    describe('date', () => {
      test('should validate dates', () => {
        expect(CommonValidators.date('2024-01-15')).toEqual({ valid: true });
        expect(CommonValidators.date('2024-01-15T10:30:00')).toEqual({ valid: true });
        expect(CommonValidators.date('invalid-date')).toEqual({ 
          valid: false, 
          message: 'Please enter a valid date' 
        });
        expect(CommonValidators.date('')).toEqual({ 
          valid: false, 
          message: 'Date is required' 
        });
      });
    });

    describe('futureDate', () => {
      test('should validate future dates', () => {
        const future = new Date();
        future.setDate(future.getDate() + 1);
        expect(CommonValidators.futureDate(future.toISOString())).toEqual({ valid: true });

        const past = new Date();
        past.setDate(past.getDate() - 1);
        expect(CommonValidators.futureDate(past.toISOString())).toEqual({ 
          valid: false, 
          message: 'Date must be in the future' 
        });
      });
    });

    describe('pastDate', () => {
      test('should validate past dates', () => {
        const past = new Date();
        past.setDate(past.getDate() - 1);
        expect(CommonValidators.pastDate(past.toISOString())).toEqual({ valid: true });

        const future = new Date();
        future.setDate(future.getDate() + 1);
        expect(CommonValidators.pastDate(future.toISOString())).toEqual({ 
          valid: false, 
          message: 'Date must be in the past' 
        });
      });
    });
  });

  describe('PasswordStrength', () => {
    describe('score', () => {
      test('should calculate password strength score', () => {
        expect(PasswordStrength.score('weak')).toBe(1);
        expect(PasswordStrength.score('WeakPass')).toBe(2);
        expect(PasswordStrength.score('WeakPass1')).toBe(3);
        expect(PasswordStrength.score('StrongP@ss1')).toBe(5);
        expect(PasswordStrength.score('VeryStrongP@ssw0rd!')).toBe(6);
      });
    });

    describe('label', () => {
      test('should return appropriate strength labels', () => {
        expect(PasswordStrength.label(0)).toBe('Weak');
        expect(PasswordStrength.label(1)).toBe('Weak');
        expect(PasswordStrength.label(2)).toBe('Weak');
        expect(PasswordStrength.label(3)).toBe('Fair');
        expect(PasswordStrength.label(4)).toBe('Good');
        expect(PasswordStrength.label(5)).toBe('Good');
        expect(PasswordStrength.label(6)).toBe('Strong');
      });
    });

    describe('color', () => {
      test('should return appropriate strength colors', () => {
        expect(PasswordStrength.color(0)).toBe('#FF4444');
        expect(PasswordStrength.color(2)).toBe('#FF4444');
        expect(PasswordStrength.color(3)).toBe('#FFA94D');
        expect(PasswordStrength.color(4)).toBe('#4ECDC4');
        expect(PasswordStrength.color(5)).toBe('#4ECDC4');
        expect(PasswordStrength.color(6)).toBe('#2ECC71');
      });
    });

    describe('requirements', () => {
      test('should return password requirements status', () => {
        const requirements = PasswordStrength.requirements('StrongP@ss1');
        expect(requirements).toHaveLength(5);
        expect(requirements[0]).toEqual({ met: true, text: 'At least 8 characters' });
        expect(requirements[1]).toEqual({ met: true, text: 'Lowercase letters' });
        expect(requirements[2]).toEqual({ met: true, text: 'Uppercase letters' });
        expect(requirements[3]).toEqual({ met: true, text: 'Numbers' });
        expect(requirements[4]).toEqual({ met: true, text: 'Special characters' });

        const weakRequirements = PasswordStrength.requirements('weak');
        expect(weakRequirements[0]).toEqual({ met: false, text: 'At least 8 characters' });
        expect(weakRequirements[1]).toEqual({ met: true, text: 'Lowercase letters' });
        expect(weakRequirements[2]).toEqual({ met: false, text: 'Uppercase letters' });
        expect(weakRequirements[3]).toEqual({ met: false, text: 'Numbers' });
        expect(weakRequirements[4]).toEqual({ met: false, text: 'Special characters' });
      });
    });
  });

  describe('FormValidator', () => {
    test('should validate form fields', () => {
      const validator = new FormValidator();
      validator.addRules('email', [
        { validate: (v) => !!v, message: 'Email is required' },
        { validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Invalid email' },
      ]);
      validator.addRules('password', [
        { validate: (v) => v.length >= 8, message: 'Password too short' },
      ]);

      const values = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(validator.isValid(values)).toBe(true);
      expect(validator.getFirstError(values)).toBeNull();

      const invalidValues = {
        email: 'invalid',
        password: 'short',
      };

      expect(validator.isValid(invalidValues)).toBe(false);
      expect(validator.getFirstError(invalidValues)).toBe('Invalid email');

      const results = validator.validateAll(values);
      expect(results.email).toEqual({ valid: true });
      expect(results.password).toEqual({ valid: true });
    });
  });
});
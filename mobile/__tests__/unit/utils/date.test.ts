// ============================================================================
// Date Utilities Tests - Date Utility Tests
// ============================================================================

// parking-management-system/mobile/__tests__/unit/utils/date.test.ts

import DateUtils from '../../../src/utils/date';

describe('DateUtils', () => {
  const testDate = new Date('2024-01-15T10:30:00');

  describe('format', () => {
    test('should format date correctly', () => {
      expect(DateUtils.format(testDate)).toBe('Jan 15, 2024');
      expect(DateUtils.format(testDate, 'yyyy-MM-dd')).toBe('2024-01-15');
      expect(DateUtils.format(testDate, 'h:mm a')).toBe('10:30 AM');
    });

    test('should handle invalid dates', () => {
      expect(DateUtils.format('invalid')).toBe('Invalid date');
    });
  });

  describe('formatDateTime', () => {
    test('should format date and time correctly', () => {
      expect(DateUtils.formatDateTime(testDate)).toBe('Jan 15, 2024 10:30 AM');
    });
  });

  describe('formatRelative', () => {
    test('should format relative time correctly', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 1000 * 60 * 60 * 2); // 2 hours ago
      expect(DateUtils.formatRelative(date)).toContain('hours');
    });
  });

  describe('formatDistanceToNow', () => {
    test('should format distance to now correctly', () => {
      const now = new Date();
      const date = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
      expect(DateUtils.formatDistanceToNow(date)).toContain('2 days');
    });
  });

  describe('daysBetween', () => {
    test('should calculate days between dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-15');
      expect(DateUtils.daysBetween(date1, date2)).toBe(14);
    });
  });

  describe('addDays', () => {
    test('should add days to a date', () => {
      const date = new Date('2024-01-01');
      const result = DateUtils.addDays(date, 5);
      expect(result.getDate()).toBe(6);
      expect(result.getMonth()).toBe(0);
    });
  });

  describe('isToday', () => {
    test('should check if date is today', () => {
      const today = new Date();
      expect(DateUtils.isToday(today)).toBe(true);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      expect(DateUtils.isToday(yesterday)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    test('should check if date is tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(DateUtils.isTomorrow(tomorrow)).toBe(true);
    });
  });

  describe('isYesterday', () => {
    test('should check if date is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(DateUtils.isYesterday(yesterday)).toBe(true);
    });
  });

  describe('startOfDay', () => {
    test('should get start of day', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = DateUtils.startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    test('should get end of day', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = DateUtils.endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });

  describe('friendlyDate', () => {
    test('should return friendly date string', () => {
      const today = new Date();
      expect(DateUtils.friendlyDate(today)).toBe('Today');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(DateUtils.friendlyDate(tomorrow)).toBe('Tomorrow');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(DateUtils.friendlyDate(yesterday)).toBe('Yesterday');

      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() + 3);
      expect(DateUtils.friendlyDate(thisWeek)).toContain('day');
    });
  });

  describe('timeRemaining', () => {
    test('should format time remaining', () => {
      const future = new Date();
      future.setHours(future.getHours() + 2);
      future.setMinutes(future.getMinutes() + 30);
      expect(DateUtils.timeRemaining(future)).toContain('2h');
    });

    test('should handle expired dates', () => {
      const past = new Date();
      past.setHours(past.getHours() - 1);
      expect(DateUtils.timeRemaining(past)).toBe('Time expired');
    });
  });
});
// ============================================================================
// Formatters - Formatting Utility Functions
// ============================================================================

// parking-management-system/mobile/src/utils/formatters.ts

import { format, formatDistance, formatRelative, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { APP_CONSTANTS } from './constants';

/**
 * Date Formatters
 */
export const DateFormatters = {
  /**
   * Format date to display string
   */
  formatDate: (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return format(parsed, formatStr);
  },

  /**
   * Format date with time
   */
  formatDateTime: (date: Date | string): string => {
    return DateFormatters.formatDate(date, 'MMM dd, yyyy h:mm a');
  },

  /**
   * Format date with time (short)
   */
  formatDateTimeShort: (date: Date | string): string => {
    return DateFormatters.formatDate(date, 'MMM dd h:mm a');
  },

  /**
   * Format time only
   */
  formatTime: (date: Date | string): string => {
    return DateFormatters.formatDate(date, 'h:mm a');
  },

  /**
   * Format date to relative time
   */
  formatRelativeTime: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return formatRelative(parsed, new Date());
  },

  /**
   * Format date to distance from now
   */
  formatDistanceToNow: (date: Date | string, options?: { includeSeconds?: boolean }): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return formatDistanceToNow(parsed, { addSuffix: true, ...options });
  },

  /**
   * Format date to friendly string (Today, Tomorrow, Yesterday, etc.)
   */
  formatFriendlyDate: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    
    const diffDays = Math.floor((dateToCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7 && diffDays <= 14) return 'Next week';
    if (diffDays < -7 && diffDays >= -14) return 'Last week';
    
    return format(parsed, 'MMM dd, yyyy');
  },

  /**
   * Format date to ISO string
   */
  formatISO: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return '';
    return parsed.toISOString();
  },

  /**
   * Format date to API format
   */
  formatAPI: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return '';
    return format(parsed, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  },

  /**
   * Format duration in seconds to readable string
   */
  formatDuration: (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    
    const now = new Date();
    if (parsed <= now) return 'Expired';
    
    const diff = parsed.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Format time elapsed
   */
  formatTimeElapsed: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return formatDistanceToNow(parsed, { addSuffix: true });
  },
};

/**
 * Number Formatters
 */
export const NumberFormatters = {
  /**
   * Format number with comma separators
   */
  formatNumber: (num: number, decimals: number = 0): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format currency with symbol only
   */
  formatCurrencySymbol: (amount: number, currency: string = '$'): string => {
    return `${currency}${amount.toFixed(2)}`;
  },

  /**
   * Format percentage
   */
  formatPercentage: (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  },

  /**
   * Format distance
   */
  formatDistance: (meters: number, unit: 'km' | 'mi' = 'km'): string => {
    if (unit === 'km') {
      const km = meters / 1000;
      if (km >= 10) return `${km.toFixed(0)} km`;
      if (km >= 1) return `${km.toFixed(1)} km`;
      return `${Math.round(meters)} m`;
    } else {
      const miles = meters / 1609.344;
      if (miles >= 10) return `${miles.toFixed(0)} mi`;
      if (miles >= 1) return `${miles.toFixed(1)} mi`;
      return `${Math.round(meters * 0.000621371)} m`;
    }
  },

  /**
   * Format speed
   */
  formatSpeed: (kmh: number): string => {
    return `${kmh.toFixed(0)} km/h`;
  },

  /**
   * Format fuel consumption
   */
  formatFuel: (liters: number): string => {
    return `${liters.toFixed(1)} L`;
  },

  /**
   * Format temperature
   */
  formatTemperature: (celsius: number): string => {
    return `${celsius.toFixed(0)}°C`;
  },

  /**
   * Format phone number
   */
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return phone;
  },

  /**
   * Format credit card number
   */
  formatCreditCard: (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cardNumber;
  },

  /**
   * Format credit card expiry
   */
  formatExpiry: (month: string, year: string): string => {
    return `${month}/${year}`;
  },

  /**
   * Format ordinal number (1st, 2nd, 3rd)
   */
  formatOrdinal: (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
  },

  /**
   * Format number with abbreviation (1k, 1m, 1b)
   */
  formatAbbreviated: (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}b`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}m`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}k`;
    return num.toString();
  },

  /**
   * Format number with sign
   */
  formatWithSign: (num: number): string => {
    if (num > 0) return `+${num}`;
    if (num < 0) return `${num}`;
    return '0';
  },

  /**
   * Format price per unit
   */
  formatPricePerUnit: (price: number, unit: string = 'hr'): string => {
    return `$${price.toFixed(2)}/${unit}`;
  },

  /**
   * Format rating
   */
  formatRating: (rating: number): string => {
    return rating.toFixed(1);
  },

  /**
   * Format star rating
   */
  formatStarRating: (rating: number): string => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  },
};

/**
 * String Formatters
 */
export const StringFormatters = {
  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Capitalize each word
   */
  capitalizeWords: (str: string): string => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, maxLength: number): string => {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  },

  /**
   * Format name
   */
  formatName: (firstName: string, lastName: string): string => {
    return `${StringFormatters.capitalize(firstName)} ${StringFormatters.capitalize(lastName)}`;
  },

  /**
   * Format initials
   */
  formatInitials: (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  },

  /**
   * Format address
   */
  formatAddress: (address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  }): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  },

  /**
   * Format name for display
   */
  formatDisplayName: (name: string): string => {
    if (!name) return 'Guest User';
    return StringFormatters.capitalizeWords(name);
  },

  /**
   * Format email for display
   */
  formatDisplayEmail: (email: string): string => {
    if (!email) return 'No email';
    return email.toLowerCase();
  },

  /**
   * Format phone for display
   */
  formatDisplayPhone: (phone: string): string => {
    if (!phone) return 'No phone';
    return NumberFormatters.formatPhone(phone);
  },

  /**
   * Format plate number
   */
  formatPlateNumber: (plate: string): string => {
    return plate.toUpperCase();
  },

  /**
   * Format status for display
   */
  formatStatus: (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'available': 'Available',
      'occupied': 'Occupied',
      'reserved': 'Reserved',
      'maintenance': 'Maintenance',
    };
    return statusMap[status] || StringFormatters.capitalize(status);
  },

  /**
   * Format vehicle type
   */
  formatVehicleType: (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'car': 'Car',
      'suv': 'SUV',
      'truck': 'Truck',
      'motorcycle': 'Motorcycle',
      'bicycle': 'Bicycle',
    };
    return typeMap[type] || StringFormatters.capitalize(type);
  },

  /**
   * Format amenity
   */
  formatAmenity: (amenity: string): string => {
    const amenityMap: { [key: string]: string } = {
      'ev_charging': 'EV Charging',
      'security': 'Security',
      'covered': 'Covered',
      'handicap': 'Handicap Access',
      'valet': 'Valet',
      '24_hours': '24/7 Access',
      'restroom': 'Restroom',
      'wifi': 'WiFi',
      'cafe': 'Cafe',
    };
    return amenityMap[amenity] || StringFormatters.capitalizeWords(amenity.replace('_', ' '));
  },

  /**
   * Format connector type
   */
  formatConnectorType: (type: string): string => {
    const connectorMap: { [key: string]: string } = {
      'type1': 'Type 1',
      'type2': 'Type 2',
      'ccs': 'CCS',
      'chademo': 'CHAdeMO',
      'tesla': 'Tesla',
    };
    return connectorMap[type] || StringFormatters.capitalize(type);
  },

  /**
   * Format power level
   */
  formatPowerLevel: (level: string): string => {
    const levelMap: { [key: string]: string } = {
      'standard': 'Standard',
      'fast': 'Fast',
      'rapid': 'Rapid',
    };
    return levelMap[level] || StringFormatters.capitalize(level);
  },

  /**
   * Format role
   */
  formatRole: (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'user': 'User',
      'admin': 'Administrator',
      'manager': 'Manager',
    };
    return roleMap[role] || StringFormatters.capitalize(role);
  },

  /**
   * Format payment method type
   */
  formatPaymentMethod: (type: string): string => {
    const methodMap: { [key: string]: string } = {
      'card': 'Credit Card',
      'paypal': 'PayPal',
      'apple_pay': 'Apple Pay',
      'google_pay': 'Google Pay',
      'bank': 'Bank Transfer',
    };
    return methodMap[type] || StringFormatters.capitalize(type);
  },

  /**
   * Format card type
   */
  formatCardType: (type: string): string => {
    const cardMap: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
    };
    return cardMap[type] || StringFormatters.capitalize(type);
  },

  /**
   * Format boolean
   */
  formatBoolean: (value: boolean): string => {
    return value ? 'Yes' : 'No';
  },
};

/**
 * Combined Formatters Object
 */
export const Formatters = {
  date: DateFormatters,
  number: NumberFormatters,
  string: StringFormatters,
};

// Default export
export default Formatters;
// ============================================================================
// String Utilities - String Manipulation Functions
// ============================================================================

// parking-management-system/shared/utils/src/string.ts

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize each word in string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + ellipsis;
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Camel case string
 */
export function camelCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Pascal case string
 */
export function pascalCase(str: string): string {
  if (!str) return '';
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Snake case string
 */
export function snakeCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Kebab case string
 */
export function kebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Title case string
 */
export function titleCase(str: string): string {
  if (!str) return '';
  const exceptions = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in'];
  const words = str.toLowerCase().split(' ');
  return words
    .map((word, index) => {
      if (index === 0 || !exceptions.includes(word)) {
        return capitalize(word);
      }
      return word;
    })
    .join(' ');
}

/**
 * Remove extra whitespace
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extract initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Check if string is empty
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if string is a valid email
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Check if string is a valid URL
 */
export function isURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is a valid phone number
 */
export function isPhone(str: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(str);
}

/**
 * Mask sensitive data
 */
export function maskString(
  str: string,
  start: number = 0,
  end: number = 0,
  maskChar: string = '*'
): string {
  if (!str) return '';
  const visibleStart = str.slice(0, start);
  const visibleEnd = str.slice(-end);
  const maskedLength = str.length - start - end;
  const masked = maskChar.repeat(Math.min(maskedLength, 10));
  return visibleStart + masked + visibleEnd;
}

/**
 * Mask credit card number
 */
export function maskCreditCard(cardNumber: string): string {
  return maskString(cardNumber, 4, 4);
}

/**
 * Mask email
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [username, domain] = email.split('@');
  const maskedUsername = maskString(username, 2, 1);
  return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
  return maskString(phone, 3, 4);
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random alphanumeric string
 */
export function generateAlphaNumeric(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Count words in string
 */
export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).length;
}

/**
 * Count characters in string (excluding whitespace)
 */
export function countCharacters(str: string): number {
  if (!str) return 0;
  return str.replace(/\s/g, '').length;
}

/**
 * Escape HTML
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

/**
 * Unescape HTML
 */
export function unescapeHtml(str: string): string {
  if (!str) return '';
  const unescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return str.replace(/&[^;]+;/g, (entity) => unescapeMap[entity] || entity);
}
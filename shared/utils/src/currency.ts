// ============================================================================
// Currency Utilities - Currency Manipulation Functions
// ============================================================================

// parking-management-system/shared/utils/src/currency.ts

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimalPlaces: number;
  locale: string;
  format: 'symbol' | 'code' | 'name';
}

/**
 * Supported currencies
 */
export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    decimalPlaces: 2,
    locale: 'en-US',
    format: 'symbol',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    decimalPlaces: 2,
    locale: 'de-DE',
    format: 'symbol',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    decimalPlaces: 2,
    locale: 'en-GB',
    format: 'symbol',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    decimalPlaces: 0,
    locale: 'ja-JP',
    format: 'symbol',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    decimalPlaces: 2,
    locale: 'zh-CN',
    format: 'symbol',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    decimalPlaces: 2,
    locale: 'en-IN',
    format: 'symbol',
  },
  CAD: {
    code: 'CAD',
    symbol: '$',
    decimalPlaces: 2,
    locale: 'en-CA',
    format: 'symbol',
  },
  AUD: {
    code: 'AUD',
    symbol: '$',
    decimalPlaces: 2,
    locale: 'en-AU',
    format: 'symbol',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    decimalPlaces: 2,
    locale: 'pt-BR',
    format: 'symbol',
  },
};

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale?: string
): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) {
    return `${amount}`;
  }

  const usedLocale = locale || currency.locale;
  const formatter = new Intl.NumberFormat(usedLocale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });

  return formatter.format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.,-]/g, '');
  const normalized = cleaned.replace(/,/g, '');
  return parseFloat(normalized);
}

/**
 * Convert currency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return amount * rate;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode];
  return currency ? currency.symbol : currencyCode;
}

/**
 * Get currency decimal places
 */
export function getCurrencyDecimalPlaces(currencyCode: string): number {
  const currency = CURRENCIES[currencyCode];
  return currency ? currency.decimalPlaces : 2;
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currencyCode: string = 'USD'): string {
  return formatCurrency(amount, currencyCode);
}

/**
 * Format price range
 */
export function formatPriceRange(
  min: number,
  max: number,
  currencyCode: string = 'USD'
): string {
  const minFormatted = formatCurrency(min, currencyCode);
  const maxFormatted = formatCurrency(max, currencyCode);
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Calculate tax amount
 */
export function calculateTax(
  amount: number,
  taxRate: number,
  currencyCode: string = 'USD'
): number {
  const tax = amount * (taxRate / 100);
  return Math.round(tax * 100) / 100;
}

/**
 * Calculate total with tax
 */
export function calculateTotalWithTax(
  amount: number,
  taxRate: number,
  currencyCode: string = 'USD'
): { subtotal: number; tax: number; total: number } {
  const tax = calculateTax(amount, taxRate, currencyCode);
  const total = amount + tax;
  return {
    subtotal: Math.round(amount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Format invoice amount
 */
export function formatInvoiceAmount(
  amount: number,
  currencyCode: string = 'USD'
): string {
  const formatted = formatCurrency(amount, currencyCode);
  return formatted;
}

/**
 * Check if currency is supported
 */
export function isCurrencySupported(currencyCode: string): boolean {
  return currencyCode in CURRENCIES;
}

/**
 * Get supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCIES);
}

/**
 * Format amount with currency code
 */
export function formatWithCode(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = formatCurrency(amount, currencyCode);
  return `${formatted} (${currencyCode})`;
}
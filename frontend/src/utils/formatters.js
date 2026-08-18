// ============================================================================
// Formatters
// ============================================================================

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format distance
 */
export const formatDistance = (distance, unit = 'km') => {
  if (distance === undefined || distance === null) return '0 km';
  if (unit === 'km') {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }
  return `${distance.toFixed(1)} mi`;
};

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format time
 */
export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export default {
  formatCurrency,
  formatDistance,
  formatDate,
  formatTime,
};
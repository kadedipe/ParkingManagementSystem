// ============================================================================
// Settings Service
// ============================================================================

const STORAGE_KEY = 'parking-management-settings';

const defaults = {
  general: {
    appName: 'Parking Management System',
    appDescription: 'A comprehensive parking management solution',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    parkingAlerts: true,
    chargingAlerts: true,
    paymentAlerts: true,
    systemUpdates: true,
    marketingEmails: false,
  },
  payment: {
    defaultCurrency: 'USD',
    taxRate: 0,
    serviceFee: 0,
    minPaymentAmount: 0.01,
    maxPaymentAmount: 10000,
    paymentMethods: ['credit_card', 'debit_card', 'paypal'],
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    requireStrongPassword: true,
  },
  privacy: {
    showProfilePublic: false,
    shareAnalytics: true,
    cookiesEnabled: true,
    dataRetention: 365,
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const readSettings = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return clone(defaults);
    const parsed = JSON.parse(stored);
    return {
      ...clone(defaults),
      ...parsed,
      general: { ...defaults.general, ...(parsed.general || {}) },
      notifications: { ...defaults.notifications, ...(parsed.notifications || {}) },
      payment: { ...defaults.payment, ...(parsed.payment || {}) },
      security: { ...defaults.security, ...(parsed.security || {}) },
      privacy: { ...defaults.privacy, ...(parsed.privacy || {}) },
    };
  } catch {
    return clone(defaults);
  }
};

const writeSettings = (data) => {
  const next = {
    ...readSettings(),
    ...data,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const settingsService = {
  getSettings: async () => readSettings(),

  updateSettings: async (data) => writeSettings(data),

  exportSettings: async () => readSettings(),

  importSettings: async (data) => writeSettings(data),

  resetSettings: async () => {
    const reset = clone(defaults);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
  },
};

export default settingsService;

// ============================================================================
// Routes Constants - Navigation Routes Configuration
// ============================================================================

// parking-management-system/mobile/src/constants/routes.ts

/**
 * Main route names for the application
 * Centralized route management for consistent navigation
 */
export const ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
    VERIFY_EMAIL: 'VerifyEmail',
    SOCIAL_LOGIN: 'SocialLogin',
    TWO_FACTOR_AUTH: 'TwoFactorAuth',
  },

  // Main App Routes (Tab Navigator)
  APP: {
    HOME: 'Home',
    PARKING: 'Parking',
    CHARGING: 'Charging',
    BOOKINGS: 'Bookings',
    PROFILE: 'Profile',
    NOTIFICATIONS: 'Notifications',
  },

  // Parking Routes
  PARKING: {
    LIST: 'ParkingList',
    DETAILS: 'ParkingDetails',
    MAP: 'ParkingMap',
    SPOTS: 'ParkingSpots',
    SPOT_SELECTOR: 'ParkingSpotSelector',
    FILTER: 'ParkingFilter',
    AVAILABILITY: 'ParkingAvailability',
    REVIEWS: 'ParkingReviews',
    ADD_REVIEW: 'AddParkingReview',
  },

  // Charging Routes
  CHARGING: {
    LIST: 'ChargingList',
    DETAILS: 'ChargingDetails',
    SESSION: 'ChargingSession',
    HISTORY: 'ChargingHistory',
    STATUS: 'ChargingStatus',
    MAP: 'ChargingMap',
    FILTER: 'ChargingFilter',
    RESERVATION: 'ChargingReservation',
  },

  // Booking Routes
  BOOKING: {
    LIST: 'BookingList',
    DETAILS: 'BookingDetails',
    CREATE: 'CreateBooking',
    CONFIRM: 'ConfirmBooking',
    HISTORY: 'BookingHistory',
    CANCEL: 'CancelBooking',
    EXTEND: 'ExtendBooking',
    CHECK_IN: 'CheckIn',
    CHECK_OUT: 'CheckOut',
    QR_CODE: 'BookingQRCode',
  },

  // Payment Routes
  PAYMENT: {
    METHODS: 'PaymentMethods',
    ADD_METHOD: 'AddPaymentMethod',
    PROCESS: 'ProcessPayment',
    HISTORY: 'PaymentHistory',
    DETAILS: 'PaymentDetails',
    RECEIPT: 'PaymentReceipt',
    REFUND: 'RefundPayment',
    WALLET: 'Wallet',
    ADD_FUNDS: 'AddFunds',
    WITHDRAW: 'WithdrawFunds',
  },

  // Profile Routes
  PROFILE: {
    VIEW: 'ProfileView',
    EDIT: 'EditProfile',
    VEHICLES: 'ProfileVehicles',
    ADD_VEHICLE: 'AddVehicle',
    EDIT_VEHICLE: 'EditVehicle',
    SETTINGS: 'Settings',
    CHANGE_PASSWORD: 'ChangePassword',
    NOTIFICATION_SETTINGS: 'NotificationSettings',
    LANGUAGE: 'Language',
    PRIVACY: 'Privacy',
    HELP: 'HelpCenter',
    FEEDBACK: 'Feedback',
    ABOUT: 'About',
    LOYALTY: 'Loyalty',
    REFERRALS: 'Referrals',
  },

  // Settings Routes
  SETTINGS: {
    MAIN: 'SettingsMain',
    ACCOUNT: 'AccountSettings',
    NOTIFICATIONS: 'NotificationSettings',
    PRIVACY: 'PrivacySettings',
    SECURITY: 'SecuritySettings',
    LANGUAGE: 'LanguageSettings',
    THEME: 'ThemeSettings',
    ABOUT: 'AboutApp',
    TERMS: 'TermsOfService',
    PRIVACY_POLICY: 'PrivacyPolicy',
    HELP: 'HelpSupport',
  },

  // Notification Routes
  NOTIFICATION: {
    LIST: 'NotificationList',
    DETAILS: 'NotificationDetails',
    SETTINGS: 'NotificationSettings',
  },

  // Onboarding Routes
  ONBOARDING: {
    WELCOME: 'Welcome',
    STEPS: 'OnboardingSteps',
    COMPLETE: 'OnboardingComplete',
  },

  // Vehicle Routes
  VEHICLE: {
    LIST: 'VehicleList',
    DETAILS: 'VehicleDetails',
    ADD: 'AddVehicle',
    EDIT: 'EditVehicle',
    SELECT: 'SelectVehicle',
  },

  // Search Routes
  SEARCH: {
    MAIN: 'SearchMain',
    RESULTS: 'SearchResults',
    FILTER: 'SearchFilter',
  },

  // Report Routes
  REPORT: {
    LIST: 'ReportList',
    DETAILS: 'ReportDetails',
    GENERATE: 'GenerateReport',
    SCHEDULE: 'ScheduleReport',
    ANALYTICS: 'Analytics',
    EXPORT: 'ExportReport',
  },

  // Support Routes
  SUPPORT: {
    HELP: 'HelpCenter',
    FAQ: 'FAQ',
    CONTACT: 'ContactSupport',
    CHAT: 'LiveChat',
    TICKET: 'SupportTicket',
    TICKET_DETAILS: 'TicketDetails',
  },

  // Common Routes
  COMMON: {
    LOADING: 'Loading',
    ERROR: 'Error',
    NOT_FOUND: 'NotFound',
    MAINTENANCE: 'Maintenance',
    UPDATE: 'UpdateRequired',
    PERMISSION: 'PermissionRequired',
  },
} as const;

/**
 * Tab route names for bottom tab navigator
 */
export const TAB_ROUTES = {
  HOME: ROUTES.APP.HOME,
  PARKING: ROUTES.APP.PARKING,
  CHARGING: ROUTES.APP.CHARGING,
  BOOKINGS: ROUTES.APP.BOOKINGS,
  PROFILE: ROUTES.APP.PROFILE,
} as const;

/**
 * Stack route groups
 */
export const STACK_ROUTES = {
  AUTH: 'AuthStack',
  APP: 'AppStack',
  PARKING: 'ParkingStack',
  CHARGING: 'ChargingStack',
  BOOKING: 'BookingStack',
  PAYMENT: 'PaymentStack',
  PROFILE: 'ProfileStack',
  SETTINGS: 'SettingsStack',
  NOTIFICATION: 'NotificationStack',
  ONBOARDING: 'OnboardingStack',
} as const;

/**
 * Navigation route parameters
 */
export interface RouteParams {
  // Auth params
  [ROUTES.AUTH.LOGIN]: {
    redirectTo?: string;
    email?: string;
  };
  [ROUTES.AUTH.REGISTER]: {
    email?: string;
    referralCode?: string;
  };
  [ROUTES.AUTH.FORGOT_PASSWORD]: {
    email?: string;
  };
  [ROUTES.AUTH.RESET_PASSWORD]: {
    token: string;
  };
  [ROUTES.AUTH.VERIFY_EMAIL]: {
    token: string;
    email?: string;
  };

  // Parking params
  [ROUTES.PARKING.DETAILS]: {
    parkingId: string;
    from?: string;
  };
  [ROUTES.PARKING.SPOTS]: {
    parkingId: string;
  };
  [ROUTES.PARKING.SPOT_SELECTOR]: {
    parkingId: string;
    spots?: any[];
    maxSelectable?: number;
  };
  [ROUTES.PARKING.REVIEWS]: {
    parkingId: string;
  };
  [ROUTES.PARKING.ADD_REVIEW]: {
    parkingId: string;
  };

  // Charging params
  [ROUTES.CHARGING.DETAILS]: {
    stationId: string;
  };
  [ROUTES.CHARGING.SESSION]: {
    sessionId: string;
  };
  [ROUTES.CHARGING.RESERVATION]: {
    stationId: string;
    startTime?: string;
  };

  // Booking params
  [ROUTES.BOOKING.DETAILS]: {
    bookingId: string;
  };
  [ROUTES.BOOKING.CREATE]: {
    parkingId?: string;
    spotId?: string;
    startTime?: string;
    endTime?: string;
  };
  [ROUTES.BOOKING.CONFIRM]: {
    bookingData: any;
  };
  [ROUTES.BOOKING.QR_CODE]: {
    bookingId: string;
  };

  // Payment params
  [ROUTES.PAYMENT.PROCESS]: {
    amount: number;
    bookingId?: string;
    currency?: string;
  };
  [ROUTES.PAYMENT.DETAILS]: {
    paymentId: string;
  };
  [ROUTES.PAYMENT.RECEIPT]: {
    paymentId: string;
  };

  // Profile params
  [ROUTES.PROFILE.EDIT]: {
    userId?: string;
  };
  [ROUTES.PROFILE.VEHICLES]: {
    selectMode?: boolean;
    onSelect?: (vehicle: any) => void;
  };
  [ROUTES.PROFILE.ADD_VEHICLE]: {
    vehicleData?: any;
  };
  [ROUTES.PROFILE.EDIT_VEHICLE]: {
    vehicleId: string;
  };

  // Notification params
  [ROUTES.NOTIFICATION.DETAILS]: {
    notificationId: string;
  };

  // Common params
  [ROUTES.COMMON.ERROR]: {
    error: string;
    retry?: () => void;
  };
  [ROUTES.COMMON.NOT_FOUND]: {
    resource?: string;
  };
}

/**
 * Route helper functions
 */
export const RouteHelpers = {
  /**
   * Get route name with params
   */
  getRoute: <T extends keyof RouteParams>(
    routeName: T,
    params?: RouteParams[T]
  ): { name: T; params?: RouteParams[T] } => {
    return {
      name: routeName,
      params,
    };
  },

  /**
   * Check if route exists
   */
  routeExists: (routeName: string): boolean => {
    const allRoutes = Object.values(ROUTES).flatMap((group) =>
      Object.values(group)
    );
    return allRoutes.includes(routeName);
  },

  /**
   * Get route group
   */
  getRouteGroup: (routeName: string): string | null => {
    for (const [group, routes] of Object.entries(ROUTES)) {
      if (Object.values(routes).includes(routeName)) {
        return group;
      }
    }
    return null;
  },

  /**
   * Check if route requires authentication
   */
  requiresAuth: (routeName: string): boolean => {
    const authRoutes = Object.values(ROUTES.AUTH);
    const onboardingRoutes = Object.values(ROUTES.ONBOARDING);
    return !authRoutes.includes(routeName) && !onboardingRoutes.includes(routeName);
  },

  /**
   * Get nested route path
   */
  getNestedPath: (stack: string, screen: string): string => {
    return `${stack}/${screen}`;
  },
};

/**
 * Deep route mapping for nested navigators
 */
export const ROUTE_MAP = {
  // Auth stack
  AuthStack: {
    Login: ROUTES.AUTH.LOGIN,
    Register: ROUTES.AUTH.REGISTER,
    ForgotPassword: ROUTES.AUTH.FORGOT_PASSWORD,
    ResetPassword: ROUTES.AUTH.RESET_PASSWORD,
    VerifyEmail: ROUTES.AUTH.VERIFY_EMAIL,
  },

  // Parking stack
  ParkingStack: {
    ParkingList: ROUTES.PARKING.LIST,
    ParkingDetails: ROUTES.PARKING.DETAILS,
    ParkingMap: ROUTES.PARKING.MAP,
    ParkingSpots: ROUTES.PARKING.SPOTS,
    ParkingSpotSelector: ROUTES.PARKING.SPOT_SELECTOR,
    ParkingReviews: ROUTES.PARKING.REVIEWS,
    AddParkingReview: ROUTES.PARKING.ADD_REVIEW,
  },

  // Charging stack
  ChargingStack: {
    ChargingList: ROUTES.CHARGING.LIST,
    ChargingDetails: ROUTES.CHARGING.DETAILS,
    ChargingSession: ROUTES.CHARGING.SESSION,
    ChargingHistory: ROUTES.CHARGING.HISTORY,
    ChargingMap: ROUTES.CHARGING.MAP,
    ChargingReservation: ROUTES.CHARGING.RESERVATION,
  },

  // Booking stack
  BookingStack: {
    BookingList: ROUTES.BOOKING.LIST,
    BookingDetails: ROUTES.BOOKING.DETAILS,
    CreateBooking: ROUTES.BOOKING.CREATE,
    ConfirmBooking: ROUTES.BOOKING.CONFIRM,
    BookingHistory: ROUTES.BOOKING.HISTORY,
    BookingQRCode: ROUTES.BOOKING.QR_CODE,
  },

  // Profile stack
  ProfileStack: {
    ProfileView: ROUTES.PROFILE.VIEW,
    EditProfile: ROUTES.PROFILE.EDIT,
    ProfileVehicles: ROUTES.PROFILE.VEHICLES,
    AddVehicle: ROUTES.PROFILE.ADD_VEHICLE,
    EditVehicle: ROUTES.PROFILE.EDIT_VEHICLE,
    Settings: ROUTES.PROFILE.SETTINGS,
    ChangePassword: ROUTES.PROFILE.CHANGE_PASSWORD,
    Loyalty: ROUTES.PROFILE.LOYALTY,
    Referrals: ROUTES.PROFILE.REFERRALS,
  },

  // Payment stack
  PaymentStack: {
    PaymentMethods: ROUTES.PAYMENT.METHODS,
    AddPaymentMethod: ROUTES.PAYMENT.ADD_METHOD,
    ProcessPayment: ROUTES.PAYMENT.PROCESS,
    PaymentHistory: ROUTES.PAYMENT.HISTORY,
    PaymentDetails: ROUTES.PAYMENT.DETAILS,
    PaymentReceipt: ROUTES.PAYMENT.RECEIPT,
    Wallet: ROUTES.PAYMENT.WALLET,
    AddFunds: ROUTES.PAYMENT.ADD_FUNDS,
    WithdrawFunds: ROUTES.PAYMENT.WITHDRAW,
  },
} as const;

/**
 * Tab icons mapping
 */
export const TAB_ICONS = {
  [ROUTES.APP.HOME]: 'home',
  [ROUTES.APP.PARKING]: 'parking',
  [ROUTES.APP.CHARGING]: 'zap',
  [ROUTES.APP.BOOKINGS]: 'calendar',
  [ROUTES.APP.PROFILE]: 'user',
} as const;

/**
 * Tab labels mapping
 */
export const TAB_LABELS = {
  [ROUTES.APP.HOME]: 'Home',
  [ROUTES.APP.PARKING]: 'Parking',
  [ROUTES.APP.CHARGING]: 'Charging',
  [ROUTES.APP.BOOKINGS]: 'Bookings',
  [ROUTES.APP.PROFILE]: 'Profile',
} as const;

/**
 * Navigation action types
 */
export const NAVIGATION_ACTIONS = {
  PUSH: 'push',
  REPLACE: 'replace',
  POP: 'pop',
  POP_TO_TOP: 'popToTop',
  RESET: 'reset',
  GO_BACK: 'goBack',
  NAVIGATE: 'navigate',
} as const;

/**
 * Deep link prefixes
 */
export const DEEP_LINK_PREFIXES = {
  APP: 'parkingapp://',
  WEB: 'https://parkingapp.com',
  SCHEME: 'parkingapp',
} as const;

/**
 * Deep link routes
 */
export const DEEP_LINK_ROUTES = {
  PARKING: `${DEEP_LINK_PREFIXES.APP}parking/`,
  BOOKING: `${DEEP_LINK_PREFIXES.APP}booking/`,
  PAYMENT: `${DEEP_LINK_PREFIXES.APP}payment/`,
  PROFILE: `${DEEP_LINK_PREFIXES.APP}profile/`,
} as const;

/**
 * Navigation error messages
 */
export const NAVIGATION_ERRORS = {
  ROUTE_NOT_FOUND: 'Route not found',
  UNAUTHORIZED: 'Authentication required',
  INVALID_PARAMS: 'Invalid navigation parameters',
  NAVIGATION_FAILED: 'Navigation failed',
  STACK_NOT_FOUND: 'Navigation stack not found',
} as const;

/**
 * Route transition types
 */
export const TRANSITION_TYPES = {
  NONE: 'none',
  FADE: 'fade',
  SLIDE: 'slide',
  SLIDE_BOTTOM: 'slide-bottom',
  SLIDE_RIGHT: 'slide-right',
  SLIDE_LEFT: 'slide-left',
  MODAL: 'modal',
  CARD: 'card',
} as const;

/**
 * Type definitions
 */
export type RouteName = typeof ROUTES[keyof typeof ROUTES][keyof typeof ROUTES[keyof typeof ROUTES]];
export type TabRouteName = typeof TAB_ROUTES[keyof typeof TAB_ROUTES];
export type StackRouteName = typeof STACK_ROUTES[keyof typeof STACK_ROUTES];
export type NavigationAction = typeof NAVIGATION_ACTIONS[keyof typeof NAVIGATION_ACTIONS];
export type TransitionType = typeof TRANSITION_TYPES[keyof typeof TRANSITION_TYPES];

/**
 * Route configuration for navigation
 */
export interface RouteConfig {
  name: RouteName;
  component: React.ComponentType<any>;
  options?: {
    headerShown?: boolean;
    headerTitle?: string;
    headerBackTitle?: string;
    tabBarIcon?: string;
    tabBarLabel?: string;
    transition?: TransitionType;
    gestureEnabled?: boolean;
  };
}

/**
 * Navigation stack configuration
 */
export interface StackConfig {
  name: StackRouteName;
  screens: RouteConfig[];
  initialRoute?: RouteName;
  mode?: 'modal' | 'card';
  headerMode?: 'float' | 'screen' | 'none';
}

export default ROUTES;
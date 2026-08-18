// ============================================================================
// Colors Constants - Design System Colors
// ============================================================================

// parking-management-system/mobile/src/constants/colors.ts

/**
 * Color palette for the parking management system
 * Follows a consistent design system with primary, secondary, and supporting colors
 */
export const COLORS = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0055CC',
  primary50: '#E8F2FF',
  primary100: '#CCE5FF',
  primary200: '#99CCFF',
  primary300: '#66B2FF',
  primary400: '#3399FF',
  primary500: '#007AFF',
  primary600: '#0062CC',
  primary700: '#004A99',
  primary800: '#003366',
  primary900: '#001A33',

  // Secondary colors
  secondary: '#5856D6',
  secondaryLight: '#7B79DF',
  secondaryDark: '#3A38A8',
  secondary50: '#EEEDFC',
  secondary100: '#DDDBF9',
  secondary200: '#BBB8F3',
  secondary300: '#9994ED',
  secondary400: '#7771E7',
  secondary500: '#5856D6',
  secondary600: '#4644AB',
  secondary700: '#353380',
  secondary800: '#232255',
  secondary900: '#12112A',

  // Success colors
  success: '#34C759',
  successLight: '#5ED67C',
  successDark: '#249F43',
  success50: '#EAF9EF',
  success100: '#D4F3DF',
  success200: '#A9E8BF',
  success300: '#7EDC9F',
  success400: '#53D17F',
  success500: '#34C759',
  success600: '#28A145',
  success700: '#1D7A33',
  success800: '#125320',
  success900: '#072B0E',

  // Danger/Error colors
  danger: '#FF3B30',
  dangerLight: '#FF6B62',
  dangerDark: '#CC2F26',
  danger50: '#FFEBEA',
  danger100: '#FFD6D5',
  danger200: '#FFADA8',
  danger300: '#FF847D',
  danger400: '#FF5B52',
  danger500: '#FF3B30',
  danger600: '#CC2F26',
  danger700: '#99231C',
  danger800: '#661813',
  danger900: '#330C09',

  // Warning colors
  warning: '#FF9500',
  warningLight: '#FFB340',
  warningDark: '#CC7700',
  warning50: '#FFF5E6',
  warning100: '#FFEACC',
  warning200: '#FFD699',
  warning300: '#FFC166',
  warning400: '#FFAD33',
  warning500: '#FF9500',
  warning600: '#CC7700',
  warning700: '#995A00',
  warning800: '#663D00',
  warning900: '#331F00',

  // Info colors
  info: '#5AC8FA',
  infoLight: '#8AD8FB',
  infoDark: '#3AA0C8',
  info50: '#EEF9FE',
  info100: '#DDF3FD',
  info200: '#BBE7FC',
  info300: '#99DBFB',
  info400: '#77CFFA',
  info500: '#5AC8FA',
  info600: '#48A0C8',
  info700: '#367896',
  info800: '#245064',
  info900: '#122832',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray50: '#F8F9FA',
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#C7C7CC',
  gray500: '#AEAEB2',
  gray600: '#8E8E93',
  gray700: '#636366',
  gray800: '#48484A',
  gray900: '#1C1C1E',

  // Text colors
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textLight: '#AEAEB2',
  textInverse: '#FFFFFF',

  // Background colors
  background: '#F2F2F7',
  backgroundSecondary: '#FFFFFF',
  backgroundDark: '#1C1C1E',

  // Border colors
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  borderDark: '#D1D1D6',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Status colors
  statusAvailable: '#34C759',
  statusOccupied: '#FF3B30',
  statusReserved: '#FF9500',
  statusMaintenance: '#8E8E93',

  // Gradient colors
  gradientStart: '#007AFF',
  gradientEnd: '#5856D6',

  // Custom component colors
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  inputBackground: '#FFFFFF',
  inputBorder: '#E5E5EA',
  inputFocus: '#007AFF',
  inputError: '#FF3B30',

  buttonPrimary: '#007AFF',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#5856D6',
  buttonSecondaryText: '#FFFFFF',
  buttonOutline: '#007AFF',
  buttonOutlineText: '#007AFF',
  buttonDanger: '#FF3B30',
  buttonDangerText: '#FFFFFF',

  tabActive: '#007AFF',
  tabInactive: '#8E8E93',

  navBar: '#FFFFFF',
  navBarText: '#1C1C1E',
  navBarBorder: '#E5E5EA',

  loading: '#007AFF',
  loadingBackground: 'rgba(255, 255, 255, 0.8)',

  emptyState: '#E5E5EA',
  emptyStateText: '#8E8E93',
} as const;

/**
 * Dark theme colors
 */
export const DARK_COLORS = {
  ...COLORS,
  background: '#1C1C1E',
  backgroundSecondary: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textLight: '#636366',
  card: '#2C2C2E',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  inputBackground: '#2C2C2E',
  inputBorder: '#3A3A3C',
  navBar: '#1C1C1E',
  navBarText: '#FFFFFF',
  navBarBorder: '#2C2C2E',
  gray50: '#1C1C1E',
  gray100: '#2C2C2E',
  gray200: '#3A3A3C',
  gray300: '#48484A',
  gray400: '#636366',
  gray500: '#8E8E93',
  gray600: '#AEAEB2',
  gray700: '#C7C7CC',
  gray800: '#D1D1D6',
  gray900: '#E5E5EA',
  loadingBackground: 'rgba(28, 28, 30, 0.8)',
  emptyState: '#3A3A3C',
  emptyStateText: '#636366',
} as const;

/**
 * Type for color keys
 */
export type ColorKey = keyof typeof COLORS;
export type ColorValue = typeof COLORS[ColorKey];

export default COLORS;
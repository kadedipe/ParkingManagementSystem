// ============================================================================
// Image Assets
// ============================================================================

/**
 * Image assets for the parking management system.
 * 
 * This module exports all image assets for easy import throughout the application.
 * Images are organized by category for better maintainability.
 */

// ============================================================================
// Logo Imports
// ============================================================================

import logo from './logo/logo.svg';
import logoDark from './logo/logo-dark.svg';
import logoLight from './logo/logo-light.svg';
import logoSmall from './logo/logo-small.svg';
import logoText from './logo/logo-text.svg';

// ============================================================================
// Icon Imports
// ============================================================================

import parkingIcon from './icons/parking.svg';
import chargingIcon from './icons/charging.svg';
import vehicleIcon from './icons/vehicle.svg';
import paymentIcon from './icons/payment.svg';
import notificationIcon from './icons/notification.svg';
import dashboardIcon from './icons/dashboard.svg';
import userIcon from './icons/user.svg';
import settingsIcon from './icons/settings.svg';
import reportsIcon from './icons/reports.svg';
import adminIcon from './icons/admin.svg';
import searchIcon from './icons/search.svg';
import filterIcon from './icons/filter.svg';
import mapIcon from './icons/map.svg';
import locationIcon from './icons/location.svg';
import calendarIcon from './icons/calendar.svg';
import timeIcon from './icons/time.svg';
import moreIcon from './icons/more.svg';

// ============================================================================
// Illustration Imports
// ============================================================================

import emptyState from './illustrations/empty-state.svg';
import noResults from './illustrations/no-results.svg';
import errorIllustration from './illustrations/error.svg';
import successIllustration from './illustrations/success.svg';
import maintenanceIllustration from './illustrations/maintenance.svg';
import underConstruction from './illustrations/under-construction.svg';
import welcomeIllustration from './illustrations/welcome.svg';
import profileIllustration from './illustrations/profile.svg';
import parkingIllustration from './illustrations/parking-illustration.svg';
import chargingIllustration from './illustrations/charging-illustration.svg';
import vehicleIllustration from './illustrations/vehicle-illustration.svg';

// ============================================================================
// Background Imports
// ============================================================================

import loginBg from './backgrounds/login-bg.jpg';
import dashboardBg from './backgrounds/dashboard-bg.jpg';
import heroBg from './backgrounds/hero-bg.jpg';

// ============================================================================
// Avatar Imports
// ============================================================================

import defaultAvatar from './avatars/default-avatar.svg';
import adminAvatar from './avatars/admin-avatar.svg';
import userAvatar from './avatars/user-avatar.svg';

// ============================================================================
// Flag Imports
// ============================================================================

import flagUS from './flags/us.svg';
import flagUK from './flags/uk.svg';
import flagCA from './flags/ca.svg';
import flagAU from './flags/au.svg';
import flagDE from './flags/de.svg';
import flagFR from './flags/fr.svg';
import flagES from './flags/es.svg';
import flagIT from './flags/it.svg';
import flagJP from './flags/jp.svg';
import flagCN from './flags/cn.svg';

// ============================================================================
// Social Icon Imports
// ============================================================================

import googleIcon from './social/google.svg';
import facebookIcon from './social/facebook.svg';
import appleIcon from './social/apple.svg';
import twitterIcon from './social/twitter.svg';
import linkedinIcon from './social/linkedin.svg';

// ============================================================================
// Brand Assets
// ============================================================================

import favicon from './brand/favicon.ico';
import appleTouchIcon from './brand/apple-touch-icon.png';
import favicon32 from './brand/favicon-32x32.png';
import favicon16 from './brand/favicon-16x16.png';
import safariPinnedTab from './brand/safari-pinned-tab.svg';

// ============================================================================
// Logo Exports
// ============================================================================

export const LOGOS = {
  default: logo,
  dark: logoDark,
  light: logoLight,
  small: logoSmall,
  text: logoText,
};

// ============================================================================
// Icon Exports
// ============================================================================

export const ICONS = {
  parking: parkingIcon,
  charging: chargingIcon,
  vehicle: vehicleIcon,
  payment: paymentIcon,
  notification: notificationIcon,
  dashboard: dashboardIcon,
  user: userIcon,
  settings: settingsIcon,
  reports: reportsIcon,
  admin: adminIcon,
  search: searchIcon,
  filter: filterIcon,
  map: mapIcon,
  location: locationIcon,
  calendar: calendarIcon,
  time: timeIcon,
  more: moreIcon,
};

// ============================================================================
// Illustration Exports
// ============================================================================

export const ILLUSTRATIONS = {
  emptyState,
  noResults,
  error: errorIllustration,
  success: successIllustration,
  maintenance: maintenanceIllustration,
  underConstruction,
  welcome: welcomeIllustration,
  profile: profileIllustration,
  parking: parkingIllustration,
  charging: chargingIllustration,
  vehicle: vehicleIllustration,
};

// ============================================================================
// Background Exports
// ============================================================================

export const BACKGROUNDS = {
  login: loginBg,
  dashboard: dashboardBg,
  hero: heroBg,
};

// ============================================================================
// Avatar Exports
// ============================================================================

export const AVATARS = {
  default: defaultAvatar,
  admin: adminAvatar,
  user: userAvatar,
};

// ============================================================================
// Flag Exports
// ============================================================================

export const FLAGS = {
  US: flagUS,
  UK: flagUK,
  CA: flagCA,
  AU: flagAU,
  DE: flagDE,
  FR: flagFR,
  ES: flagES,
  IT: flagIT,
  JP: flagJP,
  CN: flagCN,
};

// ============================================================================
// Social Icon Exports
// ============================================================================

export const SOCIAL_ICONS = {
  google: googleIcon,
  facebook: facebookIcon,
  apple: appleIcon,
  twitter: twitterIcon,
  linkedin: linkedinIcon,
};

// ============================================================================
// Brand Asset Exports
// ============================================================================

export const BRAND = {
  favicon,
  appleTouchIcon,
  favicon32,
  favicon16,
  safariPinnedTab,
};

// ============================================================================
// Combined Exports
// ============================================================================

export default {
  ...LOGOS,
  ...ICONS,
  ...ILLUSTRATIONS,
  ...BACKGROUNDS,
  ...AVATARS,
  ...FLAGS,
  ...SOCIAL_ICONS,
  ...BRAND,
};
// ============================================================================
// Image Assets - Image Management System
// ============================================================================

// parking-management-system/mobile/src/assets/images/index.js

import { Platform, Dimensions } from 'react-native';

/**
 * Image Assets - Centralized image management
 */
export const Images = {
  // App icons
  icons: {
    // Navigation icons
    home: require('./icons/home.png'),
    homeActive: require('./icons/home-active.png'),
    parking: require('./icons/parking.png'),
    parkingActive: require('./icons/parking-active.png'),
    booking: require('./icons/booking.png'),
    bookingActive: require('./icons/booking-active.png'),
    profile: require('./icons/profile.png'),
    profileActive: require('./icons/profile-active.png'),
    notifications: require('./icons/notifications.png'),
    notificationsActive: require('./icons/notifications-active.png'),
    
    // Action icons
    add: require('./icons/add.png'),
    edit: require('./icons/edit.png'),
    delete: require('./icons/delete.png'),
    search: require('./icons/search.png'),
    filter: require('./icons/filter.png'),
    sort: require('./icons/sort.png'),
    share: require('./icons/share.png'),
    download: require('./icons/download.png'),
    upload: require('./icons/upload.png'),
    refresh: require('./icons/refresh.png'),
    
    // Navigation arrows
    back: require('./icons/back.png'),
    forward: require('./icons/forward.png'),
    up: require('./icons/up.png'),
    down: require('./icons/down.png'),
    close: require('./icons/close.png'),
    menu: require('./icons/menu.png'),
    more: require('./icons/more.png'),
    
    // Status icons
    success: require('./icons/success.png'),
    error: require('./icons/error.png'),
    warning: require('./icons/warning.png'),
    info: require('./icons/info.png'),
    check: require('./icons/check.png'),
    cross: require('./icons/cross.png'),
    
    // Feature icons
    car: require('./icons/car.png'),
    ev: require('./icons/ev.png'),
    motorcycle: require('./icons/motorcycle.png'),
    bicycle: require('./icons/bicycle.png'),
    charging: require('./icons/charging.png'),
    payment: require('./icons/payment.png'),
    card: require('./icons/card.png'),
    cash: require('./icons/cash.png'),
    wallet: require('./icons/wallet.png'),
    
    // User icons
    user: require('./icons/user.png'),
    users: require('./icons/users.png'),
    settings: require('./icons/settings.png'),
    logout: require('./icons/logout.png'),
    lock: require('./icons/lock.png'),
    unlock: require('./icons/unlock.png'),
    email: require('./icons/email.png'),
    phone: require('./icons/phone.png'),
    location: require('./icons/location.png'),
    
    // Rating icons
    star: require('./icons/star.png'),
    starFilled: require('./icons/star-filled.png'),
    heart: require('./icons/heart.png'),
    heartFilled: require('./icons/heart-filled.png'),
    
    // Misc icons
    calendar: require('./icons/calendar.png'),
    clock: require('./icons/clock.png'),
    camera: require('./icons/camera.png'),
    gallery: require('./icons/gallery.png'),
    document: require('./icons/document.png'),
    pdf: require('./icons/pdf.png'),
    qrCode: require('./icons/qr-code.png'),
    barcode: require('./icons/barcode.png'),
    map: require('./icons/map.png'),
    compass: require('./icons/compass.png')
  },

  // Logo assets
  logos: {
    primary: require('./logos/logo-primary.png'),
    secondary: require('./logos/logo-secondary.png'),
    dark: require('./logos/logo-dark.png'),
    light: require('./logos/logo-light.png'),
    icon: require('./logos/logo-icon.png'),
    text: require('./logos/logo-text.png'),
    horizontal: require('./logos/logo-horizontal.png'),
    vertical: require('./logos/logo-vertical.png'),
    square: require('./logos/logo-square.png')
  },

  // Background images
  backgrounds: {
    splash: require('./backgrounds/splash.png'),
    login: require('./backgrounds/login.png'),
    register: require('./backgrounds/register.png'),
    home: require('./backgrounds/home.png'),
    profile: require('./backgrounds/profile.png'),
    gradient: require('./backgrounds/gradient.png'),
    pattern: require('./backgrounds/pattern.png'),
    darkOverlay: require('./backgrounds/dark-overlay.png'),
    lightOverlay: require('./backgrounds/light-overlay.png')
  },

  // Placeholder images
  placeholders: {
    user: require('./placeholders/user.png'),
    vehicle: require('./placeholders/vehicle.png'),
    parking: require('./placeholders/parking.png'),
    charging: require('./placeholders/charging.png'),
    card: require('./placeholders/card.png'),
    image: require('./placeholders/image.png'),
    avatar: require('./placeholders/avatar.png'),
    logo: require('./placeholders/logo.png'),
    banner: require('./placeholders/banner.png'),
    thumbnail: require('./placeholders/thumbnail.png')
  },

  // Onboarding images
  onboarding: {
    step1: require('./onboarding/step1.png'),
    step2: require('./onboarding/step2.png'),
    step3: require('./onboarding/step3.png'),
    step4: require('./onboarding/step4.png')
  },

  // Feature images
  features: {
    parking: require('./features/parking.png'),
    booking: require('./features/booking.png'),
    charging: require('./features/charging.png'),
    payment: require('./features/payment.png'),
    notifications: require('./features/notifications.png'),
    security: require('./features/security.png')
  },

  // Vehicle images
  vehicles: {
    car: require('./vehicles/car.png'),
    suv: require('./vehicles/suv.png'),
    truck: require('./vehicles/truck.png'),
    van: require('./vehicles/van.png'),
    motorcycle: require('./vehicles/motorcycle.png'),
    bicycle: require('./vehicles/bicycle.png'),
    ev: require('./vehicles/ev.png'),
    hybrid: require('./vehicles/hybrid.png')
  },

  // Badge images
  badges: {
    new: require('./badges/new.png'),
    hot: require('./badges/hot.png'),
    popular: require('./badges/popular.png'),
    featured: require('./badges/featured.png'),
    verified: require('./badges/verified.png'),
    premium: require('./badges/premium.png'),
    discount: require('./badges/discount.png'),
    vip: require('./badges/vip.png')
  },

  // Flag images (for languages)
  flags: {
    en: require('./flags/en.png'),
    es: require('./flags/es.png'),
    fr: require('./flags/fr.png'),
    de: require('./flags/de.png'),
    it: require('./flags/it.png'),
    pt: require('./flags/pt.png'),
    ru: require('./flags/ru.png'),
    zh: require('./flags/zh.png'),
    ja: require('./flags/ja.png'),
    ko: require('./flags/ko.png')
  },

  // Social media icons
  social: {
    facebook: require('./social/facebook.png'),
    twitter: require('./social/twitter.png'),
    instagram: require('./social/instagram.png'),
    linkedin: require('./social/linkedin.png'),
    youtube: require('./social/youtube.png'),
    whatsapp: require('./social/whatsapp.png'),
    telegram: require('./social/telegram.png'),
    google: require('./social/google.png'),
    apple: require('./social/apple.png')
  },

  // Payment method icons
  payment: {
    visa: require('./payment/visa.png'),
    mastercard: require('./payment/mastercard.png'),
    amex: require('./payment/amex.png'),
    discover: require('./payment/discover.png'),
    paypal: require('./payment/paypal.png'),
    stripe: require('./payment/stripe.png'),
    bitcoin: require('./payment/bitcoin.png'),
    applePay: require('./payment/apple-pay.png'),
    googlePay: require('./payment/google-pay.png')
  }
};

// Image utility functions
export const ImageUtils = {
  /**
   * Get image source with fallback
   * @param {string} path - Image path
   * @param {string} fallback - Fallback image
   * @returns {Object} Image source
   */
  getImage: (path, fallback = Images.placeholders.image) => {
    try {
      const image = require(path);
      return image || fallback;
    } catch (error) {
      console.warn('Image not found:', path);
      return fallback;
    }
  },

  /**
   * Get responsive image size
   * @param {number} baseSize - Base size
   * @param {number} screenWidth - Screen width
   * @returns {number} Responsive size
   */
  getResponsiveSize: (baseSize, screenWidth = 375) => {
    const scale = screenWidth / 375;
    return Math.round(baseSize * Math.min(scale, 1.5));
  },

  /**
   * Get image dimensions
   * @param {Object} image - Image source
   * @returns {Promise} Image dimensions
   */
  getImageDimensions: (image) => {
    return new Promise((resolve, reject) => {
      if (image && image.width && image.height) {
        resolve({ width: image.width, height: image.height });
      } else {
        // For remote images
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = image.uri || image;
      }
    });
  },

  /**
   * Get aspect ratio
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {number} Aspect ratio
   */
  getAspectRatio: (width, height) => {
    if (height === 0) return 1;
    return width / height;
  },

  /**
   * Check if image is SVG
   * @param {string} path - Image path
   * @returns {boolean} True if SVG
   */
  isSVG: (path) => {
    return path && path.toLowerCase().endsWith('.svg');
  },

  /**
   * Get image extension
   * @param {string} path - Image path
   * @returns {string} File extension
   */
  getExtension: (path) => {
    if (!path) return '';
    const parts = path.split('.');
    return parts[parts.length - 1].toLowerCase();
  },

  /**
   * Check if image is supported
   * @param {string} path - Image path
   * @returns {boolean} True if supported
   */
  isSupportedImage: (path) => {
    const supported = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const ext = ImageUtils.getExtension(path);
    return supported.includes(ext);
  }
};

export default Images;
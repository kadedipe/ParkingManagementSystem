// ============================================================================
// Image Constants - Image-related Constants
// ============================================================================

// parking-management-system/mobile/src/assets/images/constants.js

export const IMAGE_CONSTANTS = {
  // Image sizes
  SIZES: {
    // Avatar sizes
    AVATAR_SMALL: 32,
    AVATAR_MEDIUM: 48,
    AVATAR_LARGE: 64,
    AVATAR_XLARGE: 96,
    
    // Icon sizes
    ICON_SMALL: 16,
    ICON_MEDIUM: 24,
    ICON_LARGE: 32,
    ICON_XLARGE: 48,
    
    // Thumbnail sizes
    THUMBNAIL_SMALL: 80,
    THUMBNAIL_MEDIUM: 120,
    THUMBNAIL_LARGE: 160,
    
    // Banner sizes
    BANNER_SMALL: 200,
    BANNER_MEDIUM: 300,
    BANNER_LARGE: 400,
    
    // Logo sizes
    LOGO_SMALL: 40,
    LOGO_MEDIUM: 60,
    LOGO_LARGE: 80,
    LOGO_XLARGE: 120
  },

  // Image quality
  QUALITY: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
    MAXIMUM: 100
  },

  // Image formats
  FORMATS: {
    JPEG: 'jpeg',
    PNG: 'png',
    WEBP: 'webp',
    GIF: 'gif',
    SVG: 'svg'
  },

  // Image types
  TYPES: {
    AVATAR: 'avatar',
    ICON: 'icon',
    LOGO: 'logo',
    BANNER: 'banner',
    THUMBNAIL: 'thumbnail',
    BACKGROUND: 'background',
    PHOTO: 'photo'
  },

  // Image cache TTL (in milliseconds)
  CACHE_TTL: {
    SHORT: 5 * 60 * 1000,    // 5 minutes
    MEDIUM: 30 * 60 * 1000,  // 30 minutes
    LONG: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Default image settings
  DEFAULTS: {
    QUALITY: 80,
    FORMAT: 'jpeg',
    MAX_WIDTH: 2048,
    MAX_HEIGHT: 2048
  }
};

export default IMAGE_CONSTANTS;
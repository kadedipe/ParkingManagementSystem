// ============================================================================
// GIF Configuration - GIF Settings
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/config.js

export const GIF_CONFIG = {
  // GIF sizes
  sizes: {
    tiny: 32,
    small: 64,
    medium: 128,
    large: 200,
    xlarge: 300,
    xxlarge: 400,
    full: '100%'
  },

  // GIF animation settings
  animation: {
    defaultSpeed: 1.0,
    maxSpeed: 2.0,
    minSpeed: 0.5
  },

  // Loading behavior
  loading: {
    showSpinner: true,
    spinnerSize: 'small',
    spinnerColor: '#007AFF',
    fallbackDelay: 2000 // ms
  },

  // Performance settings
  performance: {
    preloadThreshold: 5, // Number of GIFs to preload
    maxConcurrentLoads: 3,
    cacheSize: 50 // Max GIFs in cache
  },

  // Fallback settings
  fallback: {
    key: 'loading',
    color: '#f0f0f0'
  },

  // Categories
  categories: {
    loading: {
      label: 'Loading',
      icon: '⏳',
      defaultGif: 'loading'
    },
    success: {
      label: 'Success',
      icon: '✅',
      defaultGif: 'success'
    },
    error: {
      label: 'Error',
      icon: '❌',
      defaultGif: 'error'
    },
    parking: {
      label: 'Parking',
      icon: '🅿️',
      defaultGif: 'parking'
    },
    charging: {
      label: 'Charging',
      icon: '⚡',
      defaultGif: 'charging'
    },
    payment: {
      label: 'Payment',
      icon: '💳',
      defaultGif: 'payment'
    },
    booking: {
      label: 'Booking',
      icon: '📅',
      defaultGif: 'booking'
    },
    empty: {
      label: 'Empty State',
      icon: '📭',
      defaultGif: 'empty'
    },
    celebration: {
      label: 'Celebration',
      icon: '🎉',
      defaultGif: 'celebration'
    },
    user: {
      label: 'User',
      icon: '👤',
      defaultGif: 'profile'
    },
    map: {
      label: 'Map',
      icon: '📍',
      defaultGif: 'mapPin'
    }
  }
};

export default GIF_CONFIG;
// ============================================================================
// Animation Constants - Animation Configuration
// ============================================================================

// parking-management-system/mobile/src/assets/animations/constants.js

export const ANIMATION_CONSTANTS = {
  // Animation durations (ms)
  DURATIONS: {
    INSTANT: 0,
    SHORT: 200,
    MEDIUM: 400,
    LONG: 600,
    EXTRA_LONG: 800,
    SLOW: 1000
  },

  // Animation easing functions
  EASING: {
    // Linear
    LINEAR: 'linear',
    
    // Ease in
    EASE_IN: 'ease-in',
    EASE_IN_QUAD: 'ease-in-quad',
    EASE_IN_CUBIC: 'ease-in-cubic',
    EASE_IN_QUART: 'ease-in-quart',
    EASE_IN_QUINT: 'ease-in-quint',
    
    // Ease out
    EASE_OUT: 'ease-out',
    EASE_OUT_QUAD: 'ease-out-quad',
    EASE_OUT_CUBIC: 'ease-out-cubic',
    EASE_OUT_QUART: 'ease-out-quart',
    EASE_OUT_QUINT: 'ease-out-quint',
    
    // Ease in-out
    EASE_IN_OUT: 'ease-in-out',
    EASE_IN_OUT_QUAD: 'ease-in-out-quad',
    EASE_IN_OUT_CUBIC: 'ease-in-out-cubic',
    EASE_IN_OUT_QUART: 'ease-in-out-quart',
    EASE_IN_OUT_QUINT: 'ease-in-out-quint',
    
    // Elastic
    ELASTIC: 'elastic',
    ELASTIC_IN: 'elastic-in',
    ELASTIC_OUT: 'elastic-out',
    ELASTIC_IN_OUT: 'elastic-in-out',
    
    // Bounce
    BOUNCE: 'bounce',
    BOUNCE_IN: 'bounce-in',
    BOUNCE_OUT: 'bounce-out',
    BOUNCE_IN_OUT: 'bounce-in-out',
    
    // Spring
    SPRING: 'spring'
  },

  // Animation types
  TYPES: {
    FADE: 'fade',
    SLIDE: 'slide',
    SCALE: 'scale',
    ROTATE: 'rotate',
    BOUNCE: 'bounce',
    SPRING: 'spring',
    FLIP: 'flip',
    SWING: 'swing',
    PULSE: 'pulse'
  },

  // Lottie animation speeds
  LOTTIE_SPEEDS: {
    SLOW: 0.5,
    NORMAL: 1.0,
    FAST: 1.5,
    VERY_FAST: 2.0
  },

  // Lottie animation loops
  LOTTIE_LOOPS: {
    NONE: 0,
    ONCE: 1,
    FEW: 3,
    SOME: 5,
    INFINITE: -1
  },

  // Animation delays
  DELAYS: {
    NONE: 0,
    SHORT: 100,
    MEDIUM: 300,
    LONG: 500,
    STAGGER: 100
  },

  // Spring animation configs
  SPRING: {
    DEFAULT: {
      damping: 15,
      mass: 1,
      stiffness: 100
    },
    GENTLE: {
      damping: 20,
      mass: 0.8,
      stiffness: 80
    },
    BOUNCY: {
      damping: 10,
      mass: 0.8,
      stiffness: 120
    },
    STIFF: {
      damping: 30,
      mass: 1,
      stiffness: 200
    },
    SNAPPY: {
      damping: 10,
      mass: 0.5,
      stiffness: 150
    }
  }
};

export default ANIMATION_CONSTANTS;
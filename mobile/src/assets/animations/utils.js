// ============================================================================
// Animation Utilities - Helper Functions
// ============================================================================

// parking-management-system/mobile/src/assets/animations/utils.js

import { Animated } from 'react-native';
import { ANIMATION_CONSTANTS } from './constants';

/**
 * Animation Utilities - Helper functions for animations
 */
export const AnimationUtils = {
  /**
   * Create interpolated animated value
   * @param {Animated.Value} value - Animated value
   * @param {Object} config - Interpolation config
   * @param {Array} config.inputRange - Input range
   * @param {Array} config.outputRange - Output range
   * @param {string} config.extrapolate - Extrapolate type
   * @returns {Animated.Value} Interpolated value
   */
  interpolate: (value, config) => {
    const {
      inputRange,
      outputRange,
      extrapolate = 'extend'
    } = config;

    return value.interpolate({
      inputRange,
      outputRange,
      extrapolate
    });
  },

  /**
   * Create transform style
   * @param {Object} transforms - Transform configuration
   * @param {Animated.Value} transforms.translateX - Translate X
   * @param {Animated.Value} transforms.translateY - Translate Y
   * @param {Animated.Value} transforms.scale - Scale
   * @param {Animated.Value} transforms.rotate - Rotate
   * @returns {Array} Transform styles
   */
  createTransform: (transforms) => {
    const transform = [];

    if (transforms.translateX !== undefined) {
      transform.push({ translateX: transforms.translateX });
    }
    if (transforms.translateY !== undefined) {
      transform.push({ translateY: transforms.translateY });
    }
    if (transforms.scale !== undefined) {
      transform.push({ scale: transforms.scale });
    }
    if (transforms.rotate !== undefined) {
      transform.push({ rotate: transforms.rotate });
    }

    return transform;
  },

  /**
   * Create slide animation
   * @param {string} direction - Slide direction (up, down, left, right)
   * @param {number} distance - Slide distance
   * @returns {Object} Slide animation config
   */
  createSlideAnimation: (direction = 'up', distance = 100) => {
    const fromValue = {};
    const toValue = {};

    switch (direction) {
      case 'up':
        fromValue.translateY = distance;
        toValue.translateY = 0;
        break;
      case 'down':
        fromValue.translateY = -distance;
        toValue.translateY = 0;
        break;
      case 'left':
        fromValue.translateX = distance;
        toValue.translateX = 0;
        break;
      case 'right':
        fromValue.translateX = -distance;
        toValue.translateX = 0;
        break;
      default:
        fromValue.translateY = distance;
        toValue.translateY = 0;
    }

    return { fromValue, toValue };
  },

  /**
   * Create scale animation
   * @param {number} fromScale - Starting scale
   * @param {number} toScale - Ending scale
   * @returns {Object} Scale animation config
   */
  createScaleAnimation: (fromScale = 0, toScale = 1) => {
    return {
      fromValue: fromScale,
      toValue: toScale
    };
  },

  /**
   * Create rotate animation
   * @param {string} fromRotate - Starting rotation
   * @param {string} toRotate - Ending rotation
   * @returns {Object} Rotate animation config
   */
  createRotateAnimation: (fromRotate = '0deg', toRotate = '360deg') => {
    return {
      fromValue: fromRotate,
      toValue: toRotate
    };
  },

  /**
   * Get animation progress from value
   * @param {Animated.Value} value - Animated value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {Animated.Value} Progress value
   */
  getProgress: (value, min = 0, max = 1) => {
    return AnimationUtils.interpolate(value, {
      inputRange: [min, max],
      outputRange: [0, 1]
    });
  },

  /**
   * Combine multiple animations
   * @param {Array} animations - Array of animation configs
   * @returns {Object} Combined animation
   */
  combineAnimations: (animations) => {
    return Animated.parallel(
      animations.map(config => {
        const { type, value, ...options } = config;
        switch (type) {
          case 'timing':
            return Animated.timing(value, options);
          case 'spring':
            return Animated.spring(value, options);
          case 'decay':
            return Animated.decay(value, options);
          default:
            return Animated.timing(value, options);
        }
      })
    );
  },

  /**
   * Create sequence of animations
   * @param {Array} animations - Array of animation configs
   * @returns {Object} Sequence animation
   */
  createSequence: (animations) => {
    return Animated.sequence(
      animations.map(config => {
        const { type, value, ...options } = config;
        switch (type) {
          case 'timing':
            return Animated.timing(value, options);
          case 'spring':
            return Animated.spring(value, options);
          case 'decay':
            return Animated.decay(value, options);
          default:
            return Animated.timing(value, options);
        }
      })
    );
  },

  /**
   * Get spring animation config
   * @param {Object} config - Spring config
   * @param {number} config.friction - Friction
   * @param {number} config.tension - Tension
   * @param {number} config.speed - Speed
   * @param {number} config.bounciness - Bounciness
   * @returns {Object} Spring animation config
   */
  getSpringConfig: (config = {}) => {
    const {
      friction = 7,
      tension = 40,
      speed = 12,
      bounciness = 8,
      useNativeDriver = true
    } = config;

    return {
      friction,
      tension,
      speed,
      bounciness,
      useNativeDriver
    };
  },

  /**
   * Get timing animation config
   * @param {Object} config - Timing config
   * @param {number} config.duration - Duration
   * @param {string} config.easing - Easing function
   * @param {number} config.delay - Delay
   * @param {boolean} config.useNativeDriver - Use native driver
   * @returns {Object} Timing animation config
   */
  getTimingConfig: (config = {}) => {
    const {
      duration = ANIMATION_CONSTANTS.DURATIONS.MEDIUM,
      easing = ANIMATION_CONSTANTS.EASING.EASE_IN_OUT,
      delay = ANIMATION_CONSTANTS.DELAYS.NONE,
      useNativeDriver = true
    } = config;

    return {
      duration,
      easing,
      delay,
      useNativeDriver
    };
  },

  /**
   * Check if animation is supported on platform
   * @param {string} animationType - Animation type
   * @returns {boolean} Supported status
   */
  isAnimationSupported: (animationType) => {
    const unsupported = ['spring']; // Add any platform-specific unsupported types
    return !unsupported.includes(animationType);
  },

  /**
   * Get optimized animation config for platform
   * @param {Object} config - Animation config
   * @returns {Object} Optimized config
   */
  getOptimizedConfig: (config) => {
    // Use native driver for better performance
    return {
      ...config,
      useNativeDriver: true
    };
  }
};

export default AnimationUtils;
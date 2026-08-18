// ============================================================================
// Animation Service - Animation Management Service
// ============================================================================

// parking-management-system/mobile/src/assets/animations/service.js

import { Animated, Easing, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { ANIMATION_CONSTANTS } from './constants';

/**
 * Animation Service - Handles all animation-related operations
 */
class AnimationService {
  constructor() {
    this.animations = new Map();
    this.lottieRefs = new Map();
    this.animatedValues = new Map();
  }

  /**
   * Create a new animation instance
   * @param {string} id - Animation ID
   * @param {Object} config - Animation configuration
   * @returns {Object} Animation instance
   */
  createAnimation(id, config = {}) {
    const {
      type = ANIMATION_CONSTANTS.TYPES.FADE,
      duration = ANIMATION_CONSTANTS.DURATIONS.MEDIUM,
      easing = ANIMATION_CONSTANTS.EASING.EASE_IN_OUT,
      delay = ANIMATION_CONSTANTS.DELAYS.NONE,
      fromValue = 0,
      toValue = 1
    } = config;

    const animatedValue = new Animated.Value(fromValue);
    
    const animation = {
      id,
      animatedValue,
      isAnimating: false,
      isPaused: false,
      config: {
        type,
        duration,
        easing,
        delay,
        fromValue,
        toValue
      },
      start: () => this.startAnimation(id),
      stop: () => this.stopAnimation(id),
      pause: () => this.pauseAnimation(id),
      resume: () => this.resumeAnimation(id),
      reset: () => this.resetAnimation(id)
    };

    this.animations.set(id, animation);
    this.animatedValues.set(id, animatedValue);

    return animation;
  }

  /**
   * Start an animation
   * @param {string} id - Animation ID
   * @param {Object} options - Animation options
   * @returns {Promise} Promise that resolves when animation completes
   */
  startAnimation(id, options = {}) {
    const animation = this.animations.get(id);
    if (!animation) {
      throw new Error(`Animation with id ${id} not found`);
    }

    if (animation.isAnimating) {
      return Promise.resolve();
    }

    animation.isAnimating = true;
    animation.isPaused = false;

    const {
      type = animation.config.type,
      duration = animation.config.duration,
      easing = animation.config.easing,
      delay = animation.config.delay,
      fromValue = animation.config.fromValue,
      toValue = animation.config.toValue
    } = options;

    const animatedValue = animation.animatedValue;
    animatedValue.setValue(fromValue);

    const animationConfig = {
      toValue,
      duration,
      delay,
      easing: this.getEasingFunction(easing),
      useNativeDriver: true
    };

    let animatedAnimation;

    switch (type) {
      case ANIMATION_CONSTANTS.TYPES.FADE:
        animatedAnimation = Animated.timing(animatedValue, animationConfig);
        break;
      case ANIMATION_CONSTANTS.TYPES.SPRING:
        animatedAnimation = Animated.spring(animatedValue, {
          toValue,
          ...this.getSpringConfig(options)
        });
        break;
      default:
        animatedAnimation = Animated.timing(animatedValue, animationConfig);
    }

    return new Promise((resolve) => {
      animatedAnimation.start(({ finished }) => {
        if (finished) {
          animation.isAnimating = false;
          resolve();
        }
      });
    });
  }

  /**
   * Stop an animation
   * @param {string} id - Animation ID
   */
  stopAnimation(id) {
    const animation = this.animations.get(id);
    if (!animation) return;

    animation.isAnimating = false;
    animation.isPaused = false;
    animation.animatedValue.stopAnimation();
  }

  /**
   * Pause an animation
   * @param {string} id - Animation ID
   */
  pauseAnimation(id) {
    const animation = this.animations.get(id);
    if (!animation || !animation.isAnimating) return;

    animation.isPaused = true;
    animation.animatedValue.stopAnimation();
  }

  /**
   * Resume an animation
   * @param {string} id - Animation ID
   */
  resumeAnimation(id) {
    const animation = this.animations.get(id);
    if (!animation || !animation.isPaused) return;

    animation.isPaused = false;
    this.startAnimation(id);
  }

  /**
   * Reset an animation
   * @param {string} id - Animation ID
   */
  resetAnimation(id) {
    const animation = this.animations.get(id);
    if (!animation) return;

    animation.isAnimating = false;
    animation.isPaused = false;
    animation.animatedValue.setValue(animation.config.fromValue);
  }

  /**
   * Get easing function by name
   * @param {string} easingName - Easing name
   * @returns {Function} Easing function
   */
  getEasingFunction(easingName) {
    const easingMap = {
      [ANIMATION_CONSTANTS.EASING.LINEAR]: Easing.linear,
      [ANIMATION_CONSTANTS.EASING.EASE_IN]: Easing.ease,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_QUAD]: Easing.quad,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_CUBIC]: Easing.cubic,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_QUART]: Easing.quart,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_QUINT]: Easing.quint,
      [ANIMATION_CONSTANTS.EASING.EASE_OUT]: Easing.ease,
      [ANIMATION_CONSTANTS.EASING.EASE_OUT_QUAD]: Easing.quad,
      [ANIMATION_CONSTANTS.EASING.EASE_OUT_CUBIC]: Easing.cubic,
      [ANIMATION_CONSTANTS.EASING.EASE_OUT_QUART]: Easing.quart,
      [ANIMATION_CONSTANTS.EASING.EASE_OUT_QUINT]: Easing.quint,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_OUT]: Easing.ease,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_OUT_QUAD]: Easing.quad,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_OUT_CUBIC]: Easing.cubic,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_OUT_QUART]: Easing.quart,
      [ANIMATION_CONSTANTS.EASING.EASE_IN_OUT_QUINT]: Easing.quint,
      [ANIMATION_CONSTANTS.EASING.ELASTIC]: Easing.elastic,
      [ANIMATION_CONSTANTS.EASING.ELASTIC_IN]: Easing.elastic,
      [ANIMATION_CONSTANTS.EASING.ELASTIC_OUT]: Easing.elastic,
      [ANIMATION_CONSTANTS.EASING.ELASTIC_IN_OUT]: Easing.elastic,
      [ANIMATION_CONSTANTS.EASING.BOUNCE]: Easing.bounce,
      [ANIMATION_CONSTANTS.EASING.BOUNCE_IN]: Easing.bounce,
      [ANIMATION_CONSTANTS.EASING.BOUNCE_OUT]: Easing.bounce,
      [ANIMATION_CONSTANTS.EASING.BOUNCE_IN_OUT]: Easing.bounce
    };

    return easingMap[easingName] || Easing.linear;
  }

  /**
   * Get spring configuration
   * @param {Object} options - Spring options
   * @returns {Object} Spring configuration
   */
  getSpringConfig(options = {}) {
    const {
      springConfig = ANIMATION_CONSTANTS.SPRING.DEFAULT,
      damping = springConfig.damping,
      mass = springConfig.mass,
      stiffness = springConfig.stiffness
    } = options;

    return {
      damping,
      mass,
      stiffness,
      useNativeDriver: true
    };
  }

  /**
   * Stagger multiple animations
   * @param {Array} animations - Array of animation promises
   * @param {number} staggerTime - Time between each animation
   * @returns {Promise} Promise that resolves when all animations complete
   */
  staggerAnimations(animations, staggerTime = ANIMATION_CONSTANTS.DELAYS.STAGGER) {
    return new Promise((resolve) => {
      const results = [];
      let completed = 0;

      animations.forEach((animation, index) => {
        setTimeout(() => {
          animation.then((result) => {
            results[index] = result;
            completed++;
            if (completed === animations.length) {
              resolve(results);
            }
          });
        }, index * staggerTime);
      });
    });
  }

  /**
   * Sequence animations
   * @param {Array} animations - Array of animation promises
   * @returns {Promise} Promise that resolves when all animations complete
   */
  sequenceAnimations(animations) {
    return animations.reduce(
      (promise, animation) => promise.then(() => animation),
      Promise.resolve()
    );
  }

  /**
   * Parallel animations
   * @param {Array} animations - Array of animation promises
   * @returns {Promise} Promise that resolves when all animations complete
   */
  parallelAnimations(animations) {
    return Promise.all(animations);
  }

  /**
   * Register Lottie animation reference
   * @param {string} id - Animation ID
   * @param {Object} ref - Lottie view reference
   */
  registerLottie(id, ref) {
    this.lottieRefs.set(id, ref);
  }

  /**
   * Unregister Lottie animation reference
   * @param {string} id - Animation ID
   */
  unregisterLottie(id) {
    this.lottieRefs.delete(id);
  }

  /**
   * Play Lottie animation
   * @param {string} id - Animation ID
   * @param {Object} options - Play options
   * @param {number} options.startFrame - Start frame
   * @param {number} options.endFrame - End frame
   * @param {number} options.speed - Animation speed
   * @param {number} options.loop - Loop count
   * @param {boolean} options.autoPlay - Auto play
   */
  playLottie(id, options = {}) {
    const ref = this.lottieRefs.get(id);
    if (!ref) {
      console.warn(`Lottie animation with id ${id} not found`);
      return;
    }

    const {
      startFrame = 0,
      endFrame = ref.getDuration ? ref.getDuration() : undefined,
      speed = ANIMATION_CONSTANTS.LOTTIE_SPEEDS.NORMAL,
      loop = ANIMATION_CONSTANTS.LOTTIE_LOOPS.ONCE,
      autoPlay = true
    } = options;

    if (autoPlay) {
      ref.play(startFrame, endFrame);
    }

    ref.setProgress(0);
    ref.setSpeed(speed);
    
    if (loop === ANIMATION_CONSTANTS.LOTTIE_LOOPS.INFINITE) {
      ref.loop = true;
    } else if (loop > 0) {
      ref.loop = false;
    }
  }

  /**
   * Stop Lottie animation
   * @param {string} id - Animation ID
   */
  stopLottie(id) {
    const ref = this.lottieRefs.get(id);
    if (ref) {
      ref.reset();
    }
  }

  /**
   * Pause Lottie animation
   * @param {string} id - Animation ID
   */
  pauseLottie(id) {
    const ref = this.lottieRefs.get(id);
    if (ref) {
      ref.pause();
    }
  }

  /**
   * Resume Lottie animation
   * @param {string} id - Animation ID
   */
  resumeLottie(id) {
    const ref = this.lottieRefs.get(id);
    if (ref) {
      ref.resume();
    }
  }

  /**
   * Get animated value
   * @param {string} id - Animation ID
   * @returns {Animated.Value} Animated value
   */
  getAnimatedValue(id) {
    return this.animatedValues.get(id);
  }

  /**
   * Dispose animation
   * @param {string} id - Animation ID
   */
  dispose(id) {
    this.stopAnimation(id);
    this.animations.delete(id);
    this.animatedValues.delete(id);
    this.lottieRefs.delete(id);
  }

  /**
   * Dispose all animations
   */
  disposeAll() {
    this.animations.forEach((_, id) => this.dispose(id));
    this.animations.clear();
    this.animatedValues.clear();
    this.lottieRefs.clear();
  }
}

// Export singleton instance
export default new AnimationService();
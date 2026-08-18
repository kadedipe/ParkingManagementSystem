// ============================================================================
// Animation Hooks - React Hooks for Animations
// ============================================================================

// parking-management-system/mobile/src/assets/animations/useAnimation.js

import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import AnimationService from './service';
import { ANIMATION_CONSTANTS } from './constants';

/**
 * Hook for creating and managing animations
 * @param {Object} config - Animation configuration
 * @param {string} config.type - Animation type
 * @param {number} config.duration - Animation duration
 * @param {string} config.easing - Animation easing
 * @param {number} config.delay - Animation delay
 * @param {number} config.fromValue - Starting value
 * @param {number} config.toValue - Ending value
 * @param {boolean} config.autoStart - Auto start animation
 * @param {boolean} config.loop - Loop animation
 * @param {number} config.loopCount - Number of loops
 * @returns {Object} Animation state and controls
 */
export const useAnimation = (config = {}) => {
  const {
    type = ANIMATION_CONSTANTS.TYPES.FADE,
    duration = ANIMATION_CONSTANTS.DURATIONS.MEDIUM,
    easing = ANIMATION_CONSTANTS.EASING.EASE_IN_OUT,
    delay = ANIMATION_CONSTANTS.DELAYS.NONE,
    fromValue = 0,
    toValue = 1,
    autoStart = false,
    loop = false,
    loopCount = -1
  } = config;

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef(null);
  const loopCountRef = useRef(0);
  const isMounted = useRef(true);

  // Create animation
  useEffect(() => {
    const id = `animation_${Date.now()}_${Math.random()}`;
    animationRef.current = AnimationService.createAnimation(id, {
      type,
      duration,
      easing,
      delay,
      fromValue,
      toValue
    });

    if (autoStart) {
      startAnimation();
    }

    return () => {
      isMounted.current = false;
      if (animationRef.current) {
        AnimationService.dispose(id);
      }
    };
  }, []);

  const startAnimation = useCallback(async () => {
    if (!animationRef.current || isAnimating) return;

    setIsAnimating(true);
    setIsPaused(false);

    try {
      await AnimationService.startAnimation(animationRef.current.id);
      
      if (loop && isMounted.current) {
        if (loopCount === -1 || loopCountRef.current < loopCount - 1) {
          loopCountRef.current++;
          startAnimation();
        } else {
          loopCountRef.current = 0;
          setIsAnimating(false);
        }
      } else {
        setIsAnimating(false);
      }
    } catch (error) {
      setIsAnimating(false);
    }
  }, [loop, loopCount, isAnimating]);

  const stopAnimation = useCallback(() => {
    if (!animationRef.current) return;
    AnimationService.stopAnimation(animationRef.current.id);
    setIsAnimating(false);
    setIsPaused(false);
  }, []);

  const pauseAnimation = useCallback(() => {
    if (!animationRef.current || !isAnimating) return;
    AnimationService.pauseAnimation(animationRef.current.id);
    setIsPaused(true);
  }, [isAnimating]);

  const resumeAnimation = useCallback(() => {
    if (!animationRef.current || !isPaused) return;
    AnimationService.resumeAnimation(animationRef.current.id);
    setIsPaused(false);
  }, [isPaused]);

  const resetAnimation = useCallback(() => {
    if (!animationRef.current) return;
    AnimationService.resetAnimation(animationRef.current.id);
    setIsAnimating(false);
    setIsPaused(false);
    loopCountRef.current = 0;
  }, []);

  const getAnimatedValue = useCallback(() => {
    if (!animationRef.current) return null;
    return AnimationService.getAnimatedValue(animationRef.current.id);
  }, []);

  return {
    animatedValue: getAnimatedValue(),
    isAnimating,
    isPaused,
    start: startAnimation,
    stop: stopAnimation,
    pause: pauseAnimation,
    resume: resumeAnimation,
    reset: resetAnimation
  };
};

/**
 * Hook for Lottie animations
 * @param {Object} source - Lottie animation source
 * @param {Object} options - Lottie options
 * @param {number} options.speed - Animation speed
 * @param {number} options.loop - Loop count
 * @param {boolean} options.autoPlay - Auto play
 * @param {number} options.progress - Initial progress
 * @returns {Object} Lottie state and controls
 */
export const useLottie = (source, options = {}) => {
  const {
    speed = ANIMATION_CONSTANTS.LOTTIE_SPEEDS.NORMAL,
    loop = ANIMATION_CONSTANTS.LOTTIE_LOOPS.ONCE,
    autoPlay = true,
    progress = 0
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const lottieRef = useRef(null);
  const animationId = useRef(`lottie_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    if (lottieRef.current) {
      AnimationService.registerLottie(animationId.current, lottieRef.current);
      
      if (autoPlay) {
        play();
      } else {
        lottieRef.current.setProgress(progress);
      }
    }

    return () => {
      AnimationService.unregisterLottie(animationId.current);
    };
  }, []);

  const play = useCallback((startFrame, endFrame) => {
    if (!lottieRef.current) return;
    
    setIsPlaying(true);
    setIsPaused(false);
    
    AnimationService.playLottie(animationId.current, {
      startFrame,
      endFrame,
      speed,
      loop,
      autoPlay: true
    });

    // Listen for animation complete
    lottieRef.current.play(startFrame, endFrame);
  }, [speed, loop]);

  const stop = useCallback(() => {
    if (!lottieRef.current) return;
    AnimationService.stopLottie(animationId.current);
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (!lottieRef.current || !isPlaying) return;
    AnimationService.pauseLottie(animationId.current);
    setIsPaused(true);
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (!lottieRef.current || !isPaused) return;
    AnimationService.resumeLottie(animationId.current);
    setIsPaused(false);
  }, [isPaused]);

  const reset = useCallback(() => {
    if (!lottieRef.current) return;
    lottieRef.current.reset();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  return {
    ref: lottieRef,
    isPlaying,
    isPaused,
    play,
    stop,
    pause,
    resume,
    reset
  };
};

/**
 * Hook for staggered animations
 * @param {Array} items - Array of items to animate
 * @param {Object} config - Animation configuration
 * @param {number} config.staggerDelay - Delay between each item
 * @param {boolean} config.autoStart - Auto start animations
 * @returns {Object} Staggered animation state
 */
export const useStaggerAnimation = (items = [], config = {}) => {
  const {
    staggerDelay = ANIMATION_CONSTANTS.DELAYS.STAGGER,
    autoStart = false,
    ...animationConfig
  } = config;

  const [animations, setAnimations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const anims = items.map((item, index) => {
      return AnimationService.createAnimation(`stagger_${index}`, {
        ...animationConfig,
        delay: index * staggerDelay
      });
    });
    setAnimations(anims);

    if (autoStart) {
      startStagger();
    }

    return () => {
      anims.forEach(anim => AnimationService.dispose(anim.id));
    };
  }, [items]);

  const startStagger = useCallback(() => {
    setIsAnimating(true);
    const promises = animations.map(anim => 
      AnimationService.startAnimation(anim.id)
    );
    
    Promise.all(promises).then(() => {
      setIsAnimating(false);
    });
  }, [animations]);

  const stopStagger = useCallback(() => {
    animations.forEach(anim => AnimationService.stopAnimation(anim.id));
    setIsAnimating(false);
  }, [animations]);

  const resetStagger = useCallback(() => {
    animations.forEach(anim => AnimationService.resetAnimation(anim.id));
    setIsAnimating(false);
  }, [animations]);

  return {
    animations,
    isAnimating,
    start: startStagger,
    stop: stopStagger,
    reset: resetStagger
  };
};

export default { useAnimation, useLottie, useStaggerAnimation };
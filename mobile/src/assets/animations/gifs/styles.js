// ============================================================================
// GIF Styles - Styling for GIF Components
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/styles.js

import { StyleSheet } from 'react-native';

export const GifStyles = StyleSheet.create({
  // Container styles
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative'
  },

  // Image styles
  image: {
    resizeMode: 'contain'
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 10
  },

  // Error state
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8
  },

  errorIcon: {
    fontSize: 40,
    marginBottom: 8
  },

  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },

  // Sizes
  tiny: {
    width: 32,
    height: 32
  },

  small: {
    width: 64,
    height: 64
  },

  medium: {
    width: 128,
    height: 128
  },

  large: {
    width: 200,
    height: 200
  },

  xlarge: {
    width: 300,
    height: 300
  },

  xxlarge: {
    width: 400,
    height: 400
  },

  full: {
    width: '100%',
    height: '100%'
  },

  // Animation speed controls
  speedSlow: {
    animationDuration: 2000
  },

  speedNormal: {
    animationDuration: 1000
  },

  speedFast: {
    animationDuration: 500
  }
});

export default GifStyles;
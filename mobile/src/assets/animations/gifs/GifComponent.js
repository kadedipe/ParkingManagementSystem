// ============================================================================
// GIF Component - React Native Component for GIFs
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/GifComponent.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import GifService from './service';
import Gifs from './index';

/**
 * GIF Component - Displays GIF animations with loading state
 * @param {Object} props - Component props
 * @param {string} props.name - GIF name/key from Gifs object
 * @param {number} props.width - Width of GIF
 * @param {number} props.height - Height of GIF
 * @param {string} props.style - Additional styles
 * @param {boolean} props.resizeMode - Image resize mode
 * @param {boolean} props.showLoading - Show loading indicator
 * @param {Function} props.onLoad - Called when GIF loads
 * @param {Function} props.onError - Called when GIF fails to load
 */
const GifComponent = ({
  name,
  width = 200,
  height = 200,
  style,
  resizeMode = 'contain',
  showLoading = true,
  onLoad,
  onError,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const gifRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(false);

    // Preload GIF
    if (GifService.gifExists(name)) {
      // If GIF exists locally, load it
      setLoading(false);
      if (onLoad) onLoad();
    } else {
      setError(true);
      if (onError) onError();
    }

    return () => {
      // Cleanup
      if (gifRef.current) {
        // Any cleanup needed
      }
    };
  }, [name]);

  const handleLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (onError) onError();
  };

  const gifSource = GifService.getGif(name, { width, height });

  if (error || !gifSource) {
    // Return fallback or error state
    return (
      <View style={[styles.container, { width, height }, style]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorPlaceholder} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      {loading && showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      <Image
        ref={gifRef}
        source={gifSource}
        style={[
          styles.image,
          { width, height },
          loading && styles.hidden
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  hidden: {
    opacity: 0
  },
  loadingContainer: {
    position: 'absolute',
    zIndex: 1
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  }
});

export default GifComponent;
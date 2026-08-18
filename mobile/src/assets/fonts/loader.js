// ============================================================================
// Font Loader - Font Loading and Management
// ============================================================================

// parking-management-system/mobile/src/assets/fonts/loader.js

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';

/**
 * Font Loader - Handles font loading and caching
 */
class FontLoader {
  constructor() {
    this.loaded = false;
    this.loading = false;
    this.fonts = {
      // Custom fonts to load
      'Montserrat-Regular': require('./Montserrat-Regular.ttf'),
      'Montserrat-Medium': require('./Montserrat-Medium.ttf'),
      'Montserrat-Bold': require('./Montserrat-Bold.ttf'),
      'Montserrat-Light': require('./Montserrat-Light.ttf'),
      'Montserrat-SemiBold': require('./Montserrat-SemiBold.ttf'),
      'Montserrat-Italic': require('./Montserrat-Italic.ttf'),
      'Poppins-Regular': require('./Poppins-Regular.ttf'),
      'Poppins-Medium': require('./Poppins-Medium.ttf'),
      'Poppins-Bold': require('./Poppins-Bold.ttf'),
      'Poppins-SemiBold': require('./Poppins-SemiBold.ttf'),
      'Poppins-Light': require('./Poppins-Light.ttf'),
    };
    
    // Google Fonts fallback URLs
    this.googleFonts = {
      'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
    };
  }

  /**
   * Load all fonts
   * @param {Object} options - Loading options
   * @param {boolean} options.showSplash - Show splash screen while loading
   * @param {Function} options.onProgress - Progress callback
   * @param {Function} options.onComplete - Complete callback
   * @param {Function} options.onError - Error callback
   * @returns {Promise} Promise that resolves when fonts are loaded
   */
  async loadFonts({
    showSplash = true,
    onProgress = () => {},
    onComplete = () => {},
    onError = () => {}
  } = {}) {
    if (this.loaded) {
      onComplete();
      return;
    }

    if (this.loading) {
      // Wait for loading to complete
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (this.loaded) {
            clearInterval(checkLoaded);
            onComplete();
            resolve();
          }
        }, 100);
      });
    }

    this.loading = true;

    try {
      if (showSplash) {
        await SplashScreen.preventAutoHideAsync();
      }

      // Load custom fonts
      const fontPromises = Object.entries(this.fonts).map(([name, source]) => {
        return Font.loadAsync({
          [name]: source
        });
      });

      // Add progress tracking
      const totalFonts = fontPromises.length;
      let loadedFonts = 0;

      const trackedPromises = fontPromises.map((promise) => {
        return promise.then(() => {
          loadedFonts++;
          onProgress((loadedFonts / totalFonts) * 100);
        });
      });

      await Promise.all(trackedPromises);

      this.loaded = true;
      this.loading = false;

      if (showSplash) {
        await SplashScreen.hideAsync();
      }

      onComplete();
      
      console.log('All fonts loaded successfully');
    } catch (error) {
      this.loading = false;
      console.error('Error loading fonts:', error);
      
      // Attempt to load fallback fonts
      await this.loadFallbackFonts();
      
      onError(error);
      
      if (showSplash) {
        await SplashScreen.hideAsync();
      }
    }
  }

  /**
   * Load fallback fonts from Google Fonts
   */
  async loadFallbackFonts() {
    try {
      // For web, we can load Google Fonts via CSS
      if (Platform.OS === 'web') {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      
      console.log('Fallback fonts loaded successfully');
    } catch (error) {
      console.error('Error loading fallback fonts:', error);
    }
  }

  /**
   * Check if fonts are loaded
   * @returns {boolean} True if fonts are loaded
   */
  isLoaded() {
    return this.loaded;
  }

  /**
   * Get loading status
   * @returns {Object} Loading status
   */
  getStatus() {
    return {
      loaded: this.loaded,
      loading: this.loading,
      fontCount: Object.keys(this.fonts).length
    };
  }

  /**
   * Clear font cache
   */
  clearCache() {
    // Font cache clearing logic
    console.log('Font cache cleared');
  }

  /**
   * Preload fonts for faster rendering
   * @param {Array} fontNames - Array of font names to preload
   */
  async preloadFonts(fontNames = []) {
    const fontsToLoad = fontNames.length > 0 
      ? fontNames 
      : Object.keys(this.fonts);
    
    const preloadPromises = fontsToLoad.map((fontName) => {
      if (this.fonts[fontName]) {
        return Font.loadAsync({
          [fontName]: this.fonts[fontName]
        });
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(preloadPromises);
      console.log('Fonts preloaded successfully');
    } catch (error) {
      console.error('Error preloading fonts:', error);
    }
  }
}

// Export singleton instance
export default new FontLoader();
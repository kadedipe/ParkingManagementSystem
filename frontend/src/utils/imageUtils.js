// ============================================================================
// Image Utilities
// ============================================================================

/**
 * Image utilities for the parking management system.
 * 
 * This module provides:
 * - Image loading helpers
 * - Image optimization
 * - Lazy loading
 * - Placeholder generation
 * - Responsive image handling
 */

// ============================================================================
// Image Constants
// ============================================================================

const IMAGE_TYPES = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
};

const IMAGE_SIZES = {
  THUMBNAIL: 150,
  SMALL: 300,
  MEDIUM: 600,
  LARGE: 1200,
  XLARGE: 2400,
};

// ============================================================================
// Image Helpers
// ============================================================================

/**
 * Check if image exists
 */
export const imageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Generate a data URL for a placeholder image
 */
export const generatePlaceholder = (width = 400, height = 300, text = '') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
  
  // Text
  if (text) {
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }
  
  return canvas.toDataURL('image/png');
};

/**
 * Get image URL with cache busting
 */
export const getImageUrlWithCache = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

/**
 * Get responsive image srcset
 */
export const getResponsiveSrcSet = (baseUrl, sizes = IMAGE_SIZES) => {
  return Object.entries(sizes)
    .map(([key, size]) => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

/**
 * Get image size based on viewport
 */
export const getResponsiveSize = (sizes = IMAGE_SIZES) => {
  const width = window.innerWidth;
  if (width < 640) return sizes.SMALL;
  if (width < 1024) return sizes.MEDIUM;
  if (width < 1440) return sizes.LARGE;
  return sizes.XLARGE;
};

/**
 * Preload images
 */
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    })
  );
};

/**
 * Lazy load images
 */
export const lazyLoadImages = (selector = 'img[data-src]') => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
    
    return imageObserver;
  }
  
  // Fallback for older browsers
  document.querySelectorAll(selector).forEach((img) => {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
  });
  
  return null;
};

/**
 * Convert image to WebP if supported
 */
export const convertToWebP = (url) => {
  if (window.chrome || window.browser) {
    // Check if WebP is supported
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(1, 1);
    const data = imageData.data;
    data[0] = 0;
    data[1] = 0;
    data[2] = 0;
    data[3] = 0;
    ctx.putImageData(imageData, 0, 0);
    const webpSupported = canvas.toDataURL('image/webp').indexOf('image/webp') !== -1;
    
    if (webpSupported) {
      return url.replace(/\.(jpg|jpeg|png|gif)$/, '.webp');
    }
  }
  return url;
};

// ============================================================================
// Image Component
// ============================================================================

import React, { useState, useEffect } from 'react';

/**
 * Optimized image component with lazy loading and fallback
 */
export const OptimizedImage = ({
  src,
  alt = '',
  fallback = '',
  width,
  height,
  className,
  lazy = true,
  responsive = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(lazy ? '' : src);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lazy) {
      setImageSrc(src);
    }
  }, [src, lazy]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  const imgProps = {
    src: imageSrc || src,
    alt,
    width,
    height,
    className: `${className || ''} ${loaded ? 'loaded' : 'loading'}`,
    onLoad: handleLoad,
    onError: handleError,
    ...props,
  };

  if (lazy) {
    imgProps['data-src'] = src;
    imgProps['loading'] = 'lazy';
  }

  return <img {...imgProps} />;
};

// ============================================================================
// Export
// ============================================================================

export default {
  IMAGE_TYPES,
  IMAGE_SIZES,
  imageExists,
  getImageDimensions,
  generatePlaceholder,
  getImageUrlWithCache,
  getResponsiveSrcSet,
  getResponsiveSize,
  preloadImages,
  lazyLoadImages,
  convertToWebP,
  OptimizedImage,
};
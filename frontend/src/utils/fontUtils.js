// ============================================================================
// Font Utilities
// ============================================================================

/**
 * Font utilities for the parking management system.
 * 
 * This module provides:
 * - Font loading helpers
 * - Font size utilities
 * - Font weight utilities
 * - Font family utilities
 */

// ============================================================================
// Font Size Mapping
// ============================================================================

export const FONT_SIZES = {
  xs: { fontSize: '0.75rem', lineHeight: '1rem' },
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  base: { fontSize: '1rem', lineHeight: '1.5rem' },
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
  xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
  '5xl': { fontSize: '3rem', lineHeight: '1' },
  '6xl': { fontSize: '3.75rem', lineHeight: '1' },
  '7xl': { fontSize: '4.5rem', lineHeight: '1' },
  '8xl': { fontSize: '6rem', lineHeight: '1' },
  '9xl': { fontSize: '8rem', lineHeight: '1' },
};

// ============================================================================
// Font Weight Mapping
// ============================================================================

export const FONT_WEIGHTS = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
};

// ============================================================================
// Font Helpers
// ============================================================================

/**
 * Get font size CSS
 */
export const getFontSize = (size = 'base') => {
  const sizeConfig = FONT_SIZES[size];
  if (!sizeConfig) return FONT_SIZES.base;
  return `${sizeConfig.fontSize} / ${sizeConfig.lineHeight}`;
};

/**
 * Get font weight CSS
 */
export const getFontWeight = (weight = 'regular') => {
  return FONT_WEIGHTS[weight] || 400;
};

/**
 * Get font family CSS
 */
export const getFontFamily = (type = 'primary') => {
  const families = {
    primary: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    secondary: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    icons: '"Material Icons"',
  };
  return families[type] || families.primary;
};

/**
 * Generate font style object
 */
export const getFontStyle = (options = {}) => {
  const {
    family = 'primary',
    size = 'base',
    weight = 'regular',
    color = 'inherit',
    align = 'inherit',
    decoration = 'none',
    transform = 'none',
  } = options;
  
  const style = {
    fontFamily: getFontFamily(family),
    fontSize: FONT_SIZES[size]?.fontSize || FONT_SIZES.base.fontSize,
    lineHeight: FONT_SIZES[size]?.lineHeight || FONT_SIZES.base.lineHeight,
    fontWeight: getFontWeight(weight),
    color,
    textAlign: align,
    textDecoration: decoration,
    textTransform: transform,
  };
  
  return style;
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (baseSize, scale = 1) => {
  const sizes = {
    xs: 0.75 * scale,
    sm: 0.875 * scale,
    base: 1 * scale,
    lg: 1.125 * scale,
    xl: 1.25 * scale,
    '2xl': 1.5 * scale,
    '3xl': 1.875 * scale,
    '4xl': 2.25 * scale,
    '5xl': 3 * scale,
    '6xl': 3.75 * scale,
    '7xl': 4.5 * scale,
    '8xl': 6 * scale,
    '9xl': 8 * scale,
  };
  
  return sizes[baseSize] || 1;
};

// ============================================================================
// Font Component
// ============================================================================

import React from 'react';

/**
 * Font component for applying font styles
 */
export const Font = ({
  children,
  family = 'primary',
  size = 'base',
  weight = 'regular',
  color = 'inherit',
  align = 'inherit',
  decoration = 'none',
  transform = 'none',
  className = '',
  as: Component = 'span',
  ...props
}) => {
  const style = getFontStyle({
    family,
    size,
    weight,
    color,
    align,
    decoration,
    transform,
  });
  
  return (
    <Component className={className} style={style} {...props}>
      {children}
    </Component>
  );
};

// ============================================================================
// Export
// ============================================================================

export default {
  FONT_SIZES,
  FONT_WEIGHTS,
  getFontSize,
  getFontWeight,
  getFontFamily,
  getFontStyle,
  getResponsiveFontSize,
  Font,
};
// ============================================================================
// Styles
// ============================================================================

/**
 * Styles for the parking management system.
 * 
 * This module exports all styles and style utilities for the application.
 */

// ============================================================================
// CSS Imports
// ============================================================================

import './reset.css';
import './variables.css';
import './theme.css';
import './typography.css';
import './utilities.css';
import './animations.css';
import './components.css';
import './responsive.css';
import './dark-mode.css';
import './print.css';
import './globals.css';

// ============================================================================
// Style Modules
// ============================================================================

import './modules/parking.css';
import './modules/dashboard.css';
import './modules/forms.css';
import './modules/tables.css';
import './modules/cards.css';
import './modules/buttons.css';
import './modules/navigation.css';
import './modules/modals.css';

// ============================================================================
// Style Constants
// ============================================================================

export const STYLES = {
  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Colors
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#d32f2f',
    info: '#0288d1',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  
  // Spacing
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      secondary: '"Roboto", "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    fontWeight: {
      thin: 100,
      extraLight: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
      black: 900,
    },
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  
  // Transitions
  transition: {
    duration: {
      none: '0ms',
      shortest: '150ms',
      shorter: '200ms',
      short: '250ms',
      standard: '300ms',
      complex: '375ms',
      entering: '225ms',
      leaving: '195ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

// ============================================================================
// Style Utilities
// ============================================================================

/**
 * Get CSS variable value
 */
export const getCSSVariable = (variable) => {
  return `var(--${variable})`;
};

/**
 * Generate media query string
 */
export const mediaQuery = (breakpoint, min = true) => {
  const value = STYLES.breakpoints[breakpoint];
  if (!value) return '';
  return min ? `@media (min-width: ${value})` : `@media (max-width: ${value})`;
};

/**
 * Generate responsive styles
 */
export const responsive = (styles, breakpoints = {}) => {
  let result = '';
  
  Object.entries(breakpoints).forEach(([breakpoint, rules]) => {
    const query = mediaQuery(breakpoint);
    if (query) {
      result += `
        ${query} {
          ${rules}
        }
      `;
    }
  });
  
  return result;
};

// ============================================================================
// Export
// ============================================================================

export default STYLES;
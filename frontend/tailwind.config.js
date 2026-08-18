// ============================================================================
// Tailwind CSS Configuration
// ============================================================================

/**
 * Tailwind CSS configuration for the Parking Management System frontend.
 * 
 * This configuration includes:
 * - Custom color palette matching the brand
 * - Extended typography system
 * - Custom animations and transitions
 * - Plugin configurations
 * - Dark mode support
 * - Responsive breakpoints
 */

/** @type {import('tailwindcss').Config} */
export default {
  // ==========================================================================
  // Content Configuration
  // ==========================================================================
  
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/layouts/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
  ],
  
  // ==========================================================================
  // Dark Mode Configuration
  // ==========================================================================
  
  darkMode: 'class', // or 'media' for system preference
  
  // ==========================================================================
  // Theme Configuration
  // ==========================================================================
  
  theme: {
    // ========================================================================
    // Container Configuration
    // ========================================================================
    
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    
    // ========================================================================
    // Extend Default Theme
    // ========================================================================
    
    extend: {
      // ======================================================================
      // Colors
      // ======================================================================
      
      colors: {
        // Primary brand colors
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#1976d2', // Main primary
          600: '#1565c0',
          700: '#0d47a1',
          800: '#0a3a8a',
          900: '#062a6e',
          950: '#031a4a',
        },
        // Secondary brand colors
        secondary: {
          50: '#fce4ec',
          100: '#f8bbd0',
          200: '#f48fb1',
          300: '#f06292',
          400: '#ec407a',
          500: '#dc004e', // Main secondary
          600: '#c51162',
          700: '#ad1457',
          800: '#880e4f',
          900: '#6a1b4a',
          950: '#4a0e2f',
        },
        // Success colors
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
          950: '#0d3d14',
        },
        // Warning colors
        warning: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
          950: '#b33e00',
        },
        // Error colors
        error: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#d32f2f',
          600: '#c62828',
          700: '#b71c1c',
          800: '#8e0000',
          900: '#5c0000',
          950: '#3a0000',
        },
        // Info colors
        info: {
          50: '#e1f5fe',
          100: '#b3e5fc',
          200: '#81d4fa',
          300: '#4fc3f7',
          400: '#29b6f6',
          500: '#0288d1',
          600: '#0277bd',
          700: '#01579b',
          800: '#01457a',
          900: '#012a5a',
          950: '#011a3a',
        },
        // Gray/Neutral colors
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
          950: '#121212',
        },
        // Parking-specific colors
        parking: {
          available: '#4caf50',
          occupied: '#d32f2f',
          reserved: '#ff9800',
          maintenance: '#757575',
          ev: '#2196f3',
          handicap: '#1565c0',
          premium: '#9c27b0',
          compact: '#00bcd4',
        },
        // Charging-specific colors
        charging: {
          available: '#4caf50',
          occupied: '#d32f2f',
          fast: '#f44336',
          slow: '#2196f3',
          ccs: '#9c27b0',
          chademo: '#ff9800',
          tesla: '#d32f2f',
          type2: '#4caf50',
        },
      },
      
      // ======================================================================
      // Font Family
      // ======================================================================
      
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"Fira Code"',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      
      // ======================================================================
      // Font Size
      // ======================================================================
      
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // ======================================================================
      // Spacing
      // ======================================================================
      
      spacing: {
        '0': '0px',
        'px': '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      
      // ======================================================================
      // Border Radius
      // ======================================================================
      
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
      
      // ======================================================================
      // Box Shadow
      // ======================================================================
      
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
        // Custom shadows
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'notification': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      
      // ======================================================================
      // Animation
      // ======================================================================
      
      animation: {
        // Base animations
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        
        // Custom animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-in',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'zoom-out': 'zoomOut 0.3s ease-in',
        'shake': 'shake 0.5s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        
        // Skeleton loading
        'shimmer': 'shimmer 2s linear infinite',
        
        // Dropdown
        'dropdown-enter': 'dropdownEnter 0.2s ease-out',
        'dropdown-leave': 'dropdownLeave 0.2s ease-in',
        
        // Modal
        'modal-enter': 'modalEnter 0.3s ease-out',
        'modal-leave': 'modalLeave 0.3s ease-in',
        
        // Notification
        'notification-enter': 'notificationEnter 0.4s ease-out',
        'notification-leave': 'notificationLeave 0.4s ease-in',
        
        // Page transitions
        'page-enter': 'pageEnter 0.3s ease-out',
        'page-leave': 'pageLeave 0.3s ease-in',
      },
      
      // ======================================================================
      // Keyframes
      // ======================================================================
      
      keyframes: {
        // Base keyframes
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        
        // Custom keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        dropdownEnter: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(-10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        dropdownLeave: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.95) translateY(-10px)' },
        },
        modalEnter: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        modalLeave: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        notificationEnter: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        notificationLeave: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pageLeave: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-20px)' },
        },
      },
      
      // ======================================================================
      // Background Image (for gradients)
      // ======================================================================
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #dc004e 0%, #f06292 100%)',
        'gradient-success': 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
        'gradient-warning': 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
        'gradient-error': 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #424242 100%)',
      },
      
      // ======================================================================
      // Transitions
      // ======================================================================
      
      transitionProperty: {
        'height': 'height',
        'width': 'width',
        'spacing': 'margin, padding',
        'transform': 'transform',
        'all': 'all',
      },
      
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      transitionTimingFunction: {
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      
      // ======================================================================
      // Z-Index
      // ======================================================================
      
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'notification': '1080',
        'max': '9999',
      },
      
      // ======================================================================
      // Screens / Breakpoints
      // ======================================================================
      
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        // Custom breakpoints
        'mobile': { 'max': '640px' },
        'tablet': { 'min': '641px', 'max': '1024px' },
        'desktop': { 'min': '1025px' },
        'dark': { 'raw': '(prefers-color-scheme: dark)' },
        'light': { 'raw': '(prefers-color-scheme: light)' },
        'motion-reduce': { 'raw': '(prefers-reduced-motion: reduce)' },
        'motion-safe': { 'raw': '(prefers-reduced-motion: no-preference)' },
      },
    },
  },
  
  // ==========================================================================
  // Plugins
  // ==========================================================================
  
  plugins: [
    // Custom plugin for forms
    function({ addBase, addComponents, addUtilities, theme }) {
      // ======================================================================
      // Base Styles
      // ======================================================================
      
      addBase({
        // Custom base styles
        'html': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'scroll-behavior': 'smooth',
        },
        'body': {
          'min-height': '100vh',
          'font-family': theme('fontFamily.sans'),
        },
        '::selection': {
          'background-color': theme('colors.primary.500'),
          'color': '#fff',
        },
        '::-webkit-scrollbar': {
          'width': '8px',
          'height': '8px',
        },
        '::-webkit-scrollbar-track': {
          'background-color': theme('colors.gray.200'),
          'border-radius': '4px',
        },
        '::-webkit-scrollbar-thumb': {
          'background-color': theme('colors.gray.400'),
          'border-radius': '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          'background-color': theme('colors.gray.500'),
        },
        // Dark mode scrollbar
        '.dark ::-webkit-scrollbar-track': {
          'background-color': theme('colors.gray.800'),
        },
        '.dark ::-webkit-scrollbar-thumb': {
          'background-color': theme('colors.gray.600'),
        },
        '.dark ::-webkit-scrollbar-thumb:hover': {
          'background-color': theme('colors.gray.500'),
        },
      });
      
      // ======================================================================
      // Component Styles
      // ======================================================================
      
      addComponents({
        // Card component
        '.card': {
          'background-color': 'white',
          'border-radius': theme('borderRadius.lg'),
          'box-shadow': theme('boxShadow.card'),
          'padding': theme('spacing.6'),
          'transition': 'all 0.3s ease',
          '&:hover': {
            'box-shadow': theme('boxShadow.card-hover'),
          },
        },
        '.card-dark': {
          'background-color': theme('colors.gray.800'),
          'color': 'white',
        },
        
        // Button variants
        '.btn': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'padding': `${theme('spacing.2')} ${theme('spacing.4')}`,
          'font-weight': '500',
          'border-radius': theme('borderRadius.md'),
          'transition': 'all 0.2s ease',
          'cursor': 'pointer',
          'border': 'none',
          '&:focus': {
            'outline': 'none',
            'ring': '2px',
            'ring-offset': '2px',
          },
          '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
          },
        },
        '.btn-primary': {
          'background-color': theme('colors.primary.500'),
          'color': 'white',
          '&:hover': {
            'background-color': theme('colors.primary.600'),
          },
          '&:focus': {
            'ring-color': theme('colors.primary.500'),
          },
        },
        '.btn-secondary': {
          'background-color': theme('colors.secondary.500'),
          'color': 'white',
          '&:hover': {
            'background-color': theme('colors.secondary.600'),
          },
          '&:focus': {
            'ring-color': theme('colors.secondary.500'),
          },
        },
        '.btn-outline': {
          'background-color': 'transparent',
          'border': `1px solid ${theme('colors.gray.300')}`,
          'color': theme('colors.gray.700'),
          '&:hover': {
            'background-color': theme('colors.gray.50'),
          },
        },
        
        // Badge component
        '.badge': {
          'display': 'inline-flex',
          'align-items': 'center',
          'padding': `${theme('spacing.0.5')} ${theme('spacing.2')}`,
          'font-size': theme('fontSize.xs'),
          'font-weight': '600',
          'border-radius': '9999px',
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
        },
        '.badge-primary': {
          'background-color': theme('colors.primary.100'),
          'color': theme('colors.primary.700'),
        },
        '.badge-success': {
          'background-color': theme('colors.success.100'),
          'color': theme('colors.success.700'),
        },
        '.badge-warning': {
          'background-color': theme('colors.warning.100'),
          'color': theme('colors.warning.700'),
        },
        '.badge-error': {
          'background-color': theme('colors.error.100'),
          'color': theme('colors.error.700'),
        },
        
        // Status indicators
        '.status-dot': {
          'display': 'inline-block',
          'width': '8px',
          'height': '8px',
          'border-radius': '9999px',
        },
        '.status-dot-available': {
          'background-color': theme('colors.parking.available'),
        },
        '.status-dot-occupied': {
          'background-color': theme('colors.parking.occupied'),
        },
        '.status-dot-reserved': {
          'background-color': theme('colors.parking.reserved'),
        },
        '.status-dot-maintenance': {
          'background-color': theme('colors.parking.maintenance'),
        },
      });
      
      // ======================================================================
      // Utility Styles
      // ======================================================================
      
      addUtilities({
        // Text utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        
        // Scroll utilities
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none',
          },
        },
        '.scrollbar-default': {
          '-ms-overflow-style': 'auto',
          'scrollbar-width': 'auto',
          '&::-webkit-scrollbar': {
            'display': 'block',
          },
        },
        
        // Focus utilities
        '.focus-ring': {
          '&:focus': {
            'outline': 'none',
            'ring': '2px',
            'ring-offset': '2px',
            'ring-color': theme('colors.primary.500'),
          },
        },
        
        // Gradient text
        '.text-gradient': {
          'background-image': theme('backgroundImage.gradient-primary'),
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
        
        // Animation delay utilities
        '.animation-delay-100': {
          'animation-delay': '100ms',
        },
        '.animation-delay-200': {
          'animation-delay': '200ms',
        },
        '.animation-delay-300': {
          'animation-delay': '300ms',
        },
        '.animation-delay-400': {
          'animation-delay': '400ms',
        },
        '.animation-delay-500': {
          'animation-delay': '500ms',
        },
        
        // Animation duration utilities
        '.animation-duration-100': {
          'animation-duration': '100ms',
        },
        '.animation-duration-200': {
          'animation-duration': '200ms',
        },
        '.animation-duration-300': {
          'animation-duration': '300ms',
        },
        '.animation-duration-400': {
          'animation-duration': '400ms',
        },
        '.animation-duration-500': {
          'animation-duration': '500ms',
        },
        '.animation-duration-1000': {
          'animation-duration': '1000ms',
        },
      });
    },
    
    // ========================================================================
    // Third-party Plugins
    // ========================================================================
    
    // Forms plugin for better form styling
    // require('@tailwindcss/forms'),
    
    // Typography plugin for prose
    // require('@tailwindcss/typography'),
    
    // Aspect ratio plugin
    // require('@tailwindcss/aspect-ratio'),
    
    // Container queries plugin
    // require('@tailwindcss/container-queries'),
  ],
};

// ============================================================================
// Export Configuration
// ============================================================================

// Export for use in other files
export default config;
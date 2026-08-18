// ============================================================================
// Application Entry Point
// ============================================================================

/**
 * Main entry point for the Parking Management System frontend application.
 * 
 * This file initializes the React application with all necessary providers:
 * - React Strict Mode for development checks
 * - React Router for navigation
 * - React Query for data fetching
 * - Material-UI Theme provider
 * - Global error boundary
 * - Analytics and monitoring
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';

// Import application components
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingFallback } from './components/common/LoadingFallback';

// Import styles
import './styles/index.css';
import './styles/globals.css';

// Import configuration
import { config } from './config';
import { theme } from './theme';

// ============================================================================
// React Query Client Configuration
// ============================================================================

/**
 * Configure React Query client with optimal settings
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time for unused data: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed queries up to 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (production only)
      refetchOnWindowFocus: import.meta.env.PROD,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Keep previous data while fetching new data
      keepPreviousData: true,
      // Disable automatic refetching on mount for performance
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations up to 2 times
      retry: 2,
      // Exponential backoff for mutation retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// ============================================================================
// Environment Checks
// ============================================================================

// Log application version and environment
console.log(`%c🚗 Parking Management System v${import.meta.env.VITE_APP_VERSION || '1.0.0'}`, 'color: #1976d2; font-size: 16px; font-weight: bold;');
console.log(`%c🌍 Environment: ${import.meta.env.MODE}`, 'color: #666; font-size: 12px;');

// Check for required environment variables in production
if (import.meta.env.PROD) {
  const requiredEnvVars = [
    'VITE_API_URL',
    'VITE_APP_NAME',
    'VITE_ENVIRONMENT',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `%c⚠️ Missing required environment variables: ${missingVars.join(', ')}`,
      'color: #ff9800; font-size: 12px;'
    );
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

// Report Web Vitals in production
if (import.meta.env.PROD) {
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    const sendToAnalytics = (metric) => {
      // Send to Google Analytics if enabled
      if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true' && window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: metric.name,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }

      // Send to console in development
      if (import.meta.env.DEV) {
        console.log(`%c📊 Web Vital: ${metric.name}`, 'color: #4caf50; font-weight: bold;');
        console.log(`  Value: ${metric.value}`);
        console.log(`  Rating: ${metric.rating}`);
      }
    };

    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  });
}

// ============================================================================
// Error Handling
// ============================================================================

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error || event.message);
  
  // Send to error tracking service if configured
  if (import.meta.env.VITE_SENTRY_DSN && window.Sentry) {
    window.Sentry.captureException(event.error || event.message);
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Send to error tracking service if configured
  if (import.meta.env.VITE_SENTRY_DSN && window.Sentry) {
    window.Sentry.captureException(event.reason);
  }
});

// ============================================================================
// Render Application
// ============================================================================

/**
 * Render the application with all providers
 */
function renderApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found!');
    return;
  }

  // Check if root element already has content (for hydration)
  const isHydrating = rootElement.hasChildNodes();

  const root = ReactDOM.createRoot(rootElement);

  // Create theme instance
  const appTheme = theme;

  // Application providers
  const AppProviders = ({ children }) => (
    <React.StrictMode>
      <ErrorBoundary fallback={<LoadingFallback />}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeContextProvider>
              <ThemeProvider theme={appTheme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <AuthProvider>
                    <NotificationProvider>
                      {children}
                    </NotificationProvider>
                  </AuthProvider>
                </LocalizationProvider>
              </ThemeProvider>
            </ThemeContextProvider>
            {/* React Query DevTools (only in development) */}
            {import.meta.env.DEV && (
              <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition="bottom-right"
                position="bottom-right"
              />
            )}
          </QueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Render or hydrate the application
  if (isHydrating) {
    root.hydrate(
      <AppProviders>
        <App />
      </AppProviders>
    );
  } else {
    root.render(
      <AppProviders>
        <App />
      </AppProviders>
    );
  }
}

// ============================================================================
// Initialize Application
// ============================================================================

// Render the app
renderApp();

// ============================================================================
// Service Worker Registration (PWA)
// ============================================================================

// Register service worker in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully');
        console.log('Scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// ============================================================================
// Development Helpers
// ============================================================================

// Expose query client to console for debugging
if (import.meta.env.DEV) {
  window.__QUERY_CLIENT__ = queryClient;
  
  // Expose React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('%c🔧 React DevTools available', 'color: #2196f3; font-size: 12px;');
  }
}

// ============================================================================
// Export for testing
// ============================================================================

export { queryClient, renderApp };
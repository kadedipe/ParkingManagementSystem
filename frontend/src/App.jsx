// ============================================================================
// Main Application Component
// ============================================================================

/**
 * Main App component for the Parking Management System.
 * 
 * This component sets up the application layout, routing, and global providers.
 * It handles authentication state, theme switching, and error boundaries.
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Import contexts and hooks
import { useAuth } from './hooks/useAuth';
import { useTheme as useAppTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { usePerformance } from './hooks/usePerformance';

// Import components
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingFallback } from './components/common/LoadingFallback';
import { ToastContainer } from './components/common/ToastContainer';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Parking = lazy(() => import('./pages/Parking'));
const Charging = lazy(() => import('./pages/Charging'));
const Payments = lazy(() => import('./pages/Payments'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const Reports = lazy(() => import('./pages/Reports'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Import utilities
import { config } from './config';
import { trackPageView } from './utils/analytics';

// ============================================================================
// Loading Component
// ============================================================================

/**
 * Page loading component shown while lazy loading pages
 */
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress />
  </Box>
);

// ============================================================================
// App Component
// ============================================================================

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { themeMode } = useAppTheme();
  const { showToast } = useNotifications();
  const { trackPerformance } = usePerformance();

  // Track page views
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath);
    
    // Track performance for route changes
    trackPerformance('page_view', {
      path: pagePath,
      title: document.title,
    });
  }, [location]);

  // Check for authentication redirects
  useEffect(() => {
    // If user is authenticated and on login/register page, redirect to dashboard
    if (isAuthenticated && user) {
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
      if (publicRoutes.includes(location.pathname)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  // Handle theme changes
  useEffect(() => {
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', themeMode);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.palette.primary.main);
    }
  }, [themeMode, theme]);

  // Show welcome toast on login
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        showToast(`Welcome back, ${user.firstName || 'User'}!`, {
          icon: '👋',
          duration: 5000,
        });
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [isAuthenticated, user, showToast]);

  // ==========================================================================
  // Route Configuration
  // ==========================================================================

  // Public routes (accessible without authentication)
  const publicRoutes = (
    <Route element={<Layout variant="auth" />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Route>
  );

  // Protected routes (require authentication)
  const protectedRoutes = (
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout variant="main" />}>
        {/* Main routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<Vehicles />} />
        <Route path="/parking" element={<Parking />} />
        <Route path="/parking/sessions" element={<Parking />} />
        <Route path="/parking/spots" element={<Parking />} />
        <Route path="/parking/reservations" element={<Parking />} />
        <Route path="/charging" element={<Charging />} />
        <Route path="/charging/sessions" element={<Charging />} />
        <Route path="/charging/stations" element={<Charging />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/history" element={<Payments />} />
        <Route path="/payments/methods" element={<Payments />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<Admin />} />
        <Route path="/admin/audit-logs" element={<Admin />} />
        <Route path="/admin/system" element={<Admin />} />
        
        {/* Report routes */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/parking" element={<Reports />} />
        <Route path="/reports/revenue" element={<Reports />} />
        <Route path="/reports/charging" element={<Reports />} />
        
        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Route>
  );

  // 404 route
  const notFoundRoute = (
    <Route path="*" element={<NotFound />} />
  );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CssBaseline />
      
      {/* Toast notifications container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[3],
          },
          success: {
            iconTheme: {
              primary: theme.palette.success.main,
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error.main,
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Toast container for custom toasts */}
      <ToastContainer />

      {/* Main routes with suspense */}
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {publicRoutes}
            {protectedRoutes}
            {notFoundRoute}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Box>
  );
}

// ============================================================================
// Export
// ============================================================================

export default App;
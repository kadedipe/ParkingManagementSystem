import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { useAuth } from './hooks/useAuth';
import { useTheme as useAppTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { usePerformance } from './hooks/usePerformance';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { trackPageView } from './utils/analytics';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/VehiclesPage'));
const Parking = lazy(() => import('./pages/ParkingSearchPage'));
const Bookings = lazy(() => import('./pages/BookingsPage'));
const ReservationCalendar = lazy(() => import('./pages/ReservationCalendar'));
const Charging = lazy(() => import('./pages/ChargingPage'));
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

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress />
  </Box>
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { themeMode } = useAppTheme();
  const { addToast: showToast } = useNotifications();
  const { trackPerformance } = usePerformance();

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath);
    trackPerformance('page_view', { path: pagePath, title: document.title });
  }, [location, trackPerformance]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
      if (publicRoutes.includes(location.pathname)) navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', theme.palette.primary.main);
  }, [themeMode, theme]);

  useEffect(() => {
    if (isAuthenticated && user && !sessionStorage.getItem('hasSeenWelcome')) {
      showToast(`Welcome back, ${user.firstName || 'User'}!`, { icon: '👋', duration: 5000 });
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [isAuthenticated, user, showToast]);

  if (authLoading) return <PageLoader />;

  if (import.meta.env.VITE_EVIDENCE_MODE === 'true') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/parking" element={<Parking />} />
              <Route path="/charging" element={<Charging />} />
              <Route path="*" element={<Navigate to="/parking" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
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
        }}
      />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout variant="auth" />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout variant="main" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/vehicles/:id" element={<Vehicles />} />
                <Route path="/parking" element={<Parking />} />
                <Route path="/parking/spots" element={<Parking />} />
                <Route path="/parking/sessions" element={<Bookings />} />
                <Route path="/parking/reservations" element={<ReservationCalendar />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/calendar" element={<ReservationCalendar />} />
                <Route path="/charging" element={<Charging />} />
                <Route path="/charging/sessions" element={<Charging />} />
                <Route path="/charging/stations" element={<Charging />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/payments/history" element={<Payments />} />
                <Route path="/payments/methods" element={<Payments />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users" element={<Admin />} />
                <Route path="/admin/audit-logs" element={<Admin />} />
                <Route path="/admin/system" element={<Admin />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/parking" element={<Reports />} />
                <Route path="/reports/revenue" element={<Reports />} />
                <Route path="/reports/charging" element={<Reports />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Box>
  );
}

export default App;

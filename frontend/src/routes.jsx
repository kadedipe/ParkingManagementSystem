// ============================================================================
// Route Configuration
// ============================================================================

/**
 * Route configuration for the Parking Management System.
 * 
 * This file defines all application routes with their associated components,
 * metadata, and access control rules.
 */

import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Import route components
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const VehicleDetail = lazy(() => import('./pages/Vehicles/VehicleDetail'));
const VehicleCreate = lazy(() => import('./pages/Vehicles/VehicleCreate'));
const VehicleEdit = lazy(() => import('./pages/Vehicles/VehicleEdit'));

const Parking = lazy(() => import('./pages/Parking'));
const ParkingSessions = lazy(() => import('./pages/Parking/Sessions'));
const ParkingSpots = lazy(() => import('./pages/Parking/Spots'));
const ParkingReservations = lazy(() => import('./pages/Parking/Reservations'));
const ParkingSpotDetail = lazy(() => import('./pages/Parking/SpotDetail'));
const ParkingSessionDetail = lazy(() => import('./pages/Parking/SessionDetail'));

const Charging = lazy(() => import('./pages/Charging'));
const ChargingSessions = lazy(() => import('./pages/Charging/Sessions'));
const ChargingStations = lazy(() => import('./pages/Charging/Stations'));
const ChargingStationDetail = lazy(() => import('./pages/Charging/StationDetail'));
const ChargingSessionDetail = lazy(() => import('./pages/Charging/SessionDetail'));

const Payments = lazy(() => import('./pages/Payments'));
const PaymentHistory = lazy(() => import('./pages/Payments/History'));
const PaymentMethods = lazy(() => import('./pages/Payments/Methods'));
const PaymentDetail = lazy(() => import('./pages/Payments/PaymentDetail'));

const Notifications = lazy(() => import('./pages/Notifications'));
const NotificationPreferences = lazy(() => import('./pages/Notifications/Preferences'));

const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminUsers = lazy(() => import('./pages/Admin/Users'));
const AdminAuditLogs = lazy(() => import('./pages/Admin/AuditLogs'));
const AdminSystem = lazy(() => import('./pages/Admin/System'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings'));

const Reports = lazy(() => import('./pages/Reports'));
const ParkingReports = lazy(() => import('./pages/Reports/Parking'));
const RevenueReports = lazy(() => import('./pages/Reports/Revenue'));
const ChargingReports = lazy(() => import('./pages/Reports/Charging'));
const ReportDetail = lazy(() => import('./pages/Reports/ReportDetail'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Logout = lazy(() => import('./pages/auth/Logout'));

const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Maintenance = lazy(() => import('./pages/Maintenance'));

// ============================================================================
// Loading Component
// ============================================================================

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
// Route Configuration Helpers
// ============================================================================

/**
 * Create a route with lazy loading
 */
const lazyRoute = (Component, props = {}) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);

/**
 * Create a protected route
 */
const protectedRoute = (Component, requiredRoles = [], props = {}) => (
  <ProtectedRoute>
    <RoleBasedRoute requiredRoles={requiredRoles}>
      {lazyRoute(Component, props)}
    </RoleBasedRoute>
  </ProtectedRoute>
);

// ============================================================================
// Route Definitions
// ============================================================================

/**
 * Public routes (accessible without authentication)
 */
export const publicRoutes = [
  {
    path: '/login',
    element: lazyRoute(Login),
    meta: {
      title: 'Login',
      description: 'Login to your account',
      layout: 'auth',
    },
  },
  {
    path: '/register',
    element: lazyRoute(Register),
    meta: {
      title: 'Register',
      description: 'Create a new account',
      layout: 'auth',
    },
  },
  {
    path: '/forgot-password',
    element: lazyRoute(ForgotPassword),
    meta: {
      title: 'Forgot Password',
      description: 'Reset your password',
      layout: 'auth',
    },
  },
  {
    path: '/reset-password',
    element: lazyRoute(ResetPassword),
    meta: {
      title: 'Reset Password',
      description: 'Set a new password',
      layout: 'auth',
    },
  },
  {
    path: '/verify-email',
    element: lazyRoute(VerifyEmail),
    meta: {
      title: 'Verify Email',
      description: 'Verify your email address',
      layout: 'auth',
    },
  },
  {
    path: '/logout',
    element: lazyRoute(Logout),
    meta: {
      title: 'Logout',
      description: 'Sign out of your account',
      layout: 'auth',
    },
  },
  {
    path: '/maintenance',
    element: lazyRoute(Maintenance),
    meta: {
      title: 'Maintenance',
      description: 'System under maintenance',
      layout: 'minimal',
    },
  },
  {
    path: '/unauthorized',
    element: lazyRoute(Unauthorized),
    meta: {
      title: 'Unauthorized',
      description: 'Access denied',
      layout: 'minimal',
    },
  },
];

// ============================================================================
// Protected Routes (require authentication)
// ============================================================================

export const protectedRoutes = [
  // ==========================================================================
  // Dashboard
  // ==========================================================================
  {
    path: '/dashboard',
    element: protectedRoute(Dashboard),
    meta: {
      title: 'Dashboard',
      description: 'Overview of your parking operations',
      icon: 'dashboard',
      nav: true,
      order: 1,
    },
  },
  
  // ==========================================================================
  // Vehicles
  // ==========================================================================
  {
    path: '/vehicles',
    element: protectedRoute(Vehicles),
    meta: {
      title: 'Vehicles',
      description: 'Manage your vehicles',
      icon: 'directions_car',
      nav: true,
      order: 2,
    },
  },
  {
    path: '/vehicles/create',
    element: protectedRoute(VehicleCreate),
    meta: {
      title: 'Add Vehicle',
      description: 'Register a new vehicle',
      parent: '/vehicles',
    },
  },
  {
    path: '/vehicles/:id',
    element: protectedRoute(VehicleDetail),
    meta: {
      title: 'Vehicle Details',
      description: 'View vehicle information',
      parent: '/vehicles',
    },
  },
  {
    path: '/vehicles/:id/edit',
    element: protectedRoute(VehicleEdit),
    meta: {
      title: 'Edit Vehicle',
      description: 'Update vehicle information',
      parent: '/vehicles',
    },
  },
  
  // ==========================================================================
  // Parking
  // ==========================================================================
  {
    path: '/parking',
    element: protectedRoute(Parking),
    meta: {
      title: 'Parking',
      description: 'Manage parking operations',
      icon: 'local_parking',
      nav: true,
      order: 3,
    },
  },
  {
    path: '/parking/sessions',
    element: protectedRoute(ParkingSessions),
    meta: {
      title: 'Parking Sessions',
      description: 'View and manage parking sessions',
      parent: '/parking',
      nav: true,
    },
  },
  {
    path: '/parking/spots',
    element: protectedRoute(ParkingSpots),
    meta: {
      title: 'Parking Spots',
      description: 'Manage parking spots',
      parent: '/parking',
      nav: true,
    },
  },
  {
    path: '/parking/reservations',
    element: protectedRoute(ParkingReservations),
    meta: {
      title: 'Reservations',
      description: 'Manage parking reservations',
      parent: '/parking',
      nav: true,
    },
  },
  {
    path: '/parking/spots/:id',
    element: protectedRoute(ParkingSpotDetail),
    meta: {
      title: 'Parking Spot Details',
      description: 'View parking spot information',
      parent: '/parking/spots',
    },
  },
  {
    path: '/parking/sessions/:id',
    element: protectedRoute(ParkingSessionDetail),
    meta: {
      title: 'Parking Session Details',
      description: 'View parking session information',
      parent: '/parking/sessions',
    },
  },
  
  // ==========================================================================
  // Charging
  // ==========================================================================
  {
    path: '/charging',
    element: protectedRoute(Charging),
    meta: {
      title: 'EV Charging',
      description: 'Manage EV charging operations',
      icon: 'ev_station',
      nav: true,
      order: 4,
    },
  },
  {
    path: '/charging/sessions',
    element: protectedRoute(ChargingSessions),
    meta: {
      title: 'Charging Sessions',
      description: 'View and manage charging sessions',
      parent: '/charging',
      nav: true,
    },
  },
  {
    path: '/charging/stations',
    element: protectedRoute(ChargingStations),
    meta: {
      title: 'Charging Stations',
      description: 'Manage charging stations',
      parent: '/charging',
      nav: true,
    },
  },
  {
    path: '/charging/stations/:id',
    element: protectedRoute(ChargingStationDetail),
    meta: {
      title: 'Charging Station Details',
      description: 'View charging station information',
      parent: '/charging/stations',
    },
  },
  {
    path: '/charging/sessions/:id',
    element: protectedRoute(ChargingSessionDetail),
    meta: {
      title: 'Charging Session Details',
      description: 'View charging session information',
      parent: '/charging/sessions',
    },
  },
  
  // ==========================================================================
  // Payments
  // ==========================================================================
  {
    path: '/payments',
    element: protectedRoute(Payments),
    meta: {
      title: 'Payments',
      description: 'Manage payments',
      icon: 'payment',
      nav: true,
      order: 5,
    },
  },
  {
    path: '/payments/history',
    element: protectedRoute(PaymentHistory),
    meta: {
      title: 'Payment History',
      description: 'View payment history',
      parent: '/payments',
      nav: true,
    },
  },
  {
    path: '/payments/methods',
    element: protectedRoute(PaymentMethods),
    meta: {
      title: 'Payment Methods',
      description: 'Manage payment methods',
      parent: '/payments',
      nav: true,
    },
  },
  {
    path: '/payments/:id',
    element: protectedRoute(PaymentDetail),
    meta: {
      title: 'Payment Details',
      description: 'View payment information',
      parent: '/payments/history',
    },
  },
  
  // ==========================================================================
  // Notifications
  // ==========================================================================
  {
    path: '/notifications',
    element: protectedRoute(Notifications),
    meta: {
      title: 'Notifications',
      description: 'View and manage notifications',
      icon: 'notifications',
      nav: true,
      order: 6,
    },
  },
  {
    path: '/notifications/preferences',
    element: protectedRoute(NotificationPreferences),
    meta: {
      title: 'Notification Preferences',
      description: 'Manage notification settings',
      parent: '/notifications',
    },
  },
  
  // ==========================================================================
  // Profile & Settings
  // ==========================================================================
  {
    path: '/profile',
    element: protectedRoute(Profile),
    meta: {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: 'person',
      nav: true,
      order: 7,
    },
  },
  {
    path: '/settings',
    element: protectedRoute(Settings),
    meta: {
      title: 'Settings',
      description: 'Application settings',
      icon: 'settings',
      nav: true,
      order: 8,
    },
  },
  
  // ==========================================================================
  // Admin Routes (require admin role)
  // ==========================================================================
  {
    path: '/admin',
    element: protectedRoute(Admin, ['admin', 'super_admin']),
    meta: {
      title: 'Admin Dashboard',
      description: 'Administration panel',
      icon: 'admin_panel_settings',
      nav: true,
      order: 9,
      adminOnly: true,
    },
  },
  {
    path: '/admin/users',
    element: protectedRoute(AdminUsers, ['admin', 'super_admin']),
    meta: {
      title: 'User Management',
      description: 'Manage system users',
      parent: '/admin',
      nav: true,
      adminOnly: true,
    },
  },
  {
    path: '/admin/audit-logs',
    element: protectedRoute(AdminAuditLogs, ['admin', 'super_admin']),
    meta: {
      title: 'Audit Logs',
      description: 'View system audit logs',
      parent: '/admin',
      nav: true,
      adminOnly: true,
    },
  },
  {
    path: '/admin/system',
    element: protectedRoute(AdminSystem, ['admin', 'super_admin']),
    meta: {
      title: 'System Settings',
      description: 'System configuration',
      parent: '/admin',
      nav: true,
      adminOnly: true,
    },
  },
  {
    path: '/admin/settings',
    element: protectedRoute(AdminSettings, ['admin', 'super_admin']),
    meta: {
      title: 'Application Settings',
      description: 'Configure application settings',
      parent: '/admin',
      nav: true,
      adminOnly: true,
    },
  },
  
  // ==========================================================================
  // Reports Routes
  // ==========================================================================
  {
    path: '/reports',
    element: protectedRoute(Reports),
    meta: {
      title: 'Reports',
      description: 'Generate and view reports',
      icon: 'assessment',
      nav: true,
      order: 10,
    },
  },
  {
    path: '/reports/parking',
    element: protectedRoute(ParkingReports),
    meta: {
      title: 'Parking Reports',
      description: 'Parking analytics and reports',
      parent: '/reports',
      nav: true,
    },
  },
  {
    path: '/reports/revenue',
    element: protectedRoute(RevenueReports),
    meta: {
      title: 'Revenue Reports',
      description: 'Revenue analytics and reports',
      parent: '/reports',
      nav: true,
    },
  },
  {
    path: '/reports/charging',
    element: protectedRoute(ChargingReports),
    meta: {
      title: 'Charging Reports',
      description: 'Charging analytics and reports',
      parent: '/reports',
      nav: true,
    },
  },
  {
    path: '/reports/:id',
    element: protectedRoute(ReportDetail),
    meta: {
      title: 'Report Details',
      description: 'View report details',
      parent: '/reports',
    },
  },
];

// ============================================================================
// Fallback Routes
// ============================================================================

export const fallbackRoutes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    meta: {
      title: 'Redirect',
      description: 'Redirect to dashboard',
    },
  },
  {
    path: '*',
    element: lazyRoute(NotFound),
    meta: {
      title: 'Page Not Found',
      description: 'The requested page could not be found',
      layout: 'minimal',
    },
  },
];

// ============================================================================
// Route Utilities
// ============================================================================

/**
 * Get all routes (public + protected + fallback)
 */
export const getAllRoutes = () => {
  return [...publicRoutes, ...protectedRoutes, ...fallbackRoutes];
};

/**
 * Get navigation routes (routes with nav: true)
 */
export const getNavigationRoutes = () => {
  return protectedRoutes.filter(route => route.meta?.nav === true);
};

/**
 * Get admin routes (routes with adminOnly: true)
 */
export const getAdminRoutes = () => {
  return protectedRoutes.filter(route => route.meta?.adminOnly === true);
};

/**
 * Find route by path
 */
export const findRouteByPath = (path) => {
  const allRoutes = getAllRoutes();
  return allRoutes.find(route => route.path === path);
};

/**
 * Get breadcrumb for a path
 */
export const getBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  let currentPath = '';
  
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const route = findRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push({
        path: currentPath,
        title: route.meta?.title || segment,
      });
    } else {
      breadcrumbs.push({
        path: currentPath,
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
      });
    }
  }
  
  return breadcrumbs;
};

/**
 * Check if route is active
 */
export const isRouteActive = (pathname, routePath) => {
  if (routePath === '/') {
    return pathname === routePath;
  }
  return pathname.startsWith(routePath);
};

// ============================================================================
// Export All Routes
// ============================================================================

export default {
  public: publicRoutes,
  protected: protectedRoutes,
  fallback: fallbackRoutes,
  all: getAllRoutes,
  navigation: getNavigationRoutes,
  admin: getAdminRoutes,
  find: findRouteByPath,
  getBreadcrumbs,
  isActive: isRouteActive,
};
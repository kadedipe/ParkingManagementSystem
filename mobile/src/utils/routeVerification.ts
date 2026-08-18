// ============================================================================
// Route Verification Utility
// ============================================================================

// parking-management-system/mobile/src/utils/routeVerification.ts

import { ROUTES, RouteHelpers } from '../constants/routes';

/**
 * Verify and validate routes
 */
export const verifyRoute = (routeName: string): boolean => {
  return RouteHelpers.routeExists(routeName);
};

/**
 * Get route parameters type
 */
export const getRouteParams = (routeName: string): any => {
  // This would be used in route validation
  const allRoutes = Object.values(ROUTES).flatMap((group) =>
    Object.values(group)
  );
  
  if (!allRoutes.includes(routeName)) {
    throw new Error(`Route "${routeName}" not found`);
  }
  
  return {};
};

/**
 * Check if route requires authentication
 */
export const requiresAuth = (routeName: string): boolean => {
  return RouteHelpers.requiresAuth(routeName);
};

/**
 * Get route group for breadcrumbs
 */
export const getRouteBreadcrumb = (routeName: string): string => {
  const group = RouteHelpers.getRouteGroup(routeName);
  return group ? `${group} / ${routeName}` : routeName;
};

export default {
  verifyRoute,
  getRouteParams,
  requiresAuth,
  getRouteBreadcrumb,
};
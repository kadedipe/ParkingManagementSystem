// ============================================================================
// Role-Based Route Component
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Role-based route component that restricts access based on user roles
 */
export const RoleBasedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  // If no roles required, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  const hasRequiredRole = user?.role && requiredRoles.includes(user.role);

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;
// ============================================================================
// AsyncBoundary Component
// ============================================================================

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';

export const AsyncBoundary = ({
  children,
  loading = false,
  loadingFallback = <LoadingSpinner />,
  errorFallback,
  ...errorBoundaryProps
}) => {
  if (loading) {
    return loadingFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback} {...errorBoundaryProps}>
      {children}
    </ErrorBoundary>
  );
};

export default AsyncBoundary;
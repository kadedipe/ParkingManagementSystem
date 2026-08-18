// ============================================================================
// ErrorBoundary Component
// ============================================================================

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing the application.
 * 
 * This component includes:
 * - Error catching and handling
 * - Fallback UI with different variants
 * - Error logging and reporting
 * - Retry functionality
 * - Development mode error details
 * - Different error display types (page, inline, toast)
 */

import React, { Component } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Alert,
  AlertTitle,
  Divider,
  Collapse,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ReportProblem as ReportProblemIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ============================================================================
// Styled Components
// ============================================================================

const ErrorContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '50vh',
  padding: theme.spacing(4),
  textAlign: 'center',
}));

const ErrorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  width: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const ErrorIconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const ErrorDetails = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.common.white, 0.05)
    : alpha(theme.palette.common.black, 0.03),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  maxHeight: 200,
  textAlign: 'left',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

// ============================================================================
// ErrorBoundary Component
// ============================================================================

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.logError(error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo: errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state if the location changes (for route-based errors)
    if (this.props.resetOnLocationChange && 
        prevProps.location !== this.props.location &&
        this.state.hasError) {
      this.handleReset();
    }
  }

  // ==========================================================================
  // Error Logging
  // ==========================================================================

  logError(error, errorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo?.componentStack);
      console.groupEnd();
    }

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry or other error tracking service
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          extra: {
            componentStack: errorInfo?.componentStack,
            ...this.props.extra,
          },
        });
      }

      // Send to custom error reporting endpoint
      if (this.props.reportError) {
        this.props.reportError(error, errorInfo);
      }
    }
  }

  // ==========================================================================
  // Handlers
  // ==========================================================================

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isRetrying: false,
    });
  };

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Call retry callback if provided
    if (this.props.onRetry) {
      await this.props.onRetry();
    }
    
    this.handleReset();
  };

  handleToggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  // ==========================================================================
  // Render Fallback UI
  // ==========================================================================

  renderFallbackUI() {
    const { error, errorInfo, showDetails, isRetrying } = this.state;
    const { 
      variant = 'page',
      title = 'Something went wrong',
      message = 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      showReset = true,
      showHome = true,
      showRetry = true,
      showDetails: showDetailsProp = process.env.NODE_ENV === 'development',
      resetText = 'Reset Application',
      retryText = 'Try Again',
      homeText = 'Go to Home',
      customFallback,
    } = this.props;

    // Use custom fallback if provided
    if (customFallback) {
      return customFallback(error, errorInfo, this.handleReset);
    }

    // ========================================================================
    // Inline Variant (for small components)
    // ========================================================================

    if (variant === 'inline') {
      return (
        <StyledAlert
          severity="error"
          icon={<ErrorIcon />}
          sx={{ width: '100%' }}
          action={
            showRetry && (
              <Button
                color="inherit"
                size="small"
                onClick={this.handleRetry}
                disabled={isRetrying}
                startIcon={<RefreshIcon />}
              >
                {isRetrying ? 'Retrying...' : retryText}
              </Button>
            )
          }
        >
          <AlertTitle>{title}</AlertTitle>
          {message}
        </StyledAlert>
      );
    }

    // ========================================================================
    // Toast Variant (for notifications)
    // ========================================================================

    if (variant === 'toast') {
      return (
        <StyledAlert
          severity="error"
          icon={<ErrorIcon />}
          sx={{ width: '100%' }}
          onClose={this.handleReset}
        >
          <AlertTitle>{title}</AlertTitle>
          {message}
        </StyledAlert>
      );
    }

    // ========================================================================
    // Page Variant (default)
    // ========================================================================

    return (
      <ErrorContainer>
        <ErrorPaper elevation={3}>
          <ErrorIconWrapper>
            <ErrorIcon sx={{ fontSize: 48 }} />
          </ErrorIconWrapper>

          <Typography variant="h4" gutterBottom fontWeight="600">
            {title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {message}
          </Typography>

          {/* Error details in development */}
          {(showDetailsProp || showDetails) && error && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Button
                size="small"
                startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={this.handleToggleDetails}
                sx={{ mb: 1 }}
              >
                {showDetails ? 'Hide Error Details' : 'Show Error Details'}
              </Button>
              <Collapse in={showDetails}>
                <ErrorDetails>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Error Details:
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {error.name || 'Error'}
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                    <strong>Message:</strong> {error.message}
                  </Typography>
                  {error.stack && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" component="div">
                        <strong>Stack Trace:</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          mt: 1,
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {error.stack}
                      </Typography>
                    </>
                  )}
                  {errorInfo?.componentStack && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" component="div">
                        <strong>Component Stack:</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          mt: 1,
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {errorInfo.componentStack}
                      </Typography>
                    </>
                  )}
                </ErrorDetails>
              </Collapse>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 3, width: '100%' }}
          >
            {showRetry && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                disabled={isRetrying}
                fullWidth
              >
                {isRetrying ? 'Retrying...' : retryText}
              </Button>
            )}
            {showHome && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                fullWidth
              >
                {homeText}
              </Button>
            )}
            {showReset && (
              <Button
                variant="text"
                color="secondary"
                startIcon={<ReportProblemIcon />}
                onClick={this.handleReset}
                fullWidth
              >
                {resetText}
              </Button>
            )}
          </Stack>

          {/* Support Information */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: 'block' }}
          >
            If this problem persists, please contact support.
            <br />
            Error ID: {new Date().getTime().toString(36).toUpperCase()}
          </Typography>
        </ErrorPaper>
      </ErrorContainer>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  render() {
    const { children, fallback } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(this.state.error, this.state.errorInfo, this.handleReset);
      }
      return this.renderFallbackUI();
    }

    return children;
  }
}

// ============================================================================
// Functional Error Boundary Wrapper
// ============================================================================

/**
 * Higher-order component that wraps a component with ErrorBoundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// ============================================================================
// ErrorBoundary Hook
// ============================================================================

/**
 * Hook for using ErrorBoundary in functional components
 * This is a simplified version that works with React hooks
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  const [errorInfo, setErrorInfo] = React.useState(null);

  const resetError = () => {
    setError(null);
    setErrorInfo(null);
  };

  const handleError = (err, info) => {
    setError(err);
    setErrorInfo(info);
  };

  return {
    error,
    errorInfo,
    resetError,
    handleError,
    ErrorBoundary: ({ children }) => (
      <ErrorBoundary
        onError={handleError}
        onReset={resetError}
      >
        {children}
      </ErrorBoundary>
    ),
  };
};

// ============================================================================
// Export
// ============================================================================

export default ErrorBoundary;
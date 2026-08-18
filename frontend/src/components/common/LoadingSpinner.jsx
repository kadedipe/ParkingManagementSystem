// ============================================================================
// LoadingSpinner Component
// ============================================================================

/**
 * LoadingSpinner component that provides various loading indicators for the application.
 * 
 * This component includes:
 * - Different spinner sizes and variants
 * - Overlay loading states
 * - Skeleton loading placeholders
 * - Progress indicators
 * - Full page loading
 * - Customizable animations
 */

import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  useTheme,
  alpha,
  Fade,
  Stack,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// ============================================================================
// Styled Components
// ============================================================================

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
`;

const StyledCircularProgress = styled(CircularProgress)(({ theme, variant }) => ({
  color: variant === 'primary' 
    ? theme.palette.primary.main 
    : variant === 'secondary' 
    ? theme.palette.secondary.main 
    : variant === 'success' 
    ? theme.palette.success.main 
    : variant === 'error' 
    ? theme.palette.error.main 
    : theme.palette.primary.main,
}));

const SpinnerContainer = styled(Box)(({ theme, fullScreen }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  ...(fullScreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modal + 1,
    backgroundColor: alpha(theme.palette.background.default, 0.8),
    backdropFilter: 'blur(4px)',
  }),
}));

const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  backdropFilter: 'blur(2px)',
  zIndex: theme.zIndex.modal,
  borderRadius: 'inherit',
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
  animation: `${pulse} 1.5s ease-in-out infinite`,
}));

// ============================================================================
// Main LoadingSpinner Component
// ============================================================================

export const LoadingSpinner = ({
  size = 'medium',
  variant = 'primary',
  label = 'Loading...',
  fullScreen = false,
  overlay = false,
  showLabel = true,
  thickness = 3.6,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();

  // Map size to pixel values
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
    xl: 72,
    xxl: 96,
  };

  const sizeValue = sizeMap[size] || sizeMap.medium;

  // Map variant to color
  const variantColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    inherit: 'inherit',
  };

  const color = variantColors[variant] || variantColors.primary;

  const spinner = (
    <Box
      className={className}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...props}
    >
      <StyledCircularProgress
        size={sizeValue}
        thickness={thickness}
        variant="indeterminate"
        variantProp={variant}
        sx={{
          color: color,
        }}
      />
      {showLabel && label && (
        <LoadingText variant="caption" sx={{ mt: 2, position: 'absolute', bottom: -28 }}>
          {label}
        </LoadingText>
      )}
    </Box>
  );

  // Return with overlay
  if (overlay) {
    return <OverlayContainer>{spinner}</OverlayContainer>;
  }

  // Return with full screen
  if (fullScreen) {
    return (
      <SpinnerContainer fullScreen>
        <Fade in timeout={300}>
          <Box>
            <StyledCircularProgress
              size={sizeValue}
              thickness={thickness}
              variant="indeterminate"
              variantProp={variant}
              sx={{
                color: color,
              }}
            />
            {showLabel && label && (
              <LoadingText variant="body1" sx={{ mt: 3 }}>
                {label}
              </LoadingText>
            )}
          </Box>
        </Fade>
      </SpinnerContainer>
    );
  }

  return spinner;
};

// ============================================================================
// Dots Loading Component
// ============================================================================

const dotAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const Dot = styled(Box)(({ theme, delay }) => ({
  width: 12,
  height: 12,
  margin: '0 4px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  animation: `${dotAnimation} 1.4s ease-in-out infinite`,
  animationDelay: delay,
}));

export const DotsLoading = ({ color = 'primary', size = 12, ...props }) => {
  const theme = useTheme();
  const dotColor = theme.palette[color]?.main || color;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...props.sx }}>
      <Dot
        delay="0s"
        sx={{
          width: size,
          height: size,
          backgroundColor: dotColor,
        }}
      />
      <Dot
        delay="0.2s"
        sx={{
          width: size,
          height: size,
          backgroundColor: dotColor,
        }}
      />
      <Dot
        delay="0.4s"
        sx={{
          width: size,
          height: size,
          backgroundColor: dotColor,
        }}
      />
    </Box>
  );
};

// ============================================================================
// Skeleton Loading Components
// ============================================================================

export const SkeletonText = ({ lines = 3, width = '100%', ...props }) => (
  <Stack spacing={1} sx={{ width, ...props.sx }}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '60%' : '100%'}
        height={24}
        animation="wave"
        {...props}
      />
    ))}
  </Stack>
);

export const SkeletonCard = ({ ...props }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
      ...props.sx,
    }}
  >
    <Skeleton variant="rectangular" height={140} animation="wave" sx={{ borderRadius: 1 }} />
    <Box sx={{ pt: 2 }}>
      <Skeleton variant="text" width="80%" height={24} animation="wave" />
      <Skeleton variant="text" width="60%" height={20} animation="wave" />
      <Skeleton variant="text" width="40%" height={20} animation="wave" />
    </Box>
  </Box>
);

export const SkeletonAvatar = ({ size = 40, ...props }) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    animation="wave"
    {...props}
  />
);

export const SkeletonTable = ({ rows = 5, columns = 4, ...props }) => (
  <Box sx={{ width: '100%', ...props.sx }}>
    {/* Header */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={`header-${index}`}
          variant="text"
          width={`${100 / columns}%`}
          height={32}
          animation="wave"
        />
      ))}
    </Box>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={`row-${rowIndex}`} sx={{ display: 'flex', gap: 2, mb: 1 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`cell-${rowIndex}-${colIndex}`}
            variant="text"
            width={`${100 / columns}%`}
            height={24}
            animation="wave"
          />
        ))}
      </Box>
    ))}
  </Box>
);

// ============================================================================
// Progress Bar Loading
// ============================================================================

export const ProgressLoading = ({
  value = 0,
  variant = 'indeterminate',
  label = 'Loading...',
  showLabel = true,
  color = 'primary',
  ...props
}) => {
  const theme = useTheme();
  const progressColor = theme.palette[color]?.main || color;

  return (
    <Box sx={{ width: '100%', ...props.sx }}>
      {showLabel && label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {variant === 'determinate' && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(value)}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant={variant}
        value={variant === 'determinate' ? value : undefined}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(progressColor, 0.2),
          '& .MuiLinearProgress-bar': {
            backgroundColor: progressColor,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

// ============================================================================
// Content Loader Component
// ============================================================================

export const ContentLoader = ({ 
  loading, 
  children, 
  variant = 'spinner',
  fallback = null,
  ...props 
}) => {
  if (!loading) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  switch (variant) {
    case 'spinner':
      return <LoadingSpinner {...props} />;
    case 'dots':
      return <DotsLoading {...props} />;
    case 'progress':
      return <ProgressLoading {...props} />;
    case 'skeleton':
      return <SkeletonCard {...props} />;
    default:
      return <LoadingSpinner {...props} />;
  }
};

// ============================================================================
// Button Loading Component
// ============================================================================

export const ButtonLoading = ({
  loading,
  children,
  size = 'medium',
  color = 'primary',
  ...props
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', ...props.sx }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress
            size={size === 'small' ? 20 : size === 'large' ? 32 : 24}
            color={color}
          />
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Export All
// ============================================================================

export default {
  LoadingSpinner,
  DotsLoading,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonTable,
  ProgressLoading,
  ContentLoader,
  ButtonLoading,
};
// ============================================================================
// ParkingCard Component
// ============================================================================

/**
 * ParkingCard component for displaying individual parking spot information.
 * 
 * This component provides:
 * - Detailed parking spot information
 * - Status indicators
 * - Quick actions (reserve, navigate, details)
 * - Interactive card with hover effects
 * - Responsive design
 * - Favorite toggle
 * - Price and availability display
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  LinearProgress,
  Avatar,
  Badge,
  useTheme,
  alpha,
  Collapse,
  Grid,
  Paper,
} from '@mui/material';
import {
  LocalParking as ParkingIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  PinDrop as PinDropIcon,
  EventAvailable as AvailableIcon,
  EventBusy as OccupiedIcon,
  EventNote as ReservedIcon,
  Build as MaintenanceIcon,
  Visibility as ViewIcon,
  BookmarkAdd as ReserveIcon,
  Directions as DirectionsIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ElectricCar as EvIcon,
  Accessible as AccessibleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDistance, formatDate, formatTime } from '../../utils/formatters';

// ============================================================================
// Styled Components
// ============================================================================

const StyledCard = styled(Card)(({ theme, status }) => {
  const statusColors = {
    available: {
      borderColor: theme.palette.success.main,
      glow: alpha(theme.palette.success.main, 0.2),
    },
    occupied: {
      borderColor: theme.palette.error.main,
      glow: alpha(theme.palette.error.main, 0.2),
    },
    reserved: {
      borderColor: theme.palette.warning.main,
      glow: alpha(theme.palette.warning.main, 0.2),
    },
    maintenance: {
      borderColor: theme.palette.grey[500],
      glow: alpha(theme.palette.grey[500], 0.2),
    },
    out_of_service: {
      borderColor: theme.palette.grey[800],
      glow: alpha(theme.palette.grey[800], 0.2),
    },
  };

  const colors = statusColors[status] || statusColors.available;

  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius * 2,
    border: `2px solid ${colors.borderColor}`,
    transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
      duration: theme.transitions.duration.standard,
    }),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 24px ${colors.glow}`,
      borderColor: theme.palette.primary.main,
    },
  };
});

const StatusBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(0.5, 1.5),
    fontWeight: 600,
    textTransform: 'capitalize',
  },
}));

const StatusIndicator = styled(Box)(({ theme, status }) => {
  const statusColors = {
    available: theme.palette.success.main,
    occupied: theme.palette.error.main,
    reserved: theme.palette.warning.main,
    maintenance: theme.palette.grey[500],
    out_of_service: theme.palette.grey[800],
  };

  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: statusColors[status] || statusColors.available,
    display: 'inline-block',
    animation: status === 'available' ? 'pulse 2s infinite' : 'none',
    '@keyframes pulse': {
      '0%': {
        boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)',
      },
      '70%': {
        boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
      },
      '100%': {
        boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
      },
    },
  };
});

const FeatureChip = styled(Chip)(({ theme, feature }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: feature === 'ev' 
    ? alpha(theme.palette.info.main, 0.1)
    : feature === 'handicap'
    ? alpha(theme.palette.primary.main, 0.1)
    : feature === 'premium'
    ? alpha(theme.palette.warning.main, 0.1)
    : alpha(theme.palette.grey[500], 0.1),
  color: feature === 'ev'
    ? theme.palette.info.main
    : feature === 'handicap'
    ? theme.palette.primary.main
    : feature === 'premium'
    ? theme.palette.warning.main
    : theme.palette.text.secondary,
  fontWeight: 500,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(0.75, 2),
}));

// ============================================================================
// Main Component
// ============================================================================

export const ParkingCard = ({
  spot,
  onReserve,
  onNavigate,
  onViewDetails,
  onFavorite,
  onShare,
  isFavorite = false,
  showActions = true,
  showFeatures = true,
  showPrice = true,
  showLocation = true,
  variant = 'default', // 'default', 'compact', 'detailed'
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleReserve = useCallback((e) => {
    e.stopPropagation();
    if (onReserve) {
      onReserve(spot);
    }
  }, [spot, onReserve]);

  const handleNavigate = useCallback((e) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate(spot);
    }
  }, [spot, onNavigate]);

  const handleViewDetails = useCallback((e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(spot);
    }
  }, [spot, onViewDetails]);

  const handleFavoriteToggle = useCallback((e) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(spot.id);
    }
  }, [spot.id, onFavorite]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    if (onShare) {
      onShare(spot);
    }
  }, [spot, onShare]);

  const handleExpandToggle = useCallback((e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatusChip = () => {
    const statusConfigs = {
      available: {
        icon: <AvailableIcon />,
        color: 'success',
        label: 'Available',
      },
      occupied: {
        icon: <OccupiedIcon />,
        color: 'error',
        label: 'Occupied',
      },
      reserved: {
        icon: <ReservedIcon />,
        color: 'warning',
        label: 'Reserved',
      },
      maintenance: {
        icon: <MaintenanceIcon />,
        color: 'default',
        label: 'Maintenance',
      },
      out_of_service: {
        icon: <ErrorIcon />,
        color: 'default',
        label: 'Out of Service',
      },
    };

    const config = statusConfigs[spot.status] || statusConfigs.available;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{
          borderRadius: theme.shape.borderRadius * 2,
          fontWeight: 600,
          '& .MuiChip-icon': {
            fontSize: 16,
          },
        }}
      />
    );
  };

  const renderFeatureChips = () => {
    const features = [];
    
    if (spot.is_ev_charging) {
      features.push({ key: 'ev', label: 'EV Charging', icon: <EvIcon /> });
    }
    if (spot.is_handicap_accessible) {
      features.push({ key: 'handicap', label: '♿ Accessible', icon: <AccessibleIcon /> });
    }
    if (spot.is_covered) {
      features.push({ key: 'covered', label: 'Covered', icon: null });
    }
    if (spot.is_premium) {
      features.push({ key: 'premium', label: 'Premium', icon: <StarIcon /> });
    }
    if (spot.has_cctv) {
      features.push({ key: 'security', label: 'CCTV', icon: null });
    }

    return features.map((feature) => (
      <FeatureChip
        key={feature.key}
        feature={feature.key}
        label={feature.label}
        icon={feature.icon}
        size="small"
      />
    ));
  };

  const renderPrice = () => {
    if (!showPrice) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          {formatCurrency(spot.price || 0)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          / hour
        </Typography>
      </Box>
    );
  };

  // ==========================================================================
  // Compact Variant
  // ==========================================================================

  if (variant === 'compact') {
    return (
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: theme.shape.borderRadius * 2,
          cursor: 'pointer',
          transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.standard,
          }),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          ...sx,
        }}
        onClick={handleViewDetails}
        {...props}
      >
        <StatusIndicator status={spot.status} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {spot.spot_number}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {spot.spot_type}
          </Typography>
        </Box>
        {renderPrice()}
        <IconButton size="small" onClick={handleFavoriteToggle}>
          {isFavorite ? (
            <FavoriteIcon fontSize="small" color="error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Paper>
    );
  }

  // ==========================================================================
  // Default/Detailed Variant
  // ==========================================================================

  return (
    <StyledCard
      status={spot.status}
      className={className}
      sx={sx}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Card Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StatusIndicator status={spot.status} />
          <Typography variant="h6" fontWeight={600}>
            {spot.spot_number}
          </Typography>
          {renderStatusChip()}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton size="small" onClick={handleFavoriteToggle}>
              {isFavorite ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton size="small" onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Grid container spacing={1.5}>
          {/* Spot Type */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ParkingIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {spot.spot_type}
              </Typography>
            </Box>
          </Grid>

          {/* Location */}
          {showLocation && spot.location && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {spot.location.address || `Floor ${spot.floor}, Section ${spot.section || 'A'}`}
                </Typography>
                {spot.distance && (
                  <Chip
                    label={formatDistance(spot.distance)}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Box>
            </Grid>
          )}

          {/* Price */}
          {showPrice && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon fontSize="small" color="action" />
                {renderPrice()}
              </Box>
            </Grid>
          )}

          {/* Features */}
          {showFeatures && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {renderFeatureChips()}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Expanded Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Dimensions
              </Typography>
              <Typography variant="body2">
                {spot.dimensions?.width || 2.5}m x {spot.dimensions?.length || 5}m
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Access Level
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {spot.access_level || 'Public'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Last Occupied
              </Typography>
              <Typography variant="body2">
                {spot.last_occupied ? formatDate(spot.last_occupied) : 'Never'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Occupancy Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={spot.occupancy_rate || 0}
                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="body2">
                  {spot.occupancy_rate || 0}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Collapse>

        {/* Expand Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton size="small" onClick={handleExpandToggle}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </CardContent>

      {/* Card Actions */}
      {showActions && spot.status === 'available' && (
        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <ActionButton
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<ReserveIcon />}
            onClick={handleReserve}
          >
            Reserve Now
          </ActionButton>
          <ActionButton
            variant="outlined"
            startIcon={<DirectionsIcon />}
            onClick={handleNavigate}
            sx={{ minWidth: 'auto', px: 1.5 }}
          >
            Navigate
          </ActionButton>
          <Tooltip title="View Details">
            <IconButton onClick={handleViewDetails}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}

      {showActions && spot.status !== 'available' && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <ActionButton
            variant="outlined"
            color="inherit"
            fullWidth
            startIcon={<ViewIcon />}
            onClick={handleViewDetails}
          >
            View Details
          </ActionButton>
        </CardActions>
      )}
    </StyledCard>
  );
};

// ============================================================================
// ParkingCardSkeleton Component
// ============================================================================

export const ParkingCardSkeleton = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.shape.borderRadius * 2,
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rectangular" width={100} height={24} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="40%" height={24} />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Skeleton variant="rounded" width={80} height={28} />
        <Skeleton variant="rounded" width={80} height={28} />
      </Box>
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </Card>
  );
};

// ============================================================================
// Export
// ============================================================================

export default ParkingCard;
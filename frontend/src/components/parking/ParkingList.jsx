// ============================================================================
// ParkingList Component
// ============================================================================

/**
 * ParkingList component for displaying parking spots in a list or grid view.
 * 
 * This component provides:
 * - List and grid view modes
 * - Pagination and sorting
 * - Parking spot status indicators
 * - Quick actions (reserve, navigate, details)
 * - Responsive design
 * - Empty and loading states
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Stack,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Divider,
  Badge,
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
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDistance } from '../../utils/formatters';
import { useParking } from '../../hooks/useParking';

// ============================================================================
// Styled Components
// ============================================================================

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    available: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
    },
    occupied: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
    },
    reserved: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
    },
    maintenance: {
      bg: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[600],
    },
    out_of_service: {
      bg: alpha(theme.palette.grey[800], 0.1),
      color: theme.palette.grey[800],
    },
  };

  const colors = statusColors[status] || statusColors.available;

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    borderRadius: theme.shape.borderRadius * 2,
    '& .MuiChip-label': {
      textTransform: 'capitalize',
    },
  };
});

const SpotCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const SpotImage = styled(Box)(({ theme }) => ({
  height: 160,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
  overflow: 'hidden',
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

// ============================================================================
// Constants
// ============================================================================

const STATUS_ICONS = {
  available: <AvailableIcon />,
  occupied: <OccupiedIcon />,
  reserved: <ReservedIcon />,
  maintenance: <MaintenanceIcon />,
  out_of_service: <ErrorIcon />,
};

const STATUS_LABELS = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  out_of_service: 'Out of Service',
};

const STATUS_COLORS = {
  available: 'success',
  occupied: 'error',
  reserved: 'warning',
  maintenance: 'default',
  out_of_service: 'default',
};

// ============================================================================
// Main Component
// ============================================================================

export const ParkingList = ({
  spots = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onSpotClick,
  onReserve,
  onNavigate,
  onFavorite,
  viewMode = 'list',
  onViewModeChange,
  sortBy = 'spot_number',
  onSortChange,
  showActions = true,
  showPagination = true,
  showFilters = true,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [hoveredSpot, setHoveredSpot] = useState(null);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleFavoriteToggle = useCallback((spotId) => {
    setFavorites(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
    if (onFavorite) {
      onFavorite(spotId);
    }
  }, [onFavorite]);

  const handleSpotClick = useCallback((spot) => {
    if (onSpotClick) {
      onSpotClick(spot);
    }
  }, [onSpotClick]);

  const handleReserve = useCallback((spot) => {
    if (onReserve) {
      onReserve(spot);
    }
  }, [onReserve]);

  const handleNavigate = useCallback((spot) => {
    if (onNavigate) {
      onNavigate(spot);
    }
  }, [onNavigate]);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatusChip = (status) => (
    <StatusChip
      status={status}
      icon={STATUS_ICONS[status] || STATUS_ICONS.available}
      label={STATUS_LABELS[status] || status}
      size="small"
    />
  );

  const renderSpotTypeChip = (type) => (
    <Chip
      label={type}
      size="small"
      variant="outlined"
      sx={{
        borderRadius: theme.shape.borderRadius * 2,
        borderColor: alpha(theme.palette.primary.main, 0.3),
        color: theme.palette.text.secondary,
      }}
    />
  );

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading) {
    if (viewMode === 'grid') {
      return (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" sx={{ mt: 2 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rounded" width={80} height={32} />
                  <Skeleton variant="rounded" width={80} height={32} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Spot', 'Type', 'Status', 'Price', 'Actions'].map((col) => (
                  <TableCell key={col}>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" width={60} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width={60} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  // ==========================================================================
  // Empty State
  // ==========================================================================

  if (spots.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: theme.shape.borderRadius * 2,
        }}
      >
        <ParkingIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Parking Spots Found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Try adjusting your search filters or check back later.
        </Typography>
      </Paper>
    );
  }

  // ==========================================================================
  // Grid View
  // ==========================================================================

  if (viewMode === 'grid') {
    return (
      <Box className={className} sx={{ width: '100%', ...sx }} {...props}>
        <Grid container spacing={3}>
          {spots.map((spot) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={spot.id}>
              <SpotCard
                onMouseEnter={() => setHoveredSpot(spot.id)}
                onMouseLeave={() => setHoveredSpot(null)}
                onClick={() => handleSpotClick(spot)}
              >
                <SpotImage>
                  <ParkingIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.3) }} />
                  <StatusBadge
                    badgeContent={renderStatusChip(spot.status)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  />
                </SpotImage>

                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {spot.spot_number}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(spot.id);
                        }}
                      >
                        {favorites.includes(spot.id) ? (
                          <FavoriteIcon color="error" fontSize="small" />
                        ) : (
                          <FavoriteBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                        }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                    {renderSpotTypeChip(spot.spot_type)}
                    {spot.is_ev_charging && (
                      <Chip
                        label="EV"
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    {spot.is_handicap_accessible && (
                      <Chip
                        label="♿"
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                        }}
                      />
                    )}
                  </Box>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" />
                      {spot.location?.address || 'Floor ' + spot.floor}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon fontSize="small" />
                      {formatCurrency(spot.price || 0)} / hour
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    startIcon={<ReserveIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReserve(spot);
                    }}
                    disabled={spot.status !== 'available'}
                    sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                  >
                    {spot.status === 'available' ? 'Reserve' : 'Unavailable'}
                  </Button>
                </CardActions>
              </SpotCard>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {showPagination && total > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={onPageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>
    );
  }

  // ==========================================================================
  // List View
  // ==========================================================================

  return (
    <Box className={className} sx={{ width: '100%', ...sx }} {...props}>
      <Paper sx={{ borderRadius: theme.shape.borderRadius * 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>Spot</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Price</TableCell>
                {showActions && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {spots.map((spot) => (
                <TableRowStyled
                  key={spot.id}
                  hover
                  onClick={() => handleSpotClick(spot)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <ParkingIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {spot.spot_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {spot.section || 'Section A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {renderSpotTypeChip(spot.spot_type)}
                      {spot.is_ev_charging && (
                        <Chip
                          label="EV"
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                            fontWeight: 600,
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {spot.location?.address || `Floor ${spot.floor}`}
                    </Typography>
                    {spot.distance && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDistance(spot.distance)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(spot.status)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(spot.price || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / hour
                    </Typography>
                  </TableCell>
                  {showActions && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpotClick(spot);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Navigate">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(spot);
                            }}
                          >
                            <DirectionsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reserve">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReserve(spot);
                            }}
                            disabled={spot.status !== 'available'}
                          >
                            <ReserveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add to Favorites">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(spot.id);
                            }}
                          >
                            {favorites.includes(spot.id) ? (
                              <FavoriteIcon fontSize="small" color="error" />
                            ) : (
                              <FavoriteBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRowStyled>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination */}
        {showPagination && total > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={total}
            rowsPerPage={pageSize}
            page={page - 1}
            onPageChange={(e, newPage) => onPageChange(e, newPage + 1)}
            onRowsPerPageChange={(e) => onPageSizeChange(e, parseInt(e.target.value, 10))}
          />
        )}
      </Paper>
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default ParkingList;
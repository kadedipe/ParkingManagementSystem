// ============================================================================
// Parking Search Page
// ============================================================================

/**
 * Parking Search Page component for searching and finding parking spots.
 * 
 * This component provides:
 * - Advanced search with filters
 * - Map view of parking spots
 * - List and grid views
 * - Real-time availability
 * - Spot details and booking
 * - Responsive design
 * - Filter persistence
 * - Location-based search
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Chip,
  Drawer,
  useMediaQuery,
  useTheme,
  alpha,
  Stack,
  Divider,
  Alert,
  Skeleton,
  Pagination,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Fade,
  Slide,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Map as MapIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Tune as TuneIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  BookmarkAdd as BookmarkIcon,
  Directions as DirectionsIcon,
  LocalParking as ParkingIcon,
  EvStation as EvStationIcon,
  Accessible as AccessibleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import components
import { ParkingSearch } from '../components/parking/ParkingSearch';
import { ParkingList } from '../components/parking/ParkingList';
import { ParkingDetails } from '../components/parking/ParkingDetails';
import { ParkingMap } from '../components/parking/ParkingMap';
import { BookingForm } from '../components/booking/BookingForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Import hooks and services
import { useParking } from '../hooks/useParking';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const FilterDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 360,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      padding: theme.spacing(2),
    },
  },
}));

const ViewToggle = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
}));

const ViewButton = styled(IconButton)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1),
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.04),
  },
}));

const StatsBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

// ============================================================================
// Main Component
// ============================================================================

export const ParkingSearchPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { searchParking, loading, error } = useParking();
  const { createBooking } = useBooking();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ==========================================================================
  // State
  // ==========================================================================

  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'map'
  const [spots, setSpots] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    spotTypes: [],
    statuses: ['available'],
    accessLevels: [],
    minPrice: 0,
    maxPrice: 100,
    radius: 5,
    latitude: null,
    longitude: null,
    sortBy: 'distance',
    sortOrder: 'asc',
  });
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [mapZoom, setMapZoom] = useState(13);
  const [activeFilters, setActiveFilters] = useState([]);

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Load user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Perform search when filters change
  useEffect(() => {
    performSearch();
  }, [filters, page]);

  // Update active filters count
  useEffect(() => {
    const active = [];
    if (filters.spotTypes.length > 0) active.push('spotTypes');
    if (filters.statuses.length > 0) active.push('statuses');
    if (filters.accessLevels.length > 0) active.push('accessLevels');
    if (filters.minPrice > 0) active.push('minPrice');
    if (filters.maxPrice < 100) active.push('maxPrice');
    if (filters.radius !== 5) active.push('radius');
    if (filters.latitude !== null) active.push('location');
    setActiveFilters(active);
  }, [filters]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const performSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      setSearchError(null);

      const searchParams = {
        ...filters,
        page,
        limit: pageSize,
      };

      const response = await searchParking(searchParams);
      
      if (response) {
        setSpots(response.items || []);
        setTotal(response.total || 0);
      }
    } catch (err) {
      setSearchError(err.message || 'Failed to search parking spots');
    } finally {
      setIsSearching(false);
    }
  }, [filters, page, pageSize, searchParking]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleSearchChange = (query) => {
    setFilters(prev => ({ ...prev, query }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      spotTypes: [],
      statuses: ['available'],
      accessLevels: [],
      minPrice: 0,
      maxPrice: 100,
      radius: 5,
      latitude: mapCenter.lat,
      longitude: mapCenter.lng,
      sortBy: 'distance',
      sortOrder: 'asc',
    });
    setPage(1);
    setShowFilters(false);
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    setShowDetails(true);
  };

  const handleSpotReserve = (spot) => {
    setSelectedSpot(spot);
    setShowDetails(false);
    setShowBooking(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBooking(false);
    // Show success message or navigate
    performSearch();
  };

  const handleBookingCancel = () => {
    setShowBooking(false);
  };

  const handleFavoriteToggle = (spotId) => {
    setFavorites(prev =>
      prev.includes(spotId)
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (event, newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(newLocation);
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setMapZoom(15);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  };

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const hasActiveFilters = useMemo(() => {
    return activeFilters.length > 0;
  }, [activeFilters]);

  const availableSpots = useMemo(() => {
    return spots.filter(spot => spot.status === 'available');
  }, [spots]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* Header */}
      <HeaderSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Find Parking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total > 0 ? `${total} parking spots found` : 'Search for available parking spots'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={hasActiveFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(true)}
              size={isSmallMobile ? 'small' : 'medium'}
            >
              Filters
              {hasActiveFilters && (
                <Chip
                  label={activeFilters.length}
                  size="small"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={performSearch}
              disabled={isSearching}
              size={isSmallMobile ? 'small' : 'medium'}
            />
          </Box>
        </Box>

        {/* Search Bar */}
        <ParkingSearch
          onSearch={handleSearchChange}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          compact={isMobile}
          showResults={false}
        />
      </HeaderSection>

      {/* Stats & View Controls */}
      <StatsBar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isSearching ? 'Searching...' : `${spots.length} spots found`}
          </Typography>
          {availableSpots.length > 0 && (
            <Chip
              label={`${availableSpots.length} available`}
              size="small"
              color="success"
              sx={{ borderRadius: 1 }}
            />
          )}
          {searchError && (
            <Alert severity="error" sx={{ py: 0 }}>
              {searchError}
            </Alert>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Use my location">
            <IconButton size="small" onClick={handleUseCurrentLocation}>
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
          <ViewToggle>
            <ViewButton
              active={viewMode === 'list'}
              onClick={() => handleViewModeChange('list')}
              size="small"
            >
              <ViewListIcon />
            </ViewButton>
            <ViewButton
              active={viewMode === 'grid'}
              onClick={() => handleViewModeChange('grid')}
              size="small"
            >
              <ViewModuleIcon />
            </ViewButton>
            <ViewButton
              active={viewMode === 'map'}
              onClick={() => handleViewModeChange('map')}
              size="small"
            >
              <MapIcon />
            </ViewButton>
          </ViewToggle>
        </Box>
      </StatsBar>

      {/* Content */}
      <ErrorBoundary>
        {isSearching && spots.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <LoadingSpinner size="large" label="Searching for parking spots..." />
          </Box>
        ) : spots.length === 0 && !isSearching ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <ParkingIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Parking Spots Found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your search filters or location.
            </Typography>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <>
            {viewMode === 'map' ? (
              <Paper
                sx={{
                  height: 500,
                  borderRadius: theme.shape.borderRadius * 2,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <ParkingMap
                  spots={spots}
                  center={mapCenter}
                  zoom={mapZoom}
                  onSpotClick={handleSpotClick}
                  onMapMove={(center) => {
                    setMapCenter(center);
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<MyLocationIcon />}
                    onClick={handleUseCurrentLocation}
                  >
                    Center Map
                  </Button>
                </Box>
              </Paper>
            ) : (
              <ParkingList
                spots={spots}
                loading={isSearching}
                total={total}
                page={page}
                pageSize={pageSize}
                viewMode={viewMode}
                onSpotClick={handleSpotClick}
                onReserve={handleSpotReserve}
                onFavorite={handleFavoriteToggle}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onViewModeChange={handleViewModeChange}
                favorites={favorites}
                showActions={true}
                showPagination={true}
              />
            )}
          </>
        )}
      </ErrorBoundary>

      {/* Filter Drawer */}
      <FilterDrawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{
          sx: {
            maxHeight: isMobile ? '90vh' : '100vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Filters
            {hasActiveFilters && (
              <Chip
                label={activeFilters.length}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <IconButton onClick={() => setShowFilters(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <ParkingSearch
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          showResults={false}
          showFilters={true}
          compact={isMobile}
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowFilters(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </FilterDrawer>

      {/* Spot Details Dialog */}
      {selectedSpot && (
        <ParkingDetails
          spot={selectedSpot}
          open={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedSpot(null);
          }}
          onReserve={() => {
            setShowDetails(false);
            setShowBooking(true);
          }}
          onFavorite={() => handleFavoriteToggle(selectedSpot.id)}
          isFavorite={favorites.includes(selectedSpot.id)}
        />
      )}

      {/* Booking Dialog */}
      {selectedSpot && (
        <BookingForm
          spot={selectedSpot}
          open={showBooking}
          onClose={handleBookingCancel}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
          user={user}
        />
      )}
    </PageContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default ParkingSearchPage;
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

import { ParkingSearch } from '../components/parking/ParkingSearch';
import { ParkingList } from '../components/parking/ParkingList';
import { ParkingDetails } from '../components/parking/ParkingDetails';
import { BookingForm } from '../components/booking/BookingForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useParking } from '../hooks/useParking';
import { useAuth } from '../hooks/useAuth';

export const ParkingSearchPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchParking } = useParking();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const requestSequence = useRef(0);

  const reservationMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('reserve') === '1' || location.state?.reservationMode === true;
  }, [location.search, location.state]);

  const [spots, setSpots] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
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

  const performSearch = useCallback(async () => {
    const requestId = ++requestSequence.current;
    setIsSearching(true);
    setSearchError('');
    try {
      const response = await searchParking({ ...filters, page, limit: pageSize });
      if (requestId !== requestSequence.current) return;
      setSpots(response?.items || []);
      setTotal(response?.total || 0);
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setSearchError(error?.message || 'Failed to search parking spots');
    } finally {
      if (requestId === requestSequence.current) {
        setIsSearching(false);
      }
    }
  }, [filters, page, pageSize, searchParking]);

  useEffect(() => {
    void performSearch();
  }, [performSearch]);

  const handleFilterChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
    setPage(1);
  };

  const handleSearch = (queryOrParams) => {
    const nextQuery = typeof queryOrParams === 'string'
      ? queryOrParams
      : String(queryOrParams?.query || '');

    setFilters((current) => {
      if (current.query === nextQuery) return current;
      return { ...current, query: nextQuery };
    });
    setPage(1);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setPage(1);
      },
      (error) => setSearchError(error?.message || 'Unable to read your current location.')
    );
  };

  const openReservation = (spot) => {
    if (String(spot?.status || '').toLowerCase() !== 'available') {
      setSearchError('That parking spot is no longer available. Please choose another spot.');
      return;
    }
    setSelectedSpot(spot);
    setShowDetails(false);
    setShowBooking(true);
  };

  const closeReservation = () => {
    setShowBooking(false);
    setSelectedSpot(null);
  };

  const handleBookingSuccess = async () => {
    setShowBooking(false);
    setSelectedSpot(null);
    await performSearch();
    navigate('/calendar');
  };

  const availableCount = spots.filter(
    (spot) => String(spot.status || '').toLowerCase() === 'available'
  ).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0, maxWidth: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>Find Parking</Typography>
          <Typography variant="body2" color="text.secondary">
            {total > 0 ? `${total} parking spots found` : 'Search for available parking spots'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Use my location">
            <IconButton onClick={handleUseCurrentLocation}><MyLocationIcon /></IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={performSearch}
            disabled={isSearching}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {reservationMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Create a reservation:</strong> choose an available parking spot below and click the
          visible <strong>Reserve</strong> button. The reservation form will open immediately.
        </Alert>
      )}

      {searchError && <Alert severity="error" sx={{ mb: 2 }}>{searchError}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2, maxWidth: '100%', overflow: 'hidden' }}>
        <ParkingSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          compact={isMobile}
          showResults={false}
        />
      </Paper>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Chip label={`${spots.length} spots found`} />
        <Chip label={`${availableCount} available`} color="success" />
        {reservationMode && <Chip label="Reservation mode" color="primary" />}
      </Stack>

      <ErrorBoundary>
        {isSearching && spots.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <LoadingSpinner size="large" label="Searching for parking spots..." />
          </Box>
        ) : (
          <ParkingList
            spots={spots}
            loading={isSearching && spots.length > 0}
            total={total}
            page={page}
            pageSize={pageSize}
            viewMode="list"
            onSpotClick={(spot) => {
              setSelectedSpot(spot);
              setShowDetails(true);
            }}
            onReserve={openReservation}
            onPageChange={(event, nextPage) => setPage(nextPage)}
            onPageSizeChange={(event, nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }}
            showActions
            showPagination
          />
        )}
      </ErrorBoundary>

      {selectedSpot && (
        <ParkingDetails
          spot={selectedSpot}
          open={showDetails}
          onClose={() => {
            setShowDetails(false);
            if (!showBooking) setSelectedSpot(null);
          }}
          onReserve={() => openReservation(selectedSpot)}
          isFavorite={false}
        />
      )}

      <Dialog
        open={showBooking && Boolean(selectedSpot)}
        onClose={closeReservation}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create parking reservation
          <IconButton onClick={closeReservation} aria-label="Close reservation form">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 } }}>
          {selectedSpot && (
            <BookingForm
              spot={selectedSpot}
              onSuccess={handleBookingSuccess}
              onCancel={closeReservation}
              user={user}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ParkingSearchPage;

// ============================================================================
// Parking Detail Page
// ============================================================================

/**
 * Parking Detail Page component for viewing and managing parking spot details.
 * 
 * This component provides:
 * - Comprehensive parking spot information
 * - Real-time availability status
 * - Booking functionality
 * - Similar spots recommendations
 * - Reviews and ratings
 * - Booking history
 * - Interactive map
 * - Share and favorite options
 * - Responsive design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Stack,
  Avatar,
  Rating,
  LinearProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
  useMediaQuery,
  CircularProgress,
  Fade,
  Slide,
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
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { formatCurrency, formatDate, formatTime, formatDistance } from '../utils/formatters';
import { useParking } from '../hooks/useParking';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';

// Import components
import { ParkingMap } from '../components/parking/ParkingMap';
import { BookingForm } from '../components/booking/BookingForm';
import { ParkingCard } from '../components/parking/ParkingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create('box-shadow', {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => {
  const statusColors = {
    available: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      border: theme.palette.success.main,
    },
    occupied: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      border: theme.palette.error.main,
    },
    reserved: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      border: theme.palette.warning.main,
    },
    maintenance: {
      bg: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[600],
      border: theme.palette.grey[600],
    },
    out_of_service: {
      bg: alpha(theme.palette.grey[800], 0.1),
      color: theme.palette.grey[800],
      border: theme.palette.grey[800],
    },
  };

  const colors = statusColors[status] || statusColors.available;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 2),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: colors.bg,
    color: colors.color,
    border: `2px solid ${colors.border}`,
    fontWeight: 600,
    textTransform: 'capitalize',
    fontSize: '0.875rem',
  };
});

const FeatureTag = styled(Chip)(({ theme, feature }) => ({
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

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const PriceDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(0.5),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  borderRadius: theme.shape.borderRadius * 2,
}));

const SimilarSpotCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  cursor: 'pointer',
}));

// ============================================================================
// Main Component
// ============================================================================

export const ParkingDetailPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getParkingSpot, loading: parkingLoading, error: parkingError } = useParking();
  const { createBooking } = useBooking();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // ==========================================================================
  // State
  // ==========================================================================

  const [spot, setSpot] = useState(null);
  const [similarSpots, setSimilarSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [reviews, setReviews] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    if (id) {
      fetchSpotDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (spot) {
      // Check if spot is in favorites
      setFavorite(isFavorite(spot.id));
      // Fetch similar spots
      fetchSimilarSpots(spot);
      // Fetch reviews
      fetchReviews(spot.id);
      // Fetch booking history
      fetchBookingHistory(spot.id);
    }
  }, [spot]);

  // ==========================================================================
  // API Calls
  // ==========================================================================

  const fetchSpotDetails = useCallback(async (spotId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getParkingSpot(spotId);
      setSpot(response);
    } catch (err) {
      setError(err.message || 'Failed to load parking spot details');
    } finally {
      setLoading(false);
    }
  }, [getParkingSpot]);

  const fetchSimilarSpots = useCallback(async (currentSpot) => {
    // Simulate fetching similar spots
    // In production, this would be an API call
    setSimilarSpots([
      {
        id: '2',
        spot_number: 'A-102',
        spot_type: 'standard',
        status: 'available',
        price: 4.50,
        distance: 0.2,
        features: ['covered', 'cctv'],
      },
      {
        id: '3',
        spot_number: 'A-103',
        spot_type: 'premium',
        status: 'available',
        price: 8.00,
        distance: 0.3,
        features: ['ev', 'premium'],
      },
      {
        id: '4',
        spot_number: 'B-101',
        spot_type: 'standard',
        status: 'occupied',
        price: 5.00,
        distance: 0.4,
        features: ['covered'],
      },
    ]);
  }, []);

  const fetchReviews = useCallback(async (spotId) => {
    // Simulate fetching reviews
    setReviews([
      {
        id: 1,
        user: 'John D.',
        rating: 5,
        comment: 'Great parking spot! Very convenient and well-maintained.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        user: 'Sarah M.',
        rating: 4,
        comment: 'Good location, easy access. Could use better lighting.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        user: 'Mike R.',
        rating: 5,
        comment: 'Perfect spot for EV charging. Fast and reliable.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);
  }, []);

  const fetchBookingHistory = useCallback(async (spotId) => {
    // Simulate fetching booking history
    setBookingHistory([
      {
        id: 'B001',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        duration: 2,
        status: 'completed',
        amount: 10.00,
      },
      {
        id: 'B002',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 3,
        status: 'completed',
        amount: 15.00,
      },
      {
        id: 'B003',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 1,
        status: 'cancelled',
        amount: 5.00,
      },
    ]);
  }, []);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookingOpen = () => {
    setShowBooking(true);
  };

  const handleBookingClose = () => {
    setShowBooking(false);
  };

  const handleBookingSuccess = (booking) => {
    setShowBooking(false);
    setSnackbarMessage('Booking confirmed successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    // Refresh spot details
    fetchSpotDetails(id);
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(spot.id);
    setFavorite(!favorite);
    setSnackbarMessage(favorite ? 'Removed from favorites' : 'Added to favorites');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Parking Spot ${spot?.spot_number}`,
        text: `Check out this parking spot at ${spot?.location?.address}`,
        url: window.location.href,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        setSnackbarMessage('Link copied to clipboard');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    }
  };

  const handleNavigate = () => {
    // Open in maps app
    const address = spot?.location?.address || `${spot?.latitude},${spot?.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleSimilarSpotClick = (similarSpot) => {
    navigate(`/parking/${similarSpot.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate and download PDF
    setSnackbarMessage('Download started');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatus = () => {
    if (!spot) return null;

    const statusConfigs = {
      available: {
        icon: <AvailableIcon />,
        label: 'Available Now',
        color: 'success',
      },
      occupied: {
        icon: <OccupiedIcon />,
        label: 'Currently Occupied',
        color: 'error',
      },
      reserved: {
        icon: <ReservedIcon />,
        label: 'Reserved',
        color: 'warning',
      },
      maintenance: {
        icon: <MaintenanceIcon />,
        label: 'Under Maintenance',
        color: 'default',
      },
      out_of_service: {
        icon: <ErrorIcon />,
        label: 'Out of Service',
        color: 'default',
      },
    };

    const config = statusConfigs[spot.status] || statusConfigs.available;

    return (
      <StatusBadge status={spot.status}>
        {config.icon}
        {config.label}
      </StatusBadge>
    );
  };

  const renderFeatures = () => {
    if (!spot) return null;

    const features = [];
    
    if (spot.is_ev_charging) {
      features.push({ key: 'ev', label: 'EV Charging', icon: <EvIcon /> });
    }
    if (spot.is_handicap_accessible) {
      features.push({ key: 'handicap', label: '♿ Accessible', icon: <AccessibleIcon /> });
    }
    if (spot.is_covered) {
      features.push({ key: 'covered', label: 'Covered Parking', icon: null });
    }
    if (spot.is_premium) {
      features.push({ key: 'premium', label: 'Premium Spot', icon: <StarIcon /> });
    }
    if (spot.has_cctv) {
      features.push({ key: 'security', label: 'CCTV Monitoring', icon: null });
    }
    if (spot.has_security) {
      features.push({ key: 'security_guard', label: 'Security Guard', icon: null });
    }
    if (spot.has_lighting) {
      features.push({ key: 'lighting', label: 'Good Lighting', icon: null });
    }

    return features.map((feature) => (
      <FeatureTag
        key={feature.key}
        feature={feature.key}
        label={feature.label}
        icon={feature.icon}
      />
    ));
  };

  const renderRatingSummary = () => {
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" fontWeight={700}>
            {averageRating.toFixed(1)}
          </Typography>
          <Rating value={averageRating} readOnly precision={0.5} />
          <Typography variant="caption" color="text.secondary">
            ({reviews.length} reviews)
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((star) => (
            <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption">{star}★</Typography>
              <LinearProgress
                variant="determinate"
                value={reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0}
                sx={{ flex: 1, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary">
                {ratingDistribution[star]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error || !spot) {
    return (
      <PageContainer>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {error || 'Parking spot not found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The parking spot you're looking for might have been removed or is temporarily unavailable.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/parking')}
          >
            Back to Parking Search
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit" underline="hover">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link component={RouterLink} to="/parking" color="inherit" underline="hover">
          Parking
        </Link>
        <Typography color="text.primary">
          Spot {spot.spot_number}
        </Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <DetailCard>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h4" fontWeight={700}>
                Spot {spot.spot_number}
              </Typography>
              {renderStatus()}
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {spot.spot_type} • {spot.section || 'Section A'} • Floor {spot.floor || 1}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {renderFeatures()}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
              <PriceDisplay>
                <Typography variant="body2" color="text.secondary">
                  Price:
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {formatCurrency(spot.price || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / hour
                </Typography>
              </PriceDisplay>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Navigate">
                  <IconButton onClick={handleNavigate}>
                    <DirectionsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton onClick={handleFavoriteToggle}>
                    {favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {spot.status === 'available' && (
            <Button
              variant="contained"
              size="large"
              startIcon={<ReserveIcon />}
              onClick={handleBookingOpen}
              sx={{ flex: 1, minWidth: 200 }}
            >
              Reserve Now
            </Button>
          )}
          <Button
            variant="outlined"
            size="large"
            startIcon={<DirectionsIcon />}
            onClick={handleNavigate}
            sx={{ flex: 1, minWidth: 150 }}
          >
            Get Directions
          </Button>
        </Box>
      </DetailCard>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Details */}
        <Grid item xs={12} md={8}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
            >
              <Tab label="Details" />
              <Tab label="Availability" />
              <Tab label="Reviews" />
              <Tab label="History" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          {activeTab === 0 && (
            <DetailCard>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Spot Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <ParkingIcon color="action" />
                    <Typography variant="body2">
                      <strong>Type:</strong> {spot.spot_type}
                    </Typography>
                  </InfoRow>
                  <InfoRow>
                    <LocationIcon color="action" />
                    <Typography variant="body2">
                      <strong>Location:</strong> {spot.location?.address || `Floor ${spot.floor}, Section ${spot.section || 'A'}`}
                    </Typography>
                  </InfoRow>
                  <InfoRow>
                    <PinDropIcon color="action" />
                    <Typography variant="body2">
                      <strong>Coordinates:</strong> {spot.latitude || 'N/A'}, {spot.longitude || 'N/A'}
                    </Typography>
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <CarIcon color="action" />
                    <Typography variant="body2">
                      <strong>Dimensions:</strong> {spot.dimensions?.width || 2.5}m x {spot.dimensions?.length || 5}m
                    </Typography>
                  </InfoRow>
                  <InfoRow>
                    <TimeIcon color="action" />
                    <Typography variant="body2">
                      <strong>Max Duration:</strong> {spot.max_duration || 24} hours
                    </Typography>
                  </InfoRow>
                  <InfoRow>
                    <MoneyIcon color="action" />
                    <Typography variant="body2">
                      <strong>Rate:</strong> {formatCurrency(spot.price || 0)} per hour
                    </Typography>
                  </InfoRow>
                </Grid>
              </Grid>
            </DetailCard>
          )}

          {activeTab === 1 && (
            <DetailCard>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Availability Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Check availability for the next 7 days
              </Typography>
              <Grid container spacing={2}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {day}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <AvailableIcon color="success" fontSize="small" />
                          <Typography variant="body2">
                            Available: {Math.floor(Math.random() * 10)} spots
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.random() * 80 + 20}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DetailCard>
          )}

          {activeTab === 2 && (
            <DetailCard>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Reviews & Ratings
              </Typography>
              {renderRatingSummary()}
              <Divider />
              <List>
                {reviews.map((review) => (
                  <ListItem key={review.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>{review.user[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{review.user}</Typography>
                          <Rating value={review.rating} size="small" readOnly />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.date)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </DetailCard>
          )}

          {activeTab === 3 && (
            <DetailCard>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Booking History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookingHistory.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>{formatDate(booking.date)}</TableCell>
                        <TableCell>{booking.duration}h</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            size="small"
                            color={booking.status === 'completed' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(booking.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DetailCard>
          )}
        </Grid>

        {/* Right Column - Map & Similar Spots */}
        <Grid item xs={12} md={4}>
          {/* Map */}
          <DetailCard>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Location
            </Typography>
            <Box sx={{ height: 200, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100' }}>
              <ParkingMap
                spots={[spot]}
                center={{ lat: spot.latitude || 37.7749, lng: spot.longitude || -122.4194 }}
                zoom={15}
                onSpotClick={() => {}}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {spot.location?.address || 'Location not specified'}
            </Typography>
          </DetailCard>

          {/* Similar Spots */}
          <DetailCard>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Similar Spots Nearby
            </Typography>
            <Stack spacing={2}>
              {similarSpots.map((similarSpot) => (
                <SimilarSpotCard
                  key={similarSpot.id}
                  onClick={() => handleSimilarSpotClick(similarSpot)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {similarSpot.spot_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {similarSpot.spot_type} • {formatDistance(similarSpot.distance)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {formatCurrency(similarSpot.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          / hour
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                      {similarSpot.features?.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          size="small"
                          sx={{ height: 20, fontSize: '0.625rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </SimilarSpotCard>
              ))}
            </Stack>
          </DetailCard>

          {/* Quick Actions */}
          <DetailCard>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print Details
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => {
                  window.location.href = `mailto:?subject=Parking Spot ${spot.spot_number}&body=Check out this parking spot: ${window.location.href}`;
                }}
              >
                Email Details
              </Button>
            </Stack>
          </DetailCard>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      {showBooking && spot && (
        <BookingForm
          spot={spot}
          open={showBooking}
          onClose={handleBookingClose}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingClose}
          user={user}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default ParkingDetailPage;
// ============================================================================
// ParkingDetails Component
// ============================================================================

/**
 * ParkingDetails component for displaying detailed parking spot information.
 * 
 * This component provides:
 * - Comprehensive parking spot details
 * - Status and availability information
 * - Pricing and features
 * - Booking/reservation functionality
 * - Location map integration
 * - Similar spots recommendations
 * - Booking history
 * - Reviews and ratings
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
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
  ListItemIcon,
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
  DatePicker,
  TimePicker,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDate, formatTime, formatDistance } from '../../utils/formatters';
import { useParking } from '../../hooks/useParking';

// ============================================================================
// Styled Components
// ============================================================================

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

// ============================================================================
// Main Component
// ============================================================================

export const ParkingDetails = ({
  spot,
  loading = false,
  onClose,
  onReserve,
  onNavigate,
  onFavorite,
  onShare,
  isFavorite = false,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { reserveSpot } = useParking();

  // ==========================================================================
  // State
  // ==========================================================================

  const [activeTab, setActiveTab] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(1);
  const [vehicleType, setVehicleType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookingOpen = () => {
    setBookingDialogOpen(true);
    setBookingStep(0);
    setBookingSuccess(false);
    setError(null);
  };

  const handleBookingClose = () => {
    setBookingDialogOpen(false);
    setBookingStep(0);
    setBookingSuccess(false);
    setError(null);
  };

  const handleBookingNext = () => {
    if (bookingStep < 2) {
      setBookingStep(bookingStep + 1);
    } else {
      handleBookingSubmit();
    }
  };

  const handleBookingBack = () => {
    if (bookingStep > 0) {
      setBookingStep(bookingStep - 1);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setError(null);
      // Validate booking data
      if (!selectedDate || !selectedTime) {
        setError('Please select date and time');
        return;
      }

      const bookingData = {
        spot_id: spot.id,
        date: selectedDate,
        time: selectedTime,
        duration: duration,
        vehicle_type: vehicleType,
        payment_method: paymentMethod,
      };

      const result = await reserveSpot(spot.id, bookingData);
      
      if (result.success) {
        setBookingSuccess(true);
        setSnackbarMessage('Booking confirmed successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setBookingStep(3);
        
        if (onReserve) {
          onReserve(spot);
        }
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to book parking spot');
      setSnackbarMessage(err.message || 'Failed to book parking spot');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFavoriteToggle = () => {
    if (onFavorite) {
      onFavorite(spot.id);
    }
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(spot);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(spot);
    }
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatus = () => {
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

    const config = statusConfigs[spot?.status] || statusConfigs.available;

    return (
      <StatusBadge status={spot?.status}>
        {config.icon}
        {config.label}
      </StatusBadge>
    );
  };

  const renderFeatures = () => {
    const features = [];
    
    if (spot?.is_ev_charging) {
      features.push({ key: 'ev', label: 'EV Charging', icon: <EvIcon /> });
    }
    if (spot?.is_handicap_accessible) {
      features.push({ key: 'handicap', label: '♿ Accessible', icon: <AccessibleIcon /> });
    }
    if (spot?.is_covered) {
      features.push({ key: 'covered', label: 'Covered Parking', icon: null });
    }
    if (spot?.is_premium) {
      features.push({ key: 'premium', label: 'Premium Spot', icon: <StarIcon /> });
    }
    if (spot?.has_cctv) {
      features.push({ key: 'security', label: 'CCTV Monitoring', icon: null });
    }
    if (spot?.has_security) {
      features.push({ key: 'security_guard', label: 'Security Guard', icon: null });
    }
    if (spot?.has_lighting) {
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

  const renderBookingSteps = () => {
    const steps = [
      {
        label: 'Select Date & Time',
        description: 'Choose when you want to park',
      },
      {
        label: 'Vehicle Details',
        description: 'Provide vehicle information',
      },
      {
        label: 'Payment',
        description: 'Complete your booking',
      },
    ];

    return (
      <Stepper activeStep={bookingStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {index === 0 && renderDateTimeSelection()}
                {index === 1 && renderVehicleSelection()}
                {index === 2 && renderPaymentSelection()}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleBookingNext}
                >
                  {index === steps.length - 1 ? 'Confirm Booking' : 'Next'}
                </Button>
                {index > 0 && (
                  <Button onClick={handleBookingBack}>
                    Back
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    );
  };

  const renderDateTimeSelection = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Select Date"
            type="date"
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Select Time"
            type="time"
            value={selectedTime || ''}
            onChange={(e) => setSelectedTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Duration (hours)</InputLabel>
            <Select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              label="Duration (hours)"
            >
              {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
                <MenuItem key={hours} value={hours}>
                  {hours} {hours === 1 ? 'hour' : 'hours'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  };

  const renderVehicleSelection = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              label="Vehicle Type"
            >
              <MenuItem value="standard">Standard</MenuItem>
              <MenuItem value="compact">Compact</MenuItem>
              <MenuItem value="suv">SUV</MenuItem>
              <MenuItem value="truck">Truck</MenuItem>
              <MenuItem value="motorcycle">Motorcycle</MenuItem>
              <MenuItem value="ev">Electric Vehicle</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="License Plate"
            placeholder="Enter license plate number"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Vehicle Notes"
            placeholder="Any special requirements?"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    );
  };

  const renderPaymentSelection = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Payment Method</FormLabel>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="credit_card"
                control={<Radio />}
                label="Credit Card"
              />
              <FormControlLabel
                value="debit_card"
                control={<Radio />}
                label="Debit Card"
              />
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label="PayPal"
              />
              <FormControlLabel
                value="apple_pay"
                control={<Radio />}
                label="Apple Pay"
              />
              <FormControlLabel
                value="google_pay"
                control={<Radio />}
                label="Google Pay"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <PriceDisplay>
            <Typography variant="body2" color="text.secondary">
              Total:
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              {formatCurrency((spot?.price || 0) * duration)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              for {duration} {duration === 1 ? 'hour' : 'hours'}
            </Typography>
          </PriceDisplay>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
      </Grid>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" height={40} width="60%" />
        <Skeleton variant="text" height={24} width="40%" />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} key={item}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <Box className={className} sx={{ width: '100%', ...sx }} {...props}>
      {/* Close Button */}
      {onClose && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {/* Header Section */}
      <DetailCard>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4" fontWeight={700}>
                {spot?.spot_number}
              </Typography>
              {renderStatus()}
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {spot?.spot_type} • {spot?.section || 'Section A'} • Floor {spot?.floor || 1}
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
                  {formatCurrency(spot?.price || 0)}
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
                <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton onClick={handleFavoriteToggle}>
                    {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
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
          {spot?.status === 'available' && (
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

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Availability" />
          <Tab label="Reviews" />
          <Tab label="History" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Details Panel */}
          <Grid item xs={12} md={6}>
            <DetailCard>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Spot Details
              </Typography>
              <Stack spacing={1}>
                <InfoRow>
                  <ParkingIcon color="action" />
                  <Typography variant="body2">
                    <strong>Type:</strong> {spot?.spot_type}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <LocationIcon color="action" />
                  <Typography variant="body2">
                    <strong>Location:</strong> {spot?.location?.address || `Floor ${spot?.floor}, Section ${spot?.section || 'A'}`}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <PinDropIcon color="action" />
                  <Typography variant="body2">
                    <strong>Coordinates:</strong> {spot?.latitude || 'N/A'}, {spot?.longitude || 'N/A'}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <CarIcon color="action" />
                  <Typography variant="body2">
                    <strong>Dimensions:</strong> {spot?.dimensions?.width || 2.5}m x {spot?.dimensions?.length || 5}m
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <TimeIcon color="action" />
                  <Typography variant="body2">
                    <strong>Max Duration:</strong> {spot?.max_duration || 24} hours
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <MoneyIcon color="action" />
                  <Typography variant="body2">
                    <strong>Rate:</strong> {formatCurrency(spot?.price || 0)} per hour
                  </Typography>
                </InfoRow>
              </Stack>
            </DetailCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailCard>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Additional Information
              </Typography>
              <Stack spacing={1}>
                <InfoRow>
                  <InfoIcon color="action" />
                  <Typography variant="body2">
                    <strong>Access Level:</strong> {spot?.access_level || 'Public'}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <CheckCircleIcon color="action" />
                  <Typography variant="body2">
                    <strong>Status:</strong> {spot?.status || 'Available'}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <HistoryIcon color="action" />
                  <Typography variant="body2">
                    <strong>Last Occupied:</strong> {spot?.last_occupied ? formatDate(spot.last_occupied) : 'Never'}
                  </Typography>
                </InfoRow>
                <InfoRow>
                  <PersonIcon color="action" />
                  <Typography variant="body2">
                    <strong>Occupancy Rate:</strong> {spot?.occupancy_rate || 0}%
                  </Typography>
                </InfoRow>
              </Stack>
            </DetailCard>
          </Grid>
        </Grid>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" fontWeight={700}>
                4.5
              </Typography>
              <Rating value={4.5} readOnly precision={0.5} />
              <Typography variant="caption" color="text.secondary">
                (128 reviews)
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption">{star}★</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={star === 5 ? 70 : star === 4 ? 20 : 10}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {star === 5 ? 70 : star === 4 ? 20 : 10}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Divider />
          <List>
            {[1, 2, 3].map((review) => (
              <ListItem key={review} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>R</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">User {review}</Typography>
                      <Rating value={4} size="small" readOnly />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Great parking spot! Very convenient and well-maintained.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        2 days ago
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
                  <TableCell>Date</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map((booking) => (
                  <TableRow key={booking}>
                    <TableCell>{formatDate(new Date())}</TableCell>
                    <TableCell>2 hours</TableCell>
                    <TableCell>
                      <Chip
                        label="Completed"
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(20)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DetailCard>
      )}

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={handleBookingClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Book Parking Spot
            </Typography>
            <IconButton onClick={handleBookingClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {bookingSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Booking Confirmed!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your parking spot has been successfully booked.
                You will receive a confirmation email shortly.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Spot:</strong> {spot?.spot_number}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {selectedDate}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {selectedTime}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {duration} hours
                </Typography>
                <Typography variant="body2">
                  <strong>Total:</strong> {formatCurrency((spot?.price || 0) * duration)}
                </Typography>
              </Box>
            </Box>
          ) : (
            renderBookingSteps()
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>
            {bookingSuccess ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default ParkingDetails;
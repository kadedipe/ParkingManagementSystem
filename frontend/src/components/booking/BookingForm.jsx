// ============================================================================
// BookingForm Component
// ============================================================================

/**
 * BookingForm component for creating and managing parking bookings.
 * 
 * This component provides:
 * - Multi-step booking wizard
 * - Date and time selection
 * - Vehicle information
 * - Payment processing
 * - Booking confirmation
 * - Validation and error handling
 * - Responsive design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  DirectionsCar as CarIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  LocalParking as ParkingIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  EventAvailable as AvailableIcon,
  EventBusy as OccupiedIcon,
  EventNote as ReservedIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../hooks/useAuth';

// ============================================================================
// Styled Components
// ============================================================================

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StepContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
  },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const PriceBreakdown = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

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
  };

  const colors = statusColors[status] || statusColors.available;

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    borderRadius: theme.shape.borderRadius * 2,
  };
});

// ============================================================================
// Main Component
// ============================================================================

export const BookingForm = ({
  spot,
  onSuccess,
  onCancel,
  onError,
  initialStep = 0,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { createBooking, loading, error } = useBooking();
  const { user } = useAuth();

  // ==========================================================================
  // State
  // ==========================================================================

  const [activeStep, setActiveStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    // Step 1: Date & Time
    date: '',
    time: '',
    duration: 1,
    // Step 2: Vehicle
    vehicleId: '',
    licensePlate: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    specialRequests: '',
    // Step 3: Personal Info
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Step 4: Payment
    paymentMethod: 'credit_card',
    savePaymentMethod: false,
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // ==========================================================================
  // Steps Configuration
  // ==========================================================================

  const steps = [
    {
      label: 'Select Date & Time',
      icon: <CalendarIcon />,
      description: 'Choose when you want to park',
    },
    {
      label: 'Vehicle Details',
      icon: <CarIcon />,
      description: 'Provide your vehicle information',
    },
    {
      label: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Confirm your contact details',
    },
    {
      label: 'Payment',
      icon: <PaymentIcon />,
      description: 'Complete your booking',
    },
  ];

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  }, [errors]);

  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  }, [activeStep, steps.length]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setFormData({
      date: '',
      time: '',
      duration: 1,
      vehicleId: '',
      licensePlate: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      specialRequests: '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      paymentMethod: 'credit_card',
      savePaymentMethod: false,
      termsAccepted: false,
    });
    setErrors({});
    setConfirmation(null);
  }, [user]);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Date & Time
        if (!formData.date) {
          newErrors.date = 'Please select a date';
        }
        if (!formData.time) {
          newErrors.time = 'Please select a time';
        }
        if (formData.duration < 1) {
          newErrors.duration = 'Duration must be at least 1 hour';
        }
        break;

      case 1: // Vehicle
        if (!formData.licensePlate) {
          newErrors.licensePlate = 'License plate is required';
        }
        if (!formData.vehicleMake) {
          newErrors.vehicleMake = 'Vehicle make is required';
        }
        if (!formData.vehicleModel) {
          newErrors.vehicleModel = 'Vehicle model is required';
        }
        break;

      case 2: // Personal Info
        if (!formData.firstName) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.phone) {
          newErrors.phone = 'Phone number is required';
        }
        break;

      case 3: // Payment
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
        }
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'You must accept the terms and conditions';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    try {
      const bookingData = {
        spot_id: spot.id,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        vehicle: {
          license_plate: formData.licensePlate,
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          color: formData.vehicleColor,
        },
        personal_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        payment_method: formData.paymentMethod,
        special_requests: formData.specialRequests,
        save_payment_method: formData.savePaymentMethod,
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        setConfirmation(result.data);
        setSnackbarMessage('Booking confirmed successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (err) {
      setSnackbarMessage(err.message || 'Failed to create booking');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      if (onError) {
        onError(err);
      }
    }
  }, [formData, spot, createBooking, onSuccess, onError]);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderDateTimeStep();
      case 1:
        return renderVehicleStep();
      case 2:
        return renderPersonalStep();
      case 3:
        return renderPaymentStep();
      default:
        return null;
    }
  };

  const renderDateTimeStep = () => {
    return (
      <StepContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select Date & Time
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={!!errors.date}
                  helperText={errors.date}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  error={!!errors.time}
                  helperText={errors.time}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Duration (hours)</InputLabel>
              <Select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                label="Duration (hours)"
                error={!!errors.duration}
              >
                {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
                  <MenuItem key={hours} value={hours}>
                    {hours} {hours === 1 ? 'hour' : 'hours'}
                  </MenuItem>
                ))}
              </Select>
              {errors.duration && (
                <Typography variant="caption" color="error">
                  {errors.duration}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <InfoIcon color="info" />
              <Typography variant="body2" color="text.secondary">
                This spot is available for the selected time. You can extend your booking later.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StepContainer>
    );
  };

  const renderVehicleStep = () => {
    return (
      <StepContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Vehicle Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Plate"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value)}
              error={!!errors.licensePlate}
              helperText={errors.licensePlate}
              required
              placeholder="ABC-1234"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={formData.vehicleType || ''}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                label="Vehicle Type"
              >
                <MenuItem value="sedan">Sedan</MenuItem>
                <MenuItem value="suv">SUV</MenuItem>
                <MenuItem value="truck">Truck</MenuItem>
                <MenuItem value="van">Van</MenuItem>
                <MenuItem value="coupe">Coupe</MenuItem>
                <MenuItem value="convertible">Convertible</MenuItem>
                <MenuItem value="hatchback">Hatchback</MenuItem>
                <MenuItem value="wagon">Wagon</MenuItem>
                <MenuItem value="minivan">Minivan</MenuItem>
                <MenuItem value="motorcycle">Motorcycle</MenuItem>
                <MenuItem value="ev">Electric Vehicle</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Make"
              value={formData.vehicleMake}
              onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
              error={!!errors.vehicleMake}
              helperText={errors.vehicleMake}
              required
              placeholder="Toyota, Honda, etc."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model"
              value={formData.vehicleModel}
              onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
              error={!!errors.vehicleModel}
              helperText={errors.vehicleModel}
              required
              placeholder="Camry, Accord, etc."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={formData.vehicleYear}
              onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
              placeholder="2023"
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Color"
              value={formData.vehicleColor}
              onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
              placeholder="White, Black, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Special Requests"
              multiline
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Any special requirements or notes..."
            />
          </Grid>
        </Grid>
      </StepContainer>
    );
  };

  const renderPersonalStep = () => {
    return (
      <StepContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              required
              placeholder="+1 234 567 8900"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Checkbox
                checked={true}
                disabled
              />
              <Typography variant="body2" color="text.secondary">
                We'll use this information to send you booking confirmation and updates.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StepContainer>
    );
  };

  const renderPaymentStep = () => {
    const totalAmount = (spot?.price || 0) * formData.duration;

    return (
      <StepContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                <FormControlLabel
                  value="credit_card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon />
                      Credit Card
                    </Box>
                  }
                />
                <FormControlLabel
                  value="debit_card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon />
                      Debit Card
                    </Box>
                  }
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaymentIcon />
                      PayPal
                    </Box>
                  }
                />
                <FormControlLabel
                  value="apple_pay"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaymentIcon />
                      Apple Pay
                    </Box>
                  }
                />
                <FormControlLabel
                  value="google_pay"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaymentIcon />
                      Google Pay
                    </Box>
                  }
                />
              </RadioGroup>
              {errors.paymentMethod && (
                <Typography variant="caption" color="error">
                  {errors.paymentMethod}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.savePaymentMethod}
                  onChange={(e) => handleInputChange('savePaymentMethod', e.target.checked)}
                />
              }
              label="Save this payment method for future bookings"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Order Summary
            </Typography>
            <SummaryCard>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Parking Spot
                      </Typography>
                      <Typography variant="body2">
                        {spot?.spot_number}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body2">
                        {formData.date && formatDate(formData.date)} at {formData.time}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {formData.duration} {formData.duration === 1 ? 'hour' : 'hours'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Hourly Rate
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(spot?.price || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <PriceBreakdown>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={600}>
                          Total
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary">
                          {formatCurrency(totalAmount)}
                        </Typography>
                      </Box>
                    </PriceBreakdown>
                  </Grid>
                </Grid>
              </CardContent>
            </SummaryCard>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                    sx={{ textTransform: 'none', p: 0 }}
                  >
                    Terms and Conditions
                  </Button>
                  {' '}and{' '}
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                    sx={{ textTransform: 'none', p: 0 }}
                  >
                    Privacy Policy
                  </Button>
                </Typography>
              }
            />
            {errors.termsAccepted && (
              <Typography variant="caption" color="error">
                {errors.termsAccepted}
              </Typography>
            )}
          </Grid>
        </Grid>
      </StepContainer>
    );
  };

  const renderSummary = () => {
    if (!confirmation) return null;

    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your parking spot has been successfully booked. A confirmation email has been sent to your email address.
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2, textAlign: 'left' }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={600}>
              Booking Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><ParkingIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Spot" secondary={spot?.spot_number} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalendarIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Date" secondary={formatDate(confirmation.date)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><TimeIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Time" secondary={confirmation.time} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CarIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Duration" secondary={`${confirmation.duration} hours`} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={600}>
              Payment Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><PaymentIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Amount" secondary={formatCurrency(confirmation.total_amount)} />
              </ListItem>
              <ListItem>
                <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Booking ID" secondary={confirmation.booking_id} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                <ListItemText primary="Status" secondary={confirmation.status} />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
          >
            Share
          </Button>
        </Box>
      </Box>
    );
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  if (confirmation) {
    return renderSummary();
  }

  return (
    <FormContainer className={className} sx={sx} {...props}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Book Parking Spot
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {spot?.spot_number} • {spot?.spot_type}
          </Typography>
        </Box>
        {onCancel && (
          <IconButton onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{ mb: 3 }}
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: activeStep === index 
                      ? theme.palette.primary.main 
                      : activeStep > index 
                      ? theme.palette.success.main 
                      : alpha(theme.palette.primary.main, 0.1),
                    color: activeStep === index || activeStep > index 
                      ? 'white' 
                      : theme.palette.text.secondary,
                  }}
                >
                  {activeStep > index ? <CheckCircleIcon /> : step.icon}
                </Box>
              )}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {renderStepContent(index)}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={activeStep === steps.length - 1 ? null : <ArrowForwardIcon />}
                  disabled={loading}
                >
                  {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
                </Button>
                {activeStep > 0 && (
                  <Button onClick={handleBack} disabled={loading}>
                    Back
                  </Button>
                )}
                {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Progress */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Processing your booking...
          </Typography>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </FormContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default BookingForm;
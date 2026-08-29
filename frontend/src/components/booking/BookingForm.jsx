import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  CalendarToday as CalendarIcon,
  DirectionsCar as CarIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const userNames = (user) => {
  const fullName = String(user?.full_name || user?.fullName || '').trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: user?.firstName || user?.first_name || parts[0] || '',
    lastName: user?.lastName || user?.last_name || parts.slice(1).join(' ') || '',
  };
};

export const BookingForm = ({ spot, onSuccess, onCancel, onError }) => {
  const { createBooking, loading, error } = useBooking();
  const { user } = useAuth();
  const names = useMemo(() => userNames(user), [user]);

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => ({
    date: '',
    time: '',
    duration: 1,
    licensePlate: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    firstName: names.firstName,
    lastName: names.lastName,
    email: user?.email || '',
    phone: user?.phone || user?.phone_number || '',
    paymentMethod: 'credit_card',
    termsAccepted: false,
  }));

  const steps = ['Select Date & Time', 'Vehicle Details', 'Personal Information', 'Review & Confirm'];

  const updateField = useCallback((field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const validateStep = useCallback((step) => {
    const nextErrors = {};

    if (step === 0) {
      if (!formData.date) nextErrors.date = 'Please select a date';
      if (!formData.time) nextErrors.time = 'Please select a time';
      if (Number(formData.duration) < 1) nextErrors.duration = 'Duration must be at least 1 hour';

      if (formData.date && formData.time) {
        const start = new Date(`${formData.date}T${formData.time}:00`);
        if (Number.isNaN(start.getTime())) {
          nextErrors.time = 'Please select a valid date and time';
        } else if (start.getTime() <= Date.now()) {
          nextErrors.time = 'Reservation start time must be in the future';
        }
      }
    }

    if (step === 1) {
      if (!formData.licensePlate.trim()) nextErrors.licensePlate = 'License plate is required';
      if (!formData.vehicleMake.trim()) nextErrors.vehicleMake = 'Vehicle make is required';
      if (!formData.vehicleModel.trim()) nextErrors.vehicleModel = 'Vehicle model is required';
    }

    if (step === 2) {
      if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) nextErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required';
    }

    if (step === 3 && !formData.termsAccepted) {
      nextErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const submitBooking = useCallback(async () => {
    try {
      const result = await createBooking({
        spot_id: spot.id,
        date: formData.date,
        time: formData.time,
        duration: Number(formData.duration),
        vehicle: {
          license_plate: formData.licensePlate.trim(),
          make: formData.vehicleMake.trim(),
          model: formData.vehicleModel.trim(),
          year: formData.vehicleYear || null,
          color: formData.vehicleColor.trim() || null,
        },
        personal_info: {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        payment_method: formData.paymentMethod,
      });

      if (!result?.success) throw new Error(result?.message || 'Booking failed');
      onSuccess?.(result.data);
    } catch (requestError) {
      onError?.(requestError);
      setErrors((current) => ({
        ...current,
        submit: requestError?.message || 'Failed to create booking',
      }));
    }
  }, [createBooking, formData, onError, onSuccess, spot]);

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;
    if (activeStep === steps.length - 1) {
      await submitBooking();
      return;
    }
    setActiveStep((current) => current + 1);
  };

  const renderDateTime = () => (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Date"
          type="date"
          value={formData.date}
          onChange={(event) => updateField('date', event.target.value)}
          error={Boolean(errors.date)}
          helperText={errors.date || 'Choose the reservation date'}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: todayInputValue() }}
          required
        />
        <TextField
          fullWidth
          label="Time"
          type="time"
          value={formData.time}
          onChange={(event) => updateField('time', event.target.value)}
          error={Boolean(errors.time)}
          helperText={errors.time || 'Choose the reservation start time'}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Stack>
      <FormControl fullWidth error={Boolean(errors.duration)}>
        <InputLabel>Duration (hours)</InputLabel>
        <Select
          label="Duration (hours)"
          value={formData.duration}
          onChange={(event) => updateField('duration', event.target.value)}
        >
          {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
            <MenuItem key={hours} value={hours}>{hours} {hours === 1 ? 'hour' : 'hours'}</MenuItem>
          ))}
        </Select>
        {errors.duration && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.duration}</Typography>}
      </FormControl>
    </Stack>
  );

  const renderVehicle = () => (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth label="License Plate" value={formData.licensePlate} onChange={(e) => updateField('licensePlate', e.target.value.toUpperCase())} error={Boolean(errors.licensePlate)} helperText={errors.licensePlate} required />
        <TextField fullWidth label="Make" value={formData.vehicleMake} onChange={(e) => updateField('vehicleMake', e.target.value)} error={Boolean(errors.vehicleMake)} helperText={errors.vehicleMake} required />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth label="Model" value={formData.vehicleModel} onChange={(e) => updateField('vehicleModel', e.target.value)} error={Boolean(errors.vehicleModel)} helperText={errors.vehicleModel} required />
        <TextField fullWidth label="Year" type="number" value={formData.vehicleYear} onChange={(e) => updateField('vehicleYear', e.target.value)} inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }} />
        <TextField fullWidth label="Color" value={formData.vehicleColor} onChange={(e) => updateField('vehicleColor', e.target.value)} />
      </Stack>
    </Stack>
  );

  const renderPersonal = () => (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth label="First Name" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} error={Boolean(errors.firstName)} helperText={errors.firstName} required />
        <TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} error={Boolean(errors.lastName)} helperText={errors.lastName} required />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} error={Boolean(errors.email)} helperText={errors.email} required />
        <TextField fullWidth label="Phone Number" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} error={Boolean(errors.phone)} helperText={errors.phone} required />
      </Stack>
    </Stack>
  );

  const totalAmount = Number(spot?.price || spot?.hourly_rate || 0) * Number(formData.duration || 0);

  const renderReview = () => (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography fontWeight={700}>Reservation summary</Typography>
          <Typography>Spot: {spot?.spot_number || spot?.number || 'Parking spot'}</Typography>
          <Typography>Date: {formData.date}</Typography>
          <Typography>Time: {formData.time}</Typography>
          <Typography>Duration: {formData.duration} hour(s)</Typography>
          <Typography>Vehicle: {formData.vehicleMake} {formData.vehicleModel} · {formData.licensePlate}</Typography>
          <Divider />
          <Typography fontWeight={700}>Estimated total: {formatCurrency(totalAmount)}</Typography>
        </Stack>
      </Paper>
      <FormControl fullWidth>
        <InputLabel>Payment preference</InputLabel>
        <Select value={formData.paymentMethod} label="Payment preference" onChange={(e) => updateField('paymentMethod', e.target.value)}>
          <MenuItem value="credit_card">Credit Card</MenuItem>
          <MenuItem value="debit_card">Debit Card</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="apple_pay">Apple Pay</MenuItem>
          <MenuItem value="google_pay">Google Pay</MenuItem>
        </Select>
      </FormControl>
      <Alert severity="info">Your payment preference will be attached to the reservation. The built-in local processor completes the payment immediately; external providers can complete it from the Payments page.</Alert>
      <FormControlLabel
        control={<Checkbox checked={formData.termsAccepted} onChange={(e) => updateField('termsAccepted', e.target.checked)} />}
        label="I accept the terms and conditions"
      />
      {errors.termsAccepted && <Typography variant="caption" color="error">{errors.termsAccepted}</Typography>}
    </Stack>
  );

  const stepIcons = [<CalendarIcon key="date" />, <CarIcon key="car" />, <PersonIcon key="person" />, <PaymentIcon key="payment" />];

  return (
    <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Book Parking Spot</Typography>
        <Typography color="text.secondary">{spot?.spot_number || spot?.number || 'Parking spot'} · {spot?.spot_type || spot?.type || 'standard'}</Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}><StepLabel icon={stepIcons[index]}>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}
      {!errors.submit && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ minHeight: 220 }}>
        {activeStep === 0 && renderDateTime()}
        {activeStep === 1 && renderVehicle()}
        {activeStep === 2 && renderPersonal()}
        {activeStep === 3 && renderReview()}
      </Box>

      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => activeStep === 0 ? onCancel?.() : setActiveStep((current) => current - 1)}
          disabled={loading}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="contained"
          endIcon={activeStep < steps.length - 1 ? <NextIcon /> : null}
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : activeStep === steps.length - 1 ? 'Confirm Reservation' : 'Next'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default BookingForm;

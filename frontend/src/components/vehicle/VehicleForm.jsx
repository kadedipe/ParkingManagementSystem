// ============================================================================
// VehicleForm Component
// ============================================================================

/**
 * VehicleForm component for creating and editing vehicle information.
 * 
 * This component provides:
 * - Vehicle registration form
 * - Form validation
 * - Image upload for vehicle photos
 * - License plate validation
 * - VIN validation
 * - Responsive design
 * - Loading states
 * - Error handling
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
  InputAdornment,
  Tooltip,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  DirectionsCar as CarIcon,
  LocalParking as ParkingIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useVehicle } from '../../hooks/useVehicle';
import { useAuth } from '../../hooks/useAuth';
import { validateLicensePlate, validateVIN } from '../../utils/validators';

// ============================================================================
// Styled Components
// ============================================================================

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const UploadBox = styled(Box)(({ theme, dragOver }) => ({
  border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'background-color'], {
    duration: theme.transitions.duration.standard,
  }),
  backgroundColor: dragOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '75%',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[100],
  '& img': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const ValidationChip = styled(Chip)(({ theme, valid }) => ({
  backgroundColor: valid ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
  color: valid ? theme.palette.success.main : theme.palette.error.main,
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 2,
}));

// ============================================================================
// Validation Schema
// ============================================================================

const vehicleSchema = yup.object().shape({
  license_plate: yup
    .string()
    .required('License plate is required')
    .min(2, 'License plate must be at least 2 characters')
    .max(20, 'License plate must not exceed 20 characters')
    .test('license-plate', 'Invalid license plate format', (value) => {
      if (!value) return true;
      return validateLicensePlate(value);
    }),
  state: yup
    .string()
    .required('State is required')
    .length(2, 'State must be 2 characters'),
  country: yup
    .string()
    .required('Country is required')
    .length(2, 'Country must be 2 characters'),
  make: yup
    .string()
    .required('Make is required')
    .min(1, 'Make is required')
    .max(50, 'Make must not exceed 50 characters'),
  model: yup
    .string()
    .required('Model is required')
    .min(1, 'Model is required')
    .max(50, 'Model must not exceed 50 characters'),
  year: yup
    .number()
    .required('Year is required')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, `Year must be ${new Date().getFullYear() + 1} or earlier`)
    .integer('Year must be a valid number'),
  color: yup
    .string()
    .required('Color is required')
    .max(30, 'Color must not exceed 30 characters'),
  vehicle_type: yup
    .string()
    .required('Vehicle type is required'),
  fuel_type: yup
    .string()
    .required('Fuel type is required'),
  vehicle_size: yup
    .string()
    .required('Vehicle size is required'),
  vin: yup
    .string()
    .nullable()
    .test('vin', 'Invalid VIN format', (value) => {
      if (!value) return true;
      return validateVIN(value);
    }),
  engine_size: yup
    .number()
    .nullable()
    .min(0, 'Engine size must be positive')
    .max(20, 'Engine size must not exceed 20L'),
  horsepower: yup
    .number()
    .nullable()
    .min(0, 'Horsepower must be positive')
    .max(2000, 'Horsepower must not exceed 2000'),
  weight_kg: yup
    .number()
    .nullable()
    .min(0, 'Weight must be positive')
    .max(5000, 'Weight must not exceed 5000kg'),
  number_of_doors: yup
    .number()
    .nullable()
    .min(1, 'Must have at least 1 door')
    .max(6, 'Must not exceed 6 doors'),
  number_of_seats: yup
    .number()
    .nullable()
    .min(1, 'Must have at least 1 seat')
    .max(20, 'Must not exceed 20 seats'),
  registration_expiry: yup
    .date()
    .nullable()
    .min(new Date(), 'Registration expiry must be in the future'),
  insurance_expiry: yup
    .date()
    .nullable()
    .min(new Date(), 'Insurance expiry must be in the future'),
  is_ev_charging_compatible: yup
    .boolean(),
  has_permit: yup
    .boolean(),
  permit_number: yup
    .string()
    .when('has_permit', {
      is: true,
      then: (schema) => schema.required('Permit number is required when permit is enabled'),
      otherwise: (schema) => schema.nullable(),
    }),
  notes: yup
    .string()
    .nullable()
    .max(1000, 'Notes must not exceed 1000 characters'),
});

// ============================================================================
// Main Component
// ============================================================================

export const VehicleForm = ({
  vehicle = null,
  onSave,
  onCancel,
  onSuccess,
  loading = false,
  readOnly = false,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { createVehicle, updateVehicle, validatePlate } = useVehicle();
  const { user } = useAuth();
  const fileInputRef = useRef();

  // ==========================================================================
  // State
  // ==========================================================================

  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [plateValid, setPlateValid] = useState(null);
  const [vinValid, setVinValid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ==========================================================================
  // React Hook Form
  // ==========================================================================

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm({
    resolver: yupResolver(vehicleSchema),
    defaultValues: {
      license_plate: vehicle?.license_plate || '',
      state: vehicle?.state || 'CA',
      country: vehicle?.country || 'US',
      make: vehicle?.make || '',
      model: vehicle?.model || '',
      year: vehicle?.year || new Date().getFullYear(),
      color: vehicle?.color || '',
      vehicle_type: vehicle?.vehicle_type || 'sedan',
      fuel_type: vehicle?.fuel_type || 'gasoline',
      vehicle_size: vehicle?.vehicle_size || 'standard',
      vin: vehicle?.vin || '',
      engine_size: vehicle?.engine_size || null,
      horsepower: vehicle?.horsepower || null,
      weight_kg: vehicle?.weight_kg || null,
      number_of_doors: vehicle?.number_of_doors || null,
      number_of_seats: vehicle?.number_of_seats || null,
      registration_expiry: vehicle?.registration_expiry || null,
      insurance_expiry: vehicle?.insurance_expiry || null,
      is_ev_charging_compatible: vehicle?.is_ev_charging_compatible || false,
      has_permit: vehicle?.has_permit || false,
      permit_number: vehicle?.permit_number || '',
      notes: vehicle?.notes || '',
      owner_id: vehicle?.owner_id || user?.id,
    },
    mode: 'onChange',
  });

  // ==========================================================================
  // Watch Values
  // ==========================================================================

  const licensePlate = watch('license_plate');
  const vin = watch('vin');
  const hasPermit = watch('has_permit');
  const vehicleType = watch('vehicle_type');
  const fuelType = watch('fuel_type');

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    // Validate license plate in real-time
    if (licensePlate && licensePlate.length >= 2) {
      const isValid = validateLicensePlate(licensePlate);
      setPlateValid(isValid);
      if (!isValid) {
        trigger('license_plate');
      }
    } else {
      setPlateValid(null);
    }
  }, [licensePlate, trigger]);

  useEffect(() => {
    // Validate VIN in real-time
    if (vin && vin.length >= 8) {
      const isValid = validateVIN(vin);
      setVinValid(isValid);
      if (!isValid) {
        trigger('vin');
      }
    } else {
      setVinValid(null);
    }
  }, [vin, trigger]);

  // Set EV charging compatibility based on vehicle type
  useEffect(() => {
    if (vehicleType === 'ev' || vehicleType === 'hybrid') {
      setValue('is_ev_charging_compatible', true);
    }
  }, [vehicleType, setValue]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    // Filter for image files
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError('Please drop image files only');
      return;
    }

    const newImages = [...images, ...imageFiles];
    setImages(newImages);

    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handlePlateValidation = async () => {
    if (!licensePlate) return;
    try {
      const result = await validatePlate(licensePlate);
      if (result.exists) {
        setError('This license plate is already registered');
        setPlateValid(false);
      } else {
        setError(null);
        setPlateValid(true);
      }
    } catch (err) {
      // If validation fails, just show invalid
      setPlateValid(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare form data
      const formData = {
        ...data,
        owner_id: data.owner_id || user?.id,
        images: images,
      };

      let result;
      if (vehicle) {
        result = await updateVehicle(vehicle.id, formData);
        setSuccessMessage('Vehicle updated successfully');
      } else {
        result = await createVehicle(formData);
        setSuccessMessage('Vehicle created successfully');
      }

      setShowSuccess(true);
      if (onSuccess) {
        onSuccess(result);
      }
      if (onSave) {
        onSave(result);
      }

      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false);
        if (!vehicle) {
          reset();
          setImages([]);
          setImagePreviews([]);
          setActiveStep(0);
        }
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // Steps Configuration
  // ==========================================================================

  const steps = [
    {
      label: 'Basic Information',
      description: 'Vehicle details',
      icon: <CarIcon />,
    },
    {
      label: 'Vehicle Specifications',
      description: 'Technical details',
      icon: <ParkingIcon />,
    },
    {
      label: 'Registration & Documents',
      description: 'Permits and registration',
      icon: <QrCodeIcon />,
    },
  ];

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderSpecifications();
      case 2:
        return renderRegistration();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Vehicle Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="license_plate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="License Plate"
                required
                error={!!errors.license_plate}
                helperText={errors.license_plate?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{
                  endAdornment: plateValid !== null && (
                    <InputAdornment position="end">
                      <Tooltip title={plateValid ? 'Valid license plate' : 'Invalid license plate'}>
                        {plateValid ? (
                          <CheckIcon color="success" />
                        ) : (
                          <WarningIcon color="error" />
                        )}
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                onBlur={() => {
                  field.onBlur();
                  handlePlateValidation();
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="State"
                required
                error={!!errors.state}
                helperText={errors.state?.message}
                disabled={readOnly || isSubmitting}
                placeholder="CA"
                inputProps={{ maxLength: 2 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Country"
                required
                error={!!errors.country}
                helperText={errors.country?.message}
                disabled={readOnly || isSubmitting}
                placeholder="US"
                inputProps={{ maxLength: 2 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="make"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Make"
                required
                error={!!errors.make}
                helperText={errors.make?.message}
                disabled={readOnly || isSubmitting}
                placeholder="e.g., Toyota"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Model"
                required
                error={!!errors.model}
                helperText={errors.model?.message}
                disabled={readOnly || isSubmitting}
                placeholder="e.g., Camry"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Year"
                type="number"
                required
                error={!!errors.year}
                helperText={errors.year?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Color"
                required
                error={!!errors.color}
                helperText={errors.color?.message}
                disabled={readOnly || isSubmitting}
                placeholder="e.g., White"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="vehicle_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.vehicle_type}>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  {...field}
                  label="Vehicle Type"
                  disabled={readOnly || isSubmitting}
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
                  <MenuItem value="pickup">Pickup</MenuItem>
                  <MenuItem value="motorcycle">Motorcycle</MenuItem>
                  <MenuItem value="ev">Electric Vehicle</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.vehicle_type && (
                  <FormHelperText>{errors.vehicle_type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="fuel_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.fuel_type}>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  {...field}
                  label="Fuel Type"
                  disabled={readOnly || isSubmitting}
                >
                  <MenuItem value="gasoline">Gasoline</MenuItem>
                  <MenuItem value="diesel">Diesel</MenuItem>
                  <MenuItem value="electric">Electric</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                  <MenuItem value="plugin_hybrid">Plug-in Hybrid</MenuItem>
                  <MenuItem value="hydrogen">Hydrogen</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.fuel_type && (
                  <FormHelperText>{errors.fuel_type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="vehicle_size"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.vehicle_size}>
                <InputLabel>Vehicle Size</InputLabel>
                <Select
                  {...field}
                  label="Vehicle Size"
                  disabled={readOnly || isSubmitting}
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                  <MenuItem value="extra_large">Extra Large</MenuItem>
                </Select>
                {errors.vehicle_size && (
                  <FormHelperText>{errors.vehicle_size.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="vin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="VIN (Vehicle Identification Number)"
                error={!!errors.vin}
                helperText={errors.vin?.message || '17 character VIN'}
                disabled={readOnly || isSubmitting}
                InputProps={{
                  endAdornment: vinValid !== null && vin && (
                    <InputAdornment position="end">
                      <Tooltip title={vinValid ? 'Valid VIN' : 'Invalid VIN'}>
                        {vinValid ? (
                          <CheckIcon color="success" />
                        ) : (
                          <WarningIcon color="error" />
                        )}
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                inputProps={{ maxLength: 17 }}
              />
            )}
          />
        </Grid>
      </Grid>
    );
  };

  const renderSpecifications = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Vehicle Specifications
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="engine_size"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Engine Size (L)"
                type="number"
                error={!!errors.engine_size}
                helperText={errors.engine_size?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{ inputProps: { min: 0, max: 20, step: 0.1 } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="horsepower"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Horsepower (HP)"
                type="number"
                error={!!errors.horsepower}
                helperText={errors.horsepower?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{ inputProps: { min: 0, max: 2000 } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="weight_kg"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Weight (kg)"
                type="number"
                error={!!errors.weight_kg}
                helperText={errors.weight_kg?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{ inputProps: { min: 0, max: 5000 } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="number_of_doors"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Number of Doors"
                type="number"
                error={!!errors.number_of_doors}
                helperText={errors.number_of_doors?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{ inputProps: { min: 1, max: 6 } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="number_of_seats"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Number of Seats"
                type="number"
                error={!!errors.number_of_seats}
                helperText={errors.number_of_seats?.message}
                disabled={readOnly || isSubmitting}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="is_ev_charging_compatible"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly || isSubmitting}
                  />
                }
                label="EV Charging Compatible"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Vehicle Images
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            Upload images of your vehicle (max 5 images)
          </Typography>

          {imagePreviews.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {imagePreviews.map((preview, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <ImagePreview>
                    <img src={preview} alt={`Vehicle ${index + 1}`} />
                    {!readOnly && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ImagePreview>
                </Grid>
              ))}
            </Grid>
          )}

          {!readOnly && (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <UploadBox
                dragOver={dragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Drag and drop images here, or click to select
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Supported formats: JPG, PNG, GIF, WebP
                </Typography>
              </UploadBox>
            </>
          )}
        </Grid>
      </Grid>
    );
  };

  const renderRegistration = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Registration & Documents
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="registration_expiry"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Registration Expiry"
                type="date"
                error={!!errors.registration_expiry}
                helperText={errors.registration_expiry?.message}
                disabled={readOnly || isSubmitting}
                InputLabelProps={{ shrink: true }}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="insurance_expiry"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Insurance Expiry"
                type="date"
                error={!!errors.insurance_expiry}
                helperText={errors.insurance_expiry?.message}
                disabled={readOnly || isSubmitting}
                InputLabelProps={{ shrink: true }}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="has_permit"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly || isSubmitting}
                  />
                }
                label="Has Parking Permit"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="permit_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Permit Number"
                error={!!errors.permit_number}
                helperText={errors.permit_number?.message}
                disabled={readOnly || isSubmitting || !hasPermit}
                placeholder={hasPermit ? 'Enter permit number' : 'Enable permit to enter number'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Notes"
                multiline
                rows={4}
                error={!!errors.notes}
                helperText={errors.notes?.message}
                disabled={readOnly || isSubmitting}
                placeholder="Any additional notes about the vehicle..."
              />
            )}
          />
        </Grid>
      </Grid>
    );
  };

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <FormContainer className={className} sx={sx} {...props}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {vehicle ? 'Update vehicle information' : 'Register a new vehicle'}
          </Typography>
        </Box>
        {onCancel && (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
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
                  {activeStep > index ? <CheckIcon /> : step.icon}
                </Box>
              )}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {renderStepContent(index)}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {index < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                )}
                {index === steps.length - 1 && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Save Vehicle'}
                  </Button>
                )}
                {index > 0 && (
                  <Button onClick={handleBack} disabled={isSubmitting}>
                    Back
                  </Button>
                )}
                {isSubmitting && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Form Progress */}
      {isSubmitting && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Saving vehicle information...
          </Typography>
        </Box>
      )}
    </FormContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default VehicleForm;
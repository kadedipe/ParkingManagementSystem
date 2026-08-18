// ============================================================================
// Register Component
// ============================================================================

/**
 * Register component for user registration.
 * 
 * This component provides:
 * - User registration form
 * - Password strength indicator
 * - Form validation
 * - Error handling
 * - Loading states
 * - Terms and conditions acceptance
 * - Email verification flow
 * - Responsive design
 * - Animated transitions
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  useTheme,
  alpha,
  Fade,
  Slide,
  Grid,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  Email as EmailSentIcon,
  LocalParking as ParkingIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validatePasswordStrength, PasswordStrength } from '../../utils/validators';

// ============================================================================
// Styled Components
// ============================================================================

const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const RegisterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  maxWidth: 560,
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: theme.shadows[10],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    maxHeight: '95vh',
  },
}));

const BrandLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
}));

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5),
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    '&:hover': {
      backgroundColor: theme.palette.common.white,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
    },
  },
}));

const StrengthIndicator = styled(Box)(({ theme, strength }) => ({
  height: 4,
  borderRadius: 2,
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-root': {
    height: 4,
    borderRadius: 2,
  },
  '& .MuiLinearProgress-bar': {
    borderRadius: 2,
    backgroundColor: 
      strength === 'weak' ? theme.palette.error.main :
      strength === 'medium' ? theme.palette.warning.main :
      strength === 'strong' ? theme.palette.success.main :
      theme.palette.grey[400],
  },
}));

// ============================================================================
// Validation Schema
// ============================================================================

const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  termsAccepted: yup
    .boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
});

// ============================================================================
// Main Component
// ============================================================================

export const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register: registerUser, loading, error: authError } = useAuth();

  // ==========================================================================
  // State
  // ==========================================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('none');

  // ==========================================================================
  // React Hook Form
  // ==========================================================================

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
    mode: 'onChange',
  });

  const password = watch('password');
  const termsAccepted = watch('termsAccepted');

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Check password strength
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength('none');
    }
  }, [password]);

  // Clear error when user types
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [watch('email'), watch('password')]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNext = async () => {
    const fields = activeStep === 0 
      ? ['firstName', 'lastName', 'email', 'phone']
      : ['password', 'confirmPassword'];
    
    const isStepValid = await trigger(fields);
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        setShowSuccess(true);
        // Navigate to verification or login after delay
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Registration successful! Please verify your email.' }
          });
        }, 2000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
      setIsSubmitting(false);
    }
  }, [registerUser, navigate]);

  const handleSocialLogin = (provider) => {
    setError(`Social login with ${provider} is not implemented yet.`);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStrengthLabel = () => {
    const labels = {
      none: '',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
    };
    return labels[passwordStrength] || '';
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderPasswordStep();
      default:
        return null;
    }
  };

  const renderPersonalInfo = () => {
    return (
      <Stack spacing={2.5}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Personal Information
        </Typography>

        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <StyledTextField
              {...field}
              fullWidth
              label="First Name"
              placeholder="Enter your first name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              disabled={isSubmitting || showSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <StyledTextField
              {...field}
              fullWidth
              label="Last Name"
              placeholder="Enter your last name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              disabled={isSubmitting || showSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <StyledTextField
              {...field}
              fullWidth
              label="Email Address"
              placeholder="Enter your email"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting || showSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <StyledTextField
              {...field}
              fullWidth
              label="Phone Number"
              placeholder="+1 234 567 8900"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={isSubmitting || showSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Stack>
    );
  };

  const renderPasswordStep = () => {
    return (
      <Stack spacing={2.5}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Password Setup
        </Typography>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <StyledTextField
              {...field}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting || showSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={isSubmitting || showSuccess}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Password Strength Indicator */}
        {password && (
          <Box>
            <StrengthIndicator strength={passwordStrength}>
              <LinearProgress 
                variant="determinate" 
                value={
                  passwordStrength === 'weak' ? 33 :
                  passwordStrength === 'medium' ? 66 :
                  passwordStrength === 'strong' ? 100 : 0
                }
                sx={{ height: 4 }}
              />
            </StrengthIndicator>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Password strength: 
                <strong style={{ 
                  color: 
                    passwordStrength === 'weak' ? theme.palette.error.main :
                    passwordStrength === 'medium' ? theme.palette.warning.main :
                    passwordStrength === 'strong' ? theme.palette.success.main :
                    'inherit'
                }}>
                  {' '}{renderStrengthLabel()}
                </strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {password.length}/8+ characters
              </Typography>
            </Box>
          </Box>
        )}

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <StyledTextField
              {...field}
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isSubmitting || showSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                      disabled={isSubmitting || showSuccess}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="termsAccepted"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  disabled={isSubmitting || showSuccess}
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Link href="#" underline="hover" color="primary">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="#" underline="hover" color="primary">
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          )}
        />
        {errors.termsAccepted && (
          <Typography variant="caption" color="error">
            {errors.termsAccepted.message}
          </Typography>
        )}
      </Stack>
    );
  };

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <RegisterContainer>
      <Fade in timeout={800}>
        <RegisterCard elevation={3}>
          {/* Brand Logo */}
          <BrandLogo>
            <ParkingIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" fontWeight={700} color="primary">
              ParkingMS
            </Typography>
          </BrandLogo>

          <Typography variant="h5" fontWeight={600} align="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join us and start managing your parking
          </Typography>

          {/* Error Message */}
          {error && (
            <Slide direction="down" in mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Success Message */}
          {showSuccess && (
            <Slide direction="down" in mountOnEnter unmountOnExit>
              <Alert 
                severity="success" 
                sx={{ mb: 3, borderRadius: 2 }}
                icon={<VerifiedIcon />}
              >
                Account created successfully! Redirecting to login...
              </Alert>
            </Slide>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Stepper */}
            <Stepper 
              activeStep={activeStep} 
              orientation="vertical"
              sx={{ mb: 3 }}
            >
              <Step>
                <StepLabel>Personal Information</StepLabel>
                <StepContent>
                  {renderPersonalInfo()}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForwardIcon />}
                      disabled={isSubmitting || showSuccess}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Password Setup</StepLabel>
                <StepContent>
                  {renderPasswordStep()}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                      disabled={isSubmitting || showSuccess}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isValid || isSubmitting || showSuccess}
                      endIcon={!isSubmitting && !showSuccess ? <CheckCircleIcon /> : null}
                      sx={{ flex: 1 }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : showSuccess ? (
                        'Success!'
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </form>

          {/* Divider */}
          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography variant="caption" color="text.secondary">
                OR SIGN UP WITH
              </Typography>
            </Divider>
          </Box>

          {/* Social Login */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('Google')}
                disabled={isSubmitting || showSuccess}
              >
                Google
              </SocialButton>
            </Grid>
            <Grid item xs={4}>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={() => handleSocialLogin('Facebook')}
                disabled={isSubmitting || showSuccess}
              >
                Facebook
              </SocialButton>
            </Grid>
            <Grid item xs={4}>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<AppleIcon />}
                onClick={() => handleSocialLogin('Apple')}
                disabled={isSubmitting || showSuccess}
              >
                Apple
              </SocialButton>
            </Grid>
          </Grid>

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleLoginRedirect}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>

          {/* Back to Home */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/"
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon fontSize="small" />
              Back to Home
            </Link>
          </Box>

          {/* Version Info */}
          <Typography
            variant="caption"
            color="text.disabled"
            align="center"
            sx={{ mt: 2, display: 'block' }}
          >
            Version {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </Typography>
        </RegisterCard>
      </Fade>
    </RegisterContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default Register;
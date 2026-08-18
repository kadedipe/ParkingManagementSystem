// ============================================================================
// Login Component
// ============================================================================

/**
 * Login component for user authentication.
 * 
 * This component provides:
 * - Email/password login
 * - Form validation
 * - Error handling
 * - Loading states
 * - "Remember me" functionality
 * - Password reset link
 * - Social login options
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
  Card,
  CardContent,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
  ArrowForward as ArrowForwardIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Home as HomeIcon,
  LocalParking as ParkingIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ============================================================================
// Styled Components
// ============================================================================

const LoginContainer = styled(Box)(({ theme }) => ({
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

const LoginCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  maxWidth: 480,
  width: '100%',
  boxShadow: theme.shadows[10],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
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

// ============================================================================
// Validation Schema
// ============================================================================

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: yup.boolean(),
});

// ============================================================================
// Main Component
// ============================================================================

export const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError } = useAuth();

  // ==========================================================================
  // State
  // ==========================================================================

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ==========================================================================
  // React Hook Form
  // ==========================================================================

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange',
  });

  const rememberMe = watch('rememberMe');

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Check for redirect URL
  const from = location.state?.from?.pathname || '/dashboard';

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

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

  const onSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Attempt login
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Save email if remember me is checked
        if (data.rememberMe) {
          localStorage.setItem('rememberedEmail', data.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setShowSuccess(true);
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  }, [login, navigate, from]);

  const handleSocialLogin = (provider) => {
    // Social login implementation
    setError(`Social login with ${provider} is not implemented yet.`);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <LoginContainer>
      <Fade in timeout={800}>
        <LoginCard elevation={3}>
          {/* Brand Logo */}
          <BrandLogo>
            <ParkingIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" fontWeight={700} color="primary">
              ParkingMS
            </Typography>
          </BrandLogo>

          <Typography variant="h5" fontWeight={600} align="center" gutterBottom>
            Welcome Back!
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to manage your parking
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
              >
                Login successful! Redirecting...
              </Alert>
            </Slide>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              {/* Email Field */}
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

              {/* Password Field */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Controller
                  name="rememberMe"
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
                      label="Remember me"
                    />
                  )}
                />
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  sx={{ textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!isValid || isSubmitting || showSuccess}
                endIcon={!isSubmitting && !showSuccess ? <ArrowForwardIcon /> : null}
                sx={{
                  borderRadius: theme.shape.borderRadius * 2,
                  py: 1.5,
                  position: 'relative',
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : showSuccess ? (
                  'Redirecting...'
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography variant="caption" color="text.secondary">
                OR CONTINUE WITH
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

          {/* Register Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleRegister}
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Sign up
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
        </LoginCard>
      </Fade>
    </LoginContainer>
  );
};

// ============================================================================
// Login Form Skeleton
// ============================================================================

export const LoginSkeleton = () => {
  const theme = useTheme();
  
  return (
    <LoginContainer>
      <LoginCard>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mx: 'auto' }} />
        </Box>
        <Stack spacing={2.5}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="text" width={120} height={32} />
          </Box>
          <Skeleton variant="rounded" height={48} />
        </Stack>
      </LoginCard>
    </LoginContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default Login;
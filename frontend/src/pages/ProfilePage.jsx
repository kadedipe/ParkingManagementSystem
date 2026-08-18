// ============================================================================
// Profile Page
// ============================================================================

/**
 * Profile Page component for managing user profile.
 * 
 * This component provides:
 * - User profile information display
 * - Profile editing
 * - Password change
 * - Profile picture upload
 * - Notification preferences
 * - Account settings
 * - Activity history
 * - Responsive design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Skeleton,
  InputAdornment,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  LocalParking as ParkingIcon,
  EvStation as EvStationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { formatDate } from '../utils/formatters';

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[4],
  position: 'relative',
  '&:hover .upload-overlay': {
    opacity: 1,
  },
}));

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  cursor: 'pointer',
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${theme.palette.divider}`,
}));

// ============================================================================
// Main Component
// ============================================================================

export const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, loading: authLoading } = useAuth();
  const { profile, loading, error, fetchProfile, updatePreferences } = useProfile();

  // ==========================================================================
  // State
  // ==========================================================================

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    parkingAlerts: true,
    chargingAlerts: true,
    paymentAlerts: true,
  });

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setPreferences({
        emailNotifications: profile.emailNotifications ?? true,
        smsNotifications: profile.smsNotifications ?? false,
        pushNotifications: profile.pushNotifications ?? true,
        marketingEmails: profile.marketingEmails ?? false,
        parkingAlerts: profile.parkingAlerts ?? true,
        chargingAlerts: profile.chargingAlerts ?? true,
        paymentAlerts: profile.paymentAlerts ?? true,
      });
    }
  }, [profile]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFormChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value,
    });
  };

  const handlePreferenceChange = (field) => (event) => {
    setPreferences({
      ...preferences,
      [field]: event.target.checked,
    });
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
      };
      
      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      await updateProfile(updateData);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update profile');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSnackbarMessage('Password changed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to change password');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await updatePreferences(preferences);
      setSnackbarMessage('Preferences updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update preferences');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderProfileInfo = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ProfileCard>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <ProfileAvatar
                src={avatarPreview || user?.avatar || ''}
                alt={user?.firstName}
              >
                {!avatarPreview && !user?.avatar && (
                  <PersonIcon sx={{ fontSize: 60, color: theme.palette.text.secondary }} />
                )}
                <UploadOverlay className="upload-overlay">
                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                    onChange={handleAvatarUpload}
                    disabled={!isEditing}
                  />
                  <PhotoCameraIcon sx={{ color: 'white', fontSize: 30 }} />
                </UploadOverlay>
              </ProfileAvatar>
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role || 'User'}
            </Typography>
            <Chip
              label={user?.status || 'Active'}
              size="small"
              color="success"
              sx={{ mt: 1 }}
            />
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <StatItem>
                <EmailIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">{user?.email}</Typography>
                </Box>
              </StatItem>
              <StatItem sx={{ mt: 1 }}>
                <PhoneIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body2">{user?.phone || 'Not provided'}</Typography>
                </Box>
              </StatItem>
              {user?.address && (
                <StatItem sx={{ mt: 1 }}>
                  <LocationIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body2">{user.address}</Typography>
                  </Box>
                </StatItem>
              )}
              <StatItem sx={{ mt: 1 }}>
                <HistoryIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body2">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </Typography>
                </Box>
              </StatItem>
            </Box>
          </ProfileCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: theme.shape.borderRadius * 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Profile Information
              </Typography>
              <Button
                variant={isEditing ? 'outlined' : 'contained'}
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                color={isEditing ? 'error' : 'primary'}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleFormChange('firstName')}
                  disabled={!isEditing || isSaving}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleFormChange('lastName')}
                  disabled={!isEditing || isSaving}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleFormChange('phone')}
                  disabled={!isEditing || isSaving}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleFormChange('address')}
                  disabled={!isEditing || isSaving}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  value={formData.bio}
                  onChange={handleFormChange('bio')}
                  disabled={!isEditing || isSaving}
                  multiline
                  rows={3}
                  placeholder="Tell us a little about yourself..."
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderPasswordChange = () => {
    return (
      <Paper sx={{ p: 3, borderRadius: theme.shape.borderRadius * 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Change Password
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Ensure your account is using a strong password to stay secure.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Current Password</InputLabel>
              <OutlinedInput
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>New Password</InputLabel>
              <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
              />
            </FormControl>
            <FormHelperText>Password must be at least 8 characters</FormHelperText>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Confirm New Password</InputLabel>
              <OutlinedInput
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirm New Password"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleChangePassword}
              disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
              fullWidth
            >
              {isSaving ? 'Changing Password...' : 'Change Password'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderPreferences = () => {
    return (
      <Paper sx={{ p: 3, borderRadius: theme.shape.borderRadius * 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Notification Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose how you want to receive notifications.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={handlePreferenceChange('emailNotifications')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Email Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive notifications via email
                  </Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsNotifications}
                  onChange={handlePreferenceChange('smsNotifications')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">SMS Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive notifications via SMS
                  </Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications}
                  onChange={handlePreferenceChange('pushNotifications')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Push Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive push notifications on your device
                  </Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Alert Preferences
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.parkingAlerts}
                  onChange={handlePreferenceChange('parkingAlerts')}
                />
              }
              label="Parking Alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.chargingAlerts}
                  onChange={handlePreferenceChange('chargingAlerts')}
                />
              }
              label="Charging Alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.paymentAlerts}
                  onChange={handlePreferenceChange('paymentAlerts')}
                />
              }
              label="Payment Alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.marketingEmails}
                  onChange={handlePreferenceChange('marketingEmails')}
                />
              }
              label="Marketing Emails"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
              disabled={isSaving}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderActivity = () => {
    const activities = [
      { type: 'parking', title: 'Parked at Spot A-101', date: new Date(), amount: 5.00 },
      { type: 'charging', title: 'Charged at Station B-02', date: new Date(Date.now() - 2 * 60 * 60 * 1000), amount: 12.50 },
      { type: 'payment', title: 'Payment processed', date: new Date(Date.now() - 3 * 60 * 60 * 1000), amount: 17.50 },
      { type: 'parking', title: 'Reserved Spot C-305', date: new Date(Date.now() - 5 * 60 * 60 * 1000), amount: 0 },
    ];

    const getActivityIcon = (type) => {
      switch (type) {
        case 'parking':
          return <ParkingIcon />;
        case 'charging':
          return <EvStationIcon />;
        case 'payment':
          return <ReceiptIcon />;
        default:
          return <DashboardIcon />;
      }
    };

    return (
      <Paper sx={{ p: 3, borderRadius: theme.shape.borderRadius * 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={index} divider={index < activities.length - 1}>
              <ListItemIcon>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={activity.title}
                secondary={formatDate(activity.date)}
              />
              {activity.amount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {activity.type === 'payment' ? '-' : '+'}{activity.amount.toFixed(2)}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/bookings')}
        >
          View All Activity
        </Button>
      </Paper>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (authLoading || loading) {
    return (
      <PageContainer>
        <Box sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <PageContainer>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile settings and preferences
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Security" icon={<LockIcon />} iconPosition="start" />
          <Tab label="Preferences" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderProfileInfo()}
      {activeTab === 1 && renderPasswordChange()}
      {activeTab === 2 && renderPreferences()}
      {activeTab === 3 && renderActivity()}

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

export default ProfilePage;
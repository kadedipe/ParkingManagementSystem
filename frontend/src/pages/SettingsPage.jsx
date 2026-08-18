// ============================================================================
// Settings Page
// ============================================================================

/**
 * Settings Page component for managing application settings.
 * 
 * This component provides:
 * - General settings
 * - Notification settings
 * - Payment settings
 * - Security settings
 * - Privacy settings
 * - Language and region settings
 * - Theme preferences
 * - Export/Import settings
 * - Responsive design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
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
  Tooltip,
  InputAdornment,
  FormHelperText,
  Avatar,
  Badge,
  Skeleton,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel as MuiFormControlLabel,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  PrivacyTip as PrivacyIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Backup as BackupIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SystemMode as SystemModeIcon,
  Translate as TranslateIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  TwoFactorAuth as TwoFactorIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useTheme as useAppTheme } from '../hooks/useTheme';

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const SettingsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const SettingsGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const SettingsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const SettingsLabel = styled(Box)(({ theme }) => ({
  flex: 1,
  '& .MuiTypography-root': {
    fontWeight: 500,
  },
  '& .MuiTypography-caption': {
    color: theme.palette.text.secondary,
  },
}));

const ThemeOption = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
  transition: theme.transitions.create(['border-color', 'background-color'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

// ============================================================================
// Main Component
// ============================================================================

export const SettingsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme, setThemeMode } = useAppTheme();
  const {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    exportSettings,
    importSettings,
    resetSettings,
  } = useSettings();

  // ==========================================================================
  // State
  // ==========================================================================

  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'Parking Management System',
    appDescription: 'A comprehensive parking management solution',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    parkingAlerts: true,
    chargingAlerts: true,
    paymentAlerts: true,
    systemUpdates: true,
    marketingEmails: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    defaultCurrency: 'USD',
    taxRate: 0.0,
    serviceFee: 0.0,
    minPaymentAmount: 0.01,
    maxPaymentAmount: 10000,
    paymentMethods: ['credit_card', 'debit_card', 'paypal'],
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    requireStrongPassword: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfilePublic: false,
    shareAnalytics: true,
    cookiesEnabled: true,
    dataRetention: 365,
  });

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      // Populate form states with settings data
      setGeneralSettings({
        appName: settings.general?.appName || 'Parking Management System',
        appDescription: settings.general?.appDescription || '',
        language: settings.general?.language || 'en',
        timezone: settings.general?.timezone || 'UTC',
        dateFormat: settings.general?.dateFormat || 'MM/DD/YYYY',
        timeFormat: settings.general?.timeFormat || '12h',
      });
      setLanguage(settings.general?.language || 'en');
      setCurrency(settings.payment?.defaultCurrency || 'USD');
      setTimezone(settings.general?.timezone || 'UTC');
      setNotificationSettings({
        emailNotifications: settings.notifications?.email ?? true,
        smsNotifications: settings.notifications?.sms ?? false,
        pushNotifications: settings.notifications?.push ?? true,
        parkingAlerts: settings.notifications?.parkingAlerts ?? true,
        chargingAlerts: settings.notifications?.chargingAlerts ?? true,
        paymentAlerts: settings.notifications?.paymentAlerts ?? true,
        systemUpdates: settings.notifications?.systemUpdates ?? true,
        marketingEmails: settings.notifications?.marketingEmails ?? false,
      });
      setPaymentSettings({
        defaultCurrency: settings.payment?.defaultCurrency || 'USD',
        taxRate: settings.payment?.taxRate || 0,
        serviceFee: settings.payment?.serviceFee || 0,
        minPaymentAmount: settings.payment?.minPaymentAmount || 0.01,
        maxPaymentAmount: settings.payment?.maxPaymentAmount || 10000,
        paymentMethods: settings.payment?.paymentMethods || ['credit_card', 'debit_card', 'paypal'],
      });
      setSecuritySettings({
        twoFactorAuth: settings.security?.twoFactorAuth || false,
        sessionTimeout: settings.security?.sessionTimeout || 30,
        maxLoginAttempts: settings.security?.maxLoginAttempts || 5,
        passwordExpiry: settings.security?.passwordExpiry || 90,
        requireStrongPassword: settings.security?.requireStrongPassword ?? true,
      });
      setPrivacySettings({
        showProfilePublic: settings.privacy?.showProfilePublic || false,
        shareAnalytics: settings.privacy?.shareAnalytics ?? true,
        cookiesEnabled: settings.privacy?.cookiesEnabled ?? true,
        dataRetention: settings.privacy?.dataRetention || 365,
      });
    }
  }, [settings]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGeneralChange = (field) => (event) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: event.target.value,
    });
  };

  const handleNotificationChange = (field) => (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [field]: event.target.checked,
    });
  };

  const handlePaymentChange = (field) => (event) => {
    setPaymentSettings({
      ...paymentSettings,
      [field]: event.target.value,
    });
  };

  const handleSecurityChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSecuritySettings({
      ...securitySettings,
      [field]: value,
    });
  };

  const handlePrivacyChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setPrivacySettings({
      ...privacySettings,
      [field]: value,
    });
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    setGeneralSettings({
      ...generalSettings,
      language: event.target.value,
    });
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
    setPaymentSettings({
      ...paymentSettings,
      defaultCurrency: event.target.value,
    });
  };

  const handleTimezoneChange = (event) => {
    setTimezone(event.target.value);
    setGeneralSettings({
      ...generalSettings,
      timezone: event.target.value,
    });
  };

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const allSettings = {
        general: generalSettings,
        notifications: notificationSettings,
        payment: paymentSettings,
        security: securitySettings,
        privacy: privacySettings,
      };
      await updateSettings(allSettings);
      setSnackbarMessage('Settings saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to save settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSettings = async () => {
    try {
      await exportSettings();
      setSnackbarMessage('Settings exported successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setExportDialogOpen(false);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to export settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleImportSettings = async () => {
    if (!importFile) {
      setSnackbarMessage('Please select a file to import');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      await importSettings(importFile);
      setSnackbarMessage('Settings imported successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setImportDialogOpen(false);
      setImportFile(null);
      await fetchSettings();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to import settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleResetSettings = async () => {
    try {
      await resetSettings();
      setSnackbarMessage('Settings reset to default');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setResetDialogOpen(false);
      await fetchSettings();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to reset settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderGeneralSettings = () => {
    return (
      <SettingsCard>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          General Settings
        </Typography>
        <SettingsGroup>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Application Name</Typography>
              <Typography variant="caption" color="text.secondary">
                Name displayed throughout the application
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              value={generalSettings.appName}
              onChange={handleGeneralChange('appName')}
              sx={{ width: 300 }}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Application Description</Typography>
              <Typography variant="caption" color="text.secondary">
                Brief description of the application
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              value={generalSettings.appDescription}
              onChange={handleGeneralChange('appDescription')}
              sx={{ width: 300 }}
            />
          </SettingsItem>
        </SettingsGroup>

        <Divider sx={{ my: 2 }} />

        <SettingsGroup>
          <Typography variant="subtitle2" gutterBottom>
            Language & Region
          </Typography>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Language</Typography>
              <Typography variant="caption" color="text.secondary">
                Application language
              </Typography>
            </SettingsLabel>
            <FormControl size="small" sx={{ width: 200 }}>
              <Select
                value={language}
                onChange={handleLanguageChange}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
                <MenuItem value="ja">Japanese</MenuItem>
              </Select>
            </FormControl>
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Timezone</Typography>
              <Typography variant="caption" color="text.secondary">
                Application timezone
              </Typography>
            </SettingsLabel>
            <FormControl size="small" sx={{ width: 200 }}>
              <Select
                value={timezone}
                onChange={handleTimezoneChange}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">Eastern Time</MenuItem>
                <MenuItem value="CST">Central Time</MenuItem>
                <MenuItem value="MST">Mountain Time</MenuItem>
                <MenuItem value="PST">Pacific Time</MenuItem>
                <MenuItem value="GMT">GMT</MenuItem>
              </Select>
            </FormControl>
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Date Format</Typography>
              <Typography variant="caption" color="text.secondary">
                How dates are displayed
              </Typography>
            </SettingsLabel>
            <FormControl size="small" sx={{ width: 200 }}>
              <Select
                value={generalSettings.dateFormat}
                onChange={handleGeneralChange('dateFormat')}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Time Format</Typography>
              <Typography variant="caption" color="text.secondary">
                How times are displayed
              </Typography>
            </SettingsLabel>
            <FormControl size="small" sx={{ width: 200 }}>
              <Select
                value={generalSettings.timeFormat}
                onChange={handleGeneralChange('timeFormat')}
              >
                <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
              </Select>
            </FormControl>
          </SettingsItem>
        </SettingsGroup>

        <Divider sx={{ my: 2 }} />

        <SettingsGroup>
          <Typography variant="subtitle2" gutterBottom>
            Theme Preferences
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <ThemeOption
                selected={themeMode === 'light'}
                onClick={() => handleThemeChange('light')}
              >
                <LightModeIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Light
                </Typography>
              </ThemeOption>
            </Grid>
            <Grid item xs={4}>
              <ThemeOption
                selected={themeMode === 'dark'}
                onClick={() => handleThemeChange('dark')}
              >
                <DarkModeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Dark
                </Typography>
              </ThemeOption>
            </Grid>
            <Grid item xs={4}>
              <ThemeOption
                selected={themeMode === 'system'}
                onClick={() => handleThemeChange('system')}
              >
                <SystemModeIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  System
                </Typography>
              </ThemeOption>
            </Grid>
          </Grid>
        </SettingsGroup>
      </SettingsCard>
    );
  };

  const renderNotificationSettings = () => {
    const notificationOptions = [
      { key: 'emailNotifications', label: 'Email Notifications' },
      { key: 'smsNotifications', label: 'SMS Notifications' },
      { key: 'pushNotifications', label: 'Push Notifications' },
    ];

    const alertOptions = [
      { key: 'parkingAlerts', label: 'Parking Alerts' },
      { key: 'chargingAlerts', label: 'Charging Alerts' },
      { key: 'paymentAlerts', label: 'Payment Alerts' },
      { key: 'systemUpdates', label: 'System Updates' },
      { key: 'marketingEmails', label: 'Marketing Emails' },
    ];

    return (
      <SettingsCard>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Notification Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure how you want to receive notifications.
        </Typography>

        <SettingsGroup>
          <Typography variant="subtitle2" gutterBottom>
            Notification Channels
          </Typography>
          {notificationOptions.map((option) => (
            <SettingsItem key={option.key}>
              <SettingsLabel>
                <Typography variant="body2">{option.label}</Typography>
              </SettingsLabel>
              <Switch
                checked={notificationSettings[option.key]}
                onChange={handleNotificationChange(option.key)}
              />
            </SettingsItem>
          ))}
        </SettingsGroup>

        <Divider sx={{ my: 2 }} />

        <SettingsGroup>
          <Typography variant="subtitle2" gutterBottom>
            Alert Preferences
          </Typography>
          {alertOptions.map((option) => (
            <SettingsItem key={option.key}>
              <SettingsLabel>
                <Typography variant="body2">{option.label}</Typography>
              </SettingsLabel>
              <Switch
                checked={notificationSettings[option.key]}
                onChange={handleNotificationChange(option.key)}
              />
            </SettingsItem>
          ))}
        </SettingsGroup>
      </SettingsCard>
    );
  };

  const renderPaymentSettings = () => {
    return (
      <SettingsCard>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Payment Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure payment processing and currency settings.
        </Typography>

        <SettingsGroup>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Default Currency</Typography>
              <Typography variant="caption" color="text.secondary">
                Currency for all transactions
              </Typography>
            </SettingsLabel>
            <FormControl size="small" sx={{ width: 200 }}>
              <Select
                value={currency}
                onChange={handleCurrencyChange}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="CAD">CAD ($)</MenuItem>
                <MenuItem value="AUD">AUD ($)</MenuItem>
                <MenuItem value="JPY">JPY (¥)</MenuItem>
              </Select>
            </FormControl>
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Tax Rate (%)</Typography>
              <Typography variant="caption" color="text.secondary">
                Sales tax rate applied to transactions
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              type="number"
              value={paymentSettings.taxRate}
              onChange={handlePaymentChange('taxRate')}
              sx={{ width: 150 }}
              InputProps={{
                inputProps: { min: 0, max: 100, step: 0.01 },
              }}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Service Fee (%)</Typography>
              <Typography variant="caption" color="text.secondary">
                Service fee applied to transactions
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              type="number"
              value={paymentSettings.serviceFee}
              onChange={handlePaymentChange('serviceFee')}
              sx={{ width: 150 }}
              InputProps={{
                inputProps: { min: 0, max: 100, step: 0.01 },
              }}
            />
          </SettingsItem>
        </SettingsGroup>
      </SettingsCard>
    );
  };

  const renderSecuritySettings = () => {
    return (
      <SettingsCard>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Security Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage security preferences and authentication settings.
        </Typography>

        <SettingsGroup>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Two-Factor Authentication</Typography>
              <Typography variant="caption" color="text.secondary">
                Extra layer of security for your account
              </Typography>
            </SettingsLabel>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onChange={handleSecurityChange('twoFactorAuth')}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Session Timeout (minutes)</Typography>
              <Typography variant="caption" color="text.secondary">
                Automatic logout after inactivity
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={handleSecurityChange('sessionTimeout')}
              sx={{ width: 150 }}
              InputProps={{
                inputProps: { min: 5, max: 120, step: 5 },
              }}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Max Login Attempts</Typography>
              <Typography variant="caption" color="text.secondary">
                Account lockout after failed attempts
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              type="number"
              value={securitySettings.maxLoginAttempts}
              onChange={handleSecurityChange('maxLoginAttempts')}
              sx={{ width: 150 }}
              InputProps={{
                inputProps: { min: 3, max: 10, step: 1 },
              }}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Password Expiry (days)</Typography>
              <Typography variant="caption" color="text.secondary">
                Password must be changed after this many days
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              type="number"
              value={securitySettings.passwordExpiry}
              onChange={handleSecurityChange('passwordExpiry')}
              sx={{ width: 150 }}
              InputProps={{
                inputProps: { min: 30, max: 365, step: 30 },
              }}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Require Strong Password</Typography>
              <Typography variant="caption" color="text.secondary">
                Enforce strong password requirements
              </Typography>
            </SettingsLabel>
            <Switch
              checked={securitySettings.requireStrongPassword}
              onChange={handleSecurityChange('requireStrongPassword')}
            />
          </SettingsItem>
        </SettingsGroup>

        <Divider sx={{ my: 2 }} />

        <SettingsGroup>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout From All Devices
          </Button>
        </SettingsGroup>
      </SettingsCard>
    );
  };

  const renderPrivacySettings = () => {
    return (
      <SettingsCard>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Privacy Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Control your privacy and data sharing preferences.
        </Typography>

        <SettingsGroup>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Public Profile</Typography>
              <Typography variant="caption" color="text.secondary">
                Allow others to see your profile
              </Typography>
            </SettingsLabel>
            <Switch
              checked={privacySettings.showProfilePublic}
              onChange={handlePrivacyChange('showProfilePublic')}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Share Analytics</Typography>
              <Typography variant="caption" color="text.secondary">
                Help improve the application by sharing usage data
              </Typography>
            </SettingsLabel>
            <Switch
              checked={privacySettings.shareAnalytics}
              onChange={handlePrivacyChange('shareAnalytics')}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Cookies</Typography>
              <Typography variant="caption" color="text.secondary">
                Enable cookies for better experience
              </Typography>
            </SettingsLabel>
            <Switch
              checked={privacySettings.cookiesEnabled}
              onChange={handlePrivacyChange('cookiesEnabled')}
            />
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Typography variant="body2">Data Retention (days)</Typography>
              <Typography variant="caption" color="text.secondary">
                How long to keep user data
              </Typography>
            </SettingsLabel>
            <TextField
              size="small"
              type="number"
              value={privacySettings.dataRetention}
              onChange={handlePrivacyChange('dataRetention')}
              sx={{ width: 150 }}
              InputProps={{
                inputProps: { min: 30, max: 3650, step: 30 },
              }}
            />
          </SettingsItem>
        </SettingsGroup>

        <Divider sx={{ my: 2 }} />

        <SettingsGroup>
          <Typography variant="subtitle2" gutterBottom>
            Data Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setExportDialogOpen(true)}
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import Data
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setResetDialogOpen(true)}
            >
              Reset Settings
            </Button>
          </Stack>
        </SettingsGroup>
      </SettingsCard>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading && !settings) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your application settings and preferences
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

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
          <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Payment" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Privacy" icon={<PrivacyIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderGeneralSettings()}
      {activeTab === 1 && renderNotificationSettings()}
      {activeTab === 2 && renderPaymentSettings()}
      {activeTab === 3 && renderSecuritySettings()}
      {activeTab === 4 && renderPrivacySettings()}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Export all settings as a JSON file. This file can be used to import settings on another instance.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExportSettings}>
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Import settings from a JSON file. This will overwrite current settings.
          </Typography>
          <input
            type="file"
            accept=".json"
            onChange={(e) => setImportFile(e.target.files[0])}
            style={{ width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImportSettings}>
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6">Reset Settings</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to reset all settings to default? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleResetSettings}>
            Reset
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
    </PageContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default SettingsPage;
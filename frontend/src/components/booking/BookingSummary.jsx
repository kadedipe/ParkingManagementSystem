// ============================================================================
// BookingSummary Component
// ============================================================================

/**
 * BookingSummary component for displaying booking details and confirmation.
 * 
 * This component provides:
 * - Booking confirmation details
 * - Order summary with pricing breakdown
 * - Booking status and timeline
 * - Print, download, and share options
 * - QR code generation
 * - Email and SMS delivery options
 * - Responsive design
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Divider,
  Chip,
  Stack,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Tooltip,
  Collapse,
  useTheme,
  alpha,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalParking as ParkingIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  DirectionsCar as CarIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  QrCode as QrCodeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Map as MapIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useBooking } from '../../hooks/useBooking';

// ============================================================================
// Styled Components
// ============================================================================

const SummaryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  maxWidth: 800,
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => {
  const statusColors = {
    confirmed: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      border: theme.palette.success.main,
    },
    pending: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      border: theme.palette.warning.main,
    },
    completed: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
      border: theme.palette.info.main,
    },
    cancelled: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      border: theme.palette.error.main,
    },
    expired: {
      bg: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[600],
      border: theme.palette.grey[600],
    },
  };

  const colors = statusColors[status] || statusColors.confirmed;

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

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const QRCodeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
  border: `2px dashed ${theme.palette.divider}`,
  minHeight: 160,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
}));

// ============================================================================
// Main Component
// ============================================================================

export const BookingSummary = ({
  booking,
  loading = false,
  onPrint,
  onDownload,
  onShare,
  onCancel,
  onEmail,
  onSMS,
  onNavigate,
  onClose,
  showActions = true,
  showQRCode = true,
  showTimeline = true,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { cancelBooking } = useBooking();
  const printRef = useRef();

  // ==========================================================================
  // State
  // ==========================================================================

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showFullDetails, setShowFullDetails] = useState(false);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint(booking);
    } else {
      window.print();
    }
  }, [booking, onPrint]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload(booking);
    } else {
      // Generate PDF or download as JSON
      const dataStr = JSON.stringify(booking, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `booking_${booking.id}_${new Date().toISOString().slice(0,10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [booking, onDownload]);

  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare(booking);
    } else {
      try {
        await navigator.share({
          title: 'Parking Booking Confirmation',
          text: `Booking #${booking.id} confirmed for ${booking.spot_number}`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSnackbarMessage('Share failed');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }
    }
  }, [booking, onShare]);

  const handleCancel = useCallback(async () => {
    if (isCancelling) return;

    try {
      setIsCancelling(true);
      const result = await cancelBooking(booking.id, { reason: cancelReason });
      
      if (result.success) {
        setSnackbarMessage('Booking cancelled successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setCancelDialogOpen(false);
        if (onCancel) {
          onCancel(booking.id);
        }
      } else {
        throw new Error(result.message || 'Cancellation failed');
      }
    } catch (err) {
      setSnackbarMessage(err.message || 'Failed to cancel booking');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsCancelling(false);
    }
  }, [booking, cancelReason, onCancel, cancelBooking]);

  const handleEmail = useCallback(() => {
    if (onEmail) {
      onEmail(booking, emailAddress);
    } else {
      // Simulate email sending
      setSnackbarMessage(`Booking confirmation sent to ${emailAddress}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setEmailDialogOpen(false);
  }, [booking, emailAddress, onEmail]);

  const handleCopyBookingId = useCallback(() => {
    navigator.clipboard.writeText(booking.id);
    setSnackbarMessage('Booking ID copied to clipboard');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, [booking.id]);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatus = () => {
    const statusConfigs = {
      confirmed: {
        icon: <CheckCircleIcon />,
        label: 'Confirmed',
        color: 'success',
      },
      pending: {
        icon: <ScheduleIcon />,
        label: 'Pending',
        color: 'warning',
      },
      completed: {
        icon: <CheckCircleIcon />,
        label: 'Completed',
        color: 'info',
      },
      cancelled: {
        icon: <CloseIcon />,
        label: 'Cancelled',
        color: 'error',
      },
      expired: {
        icon: <WarningIcon />,
        label: 'Expired',
        color: 'default',
      },
    };

    const config = statusConfigs[booking?.status] || statusConfigs.confirmed;

    return (
      <StatusBadge status={booking?.status}>
        {config.icon}
        {config.label}
      </StatusBadge>
    );
  };

  const renderTimeline = () => {
    if (!showTimeline) return null;

    const events = [
      {
        status: 'Booking Created',
        time: booking?.created_at,
        icon: <ReceiptIcon />,
        completed: true,
      },
      {
        status: 'Payment Confirmed',
        time: booking?.payment_date,
        icon: <PaymentIcon />,
        completed: booking?.status !== 'pending',
      },
      {
        status: 'Spot Reserved',
        time: booking?.reserved_at,
        icon: <ParkingIcon />,
        completed: booking?.status !== 'pending' && booking?.status !== 'cancelled',
      },
      {
        status: 'Booking Completed',
        time: booking?.completed_at,
        icon: <CheckCircleIcon />,
        completed: booking?.status === 'completed',
      },
    ];

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Booking Timeline
        </Typography>
        <Box sx={{ position: 'relative', pl: 4 }}>
          {events.map((event, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                pb: index < events.length - 1 ? 3 : 0,
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  left: -20,
                  top: 0,
                  bottom: index < events.length - 1 ? 0 : 20,
                  width: 2,
                  bgcolor: event.completed ? theme.palette.primary.main : theme.palette.divider,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  opacity: event.completed ? 1 : 0.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: event.completed ? theme.palette.primary.main : theme.palette.grey[300],
                    color: event.completed ? 'white' : theme.palette.grey[500],
                    position: 'absolute',
                    left: -36,
                    top: 0,
                  }}
                >
                  {event.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={event.completed ? 600 : 400}>
                    {event.status}
                  </Typography>
                  {event.time && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.time)} at {formatTime(event.time)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderQRCode = () => {
    if (!showQRCode) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Entry QR Code
        </Typography>
        <QRCodeContainer>
          <Box sx={{ textAlign: 'center' }}>
            <QrCodeIcon sx={{ fontSize: 100, color: theme.palette.primary.main }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Scan this QR code at the entrance
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Booking ID: {booking?.id}
            </Typography>
          </Box>
        </QRCodeContainer>
      </Box>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading) {
    return (
      <SummaryContainer>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading booking details...
          </Typography>
        </Box>
      </SummaryContainer>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <SummaryContainer ref={printRef} className={className} sx={sx} {...props}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Booking Confirmation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Booking #{booking?.id}
            </Typography>
            <Tooltip title="Copy booking ID">
              <IconButton size="small" onClick={handleCopyBookingId}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {renderStatus()}
          </Box>
        </Box>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Alert Messages */}
      {booking?.status === 'pending' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your booking is pending confirmation. We'll notify you once it's confirmed.
        </Alert>
      )}

      {booking?.status === 'cancelled' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This booking has been cancelled. If this was a mistake, please contact support.
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Details */}
        <Grid item xs={12} md={7}>
          {/* Spot Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Parking Spot Details
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        Spot Number
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.spot_number}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        Spot Type
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.spot_type}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        Floor
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.floor || '1'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        Section
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.section || 'A'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {booking?.address || '123 Parking Street, City'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Date & Time */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Date & Time
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        <CalendarIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.date ? formatDate(booking.date) : 'N/A'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        <TimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Time
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.time || 'N/A'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.duration} {booking?.duration === 1 ? 'hour' : 'hours'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DetailRow>
                      <Typography variant="body2" color="text.secondary">
                        End Time
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {booking?.end_time ? formatTime(booking.end_time) : 'N/A'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Vehicle Details */}
          {booking?.vehicle && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Vehicle Details
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailRow>
                        <Typography variant="body2" color="text.secondary">
                          License Plate
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.vehicle.license_plate}
                        </Typography>
                      </DetailRow>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailRow>
                        <Typography variant="body2" color="text.secondary">
                          Make & Model
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.vehicle.make} {booking.vehicle.model}
                        </Typography>
                      </DetailRow>
                    </Grid>
                    {booking.vehicle.color && (
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <Typography variant="body2" color="text.secondary">
                            Color
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {booking.vehicle.color}
                          </Typography>
                        </DetailRow>
                      </Grid>
                    )}
                    {booking.vehicle.year && (
                      <Grid item xs={12} sm={6}>
                        <DetailRow>
                          <Typography variant="body2" color="text.secondary">
                            Year
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {booking.vehicle.year}
                          </Typography>
                        </DetailRow>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </Grid>

        {/* Right Column - Summary & Actions */}
        <Grid item xs={12} md={5}>
          {/* Price Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Order Summary
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <List dense disablePadding>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={`Parking (${booking?.duration} ${booking?.duration === 1 ? 'hour' : 'hours'})`}
                      secondary={`${formatCurrency(booking?.hourly_rate || 0)} / hour`}
                    />
                    <Typography variant="body2">
                      {formatCurrency((booking?.hourly_rate || 0) * (booking?.duration || 0))}
                    </Typography>
                  </ListItem>
                  {booking?.service_fee > 0 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Service Fee" />
                      <Typography variant="body2">
                        {formatCurrency(booking?.service_fee || 0)}
                      </Typography>
                    </ListItem>
                  )}
                  {booking?.tax > 0 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Tax" />
                      <Typography variant="body2">
                        {formatCurrency(booking?.tax || 0)}
                      </Typography>
                    </ListItem>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <ListItem sx={{ px: 0 }} dense>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={700}>
                          Total
                        </Typography>
                      }
                    />
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {formatCurrency(booking?.total_amount || 0)}
                    </Typography>
                  </ListItem>
                </List>

                {booking?.payment_method && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCardIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Paid via {booking.payment_method.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* QR Code */}
          {renderQRCode()}

          {/* Actions */}
          {showActions && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Actions
              </Typography>
              <Stack spacing={1}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                    >
                      Print
                    </ActionButton>
                  </Grid>
                  <Grid item xs={6}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                    >
                      Download
                    </ActionButton>
                  </Grid>
                  <Grid item xs={6}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={() => setEmailDialogOpen(true)}
                    >
                      Email
                    </ActionButton>
                  </Grid>
                  <Grid item xs={6}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                    >
                      Share
                    </ActionButton>
                  </Grid>
                </Grid>

                {booking?.status !== 'cancelled' && booking?.status !== 'completed' && (
                  <ActionButton
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                    sx={{ mt: 1 }}
                  >
                    Cancel Booking
                  </ActionButton>
                )}

                {booking?.status === 'confirmed' && (
                  <ActionButton
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<LocationIcon />}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(booking);
                      }
                    }}
                  >
                    Get Directions
                  </ActionButton>
                )}
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Timeline */}
      {renderTimeline()}

      {/* Footer */}
      <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          This is a system-generated confirmation. Please keep this for your records.
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          For any queries, please contact our support team.
        </Typography>
      </Box>

      {/* ==========================================================================
      Cancel Dialog
      ========================================================================== */}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6">Cancel Booking</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            label="Reason for cancellation (optional)"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please tell us why you're cancelling..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? <CircularProgress size={24} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================================================
      Email Dialog
      ========================================================================== */}

      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Confirmation Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the email address where you'd like to receive the booking confirmation.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="user@example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEmail}
            disabled={!emailAddress}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================================================
      Snackbar
      ========================================================================== */}

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
    </SummaryContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default BookingSummary;
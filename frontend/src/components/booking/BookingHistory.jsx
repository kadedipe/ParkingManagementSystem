// ============================================================================
// BookingHistory Component
// ============================================================================

/**
 * BookingHistory component for displaying and managing booking history.
 * 
 * This component provides:
 * - List of past and upcoming bookings
 * - Filtering and search functionality
 * - Status indicators
 * - Quick actions (view, cancel, rebook)
 * - Pagination
 * - Export functionality
 * - Responsive design
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  Badge,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Chip as MuiChip,
  Rating,
  Collapse,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Replay as RebookIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalParking as ParkingIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterAltIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  DownloadDone as DownloadDoneIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useBooking } from '../../hooks/useBooking';

// ============================================================================
// Styled Components
// ============================================================================

const HistoryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    confirmed: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
    },
    pending: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
    },
    completed: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
    },
    cancelled: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
    },
    expired: {
      bg: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[600],
    },
  };

  const colors = statusColors[status] || statusColors.confirmed;

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    borderRadius: theme.shape.borderRadius * 2,
    '& .MuiChip-label': {
      textTransform: 'capitalize',
    },
  };
});

const BookingCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&:last-child': {
    marginBottom: 0,
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

// ============================================================================
// Main Component
// ============================================================================

export const BookingHistory = ({
  bookings = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onViewBooking,
  onCancelBooking,
  onRebookBooking,
  onExport,
  onRefresh,
  showFilters = true,
  showStats = true,
  viewMode = 'list', // 'list' | 'grid'
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { cancelBooking } = useBooking();

  // ==========================================================================
  // State
  // ==========================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedBookings, setExpandedBookings] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isCancelling, setIsCancelling] = useState(false);

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) ||
          booking.spot_number?.toLowerCase().includes(query) ||
          booking.vehicle?.license_plate?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    switch (dateFilter) {
      case 'upcoming':
        result = result.filter((booking) => new Date(booking.date) >= now);
        break;
      case 'past':
        result = result.filter((booking) => new Date(booking.date) < now);
        break;
      case 'today':
        result = result.filter(
          (booking) =>
            new Date(booking.date).toDateString() === now.toDateString()
        );
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter(
          (booking) => new Date(booking.date) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        result = result.filter(
          (booking) => new Date(booking.date) >= monthAgo
        );
        break;
      default:
        break;
    }

    // Sort
    switch (sortBy) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date_desc':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'price_asc':
        result.sort((a, b) => a.total_amount - b.total_amount);
        break;
      case 'price_desc':
        result.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case 'status':
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }

    return result;
  }, [bookings, searchQuery, statusFilter, dateFilter, sortBy]);

  // ==========================================================================
  // Statistics
  // ==========================================================================

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const totalSpent = bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled,
      totalSpent,
      active: confirmed + pending,
    };
  }, [bookings]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking || isCancelling) return;

    try {
      setIsCancelling(true);
      const result = await cancelBooking(selectedBooking.id);
      
      if (result.success) {
        setSnackbarMessage('Booking cancelled successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setCancelDialogOpen(false);
        if (onCancelBooking) {
          onCancelBooking(selectedBooking.id);
        }
        // Refresh the list
        if (onRefresh) {
          onRefresh();
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
  };

  const handleRebookBooking = (booking) => {
    if (onRebookBooking) {
      onRebookBooking(booking);
    }
  };

  const handleExport = (format) => {
    if (onExport) {
      onExport(filteredBookings, format);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleToggleExpand = (bookingId) => {
    setExpandedBookings((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatusChip = (status) => {
    const statusConfigs = {
      confirmed: { icon: <CheckCircleIcon />, label: 'Confirmed' },
      pending: { icon: <ScheduleIcon />, label: 'Pending' },
      completed: { icon: <CheckCircleIcon />, label: 'Completed' },
      cancelled: { icon: <CloseIcon />, label: 'Cancelled' },
      expired: { icon: <WarningIcon />, label: 'Expired' },
    };

    const config = statusConfigs[status] || statusConfigs.confirmed;

    return (
      <StatusChip
        status={status}
        icon={config.icon}
        label={config.label}
        size="small"
      />
    );
  };

  const renderBookingCard = (booking) => {
    const isExpanded = expandedBookings[booking.id] || false;

    return (
      <BookingCard key={booking.id}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Booking Info */}
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <ParkingIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Spot {booking.spot_number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Booking #{booking.id}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Date & Time */}
            <Grid item xs={12} sm={3} md={2}>
              <Box>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon fontSize="small" />
                  {formatDate(booking.date)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon fontSize="small" />
                  {booking.time}
                </Typography>
              </Box>
            </Grid>

            {/* Status & Price */}
            <Grid item xs={12} sm={3} md={2}>
              <Box>
                {renderStatusChip(booking.status)}
                <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                  {formatCurrency(booking.total_amount || 0)}
                </Typography>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12} sm={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 0.5 }}>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => handleViewBooking(booking)}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                {booking.status === 'confirmed' && (
                  <>
                    <Tooltip title="Cancel Booking">
                      <IconButton size="small" color="error" onClick={() => handleCancelBooking(booking)}>
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rebook">
                      <IconButton size="small" color="primary" onClick={() => handleRebookBooking(booking)}>
                        <RebookIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <IconButton size="small" onClick={() => handleToggleExpand(booking.id)}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, booking)}>
                  <MoreIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* Expanded Details */}
            <Grid item xs={12}>
              <Collapse in={isExpanded}>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Vehicle Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>License Plate:</strong> {booking.vehicle?.license_plate || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Make & Model:</strong> {booking.vehicle?.make || 'N/A'} {booking.vehicle?.model || ''}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Color:</strong> {booking.vehicle?.color || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Payment Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Method:</strong> {booking.payment_method || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Amount:</strong> {formatCurrency(booking.total_amount || 0)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {booking.payment_status || 'N/A'}
                    </Typography>
                  </Grid>
                  {booking.special_requests && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Special Requests
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.special_requests}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </CardContent>
      </BookingCard>
    );
  };

  const renderTableView = () => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking</TableCell>
              <TableCell>Spot</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    #{booking.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {booking.spot_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(booking.date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.time}
                  </Typography>
                </TableCell>
                <TableCell>
                  {renderStatusChip(booking.status)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(booking.total_amount || 0)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewBooking(booking)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {booking.status === 'confirmed' && (
                      <>
                        <Tooltip title="Cancel Booking">
                          <IconButton size="small" color="error" onClick={() => handleCancelBooking(booking)}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rebook">
                          <IconButton size="small" color="primary" onClick={() => handleRebookBooking(booking)}>
                            <RebookIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading && bookings.length === 0) {
    return (
      <HistoryContainer>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading your bookings...
          </Typography>
        </Box>
      </HistoryContainer>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error) {
    return (
      <HistoryContainer>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </HistoryContainer>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <HistoryContainer className={className} sx={sx} {...props}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Booking History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total} bookings found
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      {showStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="primary">
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Bookings
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.confirmed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Confirmed
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {stats.completed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {stats.cancelled}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cancelled
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700}>
                {formatCurrency(stats.totalSpent)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Spent
              </Typography>
            </StatBox>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      {showFilters && (
        <FilterBar>
          <TextField
            size="small"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleDateFilterChange}
              label="Status"
            >
              <SelectMenuItem value="all">All</SelectMenuItem>
              <SelectMenuItem value="confirmed">Confirmed</SelectMenuItem>
              <SelectMenuItem value="pending">Pending</SelectMenuItem>
              <SelectMenuItem value="completed">Completed</SelectMenuItem>
              <SelectMenuItem value="cancelled">Cancelled</SelectMenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              label="Date"
            >
              <SelectMenuItem value="all">All Time</SelectMenuItem>
              <SelectMenuItem value="today">Today</SelectMenuItem>
              <SelectMenuItem value="upcoming">Upcoming</SelectMenuItem>
              <SelectMenuItem value="past">Past</SelectMenuItem>
              <SelectMenuItem value="week">Last 7 Days</SelectMenuItem>
              <SelectMenuItem value="month">Last 30 Days</SelectMenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
            >
              <SelectMenuItem value="date_desc">Newest First</SelectMenuItem>
              <SelectMenuItem value="date_asc">Oldest First</SelectMenuItem>
              <SelectMenuItem value="price_desc">Highest Price</SelectMenuItem>
              <SelectMenuItem value="price_asc">Lowest Price</SelectMenuItem>
              <SelectMenuItem value="status">By Status</SelectMenuItem>
            </Select>
          </FormControl>
        </FilterBar>
      )}

      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredBookings.length} of {total} bookings
        </Typography>
        {loading && <CircularProgress size={20} />}
      </Box>

      {/* Loading Overlay */}
      {loading && bookings.length > 0 && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ReceiptIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Bookings Found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {searchQuery ? 'Try adjusting your search or filters' : 'You haven\'t made any bookings yet'}
          </Typography>
          {searchQuery && (
            <Button variant="outlined" onClick={handleClearSearch} sx={{ mt: 2 }}>
              Clear Search
            </Button>
          )}
        </Box>
      )}

      {/* Bookings List / Grid */}
      {filteredBookings.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {filteredBookings.map((booking) => (
                <Grid item xs={12} md={6} key={booking.id}>
                  {renderBookingCard(booking)}
                </Grid>
              ))}
            </Grid>
          ) : (
            renderTableView()
          )}
        </>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={(e, newPage) => onPageChange(e, newPage + 1)}
          onRowsPerPageChange={(e) => onPageSizeChange(e, parseInt(e.target.value, 10))}
          sx={{ mt: 2 }}
        />
      )}

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
          <Typography variant="body2">
            <strong>Booking:</strong> #{selectedBooking?.id}
          </Typography>
          <Typography variant="body2">
            <strong>Spot:</strong> {selectedBooking?.spot_number}
          </Typography>
          <Typography variant="body2">
            <strong>Date:</strong> {selectedBooking?.date && formatDate(selectedBooking.date)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
          >
            {isCancelling ? <CircularProgress size={24} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================================================
      Details Dialog
      ========================================================================== */}

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Booking Details
            </Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    #{selectedBooking.id}
                  </Typography>
                  {renderStatusChip(selectedBooking.status)}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Spot Details
                </Typography>
                <Typography variant="body2">
                  <strong>Number:</strong> {selectedBooking.spot_number}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedBooking.spot_type || 'Standard'}
                </Typography>
                <Typography variant="body2">
                  <strong>Floor:</strong> {selectedBooking.floor || '1'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Date & Time
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {formatDate(selectedBooking.date)}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {selectedBooking.time}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {selectedBooking.duration} hours
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Vehicle Details
                </Typography>
                <Typography variant="body2">
                  <strong>License Plate:</strong> {selectedBooking.vehicle?.license_plate || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Make & Model:</strong> {selectedBooking.vehicle?.make || 'N/A'} {selectedBooking.vehicle?.model || ''}
                </Typography>
                <Typography variant="body2">
                  <strong>Color:</strong> {selectedBooking.vehicle?.color || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Payment Details
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> {formatCurrency(selectedBooking.total_amount || 0)}
                </Typography>
                <Typography variant="body2">
                  <strong>Method:</strong> {selectedBooking.payment_method || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedBooking.payment_status || 'N/A'}
                </Typography>
              </Grid>
              {selectedBooking.special_requests && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Special Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.special_requests}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedBooking?.status === 'confirmed' && (
            <Button
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => {
                setDetailsDialogOpen(false);
                handleCancelBooking(selectedBooking);
              }}
            >
              Cancel
            </Button>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================================================
      Menu
      ========================================================================== */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleViewBooking(selectedBooking); handleMenuClose(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {selectedBooking?.status === 'confirmed' && (
          <>
            <MenuItem onClick={() => { handleCancelBooking(selectedBooking); handleMenuClose(); }}>
              <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Cancel</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleRebookBooking(selectedBooking); handleMenuClose(); }}>
              <ListItemIcon><RebookIcon fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText>Rebook</ListItemText>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => { handleExport('pdf'); handleMenuClose(); }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleExport('csv'); handleMenuClose(); }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
      </Menu>

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
    </HistoryContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default BookingHistory;
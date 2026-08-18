// ============================================================================
// Bookings Page
// ============================================================================

/**
 * Bookings Page component for managing all user bookings.
 * 
 * This component provides:
 * - List of all bookings (past, current, upcoming)
 * - Filtering by status, date, and type
 * - Search functionality
 * - Booking actions (view, cancel, rebook)
 * - Booking statistics
 * - Export functionality
 * - Responsive design
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  useTheme,
  alpha,
  Badge,
  Stack,
  Divider,
  Alert,
  Skeleton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalParking as ParkingIcon,
  EvStation as EvStationIcon,
  Receipt as ReceiptIcon,
  MoreVert as MoreIcon,
  ArrowBack as ArrowBackIcon,
  Replay as RebookIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../hooks/useAuth';

// Import components
import { BookingHistory } from '../components/booking/BookingHistory';
import { BookingSummary } from '../components/booking/BookingSummary';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// ============================================================================
// Styled Components
// ============================================================================

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  textAlign: 'center',
  height: '100%',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
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

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

// ============================================================================
// Main Component
// ============================================================================

export const BookingsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bookings,
    loading,
    error,
    total,
    stats,
    fetchBookings,
    cancelBooking,
    rebookBooking,
    exportBookings,
  } = useBookings();

  // ==========================================================================
  // State
  // ==========================================================================

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    loadBookings();
  }, [page, pageSize, statusFilter, typeFilter, dateFilter, sortBy]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const loadBookings = useCallback(async () => {
    try {
      await fetchBookings({
        page,
        pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        date: dateFilter !== 'all' ? dateFilter : undefined,
        sort: sortBy,
        search: searchQuery,
      });
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  }, [fetchBookings, page, pageSize, statusFilter, typeFilter, dateFilter, sortBy, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBookings();
    setIsRefreshing(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
    setPage(1);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      setIsCancelling(true);
      await cancelBooking(selectedBooking.id);
      setSnackbarMessage('Booking cancelled successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowCancelDialog(false);
      await loadBookings();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to cancel booking');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRebookBooking = async (booking) => {
    try {
      const result = await rebookBooking(booking.id);
      if (result.success) {
        setSnackbarMessage('Booking rebooked successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        await loadBookings();
        if (result.booking_id) {
          navigate(`/bookings/${result.booking_id}`);
        }
      }
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to rebook');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleExport = async (format) => {
    try {
      await exportBookings(format);
      setSnackbarMessage(`Bookings exported as ${format.toUpperCase()}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to export bookings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const activeFilters = useMemo(() => {
    const filters = [];
    if (statusFilter !== 'all') filters.push('status');
    if (typeFilter !== 'all') filters.push('type');
    if (dateFilter !== 'all') filters.push('date');
    if (searchQuery) filters.push('search');
    return filters;
  }, [statusFilter, typeFilter, dateFilter, searchQuery]);

  const hasActiveFilters = activeFilters.length > 0;

  // ==========================================================================
  // Render Stats
  // ==========================================================================

  const renderStats = () => {
    if (!stats) return null;

    const statItems = [
      {
        label: 'Total Bookings',
        value: stats.total || 0,
        color: theme.palette.primary.main,
        icon: <ReceiptIcon />,
      },
      {
        label: 'Active',
        value: stats.active || 0,
        color: theme.palette.success.main,
        icon: <CheckCircleIcon />,
      },
      {
        label: 'Pending',
        value: stats.pending || 0,
        color: theme.palette.warning.main,
        icon: <ScheduleIcon />,
      },
      {
        label: 'Completed',
        value: stats.completed || 0,
        color: theme.palette.info.main,
        icon: <CheckCircleIcon />,
      },
      {
        label: 'Cancelled',
        value: stats.cancelled || 0,
        color: theme.palette.error.main,
        icon: <CancelIcon />,
      },
      {
        label: 'Total Spent',
        value: formatCurrency(stats.totalSpent || 0),
        color: theme.palette.primary.main,
        icon: <ReceiptIcon />,
      },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statItems.map((stat, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <StatsCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={700} color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </StatsCard>
          </Grid>
        ))}
      </Grid>
    );
  };

  // ==========================================================================
  // Render Filters
  // ==========================================================================

  const renderFilters = () => {
    return (
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
            onChange={handleStatusFilterChange}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            label="Type"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="parking">Parking</MenuItem>
            <MenuItem value="charging">Charging</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Date</InputLabel>
          <Select
            value={dateFilter}
            onChange={handleDateFilterChange}
            label="Date"
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="past">Past</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Sort By"
          >
            <MenuItem value="date_desc">Newest First</MenuItem>
            <MenuItem value="date_asc">Oldest First</MenuItem>
            <MenuItem value="price_desc">Highest Price</MenuItem>
            <MenuItem value="price_asc">Lowest Price</MenuItem>
            <MenuItem value="status">By Status</MenuItem>
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            size="small"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setDateFilter('all');
              setSearchQuery('');
            }}
            startIcon={<ClearIcon />}
          >
            Clear All
          </Button>
        )}
      </FilterBar>
    );
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading && !bookings.length) {
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all your parking and charging bookings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleMenuOpen}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More actions">
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleExport('csv'); handleMenuClose(); }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleExport('pdf'); handleMenuClose(); }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleExport('excel'); handleMenuClose(); }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>
      </Menu>

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Bookings List */}
      <ErrorBoundary>
        <BookingHistory
          bookings={bookings}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          viewMode={viewMode}
          onViewBooking={handleViewBooking}
          onCancelBooking={handleCancelBooking}
          onRebookBooking={handleRebookBooking}
          onPageChange={handlePageChange}
          onPageSizeChange={(e, newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onViewModeChange={handleViewModeChange}
          onRefresh={handleRefresh}
          onExport={handleExport}
          showFilters={false}
          showStats={false}
        />
      </ErrorBoundary>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog
          open={showDetails}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Booking Details
              </Typography>
              <IconButton onClick={handleCloseDetails}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <BookingSummary
              booking={selectedBooking}
              showActions={selectedBooking.status === 'confirmed'}
              onCancel={() => {
                handleCloseDetails();
                handleCancelBooking(selectedBooking);
              }}
              onRebook={() => {
                handleCloseDetails();
                handleRebookBooking(selectedBooking);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
            {selectedBooking.status === 'confirmed' && (
              <>
                <Button
                  color="error"
                  onClick={() => {
                    handleCloseDetails();
                    handleCancelBooking(selectedBooking);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={() => {
                    handleCloseDetails();
                    handleRebookBooking(selectedBooking);
                  }}
                >
                  Rebook
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
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
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Booking:</strong> #{selectedBooking.id}
              </Typography>
              <Typography variant="body2">
                <strong>Spot:</strong> {selectedBooking.spot_number}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(selectedBooking.date)}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {formatCurrency(selectedBooking.total_amount || 0)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Keep Booking</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
            startIcon={isCancelling ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
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

export default BookingsPage;
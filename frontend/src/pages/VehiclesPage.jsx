// ============================================================================
// Vehicles Page
// ============================================================================

/**
 * Vehicles Page component for managing user vehicles.
 * 
 * This component provides:
 * - List of all vehicles
 * - Add, edit, delete vehicles
 * - Vehicle search and filtering
 * - Vehicle details view
 * - Status management
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
  Fab,
  Zoom,
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
  Add as AddIcon,
  DirectionsCar as CarIcon,
  ElectricCar as EvIcon,
  LocalGasStation as FuelIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatters';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../hooks/useAuth';

// Import components
import { VehicleList } from '../components/vehicle/VehicleList';
import { VehicleForm } from '../components/vehicle/VehicleForm';
import { VehicleDetails } from '../components/vehicle/VehicleDetails';
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

const FabContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: theme.zIndex.speedDial,
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

// ============================================================================
// Main Component
// ============================================================================

export const VehiclesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    vehicles,
    loading,
    error,
    total,
    stats,
    fetchVehicles,
    deleteVehicle,
    exportVehicles,
  } = useVehicles();

  // ==========================================================================
  // State
  // ==========================================================================

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    loadVehicles();
  }, [page, pageSize, statusFilter, typeFilter, sortBy]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const loadVehicles = useCallback(async () => {
    try {
      await fetchVehicles({
        page,
        pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sort: sortBy,
        search: searchQuery,
      });
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  }, [fetchVehicles, page, pageSize, statusFilter, typeFilter, sortBy, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVehicles();
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

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedVehicle(null);
  };

  const handleAddVehicle = () => {
    setFormMode('create');
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setFormMode('edit');
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedVehicle(null);
  };

  const handleFormSuccess = (vehicle) => {
    setShowForm(false);
    setSnackbarMessage(
      formMode === 'create' 
        ? 'Vehicle added successfully!' 
        : 'Vehicle updated successfully!'
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    loadVehicles();
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVehicle) return;
    
    try {
      setIsDeleting(true);
      await deleteVehicle(selectedVehicle.id);
      setSnackbarMessage('Vehicle deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      await loadVehicles();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to delete vehicle');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await exportVehicles(format);
      setSnackbarMessage(`Vehicles exported as ${format.toUpperCase()}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to export vehicles');
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
    if (searchQuery) filters.push('search');
    return filters;
  }, [statusFilter, typeFilter, searchQuery]);

  const hasActiveFilters = activeFilters.length > 0;

  // ==========================================================================
  // Render Stats
  // ==========================================================================

  const renderStats = () => {
    if (!stats) return null;

    const statItems = [
      {
        label: 'Total Vehicles',
        value: stats.total || 0,
        color: theme.palette.primary.main,
        icon: <CarIcon />,
      },
      {
        label: 'Active',
        value: stats.active || 0,
        color: theme.palette.success.main,
        icon: <CheckCircleIcon />,
      },
      {
        label: 'Inactive',
        value: stats.inactive || 0,
        color: theme.palette.error.main,
        icon: <CancelIcon />,
      },
      {
        label: 'EV Vehicles',
        value: stats.ev || 0,
        color: theme.palette.info.main,
        icon: <EvIcon />,
      },
      {
        label: 'Hybrid',
        value: stats.hybrid || 0,
        color: theme.palette.success.main,
        icon: <FuelIcon />,
      },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statItems.map((stat, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
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
          placeholder="Search vehicles..."
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
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
            <MenuItem value="sedan">Sedan</MenuItem>
            <MenuItem value="suv">SUV</MenuItem>
            <MenuItem value="truck">Truck</MenuItem>
            <MenuItem value="ev">Electric</MenuItem>
            <MenuItem value="hybrid">Hybrid</MenuItem>
            <MenuItem value="motorcycle">Motorcycle</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Sort By"
          >
            <MenuItem value="make_asc">Make A-Z</MenuItem>
            <MenuItem value="make_desc">Make Z-A</MenuItem>
            <MenuItem value="year_desc">Newest First</MenuItem>
            <MenuItem value="year_asc">Oldest First</MenuItem>
            <MenuItem value="created_at_desc">Recently Added</MenuItem>
            <MenuItem value="created_at_asc">Oldest Added</MenuItem>
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            size="small"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
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

  if (loading && !vehicles.length) {
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
            My Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all your registered vehicles
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
          <Tooltip title="Add Vehicle">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddVehicle}
            >
              Add Vehicle
            </Button>
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

      {/* Vehicles List */}
      <ErrorBoundary>
        <VehicleList
          vehicles={vehicles}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          viewMode={viewMode}
          onViewVehicle={handleViewVehicle}
          onEditVehicle={handleEditVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onAddVehicle={handleAddVehicle}
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

      {/* Vehicle Details Dialog */}
      {selectedVehicle && (
        <Dialog
          open={showDetails}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Vehicle Details
              </Typography>
              <IconButton onClick={handleCloseDetails}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <VehicleDetails
              vehicle={selectedVehicle}
              onEdit={() => {
                handleCloseDetails();
                handleEditVehicle(selectedVehicle);
              }}
              onDelete={() => {
                handleCloseDetails();
                handleDeleteVehicle(selectedVehicle);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
            <Button
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => {
                handleCloseDetails();
                handleEditVehicle(selectedVehicle);
              }}
            >
              Edit
            </Button>
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                handleCloseDetails();
                handleDeleteVehicle(selectedVehicle);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Vehicle Form Dialog */}
      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {formMode === 'create' ? 'Add New Vehicle' : 'Edit Vehicle'}
            </Typography>
            <IconButton onClick={handleCloseForm}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <VehicleForm
            vehicle={formMode === 'edit' ? selectedVehicle : null}
            onSave={handleFormSuccess}
            onCancel={handleCloseForm}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6">Delete Vehicle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </Typography>
          {selectedVehicle && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Vehicle:</strong> {selectedVehicle.make} {selectedVehicle.model}
              </Typography>
              <Typography variant="body2">
                <strong>License Plate:</strong> {selectedVehicle.license_plate}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedVehicle.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
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

      {/* FAB for mobile */}
      {!showForm && (
        <FabContainer>
          <Zoom in>
            <Fab
              color="primary"
              aria-label="add vehicle"
              onClick={handleAddVehicle}
              sx={{
                display: { xs: 'flex', md: 'none' },
                boxShadow: theme.shadows[6],
              }}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        </FabContainer>
      )}
    </PageContainer>
  );
};

// ============================================================================
// Export
// ============================================================================

export default VehiclesPage;
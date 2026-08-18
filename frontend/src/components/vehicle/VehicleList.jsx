// ============================================================================
// VehicleList Component
// ============================================================================

/**
 * VehicleList component for displaying and managing vehicles.
 * 
 * This component provides:
 * - List and grid view modes
 * - Search and filtering
 * - Vehicle status indicators
 * - Quick actions (view, edit, delete)
 * - Pagination
 * - Export functionality
 * - Responsive design
 */

import React, { useState, useCallback, useMemo } from 'react';
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
  CardActions,
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
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  DirectionsCar as CarIcon,
  ElectricCar as EvIcon,
  LocalGasStation as FuelIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterAltIcon,
  Sort as SortIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatDate } from '../../utils/formatters';
import { useVehicle } from '../../hooks/useVehicle';

// ============================================================================
// Styled Components
// ============================================================================

const ListContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const VehicleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    active: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
    },
    inactive: {
      bg: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[600],
    },
    suspended: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
    },
    deleted: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
    },
    maintenance: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
    },
  };

  const colors = statusColors[status] || statusColors.active;

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
  marginBottom: theme.spacing(2),
}));

const VehicleAvatar = styled(Avatar)(({ theme, type }) => ({
  backgroundColor: type === 'ev' 
    ? alpha(theme.palette.info.main, 0.1)
    : type === 'hybrid'
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.primary.main, 0.1),
  color: type === 'ev'
    ? theme.palette.info.main
    : type === 'hybrid'
    ? theme.palette.success.main
    : theme.palette.primary.main,
  width: 48,
  height: 48,
}));

// ============================================================================
// Main Component
// ============================================================================

export const VehicleList = ({
  vehicles = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onViewVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onExport,
  onRefresh,
  onAddVehicle,
  showFilters = true,
  showStats = true,
  viewMode = 'list',
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { deleteVehicle } = useVehicle();

  // ==========================================================================
  // State
  // ==========================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (vehicle) =>
          vehicle.license_plate?.toLowerCase().includes(query) ||
          vehicle.make?.toLowerCase().includes(query) ||
          vehicle.model?.toLowerCase().includes(query) ||
          vehicle.vin?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((vehicle) => vehicle.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((vehicle) => vehicle.vehicle_type === typeFilter);
    }

    // Sort
    switch (sortBy) {
      case 'make_asc':
        result.sort((a, b) => (a.make || '').localeCompare(b.make || ''));
        break;
      case 'make_desc':
        result.sort((a, b) => (b.make || '').localeCompare(a.make || ''));
        break;
      case 'year_asc':
        result.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case 'year_desc':
        result.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'created_at_asc':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'created_at_desc':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [vehicles, searchQuery, statusFilter, typeFilter, sortBy]);

  // ==========================================================================
  // Statistics
  // ==========================================================================

  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === 'active').length;
    const inactive = vehicles.filter((v) => v.status === 'inactive').length;
    const ev = vehicles.filter((v) => v.vehicle_type === 'ev' || v.is_ev_charging_compatible).length;
    const hybrid = vehicles.filter((v) => v.vehicle_type === 'hybrid').length;

    return {
      total,
      active,
      inactive,
      ev,
      hybrid,
    };
  }, [vehicles]);

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

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsDialogOpen(true);
    if (onViewVehicle) {
      onViewVehicle(vehicle);
    }
  };

  const handleEditVehicle = (vehicle) => {
    if (onEditVehicle) {
      onEditVehicle(vehicle);
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVehicle || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteVehicle(selectedVehicle.id);
      
      setSnackbarMessage('Vehicle deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      
      if (onDeleteVehicle) {
        onDeleteVehicle(selectedVehicle.id);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setSnackbarMessage(err.message || 'Failed to delete vehicle');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = (format) => {
    if (onExport) {
      onExport(filteredVehicles, format);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleMenuOpen = (event, vehicle) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderStatusChip = (status) => {
    const statusConfigs = {
      active: { icon: <CheckCircleIcon />, label: 'Active' },
      inactive: { icon: <CancelIcon />, label: 'Inactive' },
      suspended: { icon: <WarningIcon />, label: 'Suspended' },
      deleted: { icon: <ErrorIcon />, label: 'Deleted' },
      maintenance: { icon: <WarningIcon />, label: 'Maintenance' },
    };

    const config = statusConfigs[status] || statusConfigs.active;

    return (
      <StatusChip
        status={status}
        icon={config.icon}
        label={config.label}
        size="small"
      />
    );
  };

  const renderVehicleTypeIcon = (vehicle) => {
    if (vehicle.vehicle_type === 'ev' || vehicle.is_ev_charging_compatible) {
      return <EvIcon />;
    }
    if (vehicle.vehicle_type === 'hybrid') {
      return <FuelIcon />;
    }
    return <CarIcon />;
  };

  const renderVehicleCard = (vehicle) => {
    return (
      <VehicleCard>
        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <VehicleAvatar type={vehicle.vehicle_type}>
              {renderVehicleTypeIcon(vehicle)}
            </VehicleAvatar>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, vehicle)}>
              <MoreIcon />
            </IconButton>
          </Box>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            {vehicle.make} {vehicle.model}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {vehicle.license_plate}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {renderStatusChip(vehicle.status)}
            {vehicle.is_ev_charging_compatible && (
              <Chip
                label="EV Ready"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                }}
              />
            )}
            {vehicle.has_permit && (
              <Chip
                label="Permit"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                }}
              />
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Year
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {vehicle.year || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Color
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {vehicle.color || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Type
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                {vehicle.vehicle_type || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Fuel
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                {vehicle.fuel_type || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => handleViewVehicle(vehicle)}
            fullWidth
          >
            View Details
          </Button>
        </CardActions>
      </VehicleCard>
    );
  };

  const renderTableView = () => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>License Plate</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Year</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <VehicleAvatar type={vehicle.vehicle_type} sx={{ width: 36, height: 36 }}>
                      {renderVehicleTypeIcon(vehicle)}
                    </VehicleAvatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {vehicle.make} {vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{vehicle.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {vehicle.license_plate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {vehicle.vehicle_type}
                  </Typography>
                  {vehicle.is_ev_charging_compatible && (
                    <Chip
                      label="EV"
                      size="small"
                      sx={{
                        ml: 0.5,
                        height: 20,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {renderStatusChip(vehicle.status)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {vehicle.year || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewVehicle(vehicle)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEditVehicle(vehicle)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteVehicle(vehicle)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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

  if (loading && vehicles.length === 0) {
    return (
      <ListContainer>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading vehicles...
          </Typography>
        </Box>
      </ListContainer>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error) {
    return (
      <ListContainer>
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
      </ListContainer>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <ListContainer className={className} sx={sx} {...props}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total} vehicles in the system
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddVehicle}
          >
            Add Vehicle
          </Button>
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
                Total Vehicles
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {stats.inactive}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inactive
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {stats.ev}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                EV Vehicles
              </Typography>
            </StatBox>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatBox>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.hybrid}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hybrid Vehicles
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
              onChange={handleTypeFilterChange}
              label="Status"
            >
              <SelectMenuItem value="all">All</SelectMenuItem>
              <SelectMenuItem value="active">Active</SelectMenuItem>
              <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
              <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
              <SelectMenuItem value="maintenance">Maintenance</SelectMenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              label="Type"
            >
              <SelectMenuItem value="all">All</SelectMenuItem>
              <SelectMenuItem value="sedan">Sedan</SelectMenuItem>
              <SelectMenuItem value="suv">SUV</SelectMenuItem>
              <SelectMenuItem value="truck">Truck</SelectMenuItem>
              <SelectMenuItem value="ev">Electric</SelectMenuItem>
              <SelectMenuItem value="hybrid">Hybrid</SelectMenuItem>
              <SelectMenuItem value="motorcycle">Motorcycle</SelectMenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
            >
              <SelectMenuItem value="make_asc">Make A-Z</SelectMenuItem>
              <SelectMenuItem value="make_desc">Make Z-A</SelectMenuItem>
              <SelectMenuItem value="year_desc">Newest First</SelectMenuItem>
              <SelectMenuItem value="year_asc">Oldest First</SelectMenuItem>
              <SelectMenuItem value="created_at_desc">Recently Added</SelectMenuItem>
              <SelectMenuItem value="created_at_asc">Oldest Added</SelectMenuItem>
            </Select>
          </FormControl>
        </FilterBar>
      )}

      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredVehicles.length} of {total} vehicles
        </Typography>
        {loading && <CircularProgress size={20} />}
      </Box>

      {/* Loading Overlay */}
      {loading && vehicles.length > 0 && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CarIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Vehicles Found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {searchQuery ? 'Try adjusting your search or filters' : 'Add your first vehicle'}
          </Typography>
          {searchQuery && (
            <Button variant="outlined" onClick={handleClearSearch} sx={{ mt: 2 }}>
              Clear Search
            </Button>
          )}
          {!searchQuery && onAddVehicle && (
            <Button variant="contained" onClick={onAddVehicle} sx={{ mt: 2 }} startIcon={<AddIcon />}>
              Add Vehicle
            </Button>
          )}
        </Box>
      )}

      {/* Vehicles Grid/List */}
      {filteredVehicles.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredVehicles.map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                  {renderVehicleCard(vehicle)}
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
      Delete Dialog
      ========================================================================== */}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
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
              Vehicle Details
            </Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVehicle && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <VehicleAvatar type={selectedVehicle.vehicle_type} sx={{ width: 64, height: 64 }}>
                    {renderVehicleTypeIcon(selectedVehicle)}
                  </VehicleAvatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {selectedVehicle.make} {selectedVehicle.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedVehicle.license_plate}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Basic Information
                </Typography>
                <Typography variant="body2">
                  <strong>License Plate:</strong> {selectedVehicle.license_plate}
                </Typography>
                <Typography variant="body2">
                  <strong>State:</strong> {selectedVehicle.state}
                </Typography>
                <Typography variant="body2">
                  <strong>Country:</strong> {selectedVehicle.country}
                </Typography>
                <Typography variant="body2">
                  <strong>Make:</strong> {selectedVehicle.make}
                </Typography>
                <Typography variant="body2">
                  <strong>Model:</strong> {selectedVehicle.model}
                </Typography>
                <Typography variant="body2">
                  <strong>Year:</strong> {selectedVehicle.year}
                </Typography>
                <Typography variant="body2">
                  <strong>Color:</strong> {selectedVehicle.color}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Technical Details
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedVehicle.vehicle_type}
                </Typography>
                <Typography variant="body2">
                  <strong>Fuel Type:</strong> {selectedVehicle.fuel_type}
                </Typography>
                <Typography variant="body2">
                  <strong>Size:</strong> {selectedVehicle.vehicle_size}
                </Typography>
                <Typography variant="body2">
                  <strong>VIN:</strong> {selectedVehicle.vin || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Engine Size:</strong> {selectedVehicle.engine_size || 'N/A'}L
                </Typography>
                <Typography variant="body2">
                  <strong>Horsepower:</strong> {selectedVehicle.horsepower || 'N/A'} HP
                </Typography>
                <Typography variant="body2">
                  <strong>Weight:</strong> {selectedVehicle.weight_kg || 'N/A'} kg
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Status & Registration
                </Typography>
                <Box sx={{ mb: 1 }}>{renderStatusChip(selectedVehicle.status)}</Box>
                <Typography variant="body2">
                  <strong>Registration Expiry:</strong> {selectedVehicle.registration_expiry ? formatDate(selectedVehicle.registration_expiry) : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Insurance Expiry:</strong> {selectedVehicle.insurance_expiry ? formatDate(selectedVehicle.insurance_expiry) : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Has Permit:</strong> {selectedVehicle.has_permit ? 'Yes' : 'No'}
                </Typography>
                {selectedVehicle.has_permit && (
                  <Typography variant="body2">
                    <strong>Permit Number:</strong> {selectedVehicle.permit_number}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Additional Information
                </Typography>
                <Typography variant="body2">
                  <strong>EV Charging Compatible:</strong> {selectedVehicle.is_ev_charging_compatible ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDate(selectedVehicle.created_at)}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {selectedVehicle.updated_at ? formatDate(selectedVehicle.updated_at) : 'N/A'}
                </Typography>
                {selectedVehicle.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Notes:</strong> {selectedVehicle.notes}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {selectedVehicle && (
            <>
              <Button
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleEditVehicle(selectedVehicle);
                }}
              >
                Edit
              </Button>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleDeleteVehicle(selectedVehicle);
                }}
              >
                Delete
              </Button>
            </>
          )}
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
        <MenuItem onClick={() => { handleViewVehicle(selectedVehicle); handleMenuClose(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEditVehicle(selectedVehicle); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteVehicle(selectedVehicle); handleMenuClose(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export</ListItemText>
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
    </ListContainer>
  );
};

// ============================================================================
// StatBox Component
// ============================================================================

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

// ============================================================================
// Export
// ============================================================================

export default VehicleList;
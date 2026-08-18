// ============================================================================
// ParkingSearch Component
// ============================================================================

/**
 * ParkingSearch component for searching and filtering parking spots.
 * 
 * This component provides:
 * - Advanced search with multiple filters
 * - Real-time search results
 * - Filter by spot type, status, availability
 * - Location-based search
 * - Price range filtering
 * - Sort and pagination
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Stack,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Collapse,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Popover,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import hooks and services
import { useDebounce } from '../../hooks/useDebounce';
import { useParking } from '../../hooks/useParking';
import { formatCurrency } from '../../utils/formatters';

// ============================================================================
// Styled Components
// ============================================================================

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  transition: theme.transitions.create(['box-shadow', 'background-color'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const SearchInput = styled(TextField)(({ theme }) => ({
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

const FilterChip = styled(Chip)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: active 
    ? theme.palette.primary.main 
    : alpha(theme.palette.primary.main, 0.08),
  color: active 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active 
      ? theme.palette.primary.dark 
      : alpha(theme.palette.primary.main, 0.15),
  },
  '& .MuiChip-label': {
    fontWeight: active ? 600 : 400,
  },
}));

const FilterSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ResultsStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

// ============================================================================
// Constants
// ============================================================================

const SPOT_TYPES = [
  'Standard',
  'Compact',
  'Handicapped',
  'EV Charging',
  'Premium',
  'Valet',
  'Reserved',
];

const SPOT_STATUSES = [
  'Available',
  'Occupied',
  'Reserved',
  'Maintenance',
  'Out of Service',
];

const ACCESS_LEVELS = [
  'Public',
  'Restricted',
  'Private',
  'Employee',
  'VIP',
];

const SORT_OPTIONS = [
  { value: 'spot_number', label: 'Spot Number' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'distance', label: 'Distance' },
  { value: 'availability', label: 'Availability' },
];

// ============================================================================
// Main Component
// ============================================================================

export const ParkingSearch = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  showResults = true,
  compact = false,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { searchParking, loading, error } = useParking();

  // ==========================================================================
  // State
  // ==========================================================================

  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [filters, setFilters] = useState({
    spotTypes: initialFilters.spotTypes || [],
    statuses: initialFilters.statuses || [],
    accessLevels: initialFilters.accessLevels || [],
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 100,
    radius: initialFilters.radius || 5,
    latitude: initialFilters.latitude || null,
    longitude: initialFilters.longitude || null,
    sortBy: initialFilters.sortBy || 'spot_number',
    sortOrder: initialFilters.sortOrder || 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Perform search when filters or query change
  useEffect(() => {
    performSearch();
  }, [debouncedQuery, filters, page]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const performSearch = useCallback(async () => {
    try {
      const searchParams = {
        query: debouncedQuery,
        ...filters,
        page,
        limit: pageSize,
      };

      const response = await searchParking(searchParams);
      if (response) {
        setResults(response.items || []);
        setTotalResults(response.total || 0);
      }

      // Call onSearch callback
      if (onSearch) {
        onSearch(searchParams, response);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [debouncedQuery, filters, page, pageSize, searchParking, onSearch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);

    // Call onFilterChange callback
    if (onFilterChange) {
      onFilterChange({ ...filters, [key]: value });
    }
  };

  const handleToggleFilter = (key, value) => {
    setFilters(prev => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [key]: newValues };
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      spotTypes: [],
      statuses: [],
      accessLevels: [],
      minPrice: 0,
      maxPrice: 100,
      radius: 5,
      latitude: null,
      longitude: null,
      sortBy: 'spot_number',
      sortOrder: 'asc',
    });
    setPage(1);
  };

  const handleRefresh = () => {
    performSearch();
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleFilterChange('latitude', position.coords.latitude);
          handleFilterChange('longitude', position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const hasActiveFilters = useMemo(() => {
    return (
      filters.spotTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.accessLevels.length > 0 ||
      filters.minPrice > 0 ||
      filters.maxPrice < 100 ||
      filters.radius !== 5 ||
      filters.latitude !== null
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.spotTypes.length;
    count += filters.statuses.length;
    count += filters.accessLevels.length;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 100) count++;
    if (filters.radius !== 5) count++;
    if (filters.latitude !== null) count++;
    return count;
  }, [filters]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <Box className={className} sx={{ width: '100%', ...sx }} {...props}>
      <SearchContainer elevation={compact ? 1 : 2}>
        {/* Search Input */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <SearchInput
            fullWidth
            placeholder="Search for parking spots..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size={compact ? 'small' : 'medium'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.shape.borderRadius * 2,
              },
            }}
          />

          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            size={compact ? 'small' : 'medium'}
            sx={{
              minWidth: 'auto',
              borderRadius: theme.shape.borderRadius * 2,
              px: 2,
              whiteSpace: 'nowrap',
            }}
          >
            Filters
            {activeFilterCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Button>

          <IconButton
            onClick={handleRefresh}
            size={compact ? 'small' : 'medium'}
            sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {filters.spotTypes.map(type => (
              <FilterChip
                key={type}
                label={type}
                onDelete={() => handleToggleFilter('spotTypes', type)}
                size="small"
                active
              />
            ))}
            {filters.statuses.map(status => (
              <FilterChip
                key={status}
                label={status}
                onDelete={() => handleToggleFilter('statuses', status)}
                size="small"
                active
              />
            ))}
            {filters.accessLevels.map(level => (
              <FilterChip
                key={level}
                label={level}
                onDelete={() => handleToggleFilter('accessLevels', level)}
                size="small"
                active
              />
            ))}
            {filters.minPrice > 0 && (
              <FilterChip
                label={`Min: $${filters.minPrice}`}
                onDelete={() => handleFilterChange('minPrice', 0)}
                size="small"
                active
              />
            )}
            {filters.maxPrice < 100 && (
              <FilterChip
                label={`Max: $${filters.maxPrice}`}
                onDelete={() => handleFilterChange('maxPrice', 100)}
                size="small"
                active
              />
            )}
            {filters.radius !== 5 && (
              <FilterChip
                label={`${filters.radius}km radius`}
                onDelete={() => handleFilterChange('radius', 5)}
                size="small"
                active
              />
            )}
            <Chip
              label="Clear All"
              onClick={handleClearFilters}
              size="small"
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            />
          </Box>
        )}

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            {/* Spot Types */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Spot Types</InputLabel>
                <Select
                  multiple
                  value={filters.spotTypes}
                  onChange={(e) => handleFilterChange('spotTypes', e.target.value)}
                  input={<OutlinedInput label="Spot Types" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {SPOT_TYPES.map(type => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={filters.spotTypes.includes(type)} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Statuses */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.statuses}
                  onChange={(e) => handleFilterChange('statuses', e.target.value)}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {SPOT_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>
                      <Checkbox checked={filters.statuses.includes(status)} />
                      <ListItemText primary={status} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Access Levels */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Access Levels</InputLabel>
                <Select
                  multiple
                  value={filters.accessLevels}
                  onChange={(e) => handleFilterChange('accessLevels', e.target.value)}
                  input={<OutlinedInput label="Access Levels" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {ACCESS_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>
                      <Checkbox checked={filters.accessLevels.includes(level)} />
                      <ListItemText primary={level} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price Range */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Price Range
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    type="number"
                    label="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    sx={{ width: 100 }}
                  />
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(e, newValue) => {
                      handleFilterChange('minPrice', newValue[0]);
                      handleFilterChange('maxPrice', newValue[1]);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    sx={{ width: 100 }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Location & Distance */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Location & Distance
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    onClick={handleUseCurrentLocation}
                  >
                    Use My Location
                  </Button>
                  <TextField
                    size="small"
                    type="number"
                    label="Radius (km)"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', Number(e.target.value))}
                    sx={{ width: 120 }}
                  />
                </Box>
                {filters.latitude && filters.longitude && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Location: {filters.latitude.toFixed(4)}, {filters.longitude.toFixed(4)}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Sort */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label="Sort By"
                  >
                    {SORT_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </Box>
        </Collapse>
      </SearchContainer>

      {/* Results Stats */}
      {showResults && (
        <ResultsStats>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Found {totalResults} results
            </Typography>
            {loading && <CircularProgress size={20} />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewListIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModuleIcon />
            </IconButton>
          </Box>
        </ResultsStats>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default ParkingSearch;
import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  BookmarkAdd as ReserveIcon,
  LocalParking as ParkingIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDistance } from '../../utils/formatters';

const statusColor = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'available': return 'success';
    case 'occupied': return 'error';
    case 'reserved': return 'warning';
    default: return 'default';
  }
};

export const ParkingList = ({
  spots = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onSpotClick,
  onReserve,
  showActions = true,
  showPagination = true,
  sx,
}) => {
  const theme = useTheme();

  if (error) {
    return <Paper sx={{ p: 3, ...sx }}><Typography color="error">{String(error)}</Typography></Paper>;
  }

  if (!loading && spots.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', ...sx }}>
        <ParkingIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">No Parking Spots Found</Typography>
        <Typography variant="body2" color="text.disabled">Try adjusting the search filters.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden', maxWidth: '100%', ...sx }}>
      <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell>Spot</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              {showActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {spots.map((spot) => {
              const status = String(spot.status || '').toLowerCase();
              const available = status === 'available';
              const label = spot.spot_number || spot.number || spot.name || 'Parking spot';
              const type = spot.spot_type || spot.type || 'standard';
              const floor = spot.floor ?? spot.level;
              const location = spot.location?.address || spot.parking_lot_name || (floor != null ? `Floor ${floor}` : 'Parking area');
              const price = Number(spot.price ?? spot.price_per_hour ?? spot.hourly_rate ?? 0);

              return (
                <TableRow key={spot.id || label} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <ParkingIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{label}</Typography>
                        <Typography variant="caption" color="text.secondary">{spot.section || 'Section A'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={type} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{location}</Typography>
                    {spot.distance != null && (
                      <Typography variant="caption" color="text.secondary">{formatDistance(spot.distance)}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={status || 'unknown'} size="small" color={statusColor(status)} sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{formatCurrency(price)}</Typography>
                    <Typography variant="caption" color="text.secondary">/ hour</Typography>
                  </TableCell>
                  {showActions && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, minWidth: 190 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => onSpotClick?.(spot)}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ReserveIcon />}
                          onClick={() => onReserve?.(spot)}
                          disabled={!available}
                        >
                          {available ? 'Reserve' : 'Unavailable'}
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && total > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={Math.max(0, page - 1)}
          onPageChange={(event, nextPage) => onPageChange?.(event, nextPage + 1)}
          onRowsPerPageChange={(event) => onPageSizeChange?.(event, parseInt(event.target.value, 10))}
        />
      )}
    </Paper>
  );
};

export default ParkingList;

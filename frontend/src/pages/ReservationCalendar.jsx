import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookingsService from '../services/booking.service';

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const displayDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

export default function ReservationCalendar() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await bookingsService.getBookings({ limit: 100 });
      setReservations(Array.isArray(result?.items) ? result.items : []);
    } catch (requestError) {
      setReservations([]);
      setError(requestError?.message || 'Unable to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return reservations.filter((reservation) => {
      const start = new Date(reservation.start_time || reservation.date).getTime();
      const currentStatus = String(reservation.status || '').toLowerCase();
      if (status === 'upcoming' && (!Number.isFinite(start) || start < now || !['pending', 'confirmed'].includes(currentStatus))) return false;
      if (status !== 'all' && status !== 'upcoming' && currentStatus !== status) return false;
      const reservationDate = toDateInput(reservation.start_time || reservation.date);
      if (startDate && reservationDate && reservationDate < startDate) return false;
      if (endDate && reservationDate && reservationDate > endDate) return false;
      return true;
    }).sort((a, b) => new Date(a.start_time || a.date) - new Date(b.start_time || b.date));
  }, [reservations, status, startDate, endDate]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarIcon color="primary" />
            <Typography variant="h4" fontWeight={800}>Reservation Calendar</Typography>
          </Stack>
          <Typography color="text.secondary">Filter upcoming reservations by date and status, or create a new reservation from an available parking spot.</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/parking')}>New reservation</Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Reservation status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: startDate || undefined }} />
          <Button onClick={() => { setStatus('upcoming'); setStartDate(new Date().toISOString().slice(0, 10)); setEndDate(''); }}>Reset</Button>
        </Stack>
      </Paper>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Spot</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((reservation) => (
                  <TableRow key={reservation.id} hover>
                    <TableCell>{reservation.spot_number || reservation.spot || reservation.parking_spot_id || reservation.spot_id || 'Parking spot'}</TableCell>
                    <TableCell>{displayDateTime(reservation.start_time || reservation.date)}</TableCell>
                    <TableCell>{displayDateTime(reservation.end_time)}</TableCell>
                    <TableCell><Chip size="small" label={reservation.status || 'pending'} /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary" mb={2}>No reservations match this calendar range.</Typography>
                      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/parking')}>Reserve a parking spot</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

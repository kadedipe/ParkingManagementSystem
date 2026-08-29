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
  PlayArrow as StartIcon,
  Refresh as RefreshIcon,
  StopCircle as StopIcon,
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

const sessionLabel = (session, reservation) => {
  if (session?.status === 'active') return 'Parked now';
  if (session?.status === 'completed') return 'Completed';
  if (String(reservation.status || '').toLowerCase() === 'confirmed') return 'Ready to start';
  return 'Not started';
};

export default function ReservationCalendar() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');

  const startReservation = () => navigate('/parking?reserve=1', { state: { reservationMode: true } });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingResult, sessionResult] = await Promise.all([
        bookingsService.getBookings({ limit: 100 }),
        bookingsService.getParkingSessions({ limit: 500 }),
      ]);
      setReservations(Array.isArray(bookingResult?.items) ? bookingResult.items : []);
      setSessions(Array.isArray(sessionResult) ? sessionResult : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || requestError?.message || 'Unable to load reservations and parking sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const sessionsByReservation = useMemo(() => {
    const map = new Map();
    sessions.forEach((session) => {
      const current = map.get(session.reservation_id);
      if (!current || new Date(session.start_time) > new Date(current.start_time)) {
        map.set(session.reservation_id, session);
      }
    });
    return map;
  }, [sessions]);

  const handleStartParking = async (reservation) => {
    setActionId(reservation.id);
    setError('');
    setSuccess('');
    try {
      await bookingsService.startParking(reservation.id);
      setSuccess(`Parking session started for ${reservation.spot_number || reservation.spot || 'the reserved spot'}.`);
      setStatus('active');
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || requestError?.message || 'Unable to start parking session.');
    } finally {
      setActionId('');
    }
  };

  const handleEndParking = async (reservation, session) => {
    setActionId(reservation.id);
    setError('');
    setSuccess('');
    try {
      const completed = await bookingsService.endParkingSession(session.id);
      const duration = Number(completed?.duration_minutes || 0).toFixed(1);
      const amount = Number(completed?.total_amount || 0).toFixed(2);
      setSuccess(`Parking session ended. Duration: ${duration} minutes · Session charge: $${amount}.`);
      setStatus('completed');
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || requestError?.message || 'Unable to end parking session.');
    } finally {
      setActionId('');
    }
  };

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
          <Typography color="text.secondary">Manage reservations and start or end persisted parking sessions from the same operational view.</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={startReservation}>New reservation</Button>
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

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Spot</TableCell>
                  <TableCell>Reservation start</TableCell>
                  <TableCell>Reservation end</TableCell>
                  <TableCell>Reservation</TableCell>
                  <TableCell>Parking session</TableCell>
                  <TableCell>Session details</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((reservation) => {
                  const session = sessionsByReservation.get(reservation.id);
                  const reservationStatus = String(reservation.status || '').toLowerCase();
                  const isActive = session?.status === 'active';
                  const canStart = reservationStatus === 'confirmed' && !isActive;
                  const busy = actionId === reservation.id;
                  return (
                    <TableRow key={reservation.id} hover>
                      <TableCell>{reservation.spot_number || reservation.spot || reservation.parking_spot_id || reservation.spot_id || 'Parking spot'}</TableCell>
                      <TableCell>{displayDateTime(reservation.start_time || reservation.date)}</TableCell>
                      <TableCell>{displayDateTime(reservation.end_time)}</TableCell>
                      <TableCell><Chip size="small" label={reservation.status || 'pending'} /></TableCell>
                      <TableCell>
                        <Chip size="small" color={isActive ? 'success' : 'default'} label={sessionLabel(session, reservation)} />
                      </TableCell>
                      <TableCell>
                        {session ? (
                          <Stack spacing={0.25}>
                            <Typography variant="body2">Started {displayDateTime(session.start_time)}</Typography>
                            {session.end_time && <Typography variant="caption" color="text.secondary">Ended {displayDateTime(session.end_time)}</Typography>}
                            {session.duration_minutes != null && <Typography variant="caption" color="text.secondary">{Number(session.duration_minutes).toFixed(1)} min · ${Number(session.total_amount || 0).toFixed(2)}</Typography>}
                          </Stack>
                        ) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {canStart && (
                          <Button size="small" variant="contained" startIcon={<StartIcon />} disabled={busy} onClick={() => handleStartParking(reservation)}>
                            {busy ? 'Starting…' : 'Start Parking'}
                          </Button>
                        )}
                        {isActive && (
                          <Button size="small" color="error" variant="contained" startIcon={<StopIcon />} disabled={busy} onClick={() => handleEndParking(reservation, session)}>
                            {busy ? 'Ending…' : 'End Parking'}
                          </Button>
                        )}
                        {!canStart && !isActive && <Typography variant="caption" color="text.secondary">No action required</Typography>}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary" mb={2}>No reservations match this calendar range.</Typography>
                      <Button variant="contained" startIcon={<AddIcon />} onClick={startReservation}>Reserve a parking spot</Button>
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

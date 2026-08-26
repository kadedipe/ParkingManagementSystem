import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Bolt as BoltIcon,
  EvStation as EvStationIcon,
  LocationOn as LocationIcon,
  Power as PowerIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import apiService from '../services/api';
import chargingHero from '../assets/images/IMAGES/charging_station.avif';
import chargingStationsImage from '../assets/images/IMAGES/ev-charging-stations.jpg';
import chargingWorkflow from '../assets/images/IMAGES/EV Charging Workflow.png';

const getAddress = (address) => {
  if (!address) return 'Location not provided';
  if (typeof address === 'string') return address;

  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'Location not provided';
};

const getStatusColor = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active' || normalized === 'available') return 'success';
  if (normalized === 'maintenance' || normalized === 'offline') return 'warning';
  return 'default';
};

function ChargingPage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.get('/v1/charging-stations/');
      const payload = response?.data;
      setStations(Array.isArray(payload) ? payload : []);
    } catch (requestError) {
      setStations([]);
      setError(
        requestError?.message ||
          'Charging-station data is temporarily unavailable. The charging dashboard is still available.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const summary = useMemo(() => {
    return stations.reduce(
      (totals, station) => ({
        stations: totals.stations + 1,
        connectors: totals.connectors + Number(station.total_connectors || 0),
        available: totals.available + Number(station.available_connectors || 0),
        occupied: totals.occupied + Number(station.occupied_connectors || 0),
      }),
      { stations: 0, connectors: 0, available: 0, occupied: 0 }
    );
  }, [stations]);

  const metrics = [
    { label: 'Charging stations', value: summary.stations, icon: <EvStationIcon /> },
    { label: 'Total connectors', value: summary.connectors, icon: <PowerIcon /> },
    { label: 'Available now', value: summary.available, icon: <BoltIcon /> },
    { label: 'In use', value: summary.occupied, icon: <EvStationIcon /> },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 300, md: 390 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(90deg, rgba(7, 20, 35, 0.90), rgba(7, 20, 35, 0.42)), url("${chargingHero}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2} sx={{ maxWidth: 720, color: 'common.white' }}>
            <Chip
              icon={<BoltIcon />}
              label="EV charging network"
              sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.92)' }}
            />
            <Typography variant="h3" component="h1" fontWeight={800}>
              EV Charging Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Monitor charging stations, connector availability, power levels and pricing from one operational view.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadStations}
              disabled={loading}
              sx={{ alignSelf: 'flex-start' }}
            >
              Refresh station data
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={2.5}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} lg={3} key={metric.label}>
              <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800}>
                      {loading ? '—' : metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {error && (
          <Alert severity="warning" sx={{ mt: 3 }} action={
            <Button color="inherit" size="small" onClick={loadStations}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={8}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                mb={2}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Charging stations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live inventory from the charging service.
                  </Typography>
                </Box>
                <Button startIcon={<RefreshIcon />} onClick={loadStations} disabled={loading}>
                  Refresh
                </Button>
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              {loading ? (
                <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
                  <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography color="text.secondary">Loading charging stations…</Typography>
                  </Stack>
                </Box>
              ) : stations.length === 0 ? (
                <Box sx={{ py: 5 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box
                        component="img"
                        src={chargingStationsImage}
                        alt="EV charging stations"
                        sx={{ width: '100%', borderRadius: 2, display: 'block', maxHeight: 260, objectFit: 'cover' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        No charging stations are registered yet
                      </Typography>
                      <Typography color="text.secondary">
                        Once charging stations are created in the charging service, their connector availability,
                        status, power level and price per kWh will appear here automatically.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {stations.map((station) => (
                    <Grid item xs={12} md={6} key={station.id || station.name}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {station.name || 'Charging station'}
                                </Typography>
                                <Stack direction="row" spacing={0.75} alignItems="center" mt={0.5}>
                                  <LocationIcon fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {getAddress(station.address)}
                                  </Typography>
                                </Stack>
                              </Box>
                              <Chip
                                size="small"
                                label={station.status || 'unknown'}
                                color={getStatusColor(station.status)}
                              />
                            </Stack>

                            <Divider />

                            <Grid container spacing={1.5}>
                              <Grid item xs={4}>
                                <Typography variant="h6" fontWeight={700}>{station.available_connectors ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Available</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="h6" fontWeight={700}>{station.occupied_connectors ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Occupied</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="h6" fontWeight={700}>{station.total_connectors ?? 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Total</Typography>
                              </Grid>
                            </Grid>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip size="small" icon={<BoltIcon />} label={station.power_level || 'standard'} variant="outlined" />
                              <Chip
                                size="small"
                                label={`$${Number(station.price_per_kwh || 0).toFixed(2)}/kWh`}
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={chargingStationsImage}
                  alt="Electric vehicle charging station"
                  sx={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
                />
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Network visibility
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Availability counts are derived directly from each station's connector inventory exposed by the charging service.
                  </Typography>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  EV charging workflow
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Reference workflow from the existing product assets.
                </Typography>
                <Box
                  component="img"
                  src={chargingWorkflow}
                  alt="EV charging workflow"
                  sx={{ width: '100%', display: 'block', borderRadius: 1.5 }}
                />
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ChargingPage;

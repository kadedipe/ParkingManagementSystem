import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  LocalParking as ParkingIcon,
  Paid as RevenueIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import dashboardService from '../services/dashboard.service';

const asMetric = (value) => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    return value.total ?? value.count ?? value.value ?? value.current ?? 'Available';
  }
  return value ?? '—';
};

export default function Reports() {
  const [report, setReport] = useState({ occupancy: null, revenue: null, activity: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [occupancy, revenue, activity] = await Promise.allSettled([
      dashboardService.getOccupancy(),
      dashboardService.getRevenue(),
      dashboardService.getActivity({ limit: 20 }),
    ]);
    setReport({
      occupancy: occupancy.status === 'fulfilled' ? occupancy.value : null,
      revenue: revenue.status === 'fulfilled' ? revenue.value : null,
      activity: activity.status === 'fulfilled' ? activity.value : null,
    });
    if ([occupancy, revenue, activity].every((entry) => entry.status === 'rejected')) {
      setError('Reporting data is temporarily unavailable.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const metrics = [
    { label: 'Occupancy', value: asMetric(report.occupancy), icon: <ParkingIcon /> },
    { label: 'Revenue', value: asMetric(report.revenue), icon: <RevenueIcon /> },
    { label: 'Activity', value: Array.isArray(report.activity) ? report.activity.length : asMetric(report.activity), icon: <AssessmentIcon /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Reports & Analytics</Typography>
          <Typography color="text.secondary">Operational occupancy, revenue and activity reporting.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
      </Stack>
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2.5}>
          {metrics.map((metric) => (
            <Grid item xs={12} md={4} key={metric.label}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{metric.icon}</Box>
                <Typography variant="h5" fontWeight={800}>{String(metric.value)}</Typography>
                <Typography color="text.secondary">{metric.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

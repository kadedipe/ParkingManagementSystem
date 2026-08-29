import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
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

const todayString = () => new Date().toISOString().slice(0, 10);
const daysAgoString = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export default function Reports() {
  const [report, setReport] = useState({ occupancy: null, revenue: null, activity: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('operations');
  const [startDate, setStartDate] = useState(daysAgoString(7));
  const [endDate, setEndDate] = useState(todayString());
  const [generatedAt, setGeneratedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [occupancy, revenue, activity] = await Promise.allSettled([
      dashboardService.getOccupancy(),
      dashboardService.getRevenue(),
      dashboardService.getActivity({ limit: 100 }),
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

  const generateReport = async () => {
    if (!startDate || !endDate || startDate > endDate) {
      setError('Choose a valid report date range.');
      return;
    }
    await load();
    setGeneratedAt(new Date());
  };

  const metrics = useMemo(() => {
    const all = [
      { key: 'occupancy', label: 'Occupancy', value: asMetric(report.occupancy), icon: <ParkingIcon /> },
      { key: 'revenue', label: 'Revenue', value: asMetric(report.revenue), icon: <RevenueIcon /> },
      { key: 'activity', label: 'Activity', value: Array.isArray(report.activity) ? report.activity.length : asMetric(report.activity), icon: <AssessmentIcon /> },
    ];
    if (reportType === 'occupancy') return all.filter((item) => item.key === 'occupancy');
    if (reportType === 'revenue') return all.filter((item) => item.key === 'revenue');
    if (reportType === 'activity') return all.filter((item) => item.key === 'activity');
    return all;
  }, [report, reportType]);

  const downloadCsv = () => {
    const rows = [
      ['Report Type', reportType],
      ['Start Date', startDate],
      ['End Date', endDate],
      ['Generated At', generatedAt ? generatedAt.toISOString() : new Date().toISOString()],
      ...metrics.map((metric) => [metric.label, metric.value]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-report-${todayString()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Reports & Analytics</Typography>
          <Typography color="text.secondary">Configure, generate and export an operational report.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh data</Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Generate report</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report type</InputLabel>
              <Select labelId="report-type-label" value={reportType} label="Report type" onChange={(event) => setReportType(event.target.value)}>
                <MenuItem value="operations">Full operations</MenuItem>
                <MenuItem value="occupancy">Occupancy</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="activity">Activity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="date" label="Start date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="date" label="End date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={generateReport} disabled={loading}>Generate</Button></Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>The current dashboard API supplies live aggregate metrics; the selected date range is recorded in the generated report. Historical server-side filtering can be added when dated analytics endpoints are introduced.</Typography>
      </Paper>

      {loading ? (
        <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2.5}>
            {metrics.map((metric) => (
              <Grid item xs={12} md={reportType === 'operations' ? 4 : 12} key={metric.label}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{metric.icon}</Box>
                  <Typography variant="h5" fontWeight={800}>{String(metric.value)}</Typography>
                  <Typography color="text.secondary">{metric.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mt={3}>
            <Typography variant="body2" color="text.secondary">{generatedAt ? `Generated ${generatedAt.toLocaleString()}` : 'Choose the fields above and click Generate.'}</Typography>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadCsv} disabled={!generatedAt}>Download CSV</Button>
          </Stack>
        </>
      )}
    </Container>
  );
}

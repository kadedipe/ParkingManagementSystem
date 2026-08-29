import React, { useMemo, useState } from 'react';
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
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  LocalParking as ParkingIcon,
  Paid as RevenueIcon,
} from '@mui/icons-material';
import reportsService from '../services/reports.service';

const todayString = () => new Date().toISOString().slice(0, 10);
const daysAgoString = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('operations');
  const [startDate, setStartDate] = useState(daysAgoString(7));
  const [endDate, setEndDate] = useState(todayString());

  const generateReport = async () => {
    if (!startDate || !endDate || startDate > endDate) {
      setError('Choose a valid report date range.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await reportsService.generate({ startDate, endDate, reportType });
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err?.response?.data?.detail || 'Unable to generate the report from historical parking data.');
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!report?.summary) return [];
    const all = [
      {
        key: 'occupancy',
        label: 'Occupancy',
        value: `${Number(report.summary.occupancy_percent || 0).toFixed(2)}%`,
        icon: <ParkingIcon />,
      },
      {
        key: 'revenue',
        label: 'Revenue',
        value: `$${Number(report.summary.revenue || 0).toFixed(2)}`,
        icon: <RevenueIcon />,
      },
      {
        key: 'activity',
        label: 'Activity',
        value: Number(report.summary.activity || 0),
        icon: <AssessmentIcon />,
      },
    ];
    if (reportType === 'operations') return all;
    return all.filter((item) => item.key === reportType);
  }, [report, reportType]);

  const downloadCsv = () => {
    if (!report) return;
    const summaryRows = [
      ['Report Type', report.report_type],
      ['Start Date', report.start_date],
      ['End Date', report.end_date],
      ['Generated At', report.generated_at],
      ['Occupancy Percent', report.summary?.occupancy_percent],
      ['Revenue', report.summary?.revenue],
      ['Activity', report.summary?.activity],
      ['Total Spots', report.summary?.total_spots],
      ['Sessions', report.summary?.sessions],
      ['Completed Sessions', report.summary?.completed_sessions],
      ['Average Session Minutes', report.summary?.average_session_minutes],
      ['Reservations', report.summary?.reservations],
      ['Completed Payments', report.summary?.completed_payments],
      [],
      ['Date', 'Occupancy %', 'Revenue', 'Session Starts', 'Reservations Created', 'Payments Completed', 'Activity'],
      ...(report.daily || []).map((day) => [
        day.date,
        day.occupancy_percent,
        day.revenue,
        day.session_starts,
        day.reservations_created,
        day.payments_completed,
        day.activity,
      ]),
    ];
    const csv = summaryRows.map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-report-${report.start_date}-to-${report.end_date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>Reports & Analytics</Typography>
        <Typography color="text.secondary">Generate historical operational reports from persisted parking and payment data.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {report && !error && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Report generated for {report.start_date} through {report.end_date}.
        </Alert>
      )}

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
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="date" label="Start date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="date" label="End date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={generateReport} disabled={loading}>
              {loading ? <CircularProgress size={22} /> : 'Generate'}
            </Button>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          Occupancy is calculated from persisted parking-session overlap against total parking capacity. Revenue includes completed payments whose completion update falls inside the selected date range.
        </Typography>
      </Paper>

      {report && (
        <>
          <Grid container spacing={2.5}>
            {metrics.map((metric) => (
              <Grid item xs={12} md={reportType === 'operations' ? 4 : 12} key={metric.label}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{metric.icon}</Box>
                  <Typography variant="h5" fontWeight={800}>{metric.value}</Typography>
                  <Typography color="text.secondary">{metric.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Operational summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}><Typography fontWeight={700}>{report.summary?.total_spots ?? 0}</Typography><Typography variant="body2" color="text.secondary">Total spots</Typography></Grid>
              <Grid item xs={6} md={2}><Typography fontWeight={700}>{report.summary?.sessions ?? 0}</Typography><Typography variant="body2" color="text.secondary">Sessions</Typography></Grid>
              <Grid item xs={6} md={2}><Typography fontWeight={700}>{report.summary?.completed_sessions ?? 0}</Typography><Typography variant="body2" color="text.secondary">Completed sessions</Typography></Grid>
              <Grid item xs={6} md={2}><Typography fontWeight={700}>{report.summary?.average_session_minutes ?? 0}m</Typography><Typography variant="body2" color="text.secondary">Avg. session</Typography></Grid>
              <Grid item xs={6} md={2}><Typography fontWeight={700}>{report.summary?.reservations ?? 0}</Typography><Typography variant="body2" color="text.secondary">Reservations</Typography></Grid>
              <Grid item xs={6} md={2}><Typography fontWeight={700}>{report.summary?.completed_payments ?? 0}</Typography><Typography variant="body2" color="text.secondary">Payments</Typography></Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ mt: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, pb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Daily results</Typography>
            </Box>
            <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Occupancy</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Session starts</TableCell>
                    <TableCell>Reservations</TableCell>
                    <TableCell>Payments</TableCell>
                    <TableCell>Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report.daily || []).map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{day.date}</TableCell>
                      <TableCell>{Number(day.occupancy_percent || 0).toFixed(2)}%</TableCell>
                      <TableCell>${Number(day.revenue || 0).toFixed(2)}</TableCell>
                      <TableCell>{day.session_starts}</TableCell>
                      <TableCell>{day.reservations_created}</TableCell>
                      <TableCell>{day.payments_completed}</TableCell>
                      <TableCell>{day.activity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mt={3}>
            <Typography variant="body2" color="text.secondary">
              Generated {report.generated_at ? new Date(report.generated_at).toLocaleString() : ''}
            </Typography>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadCsv}>Download CSV</Button>
          </Stack>
        </>
      )}

      {!report && !loading && !error && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Choose a report type and date range, then click Generate.</Typography>
        </Paper>
      )}
    </Container>
  );
}

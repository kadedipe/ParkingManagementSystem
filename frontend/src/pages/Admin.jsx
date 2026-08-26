import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { AdminPanelSettings as AdminIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboard.service';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.activity)) return payload.activity;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function Admin() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardService.getActivity({ limit: 25 });
      setActivity(normalizeList(data));
    } catch (requestError) {
      setActivity([]);
      setError(requestError?.message || 'Administrative activity data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center"><AdminIcon color="primary" /><Typography variant="h4" fontWeight={800}>Administration</Typography></Stack>
          <Typography color="text.secondary">Role: {user?.role || 'user'} · Operational activity and system oversight.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
      </Stack>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Recent system activity</Typography>
        {loading ? <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : activity.length === 0 ? <Alert severity="info">No recent administrative activity is available.</Alert> : <List>{activity.map((item, index) => <ListItem key={item.id || index} divider={index < activity.length - 1}><ListItemText primary={item.title || item.action || item.type || 'Activity'} secondary={item.message || item.description || (item.created_at ? new Date(item.created_at).toLocaleString() : '')} /></ListItem>)}</List>}
      </Paper>
    </Container>
  );
}

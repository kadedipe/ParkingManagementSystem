import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  DoneAll as DoneAllIcon,
  NotificationsActive as AlertsIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import notificationsService from '../services/notifications.service';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({ email_enabled: false, push_enabled: true, sms_enabled: false });
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [testTitle, setTestTitle] = useState('Parking system alert');
  const [testMessage, setTestMessage] = useState('Alert delivery is active.');
  const [sendingTest, setSendingTest] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [notificationsResult, preferencesResult] = await Promise.allSettled([
      notificationsService.getNotifications({ limit: 100 }),
      notificationsService.getPreferences(),
    ]);

    if (notificationsResult.status === 'fulfilled') {
      setItems(normalizeList(notificationsResult.value));
    } else {
      setItems([]);
      setError(notificationsResult.reason?.message || 'Notifications are temporarily unavailable.');
    }

    if (preferencesResult.status === 'fulfilled') {
      setPreferences((current) => ({ ...current, ...preferencesResult.value }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePreferences = async (next) => {
    setSavingPreferences(true);
    setError('');
    try {
      const saved = await notificationsService.updatePreferences(next);
      setPreferences((current) => ({ ...current, ...saved }));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update alert preferences.');
    } finally {
      setSavingPreferences(false);
    }
  };

  const togglePreference = (key) => (event) => {
    const next = { ...preferences, [key]: event.target.checked };
    setPreferences(next);
    void savePreferences(next);
  };

  const sendTestAlert = async () => {
    if (!testTitle.trim() || !testMessage.trim()) return;
    setSendingTest(true);
    setError('');
    try {
      await notificationsService.createAlert({
        type: 'system_test',
        title: testTitle.trim(),
        message: testMessage.trim(),
        channels: ['in_app'],
        priority: 'normal',
      });
      await load();
    } catch (requestError) {
      setError(requestError?.message || 'Unable to create test alert.');
    } finally {
      setSendingTest(false);
    }
  };

  const markRead = async (item) => {
    if (!item.id || item.read || item.is_read) return;
    try {
      await notificationsService.markAsRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true, is_read: true } : entry));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to mark notification as read.');
    }
  };

  const remove = async (id) => {
    try {
      await notificationsService.deleteNotification(id);
      setItems((current) => current.filter((entry) => entry.id !== id));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to delete notification.');
    }
  };

  const markAll = async () => {
    try {
      await notificationsService.markAllAsRead();
      setItems((current) => current.map((entry) => ({ ...entry, read: true, is_read: true })));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to mark all notifications as read.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Notifications & Alerts</Typography>
          <Typography color="text.secondary">Activate alert channels, create a test alert, and review notifications.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<DoneAllIcon />} onClick={markAll}>Mark all read</Button>
          <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center"><AlertsIcon color="primary" /><Typography variant="h6" fontWeight={700}>Alert activation</Typography></Stack>
          <Typography variant="body2" color="text.secondary">Choose which channels are enabled for your account.</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControlLabel control={<Switch checked={Boolean(preferences.push_enabled)} onChange={togglePreference('push_enabled')} disabled={savingPreferences} />} label="Push alerts" />
            <FormControlLabel control={<Switch checked={Boolean(preferences.email_enabled)} onChange={togglePreference('email_enabled')} disabled={savingPreferences} />} label="Email alerts" />
            <FormControlLabel control={<Switch checked={Boolean(preferences.sms_enabled)} onChange={togglePreference('sms_enabled')} disabled={savingPreferences} />} label="SMS alerts" />
          </Stack>
          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>Test in-app alert</Typography>
          <TextField label="Alert title" value={testTitle} onChange={(event) => setTestTitle(event.target.value)} />
          <TextField label="Alert message" value={testMessage} onChange={(event) => setTestMessage(event.target.value)} multiline minRows={2} />
          <Box><Button variant="contained" startIcon={sendingTest ? <CircularProgress size={18} /> : <SendIcon />} onClick={sendTestAlert} disabled={sendingTest || !testTitle.trim() || !testMessage.trim()}>Create test alert</Button></Box>
        </Stack>
      </Paper>

      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 4 }}><Alert severity="info">No notifications are available yet. Use “Create test alert” above to verify the alert workflow.</Alert></Box>
        ) : (
          <List disablePadding>
            {items.map((item, index) => {
              const read = Boolean(item.read ?? item.is_read);
              return (
                <React.Fragment key={item.id || index}>
                  <ListItem alignItems="flex-start" onClick={() => markRead(item)} sx={{ cursor: read ? 'default' : 'pointer', bgcolor: read ? 'transparent' : 'action.hover' }} secondaryAction={item.id ? <IconButton edge="end" onClick={(event) => { event.stopPropagation(); remove(item.id); }}><DeleteIcon /></IconButton> : null}>
                    <ListItemText primary={<Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={read ? 500 : 800}>{item.title || item.subject || 'Notification'}</Typography>{!read && <Chip size="small" color="primary" label="New" />}</Stack>} secondary={<><Typography component="span" variant="body2" color="text.secondary">{item.message || item.body || ''}</Typography>{item.created_at && <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>{new Date(item.created_at).toLocaleString()}</Typography>}</>} />
                  </ListItem>
                  {index < items.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}

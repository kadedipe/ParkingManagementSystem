import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
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

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationsService.getNotifications({ limit: 100 });
      setItems(normalizeList(data));
    } catch (requestError) {
      setItems([]);
      setError(requestError?.message || 'Notifications are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
          <Typography variant="h4" fontWeight={800}>Notifications</Typography>
          <Typography color="text.secondary">Operational alerts and account notifications.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<DoneAllIcon />} onClick={markAll}>Mark all read</Button>
          <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 4 }}><Alert severity="info">No notifications are available.</Alert></Box>
        ) : (
          <List disablePadding>
            {items.map((item, index) => {
              const read = Boolean(item.read ?? item.is_read);
              return (
                <React.Fragment key={item.id || index}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => markRead(item)}
                    sx={{ cursor: read ? 'default' : 'pointer', bgcolor: read ? 'transparent' : 'action.hover' }}
                    secondaryAction={item.id ? <IconButton edge="end" onClick={(event) => { event.stopPropagation(); remove(item.id); }}><DeleteIcon /></IconButton> : null}
                  >
                    <ListItemText
                      primary={<Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={read ? 500 : 800}>{item.title || item.subject || 'Notification'}</Typography>{!read && <Chip size="small" color="primary" label="New" />}</Stack>}
                      secondary={<><Typography component="span" variant="body2" color="text.secondary">{item.message || item.body || ''}</Typography>{item.created_at && <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>{new Date(item.created_at).toLocaleString()}</Typography>}</>}
                    />
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

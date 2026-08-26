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
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  CreditCard as CreditCardIcon,
  ReceiptLong as ReceiptIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import paymentsService from '../services/payments.service';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.payments)) return payload.payments;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const money = (value, currency = 'USD') => {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [paymentsResult, methodsResult] = await Promise.allSettled([
      paymentsService.getPaymentHistory({ limit: 50 }),
      paymentsService.getPaymentMethods(),
    ]);

    if (paymentsResult.status === 'fulfilled') {
      setPayments(normalizeList(paymentsResult.value));
    } else {
      setPayments([]);
      setError(paymentsResult.reason?.message || 'Payment history is temporarily unavailable.');
    }

    if (methodsResult.status === 'fulfilled') {
      setMethods(normalizeList(methodsResult.value));
    } else {
      setMethods([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        const status = String(payment.status || '').toLowerCase();
        acc.total += Number(payment.amount || 0);
        if (status === 'completed' || status === 'paid' || status === 'succeeded') acc.completed += 1;
        if (status === 'pending') acc.pending += 1;
        return acc;
      },
      { total: 0, completed: 0, pending: 0 }
    );
  }, [payments]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Payments</Typography>
          <Typography color="text.secondary">Payment history and saved payment methods.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5 }}><WalletIcon color="primary" /><Typography variant="h5" fontWeight={800}>{money(stats.total)}</Typography><Typography color="text.secondary">Recorded payment value</Typography></Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5 }}><ReceiptIcon color="success" /><Typography variant="h5" fontWeight={800}>{stats.completed}</Typography><Typography color="text.secondary">Completed payments</Typography></Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5 }}><CreditCardIcon color="primary" /><Typography variant="h5" fontWeight={800}>{methods.length}</Typography><Typography color="text.secondary">Saved payment methods</Typography></Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Payment history</Typography>
        {loading ? (
          <Box sx={{ py: 7, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : payments.length === 0 ? (
          <Alert severity="info">No payment records are available yet.</Alert>
        ) : (
          <Grid container spacing={2}>
            {payments.map((payment, index) => (
              <Grid item xs={12} md={6} lg={4} key={payment.id || payment.reference || index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={700}>{payment.reference || payment.transaction_reference || `Payment ${index + 1}`}</Typography>
                        <Chip size="small" label={payment.status || 'unknown'} />
                      </Stack>
                      <Typography variant="h6">{money(payment.amount, payment.currency || 'USD')}</Typography>
                      <Typography variant="body2" color="text.secondary">{payment.payment_method || payment.method || 'Payment method not specified'}</Typography>
                      <Typography variant="caption" color="text.secondary">{payment.created_at ? new Date(payment.created_at).toLocaleString() : ''}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}

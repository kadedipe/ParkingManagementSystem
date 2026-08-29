import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const friendly = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [methods, setMethods] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [paymentsResult, methodsResult, statsResult, adjustmentsResult] = await Promise.allSettled([
      paymentsService.getPaymentHistory({ limit: 100 }),
      paymentsService.getPaymentMethods(),
      paymentsService.getPaymentStats(),
      paymentsService.getBillingAdjustments({ limit: 100 }),
    ]);

    if (paymentsResult.status === 'fulfilled') setPayments(normalizeList(paymentsResult.value));
    else {
      setPayments([]);
      setError(paymentsResult.reason?.message || 'Payment history is temporarily unavailable.');
    }

    setMethods(methodsResult.status === 'fulfilled' ? normalizeList(methodsResult.value) : []);
    setServerStats(statsResult.status === 'fulfilled' ? statsResult.value : null);
    setAdjustments(adjustmentsResult.status === 'fulfilled' ? normalizeList(adjustmentsResult.value) : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const derivedStats = useMemo(() => payments.reduce(
    (acc, payment) => {
      const status = String(payment.status || '').toLowerCase();
      if (status === 'completed') {
        acc.total += Number(payment.amount || 0);
        acc.completed += 1;
      }
      if (status === 'pending' || status === 'processing') acc.pending += 1;
      return acc;
    },
    { total: 0, completed: 0, pending: 0 }
  ), [payments]);

  const stats = serverStats || derivedStats;
  const provider = methods[0]?.provider || payments[0]?.provider || 'local';

  const runAction = async (payment, action) => {
    setWorkingId(payment.id);
    setError('');
    setSuccess('');
    try {
      if (action === 'process') {
        if (provider === 'stripe' && methods.find((m) => m.id === payment.payment_method)?.requires_provider_token) {
          throw new Error('Stripe is active. A Stripe payment-method token is required before this payment can be charged.');
        }
        await paymentsService.processPayment(payment.id);
        setSuccess('Payment completed successfully.');
      } else if (action === 'receipt') {
        setReceipt(await paymentsService.getPaymentReceipt(payment.id));
      } else if (action === 'refund') {
        await paymentsService.refundPayment(payment.id);
        setSuccess('Payment refunded successfully.');
      }
      if (action !== 'receipt') await load();
    } catch (actionError) {
      setError(actionError?.message || 'Payment operation failed.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Payments</Typography>
          <Typography color="text.secondary">Persistent reservation billing, receipts, refunds and automatic session reconciliation.</Typography>
          <Typography variant="caption" color="text.secondary">Processor: {friendly(provider)}</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {provider === 'local' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Local processing automatically settles parking-session overages and credits when a session ends.
        </Alert>
      )}

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2.5 }}><WalletIcon color="primary" /><Typography variant="h5" fontWeight={800}>{money(stats.total, stats.currency || 'USD')}</Typography><Typography color="text.secondary">Completed payment value</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2.5 }}><ReceiptIcon color="success" /><Typography variant="h5" fontWeight={800}>{stats.completed || 0}</Typography><Typography color="text.secondary">Completed payments</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2.5 }}><CreditCardIcon color="primary" /><Typography variant="h5" fontWeight={800}>{stats.pending || 0}</Typography><Typography color="text.secondary">Pending payments</Typography></Paper></Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Billing reconciliation</Typography>
        {loading ? (
          <Box sx={{ py: 4, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box>
        ) : adjustments.length === 0 ? (
          <Alert severity="info">No session adjustments yet. Reconciliation runs automatically when parking ends.</Alert>
        ) : (
          <Grid container spacing={2}>
            {adjustments.map((adjustment) => {
              const delta = Number(adjustment.adjustment_amount || 0);
              const settled = String(adjustment.status).toLowerCase() === 'settled';
              return (
                <Grid item xs={12} md={6} lg={4} key={adjustment.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700}>{friendly(adjustment.type)}</Typography>
                          <Chip size="small" label={friendly(adjustment.status)} color={settled ? 'success' : adjustment.status === 'failed' ? 'error' : 'warning'} />
                        </Stack>
                        <Typography variant="h6">{delta > 0 ? '+' : ''}{money(delta, adjustment.currency)}</Typography>
                        <Typography variant="body2" color="text.secondary">Reserved: {money(adjustment.reserved_amount, adjustment.currency)}</Typography>
                        <Typography variant="body2" color="text.secondary">Actual parking: {money(adjustment.actual_amount, adjustment.currency)}</Typography>
                        <Typography variant="caption" color="text.secondary">Session: {String(adjustment.parking_session_id || '').slice(0, 12)}…</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Payment history</Typography>
        {loading ? (
          <Box sx={{ py: 7, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : payments.length === 0 ? (
          <Alert severity="info">No payment records are available yet. New confirmed reservations will create a pending payment automatically.</Alert>
        ) : (
          <Grid container spacing={2}>
            {payments.map((payment, index) => {
              const status = String(payment.status || '').toLowerCase();
              const busy = workingId === payment.id;
              return (
                <Grid item xs={12} md={6} lg={4} key={payment.id || index}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={1.2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700}>{payment.receipt_number || `Payment ${String(payment.id || '').slice(0, 8)}`}</Typography>
                          <Chip size="small" label={friendly(payment.status || 'unknown')} color={status === 'completed' ? 'success' : status === 'failed' ? 'error' : status === 'refunded' ? 'warning' : 'default'} />
                        </Stack>
                        <Typography variant="h6">{money(payment.amount, payment.currency || 'USD')}</Typography>
                        <Typography variant="body2">{friendly(payment.payment_method)}</Typography>
                        <Typography variant="body2" color="text.secondary">Reservation: {String(payment.reservation_id || '').slice(0, 12)}…</Typography>
                        <Typography variant="body2" color="text.secondary">Provider: {friendly(payment.provider)}</Typography>
                        <Typography variant="caption" color="text.secondary">{payment.created_at ? new Date(payment.created_at).toLocaleString() : ''}</Typography>
                      </Stack>
                    </CardContent>
                    <CardActions>
                      {(status === 'pending' || status === 'failed') && <Button size="small" disabled={busy} onClick={() => runAction(payment, 'process')}>{busy ? 'Processing…' : 'Pay now'}</Button>}
                      {(status === 'completed' || status === 'refunded') && <Button size="small" disabled={busy} onClick={() => runAction(payment, 'receipt')}>Receipt</Button>}
                      {status === 'completed' && <Button size="small" color="warning" disabled={busy} onClick={() => runAction(payment, 'refund')}>Refund</Button>}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      <Dialog open={Boolean(receipt)} onClose={() => setReceipt(null)} fullWidth maxWidth="sm">
        <DialogTitle>Payment receipt</DialogTitle>
        <DialogContent dividers>
          {receipt && (
            <Stack spacing={1}>
              <Typography><strong>Receipt:</strong> {receipt.receipt_number || '—'}</Typography>
              <Typography><strong>Amount:</strong> {money(receipt.amount, receipt.currency)}</Typography>
              <Typography><strong>Status:</strong> {friendly(receipt.status)}</Typography>
              <Typography><strong>Method:</strong> {friendly(receipt.payment_method)}</Typography>
              <Typography><strong>Provider:</strong> {friendly(receipt.provider)}</Typography>
              <Typography><strong>Reservation:</strong> {receipt.reservation_id}</Typography>
              {receipt.reservation_amount != null && <Typography><strong>Reserved amount:</strong> {money(receipt.reservation_amount, receipt.currency)}</Typography>}
              {receipt.actual_session_amount != null && <Typography><strong>Actual parking:</strong> {money(receipt.actual_session_amount, receipt.currency)}</Typography>}
              {receipt.reconciliation_amount != null && <Typography><strong>Adjustment:</strong> {money(receipt.reconciliation_amount, receipt.currency)} ({friendly(receipt.reconciliation_type)})</Typography>}
              {receipt.provider_reference && <Typography><strong>Provider reference:</strong> {receipt.provider_reference}</Typography>}
              {receipt.processed_at && <Typography><strong>Processed:</strong> {new Date(receipt.processed_at).toLocaleString()}</Typography>}
              {receipt.reconciled_at && <Typography><strong>Reconciled:</strong> {new Date(receipt.reconciled_at).toLocaleString()}</Typography>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setReceipt(null)}>Close</Button></DialogActions>
      </Dialog>
    </Container>
  );
}

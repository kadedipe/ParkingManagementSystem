import React, { useState } from 'react';
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const response = await authService.forgotPassword(email);
    setResult(response);
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
        <form onSubmit={submit}>
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={800}>Reset your password</Typography>
            <Typography color="text.secondary">Enter your account email and we will send password-reset instructions.</Typography>
            {result && <Alert severity={result.success ? 'success' : 'error'}>{result.message || result.error}</Alert>}
            <TextField label="Email address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button type="submit" variant="contained" disabled={loading || !email}>{loading ? 'Sending…' : 'Send reset link'}</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

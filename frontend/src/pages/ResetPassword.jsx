import React, { useState } from 'react';
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const token = searchParams.get('token') || '';

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setResult({ success: false, error: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    const response = await authService.resetPassword(token, password);
    setResult(response);
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
        <form onSubmit={submit}>
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={800}>Choose a new password</Typography>
            {!token && <Alert severity="error">The reset link is missing its token.</Alert>}
            {result && <Alert severity={result.success ? 'success' : 'error'}>{result.message || result.error}</Alert>}
            <TextField label="New password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <TextField label="Confirm password" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            <Button type="submit" variant="contained" disabled={loading || !token || password.length < 8}>{loading ? 'Updating…' : 'Update password'}</Button>
            {result?.success && <Button component={RouterLink} to="/login">Return to login</Button>}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

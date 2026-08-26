import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { MarkEmailRead as EmailIcon } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState({ loading: false, success: false, message: 'The verification link is missing its token.' });
      return;
    }

    let active = true;
    authService.verifyEmail(token).then((result) => {
      if (!active) return;
      setState({
        loading: false,
        success: Boolean(result?.success),
        message: result?.message || result?.error || (result?.success ? 'Email verified successfully.' : 'Email verification failed.'),
      });
    });
    return () => { active = false; };
  }, [searchParams]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <EmailIcon color="primary" sx={{ fontSize: 56 }} />
          <Typography variant="h4" fontWeight={800}>Verify your email</Typography>
          {state.loading ? <CircularProgress /> : <Alert severity={state.success ? 'success' : 'error'} sx={{ width: '100%' }}>{state.message}</Alert>}
          {!state.loading && <Button component={RouterLink} to="/login" variant="contained">Continue to login</Button>}
        </Stack>
      </Paper>
    </Container>
  );
}

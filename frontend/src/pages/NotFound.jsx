import React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <Stack spacing={2.5} alignItems="center">
          <Typography variant="overline" color="primary" fontWeight={700}>
            Error 404
          </Typography>
          <Typography variant="h3" component="h1" fontWeight={800}>
            Page not found
          </Typography>
          <Typography color="text.secondary">
            The page you requested does not exist or may have moved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Go to dashboard
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

export default NotFound;

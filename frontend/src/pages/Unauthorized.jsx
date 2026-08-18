// ============================================================================
// Unauthorized Page
// ============================================================================

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Paper
        elevation={3}
        sx={{
          p: 6,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="error" sx={{ fontSize: '6rem', fontWeight: 700 }}>
          403
        </Typography>
        <Typography variant="h4" gutterBottom>
          Unauthorized Access
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          You don't have permission to access this page. Please contact your administrator.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
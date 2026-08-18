// ============================================================================
// PageLoader Component
// ============================================================================

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LoadingSpinner } from './LoadingSpinner';

export const PageLoader = ({ message = 'Loading page...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <LoadingSpinner size="large" variant="primary" />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default PageLoader;
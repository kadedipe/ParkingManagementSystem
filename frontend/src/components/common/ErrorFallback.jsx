// ============================================================================
// ErrorFallback Component
// ============================================================================

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

export const ErrorFallback = ({ 
  error, 
  resetErrorBoundary,
  title = 'Something went wrong',
  message = 'An unexpected error occurred',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {message}
        </Typography>
        {process.env.NODE_ENV === 'development' && error && (
          <Typography
            variant="caption"
            component="pre"
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 100,
              fontSize: '0.75rem',
              textAlign: 'left',
            }}
          >
            {error.message}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={resetErrorBoundary}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Paper>
    </Box>
  );
};

export default ErrorFallback;
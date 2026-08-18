// ============================================================================
// Layout Component
// ============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Layout component that wraps pages with common UI elements
 */
export const Layout = ({ variant = 'main', children }) => {
  const isAuthLayout = variant === 'auth';

  if (isAuthLayout) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="sm" sx={{ py: 4 }}>
          {children || <Outlet />}
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Navigation />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            overflow: 'auto',
          }}
        >
          <Container maxWidth="xl">
            {children || <Outlet />}
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
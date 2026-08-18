// ============================================================================
// Footer Component
// ============================================================================

import React from 'react';
import { Box, Typography, Link, Divider, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterRoot>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} Parking Management System. All rights reserved.
        </Typography>
        <Stack
          direction="row"
          spacing={3}
          sx={{ mt: { xs: 1, sm: 0 } }}
        >
          <Link
            href="/privacy"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            Terms of Service
          </Link>
          <Link
            href="/support"
            variant="body2"
            color="text.secondary"
            underline="hover"
          >
            Support
          </Link>
        </Stack>
      </Box>
    </FooterRoot>
  );
};

export default Footer;
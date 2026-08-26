import React from 'react';
import { Box, Typography } from '@mui/material';

export const Footer = () => (
  <Box component="footer" sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary" align="center">
      © {new Date().getFullYear()} Parking Management System
    </Typography>
  </Box>
);

export default Footer;

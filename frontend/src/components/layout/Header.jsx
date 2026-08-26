import React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { LocalParking as ParkingIcon, Person as PersonIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1 }}>
          <ParkingIcon color="primary" />
          <Typography variant="h6" component="div" fontWeight={800}>
            ParkingMS
          </Typography>
        </Box>
        <Button startIcon={<PersonIcon />} onClick={() => navigate('/profile')}>
          Profile
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

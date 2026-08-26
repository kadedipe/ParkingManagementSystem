import React from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as VehicleIcon,
  LocalParking as ParkingIcon,
  EvStation as ChargingIcon,
  Payments as PaymentsIcon,
  Notifications as NotificationsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Vehicles', path: '/vehicles', icon: VehicleIcon },
  { label: 'Parking', path: '/parking', icon: ParkingIcon },
  { label: 'Charging', path: '/charging', icon: ChargingIcon },
  { label: 'Payments', path: '/payments', icon: PaymentsIcon },
  { label: 'Notifications', path: '/notifications', icon: NotificationsIcon },
  { label: 'Reports', path: '/reports', icon: ReportsIcon },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper
      component="nav"
      square
      elevation={0}
      sx={{
        width: { xs: 72, md: 240 },
        borderRight: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <List sx={{ py: 1 }}>
        {items.map(({ label, path, icon: Icon }) => (
          <ListItemButton
            key={path}
            selected={location.pathname === path || location.pathname.startsWith(`${path}/`)}
            onClick={() => navigate(path)}
            sx={{ minHeight: 48, px: { xs: 2, md: 2.5 } }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 0, md: 40 }, justifyContent: 'center' }}>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={label} sx={{ display: { xs: 'none', md: 'block' } }} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default Navigation;

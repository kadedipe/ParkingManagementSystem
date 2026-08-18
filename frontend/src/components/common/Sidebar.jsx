// ============================================================================
// Sidebar Component
// ============================================================================

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Box,
  Tooltip,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  DirectionsCar,
  LocalParking,
  EvStation,
  Payment,
  Notifications,
  Person,
  Settings,
  AdminPanelSettings,
  Assessment,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Home,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '../../routes';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})(({ theme, collapsed }) => ({
  width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.standard,
      easing: theme.transitions.easing.sharp,
    }),
    overflowX: 'hidden',
  },
}));

export const Sidebar = ({ open, collapsed, onClose, variant = 'permanent' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedItems, setExpandedItems] = useState({});

  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
    },
    {
      title: 'Vehicles',
      path: '/vehicles',
      icon: <DirectionsCar />,
      children: [
        { title: 'My Vehicles', path: '/vehicles' },
        { title: 'Add Vehicle', path: '/vehicles/create' },
      ],
    },
    {
      title: 'Parking',
      path: '/parking',
      icon: <LocalParking />,
      children: [
        { title: 'Parking Sessions', path: '/parking/sessions' },
        { title: 'Parking Spots', path: '/parking/spots' },
        { title: 'Reservations', path: '/parking/reservations' },
      ],
    },
    {
      title: 'Charging',
      path: '/charging',
      icon: <EvStation />,
      children: [
        { title: 'Charging Sessions', path: '/charging/sessions' },
        { title: 'Charging Stations', path: '/charging/stations' },
      ],
    },
    {
      title: 'Payments',
      path: '/payments',
      icon: <Payment />,
      children: [
        { title: 'Payment History', path: '/payments/history' },
        { title: 'Payment Methods', path: '/payments/methods' },
      ],
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: <Notifications />,
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: <Assessment />,
      children: [
        { title: 'Parking Reports', path: '/reports/parking' },
        { title: 'Revenue Reports', path: '/reports/revenue' },
        { title: 'Charging Reports', path: '/reports/charging' },
      ],
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: <Person />,
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings />,
    },
    {
      title: 'Admin',
      path: '/admin',
      icon: <AdminPanelSettings />,
      adminOnly: true,
      children: [
        { title: 'Users', path: '/admin/users' },
        { title: 'Audit Logs', path: '/admin/audit-logs' },
        { title: 'System', path: '/admin/system' },
      ],
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleToggleExpand = (path) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.path] || false;
    const isActiveRoute = isActive(item.path);

    return (
      <Box key={item.path}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton
            selected={isActiveRoute}
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.path);
              } else {
                handleNavigate(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '30',
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
                '& .MuiListItemText-primary': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActiveRoute ? theme.palette.primary.main : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            {!collapsed && (
              <>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActiveRoute ? 600 : 400,
                  }}
                />
                {hasChildren && (
                  <Box>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <StyledDrawer
      variant={variant}
      open={open}
      onClose={onClose}
      collapsed={collapsed}
      sx={{
        display: { xs: variant === 'temporary' ? 'block' : 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ParkingMS
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => renderNavItem(item))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
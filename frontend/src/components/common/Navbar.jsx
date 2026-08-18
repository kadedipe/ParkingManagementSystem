// ============================================================================
// Navbar Component
// ============================================================================

/**
 * Navbar component that provides the main navigation bar for the application.
 * 
 * This component includes:
 * - Application logo and branding
 * - Navigation links
 * - Search functionality
 * - User profile menu
 * - Notification center
 * - Theme toggle
 * - Mobile responsiveness
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  InputBase,
  alpha,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as VehicleIcon,
  LocalParking as ParkingIcon,
  EvStation as ChargingIcon,
  Payment as PaymentIcon,
  Assessment as ReportsIcon,
  AdminPanelSettings as AdminIcon,
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  Home as HomeIcon,
  NotificationsActive as NotificationActiveIcon,
  PersonAdd as PersonAddIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Import hooks
import { useAuth } from '../../hooks/useAuth';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { useClickOutside } from '../../hooks/useClickOutside';

// Import config
import { config } from '../../config';

// ============================================================================
// Styled Components
// ============================================================================

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 0.6,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const NavLink = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: active ? 600 : 400,
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

const MobileNavLink = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  },
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 400,
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
}));

// ============================================================================
// Navbar Component
// ============================================================================

export const Navbar = ({
  onMenuClick,
  onThemeToggle,
  isSidebarOpen,
  isMobile,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode } = useAppTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const isDarkMode = themeMode === 'dark';
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState({});
  const [searchFocused, setSearchFocused] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);

  // Click outside handler for search
  useClickOutside(searchInputRef, () => {
    setSearchFocused(false);
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
    handleNotificationClose();
    // Navigate to notification detail or relevant page
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileMenuToggle = (path) => {
    setExpandedMobileMenu((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  // ==========================================================================
  // Navigation Items
  // ==========================================================================

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { title: 'Vehicles', path: '/vehicles', icon: <VehicleIcon /> },
    { title: 'Parking', path: '/parking', icon: <ParkingIcon /> },
    { title: 'Charging', path: '/charging', icon: <ChargingIcon /> },
    { title: 'Payments', path: '/payments', icon: <PaymentIcon /> },
    { title: 'Reports', path: '/reports', icon: <ReportsIcon /> },
  ];

  const mobileNavItems = [
    ...navItems,
    { title: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
    { title: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { title: 'Admin', path: '/admin', icon: <AdminIcon />, adminOnly: true },
  ];

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <>
      <AppBar
        ref={navbarRef}
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Toolbar>
          {/* Menu button (mobile) */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick || handleMobileDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo / Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 0,
              cursor: 'pointer',
              mr: 2,
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              component="img"
              src="/logo-small.svg"
              alt="Parking System"
              sx={{
                height: 32,
                width: 'auto',
                mr: 1,
                display: { xs: 'none', sm: 'block' },
              }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                display: { xs: 'none', sm: 'block' },
                fontSize: { sm: '1.1rem', md: '1.25rem' },
              }}
            >
              ParkingMS
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          {!isSmallScreen && (
            <Box sx={{ display: 'flex', ml: 2 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  startIcon={item.icon}
                  active={location.pathname.startsWith(item.path) ? 1 : 0}
                  onClick={() => navigate(item.path)}
                >
                  {item.title}
                </NavLink>
              ))}
            </Box>
          )}

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Search Bar */}
          <SearchBar ref={searchInputRef} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search… (Ctrl+K)"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              onFocus={() => setSearchFocused(true)}
            />
            {searchFocused && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                ESC
              </Box>
            )}
          </SearchBar>

          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton color="inherit" onClick={onThemeToggle} sx={{ ml: 1 }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <StyledBadge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </StyledBadge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ p: 0, ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: theme.shadows[3],
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    mt: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role || 'User'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ==========================================================================
      Notification Menu
      ========================================================================== */}

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 380,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" color="primary">
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length > 0 ? (
          <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
            {notifications.slice(0, 10).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: notification.isRead ? 'transparent' : theme.palette.primary.main,
                      mt: 0.5,
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={notification.isRead ? 400 : 600}>
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              No notifications
            </Typography>
          </Box>
        )}
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => { navigate('/notifications'); handleNotificationClose(); }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>

      {/* ==========================================================================
      Mobile Navigation Drawer
      ========================================================================== */}

      <SwipeableDrawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onOpen={() => setMobileDrawerOpen(true)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            ParkingMS
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 2, py: 1 }}>
          {mobileNavItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            
            const isActive = location.pathname.startsWith(item.path);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMobileMenu[item.path] || false;

            return (
              <React.Fragment key={item.path}>
                <MobileNavLink
                  active={isActive}
                  onClick={() => {
                    if (hasChildren) {
                      handleMobileMenuToggle(item.path);
                    } else {
                      handleNavigate(item.path);
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                  {hasChildren && (
                    <Box>{isExpanded ? <ExpandLess /> : <ExpandMore />}</Box>
                  )}
                </MobileNavLink>
                {hasChildren && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {item.children.map((child) => (
                        <MobileNavLink
                          key={child.path}
                          active={location.pathname === child.path}
                          onClick={() => handleNavigate(child.path)}
                          sx={{ pl: 3 }}
                        >
                          <ListItemText primary={child.title} />
                        </MobileNavLink>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
        <Divider />
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

// ============================================================================
// Export
// ============================================================================

export default Navbar;
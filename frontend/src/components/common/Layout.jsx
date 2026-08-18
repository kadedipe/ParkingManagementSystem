// ============================================================================
// Layout Component
// ============================================================================

/**
 * Layout component that provides the main application structure.
 * 
 * This component handles different layout variants including:
 * - Main layout: Full application layout with navigation and header
 * - Auth layout: Minimal layout for authentication pages
 * - Minimal layout: Simple layout without navigation
 * 
 * It also handles responsive behavior, theme switching, and layout transitions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Fade,
  Slide,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Import layout components
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { Breadcrumbs } from './Breadcrumbs';

// Import hooks
import { useAuth } from '../../hooks/useAuth';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import { useNotification } from '../../hooks/useNotification';

// Import contexts
import { LayoutContext } from '../../contexts/LayoutContext';

// ============================================================================
// Styled Components
// ============================================================================

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.standard,
  }),
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  position: 'relative',
  marginTop: '64px', // Header height
  transition: theme.transitions.create('margin', {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('sm')]: {
    marginTop: '56px', // Smaller header on mobile
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  minHeight: 'calc(100vh - 64px - 64px)', // Viewport - header - footer
  transition: theme.transitions.create('padding', {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(10), // Space for mobile bottom nav
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(1.5),
    paddingBottom: theme.spacing(10),
  },
}));

const ContentInner = styled(Box)(({ theme }) => ({
  flex: 1,
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const AuthContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const AuthCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  transition: theme.transitions.create('box-shadow', {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
}));

// ============================================================================
// Layout Component
// ============================================================================

export const Layout = ({ 
  children, 
  variant = 'main',
  maxWidth = 'xl',
  showHeader = true,
  showFooter = true,
  showSidebar = true,
  showBreadcrumbs = true,
  showMobileNav = true,
  containerProps = {},
  ...props 
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const { themeMode, toggleTheme } = useAppTheme();
  const { showNotification } = useNotification();

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  // Handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }, [isMobile, sidebarOpen, sidebarCollapsed]);

  // Handle sidebar close (mobile)
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle sidebar open (mobile)
  const openSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Update sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Reset content key on route change for animation
  useEffect(() => {
    setContentKey(prev => prev + 1);
  }, [location.pathname]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + B to toggle sidebar
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Layout context value
  const layoutContextValue = {
    variant,
    isMobile,
    isTablet,
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setSidebarCollapsed,
    contentKey,
    isTransitioning,
  };

  // ==========================================================================
  // Render Auth Layout
  // ==========================================================================

  if (variant === 'auth' || variant === 'minimal') {
    return (
      <LayoutRoot>
        <CssBaseline />
        <AuthContainer maxWidth={false}>
          <Fade in timeout={500}>
            <AuthCard>
              {variant === 'auth' && (
                <>
                  {/* Auth header with logo */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 4,
                    }}
                  >
                    <Box
                      component="img"
                      src="/logo.svg"
                      alt="Parking Management System"
                      sx={{
                        height: 48,
                        width: 'auto',
                      }}
                    />
                  </Box>
                </>
              )}
              {children || <Outlet />}
            </AuthCard>
          </Fade>
        </AuthContainer>
      </LayoutRoot>
    );
  }

  // ==========================================================================
  // Render Main Layout
  // ==========================================================================

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <LayoutRoot>
        <CssBaseline />

        {/* Header */}
        {showHeader && (
          <Header
            onMenuClick={toggleSidebar}
            onThemeToggle={toggleTheme}
            isSidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
        )}

        {/* Main Content Area */}
        <MainContent>
          {/* Sidebar */}
          {showSidebar && isAuthenticated && (
            <Sidebar
              open={sidebarOpen}
              collapsed={sidebarCollapsed}
              onClose={closeSidebar}
              variant={isMobile ? 'temporary' : 'permanent'}
            />
          )}

          {/* Content Wrapper */}
          <ContentWrapper
            sx={{
              ml: isAuthenticated && showSidebar && !isMobile ? (sidebarCollapsed ? '72px' : '240px') : 0,
              transition: theme.transitions.create('margin-left', {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.sharp,
              }),
            }}
          >
            {/* Breadcrumbs */}
            {showBreadcrumbs && isAuthenticated && (
              <Breadcrumbs sx={{ mb: 2 }} />
            )}

            {/* Main Content */}
            <ContentInner key={contentKey}>
              <Slide direction="up" in mountOnEnter unmountOnExit>
                <Box>
                  <Container maxWidth={maxWidth} {...containerProps}>
                    {children || <Outlet />}
                  </Container>
                </Box>
              </Slide>
            </ContentInner>

            {/* Footer */}
            {showFooter && <Footer />}
          </ContentWrapper>
        </MainContent>

        {/* Mobile Bottom Navigation */}
        {showMobileNav && isMobile && isAuthenticated && (
          <MobileBottomNav />
        )}

        {/* Floating Action Button for mobile sidebar toggle */}
        {isMobile && !sidebarOpen && isAuthenticated && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: theme.zIndex.speedDial,
              display: { xs: 'block', sm: 'none' },
            }}
          >
            {/* Add a floating action button if needed */}
          </Box>
        )}
      </LayoutRoot>
    </LayoutContext.Provider>
  );
};

// ============================================================================
// Layout Components Export
// ============================================================================

export { Header, Sidebar, Footer, MobileBottomNav, Breadcrumbs };

export default Layout;
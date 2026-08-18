// ============================================================================
// Dashboard Page
// ============================================================================

/**
 * Dashboard page component for the parking management system.
 * 
 * This component provides:
 * - Real-time parking statistics
 * - Occupancy charts
 * - Recent activity feed
 * - Quick actions
 * - Revenue overview
 * - Parking spot status summary
 * - EV charging status
 * - Upcoming reservations
 * - Responsive design
 * - Data refresh functionality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Badge,
  Stack,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalParking as ParkingIcon,
  DirectionsCar as CarIcon,
  EvStation as EvStationIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// Styled Components
// ============================================================================

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  height: '100%',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatIconWrapper = styled(Box)(({ theme, color }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(1),
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const StatusDot = styled(Box)(({ theme, status }) => {
  const colors = {
    available: theme.palette.success.main,
    occupied: theme.palette.error.main,
    reserved: theme.palette.warning.main,
    maintenance: theme.palette.grey[500],
  };

  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: colors[status] || theme.palette.grey[400],
    display: 'inline-block',
    marginRight: theme.spacing(1),
    animation: status === 'available' ? 'pulse 2s infinite' : 'none',
    '@keyframes pulse': {
      '0%': {
        boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)',
      },
      '70%': {
        boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
      },
      '100%': {
        boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
      },
    },
  };
});

// ============================================================================
// Main Component
// ============================================================================

export const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { 
    stats, 
    loading, 
    error, 
    fetchDashboard,
    occupancyData,
    revenueData,
    activityData,
    spotStatusData,
    chargingData,
    reservationsData,
  } = useDashboard();

  // ==========================================================================
  // State
  // ==========================================================================

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showOccupancy, setShowOccupancy] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    occupancy: true,
    revenue: true,
    activity: true,
    reservations: true,
  });

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    fetchDashboard();
    
    // Set up auto-refresh interval (5 minutes)
    const interval = setInterval(() => {
      fetchDashboard();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboard();
    setIsRefreshing(false);
  }, [fetchDashboard]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  const occupancyRate = useMemo(() => {
    if (!stats) return 0;
    return stats.total_spots > 0 
      ? (stats.occupied_spots / stats.total_spots) * 100 
      : 0;
  }, [stats]);

  const revenueTotal = useMemo(() => {
    return stats?.total_revenue || 0;
  }, [stats]);

  // ==========================================================================
  // Chart Colors
  // ==========================================================================

  const COLORS = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    grey: theme.palette.grey[500],
  };

  const CHART_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.success,
    COLORS.error,
    COLORS.warning,
    COLORS.info,
  ];

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.firstName || 'User'}! Here's what's happening with your parking system.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="More actions">
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Dashboard</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Full Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Total Spots
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats?.total_spots || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.available_spots || 0} available
                  </Typography>
                </Box>
                <StatIconWrapper color={COLORS.primary}>
                  <ParkingIcon />
                </StatIconWrapper>
              </Box>
              <LinearProgress
                variant="determinate"
                value={occupancyRate}
                sx={{ mt: 2, height: 4, borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {occupancyRate.toFixed(1)}% occupancy
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Active Sessions
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats?.active_sessions || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.today_sessions || 0} today
                  </Typography>
                </Box>
                <StatIconWrapper color={COLORS.success}>
                  <CarIcon />
                </StatIconWrapper>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Avg. duration: {stats?.avg_duration || 0}m
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Revenue Today
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(revenueTotal)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(stats?.weekly_revenue || 0)} this week
                  </Typography>
                </Box>
                <StatIconWrapper color={COLORS.success}>
                  <MoneyIcon />
                </StatIconWrapper>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.success, mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  +{stats?.revenue_growth || 0}% from last week
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    EV Charging
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats?.charging_stations || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.active_charging || 0} in use
                  </Typography>
                </Box>
                <StatIconWrapper color={COLORS.info}>
                  <EvStationIcon />
                </StatIconWrapper>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {stats?.energy_consumed || 0} kWh consumed today
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Occupancy Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: theme.shape.borderRadius * 2,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Occupancy Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOccupancy}
                      onChange={(e) => setShowOccupancy(e.target.checked)}
                      size="small"
                    />
                  }
                  label={showOccupancy ? 'Show Occupancy' : 'Show Available'}
                />
                <Tooltip title="Expand">
                  <IconButton size="small" onClick={() => toggleSection('occupancy')}>
                    {expandedSections.occupancy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {expandedSections.occupancy && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: theme.shape.borderRadius * 2,
                      border: 'none',
                      boxShadow: theme.shadows[3],
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={showOccupancy ? 'occupancy' : 'available'}
                    stroke={theme.palette.primary.main}
                    fill="url(#occupancyGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Spot Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: theme.shape.borderRadius * 2,
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Spot Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spotStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {spotStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: theme.shape.borderRadius * 2,
                    border: 'none',
                    boxShadow: theme.shadows[3],
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Revenue Overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tabs value={selectedTab} onChange={handleTabChange} sx={{ minHeight: 36 }}>
                  <Tab label="Daily" sx={{ minHeight: 36, py: 0 }} />
                  <Tab label="Weekly" sx={{ minHeight: 36, py: 0 }} />
                  <Tab label="Monthly" sx={{ minHeight: 36, py: 0 }} />
                </Tabs>
                <Tooltip title="Expand">
                  <IconButton size="small" onClick={() => toggleSection('revenue')}>
                    {expandedSections.revenue ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {expandedSections.revenue && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: theme.shape.borderRadius * 2,
                      border: 'none',
                      boxShadow: theme.shadows[3],
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity & Upcoming Reservations */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Last 24h" size="small" />
                <Tooltip title="Expand">
                  <IconButton size="small" onClick={() => toggleSection('activity')}>
                    {expandedSections.activity ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {expandedSections.activity && (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {activityData.map((activity, index) => (
                  <ActivityItem key={index} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        {activity.type === 'parking' && <ParkingIcon />}
                        {activity.type === 'payment' && <PaymentIcon />}
                        {activity.type === 'charging' && <EvStationIcon />}
                        {activity.type === 'user' && <PeopleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(activity.time)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {activity.description}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={activity.status}
                              size="small"
                              color={activity.status === 'completed' ? 'success' : 'warning'}
                              sx={{ height: 20 }}
                            />
                          </Box>
                        </>
                      }
                    />
                  </ActivityItem>
                ))}
                {activityData.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Reservations */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Upcoming Reservations
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Badge badgeContent={reservationsData.length} color="primary">
                  <CalendarIcon />
                </Badge>
                <Tooltip title="Expand">
                  <IconButton size="small" onClick={() => toggleSection('reservations')}>
                    {expandedSections.reservations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {expandedSections.reservations && (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Spot</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservationsData.map((reservation, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StatusDot status={reservation.status} />
                            {reservation.spot}
                          </Box>
                        </TableCell>
                        <TableCell>{reservation.customer}</TableCell>
                        <TableCell>{formatDate(reservation.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={reservation.status}
                            size="small"
                            color={
                              reservation.status === 'confirmed' ? 'success' :
                              reservation.status === 'pending' ? 'warning' :
                              'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {reservationsData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No upcoming reservations
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: theme.shape.borderRadius * 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<ParkingIcon />}>
            Add Parking
          </Button>
          <Button variant="outlined" startIcon={<EvStationIcon />}>
            Add Charging
          </Button>
          <Button variant="outlined" startIcon={<AssessmentIcon />}>
            Generate Report
          </Button>
          <Button variant="outlined" startIcon={<NotificationsIcon />}>
            View Alerts
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default Dashboard;
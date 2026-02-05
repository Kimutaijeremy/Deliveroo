import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
  AccessTime as TimeIcon,
  MonetizationOn as MoneyIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';


const Dashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  // Memoized calculations for better performance
  const stats = useMemo(() => {
    const totalSpent = parcels.reduce((sum, parcel) => sum + parcel.quote_amount, 0);
    const activeDeliveries = parcels.filter(p => p.status === 'in_transit').length;
    const deliveredThisMonth = parcels.filter(p => 
      p.status === 'delivered' && 
      new Date(p.created_at).getMonth() === new Date().getMonth()
    ).length;
    const avgDeliveryTime = parcels.length > 0 
      ? parcels.reduce((sum, parcel) => sum + (parcel.duration_mins || 0), 0) / parcels.length 
      : 0;

    return {
      totalSpent,
      activeDeliveries,
      deliveredThisMonth,
      avgDeliveryTime: Math.round(avgDeliveryTime),
    };
  }, [parcels]);

  const statusData = useMemo(() => [
    { name: 'Delivered', value: parcels.filter(p => p.status === 'delivered').length },
    { name: 'In Transit', value: parcels.filter(p => p.status === 'in_transit').length },
    { name: 'Pending', value: parcels.filter(p => p.status === 'pending').length },
    { name: 'Cancelled', value: parcels.filter(p => p.status === 'cancelled').length },
  ], [parcels]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parcels/');
      setParcels(response.data);
    } catch (error) {
      toast.error('Failed to fetch parcels');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#00C853';
      case 'in_transit': return '#2196F3';
      case 'cancelled': return '#FF5252';
      default: return '#FF9800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <DeliveredIcon />;
      case 'in_transit': return <ShippingIcon />;
      default: return <PendingIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Mock data for charts
  const deliveryData = [
    { name: 'Mon', deliveries: 4 },
    { name: 'Tue', deliveries: 3 },
    { name: 'Wed', deliveries: 6 },
    { name: 'Thu', deliveries: 8 },
    { name: 'Fri', deliveries: 5 },
    { name: 'Sat', deliveries: 2 },
    { name: 'Sun', deliveries: 3 },
  ];

  const COLORS = ['#00C853', '#2196F3', '#FF9800', '#FF5252'];

  const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                {value}
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {trend > 0 ? (
                    <ArrowUpIcon sx={{ color: '#00C853', fontSize: 16 }} />
                  ) : (
                    <ArrowDownIcon sx={{ color: '#FF5252', fontSize: 16 }} />
                  )}
                  <Typography variant="caption" color={trend > 0 ? '#00C853' : '#FF5252'}>
                    {Math.abs(trend)}% from last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                background: `${color}1a`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your deliveries in real-time
            </Typography>
          </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchParcels}
                  disabled={loading}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Refresh
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create')}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    background: 'linear-gradient(135deg, #0066FF 0%, #00D4AA 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0052CC 0%, #00A888 100%)',
                    },
                  }}
                >
                  New Delivery
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Grid */}
        <Box sx={{ mb: 6 }}>
          <AnimatePresence>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <StatCard
                  title="Total Spent"
                  value={`$${stats.totalSpent.toFixed(2)}`}
                  icon={<MoneyIcon />}
                  color="#0066FF"
                  trend={12.5}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <StatCard
                  title="Active Deliveries"
                  value={stats.activeDeliveries}
                  icon={<ShippingIcon />}
                  color="#00D4AA"
                  trend={8.3}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <StatCard
                  title="Delivered This Month"
                  value={stats.deliveredThisMonth}
                  icon={<DeliveredIcon />}
                  color="#00C853"
                  trend={15.2}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <StatCard
                  title="Avg. Delivery Time"
                  value={`${stats.avgDeliveryTime}m`}
                  icon={<TimeIcon />}
                  color="#FF9800"
                  trend={-3.7}
                />
              </motion.div>
            </Box>
          </AnimatePresence>
        </Box>

        {/* Charts Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 6 }}>
          {/* Delivery Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Paper
              sx={{
                p: 3,
                height: 400,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Delivery Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Weekly delivery performance
                  </Typography>
                </Box>
                <Chip label="Last 7 Days" size="small" />
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
                  <XAxis dataKey="name" stroke="rgba(0, 0, 0, 0.5)" />
                  <YAxis stroke="rgba(0, 0, 0, 0.5)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid rgba(0, 102, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#0066FF"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Paper
              sx={{
                p: 3,
                height: 400,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Status Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overview of parcel statuses
              </Typography>
              
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid rgba(0, 102, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                {statusData.map((status, index) => (
                  <Box key={status.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index] }} />
                    <Typography variant="caption">{status.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Recent Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Deliveries
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your latest parcel deliveries
                  </Typography>
                </Box>
              <AvatarGroup total={parcels.length}>
                <Avatar sx={{ bgcolor: '#0066FF' }}>U</Avatar>
                <Avatar sx={{ bgcolor: '#00D4AA' }}>A</Avatar>
              </AvatarGroup>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography>Loading deliveries...</Typography>
              </Box>
            ) : parcels.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ShippingIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.1)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No deliveries yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first delivery to get started
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/create')}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      background: 'linear-gradient(135deg, #0066FF 0%, #00D4AA 100%)',
                    }}
                  >
                    Create First Delivery
                  </Button>
                </motion.div>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tracking ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {parcels.slice(0, 5).map((parcel, index) => (
                        <TableRow
                          key={parcel.id}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              #{parcel.id.toString().padStart(4, '0')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {parcel.pickup_address?.split(',')[0] || parcel.pickup_address}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                to {parcel.destination_address?.split(',')[0] || parcel.destination_address}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={parcel.weight_category}
                              size="small"
                              sx={{
                                textTransform: 'capitalize',
                                bgcolor: alpha('#0066FF', 0.1),
                                color: '#0066FF',
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              ${parcel.quote_amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ color: getStatusColor(parcel.status) }}>
                                {getStatusIcon(parcel.status)}
                              </Box>
                              <Chip
                                label={parcel.status}
                                size="small"
                                sx={{
                                  bgcolor: alpha(getStatusColor(parcel.status), 0.1),
                                  color: getStatusColor(parcel.status),
                                  fontWeight: 500,
                                  textTransform: 'capitalize',
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(parcel.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/parcel/${parcel.id}`)}
                                sx={{
                                  bgcolor: alpha('#0066FF', 0.1),
                                  '&:hover': {
                                    bgcolor: alpha('#0066FF', 0.2),
                                  },
                                }}
                              >
                                <ViewIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {parcels.length > 5 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: alpha('#0066FF', 0.1),
                    },
                  }}
                >
                  View All Deliveries →
                </Button>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Quick Stats Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              gap: 4,
              background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(0, 212, 170, 0.05) 100%)',
              border: '1px solid rgba(0, 102, 255, 0.1)',
              borderRadius: 4,
            }}
          >
            {[
              { label: 'Total Parcels', value: parcels.length },
              { label: 'Success Rate', value: '99.7%' },
              { label: 'Avg. Delivery', value: `${stats.avgDeliveryTime}m` },
              { label: 'Customer Rating', value: '4.9/5.0' },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center', px: 2 }}>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;

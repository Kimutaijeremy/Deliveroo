import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  alpha,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import MapContainer from '../components/MapContainer';


const statusSteps = ['pending', 'in_transit', 'delivered'];
const statusLabels = {
  pending: 'Pending Pickup',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const ParcelDetail = () => {
  const { id } = useParams();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const fetchParcel = useCallback(async () => {
    try {
      const response = await api.get(`/parcels/${id}`);
      setParcel(response.data);
    } catch (error) {
      toast.error('Failed to fetch parcel details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchParcel();
  }, [fetchParcel]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this delivery?')) {
      return;
    }

    try {
      setCancelling(true);
      await api.put(`/parcels/${id}/cancel`);
      toast.success('Parcel cancelled successfully');
      fetchParcel();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel parcel');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckIcon color="success" />;
      case 'in_transit': return <ShippingIcon color="info" />;
      case 'cancelled': return <CancelIcon color="error" />;
      default: return <PendingIcon color="warning" />;
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

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <ShippingIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </motion.div>
        </Box>
      </Container>
    );
  }

  if (!parcel) {
    return null;
  }

  const statusIndex = getStatusIndex(parcel.status);
  const canCancel = parcel.status === 'pending';
  const statusColor = getStatusColor(parcel.status);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/')}
              variant="outlined"
              sx={{ borderRadius: 3, px: 3 }}
            >
              Back to Dashboard
            </Button>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h3" fontWeight={800}>
                  Delivery #{parcel.id.toString().padStart(4, '0')}
                </Typography>
                <Chip
                  label={statusLabels[parcel.status] || parcel.status}
                  icon={getStatusIcon(parcel.status)}
                  sx={{
                    bgcolor: alpha(statusColor, 0.1),
                    color: statusColor,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    height: 32,
                    '& .MuiChip-icon': {
                      color: statusColor,
                    },
                  }}
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                Created on {formatDate(parcel.created_at)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<ShareIcon />}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              Share
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              Receipt
            </Button>
          </Box>
        </Box>

        {/* Progress Bar */}
        {parcel.status !== 'cancelled' && (
          <Paper sx={{ p: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Delivery Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tracking your package in real-time
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative', mb: 4 }}>
              <LinearProgress 
                variant="determinate"
                value={statusIndex >= 0 ? ((statusIndex + 1) / statusSteps.length) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0, 102, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #0066FF 0%, #00D4AA 100%)',
                    borderRadius: 4,
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                {statusSteps.map((step, index) => (
                  <Box key={step} sx={{ textAlign: 'center', position: 'relative' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: index <= statusIndex ? '#0066FF' : 'rgba(0, 0, 0, 0.1)',
                        color: 'white',
                        fontWeight: 600,
                        mb: 1,
                        mx: 'auto',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight={index <= statusIndex ? 600 : 400}
                      color={index <= statusIndex ? 'primary.main' : 'text.secondary'}
                    >
                      {statusLabels[step]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: alpha('#0066FF', 0.05), border: `1px solid ${alpha('#0066FF', 0.1)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <LocationIcon sx={{ color: '#0066FF' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Pickup Location
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {parcel.pickup_address}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: alpha('#00D4AA', 0.05), border: `1px solid ${alpha('#00D4AA', 0.1)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <LocationIcon sx={{ color: '#00D4AA' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Destination
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {parcel.destination_address}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: alpha('#FF9800', 0.05), border: `1px solid ${alpha('#FF9800', 0.1)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <ScheduleIcon sx={{ color: '#FF9800' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Estimated Delivery
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {parcel.duration_mins ? `${parcel.duration_mins} minutes` : 'Calculating...'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Main Content */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Details" />
              <Tab label="Timeline" />
              <Tab label="Documents" />
            </Tabs>

            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Route Map
                    </Typography>
                    <MapContainer
                      pickupLat={parcel.pickup_lat || -1.2921}
                      pickupLng={parcel.pickup_lng || 36.8219}
                      destLat={parcel.destination_lat || -4.0435}
                      destLng={parcel.destination_lng || 39.6682}
                      distance={`${parcel.distance_km?.toFixed(1) || '480'} km`}
                      duration={`${Math.floor((parcel.duration_mins || 390) / 60)}h ${(parcel.duration_mins || 390) % 60}m`}
                    />
                  </Paper>
                  
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Delivery Details
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                              <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Payment Information
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="Total Amount"
                                  secondary={
                                    <Typography variant="h4" color="primary" fontWeight={800}>
                                      ${parcel.quote_amount.toFixed(2)}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Payment Status"
                                  secondary={
                                    <Chip
                                      label="Paid"
                                      size="small"
                                      sx={{
                                        bgcolor: alpha('#00C853', 0.1),
                                        color: '#00C853',
                                        fontWeight: 600,
                                      }}
                                    />
                                  }
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Payment Method"
                                  secondary="Credit Card (•••• 4242)"
                                />
                              </ListItem>
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                              <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Package Details
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="Weight Category"
                                  secondary={
                                    <Chip
                                      label={parcel.weight_category}
                                      size="small"
                                      sx={{
                                        textTransform: 'capitalize',
                                        bgcolor: alpha('#0066FF', 0.1),
                                        color: '#0066FF',
                                        fontWeight: 600,
                                      }}
                                    />
                                  }
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Distance"
                                  secondary={`${parcel.distance_km?.toFixed(1) || 'N/A'} km`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Current Location"
                                  secondary={parcel.present_location || 'Waiting for pickup'}
                                />
                              </ListItem>
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                              <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Tracking Information
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: 'white',
                                  borderRadius: 2,
                                  border: '1px solid rgba(0, 0, 0, 0.1)',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    letterSpacing: 2,
                                    textAlign: 'center',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  TRACKING {parcel.id.toString().padStart(8, '0')}
                                </Box>
                              </Box>
                              <Box>
                                <Typography variant="body1" fontWeight={600} gutterBottom>
                                  Tracking Number
                                </Typography>
                                <Typography variant="h4" color="primary" fontWeight={800} gutterBottom>
                                  {parcel.id.toString().padStart(10, '0')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Use this number to track your package on our website
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {canCancel && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={cancelling}
                    fullWidth
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Delivery'}
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  startIcon={<ShippingIcon />}
                  onClick={() => navigate('/create')}
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Create Another Delivery
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/')}
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  View All Deliveries
                </Button>
              </Box>
            </Paper>

            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Need Help?
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<PhoneIcon />}
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Call Support: +254 700 000 000
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Email@deliveroo.com
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Live Chat Support
                </Button>
              </Box>

              <Alert
                severity="info"
                sx={{ mt: 3, borderRadius: 2 }}
              >
                <Typography variant="body2">
                  Our support team is available 24/7 to assist you with any questions about your delivery.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ParcelDetail;
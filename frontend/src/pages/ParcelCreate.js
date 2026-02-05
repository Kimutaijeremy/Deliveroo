import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
  IconButton,
  alpha,
  useTheme,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as TruckIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const weightCategories = [
  { value: 'small', label: 'Small Package', description: 'Up to 5kg', price: '$25.50', icon: '📦' },
  { value: 'medium', label: 'Medium Package', description: '5-15kg', price: '$35.75', icon: '📦📦' },
  { value: 'large', label: 'Large Package', description: '15kg+', price: '$45.90', icon: '🚚' },
];

const steps = ['Delivery Details', 'Review & Confirm', 'Payment'];

const ParcelCreate  = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [duration, setDuration] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    pickup_address: '',
    destination_address: '',
    weight_category: 'medium',
    pickup_lat: -1.2921,
    pickup_lng: 36.8219,
    destination_lat: -4.0435,
    destination_lng: 39.6682,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateQuote = async () => {
    try {
      setLoading(true);
      const mockQuote = formData.weight_category === 'small' ? 25.50 :
                       formData.weight_category === 'medium' ? 35.75 : 45.90;

      setQuote(mockQuote);
      setDuration('6 hours 30 mins');

      toast.success('Quote calculated successfully');
      setActiveStep(1);
    } catch (error) {
      toast.error('Failed to calculate quote');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.post('/parcels/', formData);
      toast.success('Parcel created successfully!');
      navigate(`/parcel/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create parcel');
    } finally {
      setLoading(false);
    }
  };

  const handleBack  = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <BackIcon />
          </IconButton>
          
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Create New Delivery
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Fast, reliable, and secure parcel delivery
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Delivery Details
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                  Enter the pickup and delivery information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pickup Address"
                      name="pickup_address"
                      value={formData.pickup_address}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Nairobi City Center"
                      InputProps={{
                        startAdornment: (
                          <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Destination Address"
                      name="destination_address"
                      value={formData.destination_address}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Mombasa Beach Resort"
                      InputProps={{
                        startAdornment: (
                          <LocationIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                      Package Size
                    </Typography>
                    <Grid container spacing={2}>
                      {weightCategories.map((category) => (
                        <Grid item xs={12} sm={4} key={category.value}>
                          <Card
                            onClick={() => setFormData({...formData, weight_category: category.value})}
                            sx={{
                              cursor: 'pointer',
                              border: formData.weight_category === category.value 
                                ? '2px solid #0066FF' 
                                : '1px solid rgba(0, 0, 0, 0.1)',
                              background: formData.weight_category === category.value 
                                ? alpha('#0066FF', 0.05)
                                : 'white',
                              '&:hover': {
                                borderColor: '#0066FF',
                                background: alpha('#0066FF', 0.05),
                              },
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                              <Typography variant="h3" gutterBottom>
                                {category.icon}
                              </Typography>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                {category.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {category.description}
                              </Typography>
                              <Typography variant="h5" fontWeight={800} color="primary.main">
                                {category.price}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="body2">
                        Note: In this demo, coordinates are pre-filled. In a real application,
                        you would use Google Maps autocomplete and geocoding.
                      </Typography>
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={calculateQuote}
                        disabled={!formData.pickup_address || !formData.destination_address || loading}
                        endIcon={<ArrowForwardIcon />}
                        sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                      >
                        {loading ? 'Calculating...' : 'Calculate Quote & Continue'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Review & Confirm
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                  Review your delivery details before confirming
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Delivery Summary
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <LocationIcon sx={{ color: '#0066FF' }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  From:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {formData.pickup_address}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <LocationIcon sx={{ color: '#00D4AA' }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  To:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {formData.destination_address}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <TruckIcon sx={{ color: '#FF9800' }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Weight Category:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {weightCategories.find(w => w.value === formData.weight_category)?.label}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <ScheduleIcon sx={{ color: '#2196F3' }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Duration:
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {duration}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <MoneyIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                          <Typography variant="h5" fontWeight={600}>
                            Delivery Quote
                          </Typography>
                        </Box>
                        
                        <Typography variant="h1" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                          ${quote?.toFixed(2)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Total delivery cost (all inclusive)
                        </Typography>

                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={loading}
                          fullWidth
                          sx={{ py: 1.5, borderRadius: 3, mb: 2 }}
                        >
                          {loading ? 'Creating Delivery...' : 'Confirm & Pay'}
                        </Button>

                        <Button
                          onClick={() => setActiveStep(0)}
                          startIcon={<ArrowBackIcon />}
                          fullWidth
                        >
                          Back to Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Container>
  );
};

export default ParcelCreate;
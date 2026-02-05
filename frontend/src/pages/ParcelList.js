import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ParcelList  = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({
    open: false,
    parcel: null,
  });
  const [newDestination, setNewDestination] = useState('');
  const [error, setError] = useState('');
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

  const handleUpdateDestination = async () => {
    if (!editDialog.parcel || !newDestination.trim()) {
      setError('Please enter a valid destination');
      return;
    }

    try {
      await api.put(`/parcels/${editDialog.parcel.id}/destination`, {
        destination_address: newDestination,
      });
      toast.success('Destination updated successfully');
      setEditDialog({ open: false, parcel: null });
      setNewDestination('');
      setError('');
      fetchParcels();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to update destination');
    }
  };

  const handleCancelParcel = async (parcelId) => {
    if (!window.confirm('Are you sure you want to cancel this parcel?')) {
      return;
    }

    try {
      await api.put(`/parcels/${parcelId}/cancel`);
      toast.success('Parcel cancelled successfully');
      fetchParcels();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel parcel');
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

  const canModifyParcel = (status) => {
    return status !== 'delivered' && status !== 'cancelled';
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                My Parcels
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your parcel deliveries
              </Typography>
            </Box>
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
              New Parcel
            </Button>
          </Box>
        </motion.div>

        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography>Loading parcels...</Typography>
            </Box>
          ) : parcels.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ShippingIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.1)', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No parcels yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create your first parcel to get started
              </Typography>
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
                Create First Parcel
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parcels.map((parcel) => (
                    <TableRow key={parcel.id}>
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
                              textTransform: 'capitalize',
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {parcel.present_location || 'Pickup location'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/parcel/${parcel.id}`)}
                            sx={{ bgcolor: alpha('#0066FF', 0.1) }}
                          >
                            <ViewIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                          {canModifyParcel(parcel.status) && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditDialog({ open: true, parcel });
                                  setNewDestination(parcel.destination_address);
                                }}
                                sx={{ bgcolor: alpha('#00D4AA', 0.1) }}
                              >
                                <EditIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleCancelParcel(parcel.id)}
                                sx={{ bgcolor: alpha('#FF5252', 0.1) }}
                              >
                                <CancelIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Edit Destination Dialog */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, parcel: null })}>
          <DialogTitle>Update Destination</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Parcel #{editDialog.parcel?.id.toString().padStart(4, '0')}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="New Destination"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              margin="normal"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, parcel: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDestination} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ParcelList;
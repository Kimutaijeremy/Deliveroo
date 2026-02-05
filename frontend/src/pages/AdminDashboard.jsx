import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';


const AdminDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    present_location: '',
  });
  const navigate = useNavigate();

  const fetchAllParcels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/parcels/all');
      setParcels(response.data);
      toast.success('Parcels loaded successfully');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/');
      } else {
        toast.error('Failed to fetch parcels');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllParcels();
  }, [fetchAllParcels]);

  const handleEditClick = (parcel) => {
    setSelectedParcel(parcel);
    setUpdateData({
      status: parcel.status,
      present_location: parcel.present_location || '',
    });
    setEditDialog(true);
  };

  const handleUpdateParcel = async () => {
    if (!selectedParcel) return;

    try {
      await api.put(`/parcels/${selectedParcel.id}/admin`, updateData);
      toast.success('Parcel updated successfully');
      setEditDialog(false);
      fetchAllParcels();
    } catch (error) {
      toast.error('Failed to update parcel');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AdminIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage all parcel deliveries and track system performance
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAllParcels}
                disabled={loading}
                sx={{ borderRadius: 3, px: 3 }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                sx={{ borderRadius: 3, px: 3 }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
          {[
            { label: 'Total Parcels', value: parcels.length, color: '#0066FF' },
            { label: 'Pending', value: parcels.filter(p => p.status === 'pending').length, color: '#FF9800' },
            { label: 'In Transit', value: parcels.filter(p => p.status === 'in_transit').length, color: '#2196F3' },
            { label: 'Delivered', value: parcels.filter(p => p.status === 'delivered').length, color: '#00C853' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                }}
              >
                <Typography variant="h3" fontWeight={800} color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>

        {/* Parcels Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              All Parcels
            </Typography>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography>Loading parcels...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcels.map((parcel) => (
                      <TableRow key={parcel.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{parcel.id.toString().padStart(4, '0')}
                          </Typography>
                        </TableCell>
                        <TableCell>{parcel.user_id}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {parcel.pickup_address.split(',')[0]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              → {parcel.destination_address.split(',')[0]}
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
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {parcel.present_location || 'Not set'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(parcel.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(parcel)}
                            sx={{
                              bgcolor: alpha('#0066FF', 0.1),
                              '&:hover': {
                                bgcolor: alpha('#0066FF', 0.2),
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Parcel #{selectedParcel?.id}
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Status"
              value={updateData.status}
              onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Present Location"
              value={updateData.present_location}
              onChange={(e) => setUpdateData({ ...updateData, present_location: e.target.value })}
              margin="normal"
              placeholder="e.g., En route to destination"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateParcel} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
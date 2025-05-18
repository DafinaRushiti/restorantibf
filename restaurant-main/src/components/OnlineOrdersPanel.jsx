import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  KeyboardArrowUp,
  Restaurant,
  LocalShipping,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import api from '../api/axios';

// Format date nicely for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

// Row component for expandable rows
const OrderRow = ({ order, onUpdateStatus, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState('');

  // Log the raw order data to debug
  console.log('Raw order data:', order);

  // Ensure order data has valid values or provide defaults
  const safeOrder = {
    id: order?.id || 'N/A',
    customerName: order?.customerName || order?.customer?.name || 'Guest',
    customerPhone: order?.customerPhone || order?.customer?.phone || 'N/A',
    createdAt: order?.createdAt || new Date().toISOString(),
    total: parseFloat(order?.total || order?.totalPrice || 0),
    status: order?.status || 'pending',
    deliveryAddress: order?.deliveryAddress || order?.address || '',
    paymentMethod: order?.paymentMethod || order?.payment || 'Cash',
    notes: order?.notes || order?.additionalNotes || '',
    // Try to get items from different possible structures
    items: Array.isArray(order?.items) ? order?.items : 
           Array.isArray(order?.OrderDetails) ? order?.OrderDetails.map(detail => ({
             name: detail?.Product?.name || 'Unknown Item',
             price: parseFloat(detail?.unitPrice || 0),
             quantity: parseInt(detail?.quantity || 0)
           })) : [],
    // Try to calculate subtotal if missing
    subtotal: parseFloat(order?.subtotal || 0),
    deliveryFee: parseFloat(order?.deliveryFee || 0)
  };

  // If subtotal is missing, calculate from items
  if (safeOrder.subtotal === 0 && safeOrder.items.length > 0) {
    safeOrder.subtotal = safeOrder.items.reduce((sum, item) => 
      sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)), 0);
  }

  // If total is missing, calculate from subtotal + delivery fee
  if (safeOrder.total === 0) {
    safeOrder.total = safeOrder.subtotal + safeOrder.deliveryFee;
  }

  // Initialize local status from order
  useEffect(() => {
    setLocalStatus(safeOrder.status);
  }, [safeOrder.status]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const success = await onUpdateStatus(safeOrder.id, newStatus);
      if (success) {
        // Update local status immediately for better UX
        setLocalStatus(newStatus);
        // Notify parent component about the status change
        if (onStatusChange) {
          onStatusChange(safeOrder.id, newStatus);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'completed': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Use local status for UI display instead of safeOrder.status
  const displayStatus = localStatus || safeOrder.status;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          #{safeOrder.id}
        </TableCell>
        <TableCell>{safeOrder.customerName}</TableCell>
        <TableCell>{safeOrder.customerPhone}</TableCell>
        <TableCell>{formatDate(safeOrder.createdAt)}</TableCell>
        <TableCell>${safeOrder.total.toFixed(2)}</TableCell>
        <TableCell>
          <Chip 
            label={displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
            color={getStatusColor(displayStatus)}
            size="small"
          />
        </TableCell>
        <TableCell>
          {updating ? (
            <CircularProgress size={24} />
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {displayStatus === 'pending' && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<Restaurant />}
                  onClick={() => handleStatusUpdate('preparing')}
                >
                  Prepare
                </Button>
              )}
              
              {displayStatus === 'preparing' && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleStatusUpdate('completed')}
                >
                  Complete
                </Button>
              )}
              
              {displayStatus === 'completed' && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<LocalShipping />}
                  onClick={() => handleStatusUpdate('delivered')}
                >
                  Deliver
                </Button>
              )}
              
              {['pending', 'preparing'].includes(displayStatus) && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  Cancel
                </Button>
              )}
            </Box>
          )}
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Order Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Delivery Address:</strong> {safeOrder.deliveryAddress || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment Method:</strong> {safeOrder.paymentMethod || 'Cash'}
                </Typography>
                <Typography variant="body2">
                  <strong>Notes:</strong> {safeOrder.notes || 'No notes provided'}
                </Typography>
              </Box>
              
              <Table size="small" aria-label="order items">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeOrder.items.map((item, index) => {
                    // Ensure item has valid values
                    const safeItem = {
                      name: item?.name || item?.productName || 'Unknown Item',
                      price: parseFloat(item?.price || item?.unitPrice || 0),
                      quantity: parseInt(item?.quantity || 0)
                    };
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{safeItem.name}</TableCell>
                        <TableCell>${safeItem.price.toFixed(2)}</TableCell>
                        <TableCell>{safeItem.quantity}</TableCell>
                        <TableCell>${(safeItem.price * safeItem.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell rowSpan={3} />
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>${safeOrder.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Delivery Fee</TableCell>
                    <TableCell>${safeOrder.deliveryFee.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>${safeOrder.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OnlineOrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchOnlineOrders();
    
    // Set up polling for orders every 30 seconds
    const intervalId = setInterval(() => {
      fetchOnlineOrders();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refreshTrigger]);

  const fetchOnlineOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders?source=online');
      console.log('API Response for online orders:', response.data);
      
      // Check if the data is an array
      if (!Array.isArray(response.data)) {
        console.error('API response is not an array:', response.data);
        setError('Received invalid data format from server');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Transform the data to ensure it has the expected structure
      const processedOrders = response.data.map(order => {
        // Log the raw order to help with debugging
        console.log('Processing order:', order);
        
        // Try to access customer info from different possible structures
        const customerName = order.customerName || 
                           (order.customer ? order.customer.name : null) || 
                           'Guest';
                           
        const customerPhone = order.customerPhone || 
                            (order.customer ? order.customer.phone : null) || 
                            'N/A';
        
        // Try to access order items from different possible structures
        let orderItems = [];
        if (Array.isArray(order.items)) {
          orderItems = order.items;
        } else if (Array.isArray(order.OrderDetails)) {
          orderItems = order.OrderDetails.map(detail => ({
            name: detail.Product ? detail.Product.name : 'Unknown Item',
            price: parseFloat(detail.unitPrice || 0),
            quantity: parseInt(detail.quantity || 0)
          }));
        }
        
        // Calculate total if missing
        let orderTotal = parseFloat(order.total || order.totalPrice || 0);
        let subtotal = parseFloat(order.subtotal || 0);
        let deliveryFee = parseFloat(order.deliveryFee || 0);
        
        // If no subtotal but we have items, calculate from items
        if (subtotal === 0 && orderItems.length > 0) {
          subtotal = orderItems.reduce((sum, item) => 
            sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)), 0);
        }
        
        // If no total, calculate from subtotal + delivery fee
        if (orderTotal === 0) {
          orderTotal = subtotal + deliveryFee;
        }
        
        return {
          id: order.id,
          customerName: customerName,
          customerPhone: customerPhone,
          createdAt: order.createdAt || new Date().toISOString(),
          total: orderTotal,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          status: order.status || 'pending',
          deliveryAddress: order.deliveryAddress || order.address || '',
          paymentMethod: order.paymentMethod || 'Cash',
          notes: order.notes || order.additionalNotes || '',
          items: orderItems
        };
      });
      
      setOrders(processedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching online orders:', err);
      setError('Failed to load online orders. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      // Make the API call
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      console.log('API Response:', response);
      
      // Update the order in the local state
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Show success message
      setStatusMessage(`Order #${orderId} has been changed to ${newStatus}`);
      setShowSuccessMessage(true);
      
      // Add delay before refreshing to allow UI to update
      setTimeout(() => {
        // Trigger refresh after update
        setRefreshTrigger(prev => prev + 1);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      // More detailed error message
      const errorMsg = error.response?.data?.msg || error.message || 'Unknown error occurred';
      setError(`Failed to update order status: ${errorMsg}`);
      setShowSuccessMessage(false);
      return false;
    }
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    // This function can be used to update UI or trigger side effects
    console.log(`Order ${orderId} status changed to ${newStatus}`);
    
    // If needed, we can record this status change for reports
    if (newStatus === 'delivered' || newStatus === 'completed') {
      // Here we could call an API endpoint to record this completed order for reports
      // api.post('/reports/record-sale', { orderId, status: newStatus });
    }
  };

  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  return (
    <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          Online Orders
        </Typography>
        <Button 
          variant="outlined" 
          onClick={refreshOrders}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Box display="flex" justifyContent="center" my={4}>
          <Typography variant="body1" color="text.secondary">
            No online orders available
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table aria-label="online orders table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Order Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <OrderRow 
                  key={order.id} 
                  order={order} 
                  onUpdateStatus={handleUpdateStatus}
                  onStatusChange={handleOrderStatusChange}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={statusMessage}
      />
    </Paper>
  );
};

export default OnlineOrdersPanel; 
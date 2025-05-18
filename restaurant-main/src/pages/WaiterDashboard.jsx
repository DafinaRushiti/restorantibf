import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Divider,
  IconButton,
  Box,
  Container,
  Chip,
  Badge,
  Grid,
  Menu,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Navbar from "../components/navbar";
import OnlineOrdersPanel from "../components/OnlineOrdersPanel";
import { AuthContext } from "../context/auth";
import api from "../api/axios";

const defaultImg =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=1000&q=80";

// Table status colors
const tableStatusColors = {
  free: {
    background: "white",
    indicator: "#52c41a", // green
    text: "#333",
    icon: "#52c41a",
    label: "Available",
  },
  busy: {
    background: "#fff0f0",
    indicator: "#e7582b", // red
    text: "#e7582b",
    icon: "#e7582b",
    label: "Occupied",
  },
  reserved: {
    background: "#fff9e6",
    indicator: "#faad14", // yellow
    text: "#d48806",
    icon: "#faad14",
    label: "Reserved",
  },
};

export default function WaiterDashboard() {
  const { user } = useContext(AuthContext);
  const tables = [1, 2, 3, 4, 5, 6, 7, 8];

  const [products, setProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState({});
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderPlacedMap, setOrderPlacedMap] = useState({});
  const [reservations, setReservations] = useState({}); // No tables reserved by default
  const [selectedTable, setSelectedTable] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tableActionMenu, setTableActionMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState(0);

  const [currentTab, setCurrentTab] = useState(0);
  const [deliveryType, setDeliveryType] = useState("Delivery");

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchActiveOrders();
    
    // Set up auto-refresh for active orders
    const interval = setInterval(() => {
      fetchActiveOrders();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Fetch products from the backend
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      
      // Organize products by category
      const productsByCat = {};
      const uniqueCategories = [];
      
      response.data.forEach(product => {
        if (!productsByCat[product.category]) {
          productsByCat[product.category] = [];
          uniqueCategories.push(product.category);
        }
        productsByCat[product.category].push({
          id: product.id,
          name: product.name,
          weight: product.description || "",
          price: parseFloat(product.price),
          img: product.imageUrl || defaultImg,
          stock: product.stock
        });
      });
      
      setProductsByCategory(productsByCat);
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
      setLoading(false);
    }
  };

  // Fetch active orders
  const fetchActiveOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('/orders');
      const pendingOrders = response.data.filter(order => order.status === 'pending' && order.source === 'lokal');
      setActiveOrders(pendingOrders);
      
      // Update the orders and orderPlacedMap state based on active orders
      const newOrders = {};
      const newOrderPlacedMap = {};
      
      pendingOrders.forEach(order => {
        const tableNumber = parseInt(order.tableNumber || 1);
        newOrders[tableNumber] = {};
        newOrderPlacedMap[tableNumber] = true;
        
        // Store the order ID for the table
        if (selectedTable === tableNumber) {
          setCurrentOrderId(order.id);
        }
        
        if (order.OrderDetails && Array.isArray(order.OrderDetails)) {
          order.OrderDetails.forEach(detail => {
            if (detail.Product) {
              newOrders[tableNumber][detail.productId] = {
                id: detail.productId,
                name: detail.Product.name,
                price: parseFloat(detail.unitPrice),
                qty: detail.quantity,
                img: detail.Product.imageUrl || defaultImg
              };
            }
          });
        }
      });
      
      // Merge with existing orders rather than replacing completely
      setOrders(prevOrders => {
        const mergedOrders = { ...prevOrders };
        Object.keys(newOrders).forEach(tableNum => {
          mergedOrders[tableNum] = newOrders[tableNum];
        });
        return mergedOrders;
      });
      
      setOrderPlacedMap(prevMap => ({ ...prevMap, ...newOrderPlacedMap }));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching active orders:", err);
      setError("Failed to load orders. Please check your connection.");
      setLoading(false);
    }
  };

  const handleOpen = (table) => {
    setSelectedTable(table);
    setCurrentTab(0);
    setDeliveryType("Delivery");
    
    // First check for the order in the current state
    if (orderPlacedMap[table]) {
      // Look for the matching active order
      const activeOrder = activeOrders.find(order => parseInt(order.tableNumber) === table);
      if (activeOrder) {
        setCurrentOrderId(activeOrder.id);
      } else {
        // If not found in active orders, try to fetch again
        api.get('/orders')
          .then(response => {
            const pendingOrders = response.data.filter(order => 
              order.status === 'pending' && 
              order.source === 'lokal' && 
              parseInt(order.tableNumber) === table
            );
            
            if (pendingOrders.length > 0) {
              setCurrentOrderId(pendingOrders[0].id);
              
              // Also update the orders data for this table if needed
              if (!orders[table] || Object.keys(orders[table]).length === 0) {
                const newTableOrders = {};
                pendingOrders[0].OrderDetails.forEach(detail => {
                  if (detail.Product) {
                    newTableOrders[detail.productId] = {
                      id: detail.productId,
                      name: detail.Product.name,
                      price: parseFloat(detail.unitPrice),
                      qty: detail.quantity,
                      img: detail.Product.imageUrl || defaultImg
                    };
                  }
                });
                
                setOrders(prev => ({
                  ...prev,
                  [table]: newTableOrders
                }));
              }
            } else {
              setCurrentOrderId(null);
            }
          })
          .catch(err => {
            console.error("Error fetching order for table:", err);
            setCurrentOrderId(null);
          });
      }
    } else {
      setCurrentOrderId(null);
    }
  };

  const handleClose = () => setSelectedTable(null);

  const handleTableActionClick = (event, table) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setTableActionMenu(table);
  };

  const handleTableActionClose = () => {
    setAnchorEl(null);
    setTableActionMenu(null);
  };

  const toggleReservation = (table) => {
    setReservations((prev) => {
      const newReservations = { ...prev };
      if (newReservations[table]) {
        delete newReservations[table];
      } else {
        newReservations[table] = true;
      }
      return newReservations;
    });
    handleTableActionClose();
  };

  // Add a function to clear a table from the table action menu
  const handleClearTableFromMenu = (table) => {
    // Clear the order data for this table
    setOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[table];
      return newOrders;
    });
    
    // Remove from orderPlacedMap
    setOrderPlacedMap(prev => {
      const newMap = { ...prev };
      delete newMap[table];
      return newMap;
    });
    
    // Show success message
    setSuccessMessage(`Table ${table} cleared successfully`);
    setSnackbarOpen(true);
    
    handleTableActionClose();
  };

  const handleAdd = (prod) => {
    if (prod.stock <= 0) {
      setError(`${prod.name} is out of stock`);
      setSnackbarOpen(true);
      return;
    }
    
    setOrders((prev) => {
      const tableCart = prev[selectedTable] || {};
      const existing = tableCart[prod.id] || { ...prod, qty: 0 };
      
      // Check if adding would exceed stock
      if (existing.qty + 1 > prod.stock) {
        setError(`Cannot add more ${prod.name}. Only ${prod.stock} available.`);
        setSnackbarOpen(true);
        return prev;
      }
      
      return {
        ...prev,
        [selectedTable]: {
          ...tableCart,
          [prod.id]: { ...existing, qty: existing.qty + 1 },
        },
      };
    });
    setOrderPlacedMap((p) => ({ ...p, [selectedTable]: false }));

    // If table was reserved, remove the reservation when adding items
    if (reservations[selectedTable]) {
      setReservations((prev) => {
        const newReservations = { ...prev };
        delete newReservations[selectedTable];
        return newReservations;
      });
    }
  };

  const handleRemove = (id) => {
    setOrders((prev) => {
      const tableCart = { ...prev[selectedTable] };
      if (tableCart[id].qty > 1) {
        tableCart[id] = { ...tableCart[id], qty: tableCart[id].qty - 1 };
      } else {
      delete tableCart[id];
      }

      // If cart is empty after removal, also remove from orderPlacedMap
      if (Object.keys(tableCart).length === 0) {
        setOrderPlacedMap((p) => {
          const newMap = { ...p };
          delete newMap[selectedTable];
          return newMap;
        });
        return {
          ...prev,
          [selectedTable]: {},
        };
      }

      return {
        ...prev,
        [selectedTable]: tableCart,
      };
    });
  };

  const placeOrder = async () => {
    if (!selectedTable || !orders[selectedTable] || Object.keys(orders[selectedTable]).length === 0) {
      setError("Cannot place an empty order");
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      // Format order items for the API
      const items = Object.values(orders[selectedTable]).map(item => ({
        productId: item.id,
        quantity: item.qty
      }));
      
      // Create the order
      const response = await api.post('/orders', {
        source: 'lokal',
        tableNumber: selectedTable.toString(),
        items
      });
      
      if (response.data && response.data.orderId) {
        setCurrentOrderId(response.data.orderId);
        setOrderPlacedMap(prev => ({ ...prev, [selectedTable]: true }));
        setSuccessMessage("Order placed successfully!");
        setSnackbarOpen(true);
        
        // Move to the order tab to show the placed order
        setCurrentTab(1);
        
        // Refresh product list to update stock
        fetchProducts();
        // Also refresh active orders
        fetchActiveOrders();
      } else {
        // Handle unexpected response format
        console.error("Unexpected response format:", response.data);
        setError("Order creation failed - server did not return an order ID");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.response?.data?.msg || "Failed to place order");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const generateCoupon = async () => {
    // If no currentOrderId, try to find it from activeOrders
    if (!currentOrderId) {
      const activeOrder = activeOrders.find(order => parseInt(order.tableNumber) === selectedTable);
      if (activeOrder) {
        setCurrentOrderId(activeOrder.id);
        // Wait for state update and then try again
        setTimeout(() => generateCoupon(), 100);
        return;
      } else {
        // Create a manual receipt from current table data
        const tableItems = orders[selectedTable] || {};
        const manualItems = Object.values(tableItems).map(item => ({
          name: item.name,
          quantity: item.qty,
          unitPrice: item.price
        }));
        
        const manualReceipt = {
          tableNumber: selectedTable,
          items: manualItems,
          total: calculateTotal()
        };
        
        setCouponData(manualReceipt);
        setCouponDialogOpen(true);
        
        // Only clear the order after displaying the receipt
        setTimeout(() => {
          setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[selectedTable];
            return newOrders;
          });
          
          setOrderPlacedMap(prev => {
            const newMap = { ...prev };
            delete newMap[selectedTable];
            return newMap;
          });
        }, 500);
        
        return;
      }
    }
    
    setLoading(true);
    try {
      // Store current table data as backup
      const tableItems = orders[selectedTable] || {};
      const backupItems = Object.values(tableItems).map(item => ({
        name: item.name,
        quantity: item.qty,
        unitPrice: item.price
      }));
      const backupTotal = calculateTotal();
      
      const response = await api.post(`/coupons/${currentOrderId}`);
      
      // Check if response contains valid data, otherwise use backup
      if (!response.data || !response.data.items || !response.data.items.length || !response.data.total) {
        console.warn('Using backup data for receipt');
        setCouponData({
          tableNumber: selectedTable,
          items: backupItems,
          total: backupTotal
        });
      } else {
        // Ensure response data has items array
        const safeData = {
          ...response.data,
          items: Array.isArray(response.data.items) ? response.data.items : [],
          total: parseFloat(response.data.total || backupTotal),
          tableNumber: selectedTable
        };
        setCouponData(safeData);
      }
      
      setCouponDialogOpen(true);
      
      // Only clear the order AFTER displaying receipt
      setTimeout(() => {
        // Clear the order after generating coupon
        setOrders(prev => {
          const newOrders = { ...prev };
          delete newOrders[selectedTable];
          return newOrders;
        });
        
        setOrderPlacedMap(prev => {
          const newMap = { ...prev };
          delete newMap[selectedTable];
          return newMap;
        });
        
        // Reset currentOrderId
        setCurrentOrderId(null);
        
        // Refresh active orders
        fetchActiveOrders();
      }, 500);
      
    } catch (err) {
      console.error("Error generating coupon:", err);
      
      // Fallback to manual receipt on error
      const tableItems = orders[selectedTable] || {};
      const manualItems = Object.values(tableItems).map(item => ({
        name: item.name,
        quantity: item.qty,
        unitPrice: item.price
      }));
      
      setCouponData({
        tableNumber: selectedTable,
        items: manualItems,
        total: calculateTotal()
      });
      
      setCouponDialogOpen(true);
      setError("Using local receipt data due to server error");
      setSnackbarOpen(true);
      
      // Still clear the table after showing receipt
      setTimeout(() => {
        setOrders(prev => {
          const newOrders = { ...prev };
          delete newOrders[selectedTable];
          return newOrders;
        });
        
        setOrderPlacedMap(prev => {
          const newMap = { ...prev };
          delete newMap[selectedTable];
          return newMap;
        });
        
        setCurrentOrderId(null);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const closeTable = () => {
    if (!orderPlacedMap[selectedTable]) {
      // If no order was placed but there are items in the cart, clear the table
      if (orders[selectedTable] && Object.keys(orders[selectedTable]).length > 0) {
        setOrders(prev => {
          const newOrders = { ...prev };
          delete newOrders[selectedTable];
          return newOrders;
        });
      }
      // Close the table dialog
      handleClose();
      return;
    }
    
    // If there's an active order but no currentOrderId, try to find it
    if (!currentOrderId) {
      const activeOrder = activeOrders.find(order => parseInt(order.tableNumber) === selectedTable);
      if (activeOrder) {
        setCurrentOrderId(activeOrder.id);
        // Wait for state update and then generate coupon
        setTimeout(() => generateCoupon(), 100);
        return;
      }
    }
    
    // If order was placed, generate coupon
    generateCoupon();
  };

  // Add a new function to clear the table without generating a receipt
  const clearTable = () => {
    // Clear the order data for this table
    setOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[selectedTable];
      return newOrders;
    });
    
    // Remove from orderPlacedMap
    setOrderPlacedMap(prev => {
      const newMap = { ...prev };
      delete newMap[selectedTable];
      return newMap;
    });
    
    // Clear the currentOrderId if it matches this table
    if (currentOrderId) {
      const matchingOrder = activeOrders.find(
        order => order.id === currentOrderId && parseInt(order.tableNumber) === selectedTable
      );
      
      if (matchingOrder) {
        setCurrentOrderId(null);
      }
    }
    
    // Close the dialog
    handleClose();
    
    // Show success message
    setSuccessMessage("Table cleared successfully");
    setSnackbarOpen(true);
  };

  const getTableStatus = (table) => {
    // Check if table has any items in the order
    const hasItems = orders[table] && Object.keys(orders[table]).length > 0;
    
    if (reservations[table]) return "reserved";
    if (orderPlacedMap[table] || hasItems) return "busy";
    return "free";
  };

  const getTableItems = (table) => {
    const tableOrder = orders[table] || {};
    return Object.values(tableOrder).reduce((sum, item) => sum + item.qty, 0);
  };

  const getTableTotal = (table) => {
    const tableOrder = orders[table] || {};
    return Object.values(tableOrder).reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  };

  // Calculate total for the current table
  const calculateTotal = () => {
    if (!selectedTable || !orders[selectedTable]) return 0;
    return getTableTotal(selectedTable);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle coupon dialog close
  const handleCouponDialogClose = () => {
    setCouponDialogOpen(false);
    handleClose(); // Close the table dialog as well
  };

  // Add handler for dashboard tabs
  const handleDashboardTabChange = (event, newValue) => {
    setDashboardTab(newValue);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
          Waiter Dashboard
        </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Manage tables, orders, and view online orders
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Dashboard Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={dashboardTab}
            onChange={handleDashboardTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<EventSeatIcon />} label="Tables" />
            <Tab icon={<ReceiptIcon />} label="Online Orders" />
          </Tabs>
        </Paper>

        {/* Tables Tab */}
        {dashboardTab === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Restaurant Floor Plan
        </Typography>
            <Grid container spacing={3}>
          {tables.map((table) => {
                const tableStatus = getTableStatus(table);
                const statusStyle = tableStatusColors[tableStatus];
                const hasItems = getTableItems(table) > 0;
                const totalAmount = getTableTotal(table);

            return (
              <Grid item xs={6} sm={4} md={3} key={table}>
                <Paper
                  sx={{
                        p: 3,
                    cursor: "pointer",
                        position: "relative",
                    borderRadius: 2,
                        border: "1px solid #eee",
                        background: statusStyle.background,
                        textAlign: "center",
                        transition: "all 0.2s ease-in-out",
                    "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-5px)",
                    },
                  }}
                  onClick={() => handleOpen(table)}
                >
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                          right: 8,
                          top: 8,
                    }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableActionClick(e, table);
                        }}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Box
                      sx={{
                          width: 20,
                          height: 20,
                      borderRadius: "50%",
                          background: statusStyle.indicator,
                      position: "absolute",
                      top: 10,
                      left: 10,
                      }}
                    />

                  <EventSeatIcon
                      sx={{
                          fontSize: 50,
                      mb: 1,
                          color: statusStyle.icon,
                      }}
                    />
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Table {table}
                      </Typography>
                  <Typography
                        variant="body2"
                        sx={{ color: statusStyle.text, mb: 1 }}
                  >
                        {statusStyle.label}
                  </Typography>

                      {hasItems && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                    >
                            {getTableItems(table)} items
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", color: "#e7582b" }}
                          >
                            ${totalAmount.toFixed(2)}
                  </Typography>
                        </>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
          </>
        )}

        {/* Online Orders Tab */}
        {dashboardTab === 1 && (
          <Box>
            <OnlineOrdersPanel />
          </Box>
        )}

        {/* Table Dialog */}
      <Dialog
          open={Boolean(selectedTable)}
        onClose={handleClose}
          maxWidth="md"
        fullWidth
          scroll="paper"
          PaperProps={{ 
            sx: { 
              minHeight: '80vh',
              maxHeight: '85vh',
              borderRadius: 2
            } 
          }}
        >
          {selectedTable && (
            <>
              <DialogTitle sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Table {selectedTable}</Typography>
                <Box>
                  <Chip
                    label={orderPlacedMap[selectedTable] ? "Order Placed" : "New Order"}
                    color={orderPlacedMap[selectedTable] ? "success" : "primary"}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <IconButton onClick={handleClose} edge="end">
            <CloseIcon />
          </IconButton>
                </Box>
        </DialogTitle>

              <DialogContent sx={{ p: 0 }}>
                {orderPlacedMap[selectedTable] ? (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Current Order for Table {selectedTable}
                    </Typography>
                    {Object.values(orders[selectedTable] || {}).map((item) => (
                      <Box
                        key={item.id}
            sx={{
                          display: "flex",
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          border: "1px solid #eee",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            overflow: "hidden",
                            mr: 2,
                            flexShrink: 0,
                          }}
                        >
                          <Box 
                            sx={{ 
                              height: "60px", 
                              overflow: "hidden",
                              position: "relative" 
                            }}
                          >
                            <img
                              src={item.img}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center"
                              }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            ${item.price} × {item.qty}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold", mr: 2 }}
                          >
                            ${(item.price * item.qty).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mr: 2 }}>
                        Total:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                        ${calculateTotal().toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Tabs
                        value={currentTab}
                        onChange={(e, v) => setCurrentTab(v)}
                        variant="fullWidth"
                      >
                        <Tab label="Menu" />
                        <Tab
                          label={
                            <Badge
                              color="error"
                              badgeContent={Object.keys(orders[selectedTable] || {}).length}
                            >
                              Order
                            </Badge>
                          }
                        />
              </Tabs>
              </Box>

                    {currentTab === 0 && (
                      <Box sx={{ px: 3, py: 2 }}>
              <Box
                sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            mb: 2,
                            gap: 0.5,
                }}
              >
                          {categories.map((category, idx) => (
                            <Chip
                              key={idx}
                              label={
                                category.charAt(0).toUpperCase() + category.slice(1)
                              }
                              onClick={() => {
                                const element = document.getElementById(
                                  `category-${category}`
                                );
                                if (element) {
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: "12px",
                                fontSize: "0.7rem",
                                height: "24px",
                                "&:hover": {
                                  background: "#f5f5f5",
                                },
                              }}
                            />
                          ))}
                  </Box>

                        <Box sx={{ height: "65vh", overflowY: "auto", pr: 1 }}>
                          {categories.map((category) => (
                            <Box key={category} sx={{ mb: 3 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  mb: 1.5,
                                  pb: 0.5,
                                  borderBottom: "1px solid #eee",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold"
                                }}
                                id={`category-${category}`}
                              >
                                {category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                              </Typography>
                  <Grid container spacing={2}>
                                {productsByCategory[category]?.map((product) => (
                                  <Grid item xs={4} sm={3} md={2} key={product.id}>
                                    <Card
                                      sx={{
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        "&:hover": {
                                          transform: "translateY(-5px)",
                                          boxShadow: 3,
                                        },
                                      }}
                                      onClick={() => handleAdd(product)}
                                    >
                                      <Box 
                                        sx={{ 
                                          height: "60px", 
                                          overflow: "hidden",
                                          position: "relative" 
                                        }}
                                      >
                                        <img
                                          src={product.img}
                                          alt={product.name}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "center"
                                          }}
                                        />
                                      </Box>
                                      <CardContent sx={{ p: 1, pb: 1, flexGrow: 1 }}>
                                        <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.75rem' }}>
                                          {product.name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mb: 0.5, display: 'block', fontSize: '0.65rem' }}
                                        >
                                          {product.weight}
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mt: 'auto',
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: "bold", fontSize: '0.75rem' }}
                                          >
                                            ${product.price}
                                          </Typography>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ minWidth: 0, p: 0.2, minHeight: 0, height: '18px', width: '18px' }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAdd(product);
                                            }}
                                          >
                                            +
                                          </Button>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                  </Grid>
            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {currentTab === 1 && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                          Order for Table {selectedTable}
              </Typography>

                        {Object.keys(orders[selectedTable] || {}).length > 0 ? (
                          <Box>
                            <Box
                              sx={{
                                height: "50vh",
                                overflowY: "auto",
                                pr: 1,
                                mb: 2,
                              }}
                            >
                              {Object.values(orders[selectedTable] || {}).map(
                                (item) => (
                      <Box
                        key={item.id}
                  sx={{
                          display: "flex",
                                      p: 2,
                                      mb: 2,
                                      borderRadius: 2,
                                      border: "1px solid #eee",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    }}
                                  >
                          <Box
                            sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 1,
                                        overflow: "hidden",
                                        mr: 2,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Box 
                                        sx={{ 
                                          height: "60px", 
                                          overflow: "hidden",
                                          position: "relative" 
                                        }}
                                      >
                                        <img
                                          src={item.img}
                                          alt={item.name}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "center"
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="subtitle1">
                                        {item.name}
                                      </Typography>
                <Typography
                  variant="body2"
                                        sx={{ color: "text.secondary" }}
                >
                                        ${item.price} × {item.qty}
                </Typography>
                                    </Box>
                                    <Box
                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: "bold" }}
                        >
                          ${(item.price * item.qty).toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                                        color="error"
                          onClick={() => handleRemove(item.id)}
                        >
                                        <DeleteIcon />
                        </IconButton>
                    </Box>
                                  </Box>
                                )
                              )}
                            </Box>

                            <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
                              <Typography variant="h6" sx={{ mb: 2 }}>
                                Order Summary
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography>Subtotal</Typography>
                                <Typography sx={{ fontWeight: "bold" }}>
                                  ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                                  mb: 2,
                  }}
                >
                                <Typography variant="body2">
                                  Items: {Object.keys(orders[selectedTable] || {}).length}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              p: 4,
                              textAlign: "center",
                              border: "1px dashed #ddd",
                              borderRadius: 2,
                            }}
                          >
                            <ShoppingCartIcon
                              sx={{ fontSize: 40, color: "#ddd", mb: 2 }}
                            />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              Cart is Empty
                            </Typography>
                  <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mb: 2 }}
                  >
                              Add items from the menu tab
                  </Typography>
                            <Button
                              variant="outlined"
                              onClick={() => setCurrentTab(0)}
                            >
                              Browse Menu
                            </Button>
                </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </DialogContent>

              <DialogActions
                sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.12)" }}
              >
                {currentTab === 1 && Object.keys(orders[selectedTable] || {}).length > 0 && (
                  <>
                    {orderPlacedMap[selectedTable] ? (
                      <>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={closeTable}
                          sx={{ mr: 1 }}
                        >
                          Close Table
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<PrintIcon />}
                          onClick={generateCoupon}
                        >
                          Generate Receipt
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={clearTable}
                          sx={{ mr: 1 }}
                        >
                          Clear Table
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<RestaurantIcon />}
                          onClick={placeOrder}
                        >
                          Place Order
                        </Button>
                      </>
                    )}
                  </>
                )}
                {currentTab === 1 && Object.keys(orders[selectedTable] || {}).length === 0 && orderPlacedMap[selectedTable] && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={closeTable}
                      sx={{ mr: 1 }}
                    >
                      Close Table
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={generateCoupon}
                    >
                      Generate Receipt
                    </Button>
                  </>
                )}
                {currentTab === 1 && Object.keys(orders[selectedTable] || {}).length === 0 && !orderPlacedMap[selectedTable] && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                )}
              </DialogActions>
            </>
          )}
      </Dialog>

        {/* Menu for table actions */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleTableActionClose}
        >
          <MenuItem
            onClick={() => {
              toggleReservation(tableActionMenu);
              handleTableActionClose();
            }}
          >
            {reservations[tableActionMenu]
              ? "Cancel Reservation"
              : "Mark as Reserved"}
          </MenuItem>
          
          {/* Add a menu item to clear a table if it has items */}
          {tableActionMenu && orders[tableActionMenu] && Object.keys(orders[tableActionMenu]).length > 0 && (
            <MenuItem
              onClick={() => {
                handleClearTableFromMenu(tableActionMenu);
              }}
            >
              Clear Table
            </MenuItem>
          )}
        </Menu>

        {/* Receipt Popup */}
        <Dialog
          open={couponDialogOpen}
          onClose={handleCouponDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Receipt</DialogTitle>
          <DialogContent>
            {couponData && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Restaurant Receipt
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography sx={{ mb: 1 }}>
                  Table: {couponData.tableNumber || 'N/A'}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Date: {new Date().toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                  Items:
                </Typography>
                {couponData.items && couponData.items.length > 0 ? (
                  couponData.items.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography>
                        {item.name || item.Product?.name || 'Item'} × {item.quantity}
                      </Typography>
                      <Typography>${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>No items available</Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    ${couponData.total ? couponData.total.toFixed(2) : '0.00'}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
                >
                  Thank you for your visit!
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCouponDialogClose}>Close</Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message="Order successfully placed!"
        />
      </Container>
    </>
  );
}

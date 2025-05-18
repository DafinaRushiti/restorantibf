import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import Navbar from "../components/navbar";
import { AuthContext } from "../context/auth";
import api from "../api/axios";

// Menu categories
const productCategories = ["appetizer", "main", "dessert", "beverage"];

export default function InventoryManagement() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  
  // Stock adjustment dialog
  const [adjustStockDialog, setAdjustStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("restock");
  
  // Product dialog
  const [productDialog, setProductDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "main",
    price: "",
    stock: "",
    imageUrl: "",
    minStockLevel: "5" // New field for minimum stock level
  });
  
  // Inventory stats
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    // Filter products based on search term and current tab
    if (products.length > 0) {
      let filtered = [...products];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply tab filter
      if (currentTab === 1) { // Low stock
        filtered = filtered.filter(product => product.stock <= (product.minStockLevel || 5));
      } else if (currentTab === 2) { // Out of stock
        filtered = filtered.filter(product => product.stock === 0);
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm, currentTab]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      calculateInventoryStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
      setLoading(false);
    }
  };
  
  const calculateInventoryStats = (productData) => {
    const stats = {
      totalProducts: productData.length,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };
    
    productData.forEach(product => {
      // Calculate total inventory value
      stats.totalValue += product.price * product.stock;
      
      // Count low stock items
      if (product.stock <= (product.minStockLevel || 5) && product.stock > 0) {
        stats.lowStockItems++;
      }
      
      // Count out of stock items
      if (product.stock === 0) {
        stats.outOfStockItems++;
      }
    });
    
    setInventoryStats(stats);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Product dialog handlers
  const openProductDialog = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || "",
        minStockLevel: (product.minStockLevel || 5).toString()
      });
    } else {
      setSelectedProduct(null);
      setProductForm({
        name: "",
        description: "",
        category: "main",
        price: "",
        stock: "",
        imageUrl: "",
        minStockLevel: "5"
      });
    }
    setProductDialog(true);
  };

  const closeProductDialog = () => {
    setProductDialog(false);
    setSelectedProduct(null);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProduct = async () => {
    setLoading(true);
    setError("");
    
    // Form validation
    if (!productForm.name || !productForm.price || !productForm.stock) {
      setError("Name, price and stock are required");
      setLoading(false);
      return;
    }
    
    try {
      const formData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        minStockLevel: parseInt(productForm.minStockLevel),
        createdByAdminId: user?.id
      };
      
      let response;
      if (selectedProduct) {
        // Update existing product
        response = await api.put(`/products/${selectedProduct.id}`, formData);
        setSuccessMessage("Product updated successfully");
      } else {
        // Create new product
        response = await api.post('/products', formData);
        setSuccessMessage("Product added successfully");
      }
      
      // Refresh products list
      fetchProducts();
      closeProductDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.msg || "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await api.delete(`/products/${id}`);
      setSuccessMessage("Product deleted successfully");
      
      // Refresh products list
      fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.response?.data?.msg || "Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Stock adjustment handlers
  const openAdjustStockDialog = (product) => {
    setSelectedProduct(product);
    setAdjustmentAmount(0);
    setAdjustmentReason("restock");
    setAdjustStockDialog(true);
  };
  
  const closeAdjustStockDialog = () => {
    setAdjustStockDialog(false);
    setSelectedProduct(null);
    setAdjustmentAmount(0);
  };
  
  const handleAdjustStock = async () => {
    if (!selectedProduct || adjustmentAmount === 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Calculate new stock level
      const newStock = Math.max(0, selectedProduct.stock + parseInt(adjustmentAmount));
      
      // Update product stock
      await api.put(`/products/${selectedProduct.id}`, {
        stock: newStock
      });
      
      setSuccessMessage(`Stock ${adjustmentAmount > 0 ? 'increased' : 'decreased'} successfully`);
      
      // Refresh products list
      fetchProducts();
      closeAdjustStockDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error adjusting stock:", err);
      setError(err.response?.data?.msg || "Failed to adjust stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const getStockStatus = (product) => {
    const minLevel = product.minStockLevel || 5;
    
    if (product.stock === 0) {
      return { label: "Out of Stock", color: "error" };
    } else if (product.stock <= minLevel) {
      return { label: "Low Stock", color: "warning" };
    } else {
      return { label: "In Stock", color: "success" };
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", pb: 4 }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 4,
            color: "#333",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <InventoryIcon sx={{ mr: 1, color: "#e7582b" }} />
          Inventory Management
        </Typography>
        
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Inventory Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Products
                </Typography>
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {inventoryStats.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  Inventory Value
                </Typography>
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {formatCurrency(inventoryStats.totalValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', backgroundColor: '#fff9e6' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  Low Stock Items
                </Typography>
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold', color: '#d48806' }}>
                  {inventoryStats.lowStockItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', backgroundColor: '#fff0f0' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">
                  Out of Stock
                </Typography>
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold', color: '#e7582b' }}>
                  {inventoryStats.outOfStockItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Search and Filter Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products by name or category"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchProducts}
                sx={{
                  mr: 1,
                  backgroundColor: "#1890ff",
                  "&:hover": { backgroundColor: "#0c7cd5" },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openProductDialog()}
                sx={{
                  backgroundColor: "#52c41a",
                  "&:hover": { backgroundColor: "#389e0d" },
                }}
              >
                Add Product
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabs for filtering */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: "medium",
                fontSize: "1rem",
              },
              "& .Mui-selected": {
                color: "#e7582b",
                fontWeight: "bold",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#e7582b",
              },
            }}
          >
            <Tab label="All Products" />
            <Tab label="Low Stock" />
            <Tab label="Out of Stock" />
          </Tabs>
        </Box>
        
        {/* Products Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Min. Stock Level</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                        <TableCell align="right">{product.stock}</TableCell>
                        <TableCell align="right">{product.minStockLevel || 5}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={stockStatus.label} 
                            color={stockStatus.color} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(product.price * product.stock)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            onClick={() => openAdjustStockDialog(product)}
                            title="Adjust Stock"
                          >
                            <InventoryIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => openProductDialog(product)}
                            title="Edit Product"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => deleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
      
      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={closeProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            value={productForm.name}
            onChange={handleProductFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={productForm.description}
            onChange={handleProductFormChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={productForm.category}
              label="Category"
              onChange={handleProductFormChange}
            >
              {productCategories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="price"
                label="Price ($)"
                type="number"
                fullWidth
                value={productForm.price}
                onChange={handleProductFormChange}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="stock"
                label="Current Stock"
                type="number"
                fullWidth
                value={productForm.stock}
                onChange={handleProductFormChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="minStockLevel"
                label="Minimum Stock Level"
                type="number"
                fullWidth
                value={productForm.minStockLevel}
                onChange={handleProductFormChange}
                inputProps={{ min: 0 }}
                helperText="Alert will be shown when stock falls below this level"
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            name="imageUrl"
            label="Image URL (optional)"
            type="text"
            fullWidth
            value={productForm.imageUrl}
            onChange={handleProductFormChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProductDialog}>
            Cancel
          </Button>
          <Button onClick={saveProduct} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustStockDialog} onClose={closeAdjustStockDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Adjust Stock: {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Current Stock: <strong>{selectedProduct?.stock || 0}</strong>
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Adjustment Amount"
            type="number"
            fullWidth
            value={adjustmentAmount}
            onChange={(e) => setAdjustmentAmount(e.target.value)}
            helperText="Use positive numbers to add stock, negative to remove"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reason for Adjustment</InputLabel>
            <Select
              value={adjustmentReason}
              label="Reason for Adjustment"
              onChange={(e) => setAdjustmentReason(e.target.value)}
            >
              <MenuItem value="restock">Restock</MenuItem>
              <MenuItem value="damaged">Damaged/Expired</MenuItem>
              <MenuItem value="correction">Inventory Correction</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2">
              New Stock Level: <strong>{Math.max(0, (selectedProduct?.stock || 0) + parseInt(adjustmentAmount || 0))}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdjustStockDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdjustStock} 
            variant="contained" 
            disabled={loading || adjustmentAmount === 0}
          >
            {loading ? <CircularProgress size={24} /> : "Apply"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import InsightsIcon from "@mui/icons-material/Insights";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Navbar from "../components/navbar";
import DailyReportTable from "../components/DailyReportTable";
import OnlineOrdersPanel from "../components/OnlineOrdersPanel";
import { AuthContext } from "../context/auth";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

// Menu categories
const productCategories = ["appetizer", "main", "dessert", "beverage"];

// Staff roles
const staffRoles = ["kamarier", "admin"];

const ManagerPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Daily reports state
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [dailyReports, setDailyReports] = useState([]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Product form state
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "main",
    price: "",
    stock: "",
    imageUrl: "",
    tags: ""
  });
  
  // Staff form state
  const [staffDialog, setStaffDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "kamarier"
  });
  
  // Revenue data state
  const [revenueData, setRevenueData] = useState({
    today: "$0",
    week: "$0",
    month: "$0",
  });

  // Load products and staff on initial render
  useEffect(() => {
    fetchProducts();
    fetchStaff();
    if (currentTab === 3) {
      fetchDailyReports(reportDate);
    }
  }, [currentTab, reportDate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('/auth/staff');
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to load staff. Please try again.");
      setLoading(false);
    }
  };

  const fetchDailyReports = async (date) => {
    setReportsLoading(true);
    setReportsError("");
    try {
      const response = await api.get(`/reports/daily?date=${date}`);
      
      // Process the data to ensure it's in the right format
      let reportData = response.data;
      
      // Check if it's an empty array or undefined - provide sample data for testing if needed
      if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
        // For testing purposes only - remove this in production
        console.log('No reports found for date: ' + date);
        
        // You can uncomment this for testing UI without backend data
        /*
        reportData = [
          {
            staffName: 'John Doe',
            staffRole: 'Waiter',
            orderCount: 12,
            itemCount: 35,
            totalSales: 450.75
          },
          {
            staffName: 'Jane Smith',
            staffRole: 'Waiter',
            orderCount: 8,
            itemCount: 22,
            totalSales: 320.50
          }
        ];
        */
      }
      
      // Ensure all numeric values are properly formatted as numbers
      const processedReports = Array.isArray(reportData) ? reportData.map(report => ({
        staffName: report?.staffName || 'Unknown Staff',
        staffRole: report?.staffRole || 'N/A',
        orderCount: Number(report?.orderCount) || 0,
        itemCount: Number(report?.itemCount) || 0,
        totalSales: Number(report?.totalSales) || 0
      })) : [];
      
      setDailyReports(processedReports);
      setReportsLoading(false);
    } catch (err) {
      console.error("Error fetching daily reports:", err);
      setReportsError("Failed to load daily reports. Please try again.");
      setReportsLoading(false);
      // Still set empty reports array so UI doesn't break
      setDailyReports([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Product dialog handlers
  const openProductDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || "",
        tags: product.tags || ""
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        category: "main",
        price: "",
        stock: "",
        imageUrl: "",
        tags: ""
      });
    }
    setProductDialog(true);
  };

  const closeProductDialog = () => {
    setProductDialog(false);
    setEditingProduct(null);
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
        createdByAdminId: user?.id
      };
      
      let response;
      if (editingProduct) {
        // Update existing product
        response = await api.put(`/products/${editingProduct.id}`, formData);
        setSuccessMessage("Product updated successfully");
      } else {
        // Create new product
        response = await api.post('/products', formData);
        setSuccessMessage("Product created successfully");
      }
      
      setLoading(false);
      closeProductDialog();
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Failed to save product. Please try again.");
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
      setProducts(products.filter(p => p.id !== id));
      setSuccessMessage("Product deleted successfully");
      setLoading(false);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
      setLoading(false);
    }
  };

  // Staff dialog handlers
  const openStaffDialog = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setStaffForm({
        fullName: staff.fullName,
        email: staff.email,
        password: "", // Don't fill password for security
        role: staff.role
      });
    } else {
      setEditingStaff(null);
      setStaffForm({
        fullName: "",
        email: "",
        password: "",
        role: "kamarier"
      });
    }
    setStaffDialog(true);
  };

  const closeStaffDialog = () => {
    setStaffDialog(false);
    setEditingStaff(null);
  };

  const handleStaffFormChange = (e) => {
    const { name, value } = e.target;
    setStaffForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveStaff = async () => {
    setLoading(true);
    setError("");
    
    // Form validation
    if (!staffForm.fullName || !staffForm.email || (!editingStaff && !staffForm.password)) {
      setError("Full name, email and password are required");
      setLoading(false);
      return;
    }
    
    try {
      let response;
      if (editingStaff) {
        // Update existing staff member
        // If password is empty, don't update it
        const formData = { ...staffForm };
        if (!formData.password) {
          delete formData.password;
        }
        
        response = await api.put(`/auth/staff/${editingStaff.id}`, formData);
        setSuccessMessage("Staff updated successfully");
      } else {
        // Create new staff member
        response = await api.post('/auth/register/staff', staffForm);
        setSuccessMessage("Staff created successfully");
      }
      
      setLoading(false);
      closeStaffDialog();
      fetchStaff(); // Refresh staff list
    } catch (err) {
      console.error("Error saving staff:", err);
      setError("Failed to save staff member. Please try again.");
      setLoading(false);
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await api.delete(`/auth/staff/${id}`);
      setEmployees(employees.filter(e => e.id !== id));
      setSuccessMessage("Staff deleted successfully");
      setLoading(false);
    } catch (err) {
      console.error("Error deleting staff:", err);
      setError("Failed to delete staff member. Please try again.");
      setLoading(false);
    }
  };

  const navigateToAnalytics = () => {
    navigate('/admin/analytics');
  };

  const navigateToInventory = () => {
    navigate('/admin/inventory');
  };

  const handleReportDateChange = (date) => {
    setReportDate(date);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
          Manager Dashboard
        </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Manage your restaurant operations
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

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<RestaurantIcon />} label="Menu Items" />
            <Tab icon={<GroupIcon />} label="Staff" />
            <Tab icon={<ReceiptIcon />} label="Online Orders" />
            <Tab icon={<AssessmentIcon />} label="Daily Reports" />
            <Tab icon={<MonetizationOnIcon />} label="Revenue" />
          </Tabs>
        </Paper>

        {/* Menu Items Tab */}
        {currentTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Menu Items</Typography>
              <Box>
                        <Button
                          variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => openProductDialog()}
                  sx={{ mr: 1 }}
                        >
                  Add Product
                        </Button>
                  <Button
                  variant="outlined"
                    startIcon={<RefreshIcon />}
                  onClick={fetchProducts}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>
              
              {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <Card>
                      {product.imageUrl && (
                        <CardContent sx={{ p: 0 }}>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{ width: "100%", height: 200, objectFit: "cover" }}
                          />
                        </CardContent>
                      )}
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {product.description || "No description"}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">
                            ${parseFloat(product.price).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Stock: {product.stock}
                          </Typography>
                        </Box>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => openProductDialog(product)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                            size="small"
                            color="error"
                            onClick={() => deleteProduct(product.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
            </CardContent>
          </Card>
                  </Grid>
                ))}
                {products.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <Typography>No products found. Add your first product!</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        )}

        {/* Staff Tab */}
        {currentTab === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Staff Management</Typography>
                <Box>
                  <Button
                    variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => openStaffDialog()}
                  sx={{ mr: 1 }}
                  >
                  Add Staff
                  </Button>
                  <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchStaff}
                  >
                  Refresh
                  </Button>
                </Box>
              </Box>
              
              {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
              <Grid container spacing={3}>
                {employees.map((employee) => (
                  <Grid item xs={12} sm={6} md={4} key={employee.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {employee.fullName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {employee.email}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Role: {employee.role}
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => openStaffDialog(employee)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                            size="small"
                            color="error"
                            onClick={() => deleteStaff(employee.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {employees.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <Typography>No staff members found. Add your first staff member!</Typography>
                    </Paper>
                  </Grid>
              )}
              </Grid>
            )}
          </Box>
        )}

        {/* Online Orders Tab */}
        {currentTab === 2 && (
          <Box>
            <OnlineOrdersPanel />
              </Box>
        )}

        {/* Daily Reports Tab */}
        {currentTab === 3 && (
          <Box>
            <DailyReportTable 
              reports={dailyReports}
              loading={reportsLoading}
              error={reportsError}
              date={reportDate}
              onDateChange={handleReportDateChange}
            />
          </Box>
        )}

        {/* Revenue Tab */}
        {currentTab === 4 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
            <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Today's Revenue
              </Typography>
                    <Typography variant="h4" color="primary">
                      {revenueData.today}
                </Typography>
                  </CardContent>
                </Card>
                  </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weekly Revenue
                      </Typography>
                    <Typography variant="h4" color="primary">
                      {revenueData.week}
                    </Typography>
                  </CardContent>
                </Card>
                  </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Revenue
                      </Typography>
                    <Typography variant="h4" color="primary">
                      {revenueData.month}
                    </Typography>
                  </CardContent>
                </Card>
                  </Grid>
                </Grid>

            <Box mt={4} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                color="primary"
                  startIcon={<InsightsIcon />}
                  onClick={navigateToAnalytics}
                sx={{ mr: 2 }}
                >
                Detailed Analytics
              </Button>
              <Button
                variant="outlined"
                startIcon={<InventoryIcon />}
                onClick={navigateToInventory}
              >
                Inventory Management
                </Button>
              </Box>
          </Box>
        )}
      </Container>
      
      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={closeProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
              label="Product Name"
              name="name"
            value={productForm.name}
            onChange={handleProductFormChange}
              margin="normal"
          />
          <TextField
            fullWidth
              label="Description"
              name="description"
            value={productForm.description}
            onChange={handleProductFormChange}
              margin="normal"
              multiline
              rows={3}
          />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={productForm.category}
              onChange={handleProductFormChange}
                label="Category"
            >
                {productCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
              <TextField
              fullWidth
              label="Price"
                name="price"
                type="number"
                value={productForm.price}
                onChange={handleProductFormChange}
              margin="normal"
              InputProps={{ startAdornment: "$" }}
              />
              <TextField
              fullWidth
                label="Stock"
              name="stock"
                type="number"
                value={productForm.stock}
                onChange={handleProductFormChange}
              margin="normal"
              />
          <TextField
            fullWidth
              label="Image URL"
              name="imageUrl"
            value={productForm.imageUrl}
            onChange={handleProductFormChange}
              margin="normal"
              placeholder="https://example.com/image.jpg"
          />
          <TextField
            fullWidth
              label="Tags (comma separated)"
              name="tags"
            value={productForm.tags}
            onChange={handleProductFormChange}
              margin="normal"
              placeholder="e.g. spicy,vegan,bestseller"
          />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProductDialog}>Cancel</Button>
          <Button
            onClick={saveProduct}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Staff Dialog */}
      <Dialog open={staffDialog} onClose={closeStaffDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
              label="Full Name"
              name="fullName"
            value={staffForm.fullName}
            onChange={handleStaffFormChange}
              margin="normal"
          />
          <TextField
              fullWidth
            label="Email"
              name="email"
            type="email"
            value={staffForm.email}
            onChange={handleStaffFormChange}
              margin="normal"
          />
          <TextField
              fullWidth
              label={editingStaff ? "New Password (leave blank to keep current)" : "Password"}
            name="password"
            type="password"
            value={staffForm.password}
            onChange={handleStaffFormChange}
              margin="normal"
          />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={staffForm.role}
              onChange={handleStaffFormChange}
                label="Role"
            >
                {staffRoles.map((role) => (
                <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStaffDialog}>Cancel</Button>
          <Button
            onClick={saveStaff}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManagerPanel;

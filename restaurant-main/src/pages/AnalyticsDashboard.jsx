import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InsightsIcon from "@mui/icons-material/Insights";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Navbar from "../components/navbar";
import { AuthContext } from "../context/auth";
import api from "../api/axios";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e7582b'];

export default function AnalyticsDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  
  // Data states
  const [salesData, setSalesData] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  
  // Filter states
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Summary metrics
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [salesGrowth, setSalesGrowth] = useState(0);
  
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, selectedPeriod, startDate, endDate]);
  
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch reports data
      const reportsResponse = await api.get('/reports');
      setDailyReports(reportsResponse.data);
      
      // Fetch all orders for detailed analysis
      const ordersResponse = await api.get('/orders');
      const orders = ordersResponse.data;
      
      // Process sales data by date
      processSalesData(orders);
      
      // Process product statistics
      processProductStats(orders);
      
      // Calculate summary metrics
      calculateSummaryMetrics(orders);
      
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const processSalesData = (orders) => {
    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Group by date
    const salesByDate = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          sales: 0,
          orders: 0,
          local: 0,
          online: 0
        };
      }
      
      salesByDate[date].sales += parseFloat(order.totalPrice);
      salesByDate[date].orders += 1;
      
      if (order.source === 'lokal') {
        salesByDate[date].local += parseFloat(order.totalPrice);
      } else {
        salesByDate[date].online += parseFloat(order.totalPrice);
      }
    });
    
    // Convert to array and sort by date
    const salesDataArray = Object.values(salesByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    setSalesData(salesDataArray);
  };
  
  const processProductStats = (orders) => {
    // Product popularity and sales tracking
    const productMap = {};
    const categoryMap = {};
    
    // Process all order details
    orders.forEach(order => {
      if (order.OrderDetails && order.OrderDetails.length > 0) {
        order.OrderDetails.forEach(detail => {
          const product = detail.Product;
          if (!product) return;
          
          // Track product sales
          if (!productMap[product.id]) {
            productMap[product.id] = {
              id: product.id,
              name: product.name,
              quantity: 0,
              revenue: 0,
              category: product.category
            };
          }
          
          productMap[product.id].quantity += detail.quantity;
          productMap[product.id].revenue += parseFloat(detail.unitPrice) * detail.quantity;
          
          // Track category sales
          if (!categoryMap[product.category]) {
            categoryMap[product.category] = {
              name: product.category,
              value: 0,
              count: 0
            };
          }
          
          categoryMap[product.category].value += parseFloat(detail.unitPrice) * detail.quantity;
          categoryMap[product.category].count += detail.quantity;
        });
      }
    });
    
    // Convert to arrays
    const productsArray = Object.values(productMap);
    const categoriesArray = Object.values(categoryMap);
    
    // Sort products by revenue
    productsArray.sort((a, b) => b.revenue - a.revenue);
    
    setProductStats(productsArray);
    setTopProducts(productsArray.slice(0, 5)); // Top 5 products
    setSalesByCategory(categoriesArray);
  };
  
  const calculateSummaryMetrics = (orders) => {
    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Calculate total sales and orders
    let total = 0;
    filteredOrders.forEach(order => {
      total += parseFloat(order.totalPrice);
    });
    
    setTotalSales(total);
    setTotalOrders(filteredOrders.length);
    
    // Calculate average order value
    setAverageOrderValue(filteredOrders.length > 0 ? total / filteredOrders.length : 0);
    
    // Calculate sales growth (comparing with previous period)
    const currentPeriodSales = total;
    
    // Calculate previous period date range
    const periodDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    const prevPeriodEndDate = new Date(startDate);
    prevPeriodEndDate.setDate(prevPeriodEndDate.getDate() - 1);
    const prevPeriodStartDate = new Date(prevPeriodEndDate);
    prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - periodDays);
    
    // Filter orders for previous period
    const prevPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= prevPeriodStartDate && orderDate <= prevPeriodEndDate;
    });
    
    // Calculate previous period sales
    let prevPeriodSales = 0;
    prevPeriodOrders.forEach(order => {
      prevPeriodSales += parseFloat(order.totalPrice);
    });
    
    // Calculate growth percentage
    if (prevPeriodSales > 0) {
      setSalesGrowth(((currentPeriodSales - prevPeriodSales) / prevPeriodSales) * 100);
    } else {
      setSalesGrowth(currentPeriodSales > 0 ? 100 : 0);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handlePeriodChange = (event) => {
    const period = event.target.value;
    setSelectedPeriod(period);
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    setStartDate(startDate);
    setEndDate(endDate);
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
          <InsightsIcon sx={{ mr: 1, color: "#e7582b" }} />
          Sales Analytics Dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Filter Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="period-select-label">Time Period</InputLabel>
                <Select
                  labelId="period-select-label"
                  value={selectedPeriod}
                  label="Time Period"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="week">Last 7 days</MenuItem>
                  <MenuItem value="month">Last 30 days</MenuItem>
                  <MenuItem value="quarter">Last 3 months</MenuItem>
                  <MenuItem value="year">Last year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={endDate}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={startDate}
                  maxDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={fetchData}
                sx={{
                  backgroundColor: "#e7582b",
                  "&:hover": { backgroundColor: "#d44d24" },
                }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Sales
                  </Typography>
                  <PointOfSaleIcon sx={{ color: '#0088FE' }} />
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {formatCurrency(totalSales)}
                </Typography>
                <Typography variant="body2" color={salesGrowth >= 0 ? "success.main" : "error.main"} sx={{ mt: 1 }}>
                  {salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}% vs previous period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Orders
                  </Typography>
                  <RestaurantMenuIcon sx={{ color: '#00C49F' }} />
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Avg. Order Value
                  </Typography>
                  <TrendingUpIcon sx={{ color: '#FFBB28' }} />
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {formatCurrency(averageOrderValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Time Period
                  </Typography>
                  <CalendarTodayIcon sx={{ color: '#FF8042' }} />
                </Box>
                <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for different analytics views */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
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
              <Tab label="Sales Overview" />
              <Tab label="Product Performance" />
              <Tab label="Category Analysis" />
              <Tab label="Daily Reports" />
            </Tabs>
          </Box>
          
          {/* Sales Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Sales Trend
                </Typography>
                <Paper sx={{ p: 3, mb: 4 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="local" name="In-store Sales" fill="#0088FE" />
                      <Bar dataKey="online" name="Online Sales" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Order Volume
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Number of Orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </>
            )}
          </TabPanel>
          
          {/* Product Performance Tab */}
          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Top Selling Products
                </Typography>
                <Paper sx={{ p: 3, mb: 4 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Units Sold</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  All Products Performance
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Units Sold</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productStats.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            )}
          </TabPanel>
          
          {/* Category Analysis Tab */}
          <TabPanel value={tabValue} index={2}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                      Sales by Category
                    </Typography>
                    <Paper sx={{ p: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={salesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {salesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                      Category Performance
                    </Typography>
                    <Paper sx={{ p: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Items Sold</TableCell>
                              <TableCell align="right">Revenue</TableCell>
                              <TableCell align="right">% of Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {salesByCategory.map((category, index) => {
                              const percentage = (category.value / totalSales * 100).toFixed(1);
                              return (
                                <TableRow key={index}>
                                  <TableCell>{category.name}</TableCell>
                                  <TableCell align="right">{category.count}</TableCell>
                                  <TableCell align="right">{formatCurrency(category.value)}</TableCell>
                                  <TableCell align="right">{percentage}%</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}
          </TabPanel>
          
          {/* Daily Reports Tab */}
          <TabPanel value={tabValue} index={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Daily Sales Reports
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Staff Member</TableCell>
                          <TableCell align="right">Orders</TableCell>
                          <TableCell align="right">Total Sales</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dailyReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                            <TableCell>{report.User?.fullName || 'Unknown'}</TableCell>
                            <TableCell align="right">{report.details?.orderCount || 0}</TableCell>
                            <TableCell align="right">{formatCurrency(report.totalSales)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            )}
          </TabPanel>
        </Box>
      </Container>
    </Box>
  );
}

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
} 
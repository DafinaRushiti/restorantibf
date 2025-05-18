import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Box,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Badge,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import GrainIcon from "@mui/icons-material/Grain";
import NavbarClient from "../components/navbarClient";
import api from "../api/axios";

// Default image if product has no image
const defaultImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=1000&q=80";

// Categories mapping
const categoryMapping = {
  "appetizer": "Appetizers",
  "main": "Main courses",
  "dessert": "Desserts",
  "beverage": "Beverages",
  "pizza": "Pizza"
};

export default function OnlineMenu() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [cart, setCart] = useState({});
  const [deliveryType, setDeliveryType] = useState("Delivery");
  const [tipPercent, setTipPercent] = useState(10);
  const [customTip, setCustomTip] = useState("");
  
  // State for products and categories
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    
    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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
        const category = categoryMapping[product.category] || product.category;
        
        if (!productsByCat[category]) {
          productsByCat[category] = [];
          uniqueCategories.push(category);
        }
        
        productsByCat[category].push({
          id: product.id,
          name: product.name,
          weight: product.description || "",
          price: parseFloat(product.price),
          img: product.imageUrl || defaultImg,
          stock: product.stock,
          tags: product.tags ? product.tags.split(',') : []
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

  const handleAdd = (prod) => {
    setCart((c) => {
      const qty = c[prod.id]?.qty || 0;
      return { ...c, [prod.id]: { ...prod, qty: qty + 1 } };
    });
  };

  const handleRemove = (id) => {
    setCart((c) => {
      const { [id]: _, ...rest } = c;
      return rest;
    });
  };

  const handleTipChange = (event) => {
    const value = event.target.value;
    setTipPercent(Number(value));
    if (value === "other") {
      setTipPercent(0);
    }
  };

  const handleCustomTipChange = (event) => {
    setCustomTip(event.target.value);
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 50 || deliveryType === "Room Service" ? 0 : 5;
  const tip =
    tipPercent === "other" && customTip
      ? Number(customTip)
      : subtotal * (tipPercent / 100);
  const total = subtotal + deliveryFee + tip;

  // Function to render tag chips for each product
  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return tags.map((tag) => {
      if (tag === "spicy") {
        return (
          <Chip
            key={tag}
            icon={<LocalFireDepartmentIcon style={{ color: "#ff4d4f" }} />}
            label="Spicy"
            size="small"
            variant="outlined"
            sx={{ borderColor: "#ff4d4f", color: "#ff4d4f", marginRight: 0.5 }}
          />
        );
      }
      if (tag === "gluten") {
        return (
          <Chip
            key={tag}
            icon={<GrainIcon style={{ fontSize: "14px", color: "#f5b042" }} />}
            label="Gluten"
            size="small"
            variant="outlined"
            sx={{ borderColor: "#f5b042", color: "#f5b042", marginRight: 0.5 }}
          />
        );
      }
      if (tag === "bestseller") {
        return (
          <Chip
            key={tag}
            icon={<StarIcon style={{ color: "#faad14" }} />}
            label="Bestseller"
            size="small"
            variant="outlined"
            sx={{ borderColor: "#faad14", color: "#faad14", marginRight: 0.5 }}
          />
        );
      }
      return (
        <Chip
          key={tag}
          label={tag}
          size="small"
          variant="outlined"
          sx={{ marginRight: 0.5 }}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f9f9f9, #f3f3f3)",
        backgroundImage:
          'url("https://www.transparenttextures.com/patterns/cubes.png")',
      }}
    >
      {/* Navbar */}
      <NavbarClient />

      {/* Main Content */}
      <Container
        maxWidth="xl"
        sx={{
          pt: 4,
          pb: 8,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* Menu Section */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Category Tabs */}
            <Box sx={{ mb: 4, display: "flex", overflowX: "auto", pb: 1 }}>
              {categories.map((cat, index) => (
                <Button
                  key={cat}
                  variant={currentTab === index ? "contained" : "outlined"}
                  onClick={() => setCurrentTab(index)}
                  sx={{
                    borderRadius: 4,
                    mr: 1,
                    minWidth: "auto",
                    px: 3,
                    py: 1,
                    backgroundColor:
                      currentTab === index ? "#e7582b" : "#f9e9e5",
                    color: currentTab === index ? "white" : "#333",
                    "&:hover": {
                      backgroundColor:
                        currentTab === index ? "#d44d24" : "#f0dad5",
                    },
                    border: "none",
                    fontWeight: "medium",
                    textTransform: "none",
                    boxShadow:
                      currentTab === index
                        ? "0 4px 8px rgba(231, 88, 43, 0.25)"
                        : "none",
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Box>

            {/* Category Title */}
            <Typography
              variant="h4"
              component="h2"
              sx={{ mb: 3, color: "#333", fontWeight: "medium" }}
            >
              {categories[currentTab] || "Menu"}
            </Typography>

            {/* Products Grid */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {categories.length > 0 && productsByCategory[categories[currentTab]]?.map((prod) => (
                  <Card
                    key={prod.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      },
                      background: "white",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "75%" /* 4:3 aspect ratio */,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={prod.img}
                        alt={prod.name}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pb: 2, px: 3 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: "medium", mb: 1 }}
                      >
                        {prod.name}{" "}
                        <span style={{ color: "#777" }}>({prod.weight})</span>
                      </Typography>

                      {/* Product Tags */}
                      <Box sx={{ display: "flex", flexWrap: "wrap", my: 1.5 }}>
                        {renderTags(prod.tags)}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="p"
                          sx={{ fontWeight: "bold", color: "#333" }}
                        >
                          ${prod.price.toFixed(2)}
                        </Typography>

                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => handleAdd(prod)}
                          disabled={prod.stock <= 0}
                          sx={{
                            borderRadius: 4,
                            backgroundColor: prod.stock > 0 ? "#e7582b" : "#ccc",
                            "&:hover": {
                              backgroundColor: prod.stock > 0 ? "#d44d24" : "#ccc",
                            },
                            fontWeight: "medium",
                            textTransform: "none",
                            px: 3,
                            boxShadow: prod.stock > 0 ? "0 4px 8px rgba(231, 88, 43, 0.25)" : "none",
                          }}
                        >
                          {prod.stock > 0 ? "Order now" : "Out of stock"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                
                {categories.length > 0 && (!productsByCategory[categories[currentTab]] || productsByCategory[categories[currentTab]].length === 0) && (
                  <Typography sx={{ gridColumn: "1 / -1", textAlign: "center", py: 5, color: "text.secondary" }}>
                    No products available in this category.
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Order Sidebar */}
          <Paper
            sx={{
              width: { xs: "100%", md: 320 },
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              position: { md: "sticky" },
              top: 88,
              alignSelf: "flex-start",
              background: "white",
              minHeight: 200,
            }}
          >
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: "bold" }}
              >
                Bistro
              </Typography>
              <Chip
                label="Open now"
                size="small"
                sx={{
                  backgroundColor: "#ecf8f0",
                  color: "#52c41a",
                  "& .MuiChip-label": {
                    px: 1,
                  },
                  height: 24,
                }}
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      ml: 1,
                    }}
                  />
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2, height: 42 }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Badge color="primary" sx={{ mr: 1 }}>
                        <ShoppingCartIcon fontSize="small" />
                      </Badge>
                      {selected}
                    </Box>
                  )}
                >
                  <MenuItem value="Delivery">Delivery</MenuItem>
                  <MenuItem value="Take-away">Take-away</MenuItem>
                  <MenuItem value="Room Service">Room Service</MenuItem>
                </Select>
              </FormControl>

              {deliveryType === "Delivery" && (
                <TextField
                  placeholder="Enter delivery address"
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      height: 42,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <LocationOnIcon
                        color="action"
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                    ),
                  }}
                />
              )}
            </Box>

            {/* Your Order Section */}
            <Typography
              variant="h6"
              component="h3"
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              Your order
            </Typography>

            {cartItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No items yet
              </Typography>
            ) : (
              <Box sx={{ mb: 3, maxHeight: 200, overflowY: "auto", pr: 1 }}>
                {cartItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1.5,
                      pb: 1.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography variant="body2">
                      {item.qty} x {item.name} ({item.weight})
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "medium", mr: 1 }}
                      >
                        ${(item.price * item.qty).toFixed(2)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(item.id)}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Delivery Fee */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Delivery
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: deliveryFee === 0 ? "medium" : "normal",
                  color: deliveryFee === 0 ? "#52c41a" : "inherit",
                }}
              >
                {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
              </Typography>
            </Box>

            {/* Tip Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Tip
              </Typography>
              <RadioGroup
                row
                value={tipPercent}
                onChange={handleTipChange}
                sx={{ justifyContent: "space-between" }}
              >
                <FormControlLabel
                  value={0}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        "&.Mui-checked": { color: "#e7582b" },
                        p: 0.5,
                      }}
                    />
                  }
                  label="0%"
                  sx={{
                    m: 0,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    px: 1,
                    mr: 0.5,
                    flex: "1 0 auto",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                />
                <FormControlLabel
                  value={10}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        "&.Mui-checked": { color: "#e7582b" },
                        p: 0.5,
                      }}
                    />
                  }
                  label="10%"
                  sx={{
                    m: 0,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    px: 1,
                    mr: 0.5,
                    flex: "1 0 auto",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                />
                <FormControlLabel
                  value={20}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        "&.Mui-checked": { color: "#e7582b" },
                        p: 0.5,
                      }}
                    />
                  }
                  label="20%"
                  sx={{
                    m: 0,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    px: 1,
                    mr: 0.5,
                    flex: "1 0 auto",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                />
                <FormControlLabel
                  value="other"
                  control={
                    <Radio
                      size="small"
                      sx={{
                        "&.Mui-checked": { color: "#e7582b" },
                        p: 0.5,
                      }}
                    />
                  }
                  label="Other"
                  sx={{
                    m: 0,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    px: 1,
                    flex: "1 0 auto",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                />
              </RadioGroup>

              {tipPercent === "other" && (
                <TextField
                  placeholder="Enter tip amount"
                  value={customTip}
                  onChange={handleCustomTipChange}
                  type="number"
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                />
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Tip
                </Typography>
                <Typography variant="body2">${tip.toFixed(2)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                TOTAL
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                ${total.toFixed(2)}
              </Typography>
            </Box>

            {/* Checkout Button */}
            <Button
              variant="contained"
              fullWidth
              disabled={cartItems.length === 0}
              onClick={() =>
                navigate("/orders/online/checkout", {
                  state: { cart: cartItems, deliveryType, deliveryFee, tip, total },
                })
              }
              sx={{
                borderRadius: 3,
                py: 1.5,
                backgroundColor: cartItems.length > 0 ? "#e7582b" : "#ccc",
                "&:hover": {
                  backgroundColor: cartItems.length > 0 ? "#d44d24" : "#ccc",
                },
                fontWeight: "medium",
                textTransform: "none",
                boxShadow: cartItems.length > 0 ? "0 4px 12px rgba(231, 88, 43, 0.25)" : "none",
              }}
            >
              Go to checkout
            </Button>

            {/* Minimum Order Notice */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 1 }}
            >
              Min. order $30.00 • Have a coupon?
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

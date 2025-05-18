import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Divider,
  Box,
  Container,
  Grid,
  Paper,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NavbarClient from "./navbarClient";
import api from "../api/axios";

// Payment icons - using direct URLs instead of local assets
const visaIcon = "https://cdn.iconscout.com/icon/free/png-256/free-visa-3-226460.png";
const mastercardIcon = "https://cdn.iconscout.com/icon/free/png-256/free-mastercard-3-226462.png";
const paypalIcon = "https://cdn.iconscout.com/icon/free/png-256/free-paypal-34-226455.png";

const steps = ["Delivery Information", "Payment Method", "Review Order"];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    notes: "",
  });

  useEffect(() => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else if (location.state?.cart) {
      // Ensure cart is always an array
      const stateCart = location.state.cart;
      setCart(Array.isArray(stateCart) ? stateCart : Object.values(stateCart));
    }
  }, [location.state]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit order
      handlePlaceOrder();
    } else {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Ensure cart is an array before mapping
      const cartArray = Array.isArray(cart) ? cart : Object.values(cart);
      
      // Format items for the API
      const items = cartArray.map(item => ({
        productId: item.id,
        quantity: item.quantity || item.qty // Handle both quantity and qty properties
      }));
      
      // Create the order
      const response = await api.post('/orders', {
        source: 'online',
        items
      });
      
      setOrderId(response.data.orderId);
      setSuccess(true);
      
      // Clear cart
      localStorage.removeItem("cart");
      
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        navigate("/", { state: { orderPlaced: true } });
      }, 2000);
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.response?.data?.msg || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    // Ensure cart is an array
    const cartArray = Array.isArray(cart) ? cart : Object.values(cart);
    return cartArray.reduce((sum, item) => sum + item.price * (item.quantity || item.qty), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Delivery Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Payment Method
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Select Payment Method</FormLabel>
              <RadioGroup
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label="Credit/Debit Card"
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label="PayPal"
                />
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label="Cash on Delivery"
                />
              </RadioGroup>
            </FormControl>

            {formData.paymentMethod === "card" && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Name on Card"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Expiry Date (MM/YY)"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <img
                      src={visaIcon}
                      alt="Visa"
                      style={{ height: 30, objectFit: "contain" }}
                    />
                    <img
                      src={mastercardIcon}
                      alt="Mastercard"
                      style={{ height: 30, objectFit: "contain" }}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            {formData.paymentMethod === "paypal" && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <img
                  src={paypalIcon}
                  alt="PayPal"
                  style={{ height: 60, objectFit: "contain" }}
                />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  You will be redirected to PayPal to complete your payment.
                </Typography>
              </Box>
            )}

            {formData.paymentMethod === "cash" && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Please have the exact amount ready for the delivery person.
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Review Your Order
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                  Delivery Information
                </Typography>
                <Typography variant="body2">
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2">{formData.email}</Typography>
                <Typography variant="body2">{formData.phone}</Typography>
                <Typography variant="body2">
                  {formData.address}, {formData.city}, {formData.zipCode}
                </Typography>
                {formData.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {formData.notes}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  {formData.paymentMethod === "card"
                    ? `Credit Card (${formData.cardNumber.slice(-4)})`
                    : formData.paymentMethod === "paypal"
                    ? "PayPal"
                    : "Cash on Delivery"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                  Order Items
                </Typography>
                {Array.isArray(cart) ? cart.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                      pb: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src={item.image || "https://via.placeholder.com/50"}
                        alt={item.name}
                        sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                      />
                      <Box>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity || item.qty}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      ${(item.price * (item.quantity || item.qty)).toFixed(2)}
                    </Typography>
                  </Box>
                )) : Object.values(cart).map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                      pb: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src={item.image || "https://via.placeholder.com/50"}
                        alt={item.name}
                        sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                      />
                      <Box>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.qty || item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      ${(item.price * (item.qty || item.quantity)).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  if (success) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
          backgroundColor: "#f5f5f5",
      }}
    >
      <NavbarClient />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, color: "#52c41a" }}>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              Thank you for your order. Your order number is #{orderId}.
              <br />
              You will receive a confirmation email shortly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                mt: 2,
                backgroundColor: "#e7582b",
                "&:hover": { backgroundColor: "#d44d24" },
              }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <NavbarClient />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: "bold" }}>
              Checkout
            </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
              {getStepContent(activeStep)}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                      }}
                    >
                <Typography variant="h6" sx={{ mb: 2 }}>
                        Order Summary
                      </Typography>
                <Box sx={{ mb: 3 }}>
                  {Array.isArray(cart) ? cart.map((item) => (
                        <Box
                      key={item.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                      <Typography variant="body2">
                        {item.quantity || item.qty} x {item.name}
                          </Typography>
                          <Typography variant="body2">
                        ${(item.price * (item.quantity || item.qty)).toFixed(2)}
                          </Typography>
                        </Box>
                  )) : Object.values(cart).map((item) => (
                        <Box
                      key={item.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                      <Typography variant="body2">
                        {item.qty || item.quantity} x {item.name}
                          </Typography>
                          <Typography variant="body2">
                        ${(item.price * (item.qty || item.quantity)).toFixed(2)}
                          </Typography>
                        </Box>
                  ))}
                      </Box>
                      <Divider sx={{ my: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                  <Typography variant="body2">Subtotal</Typography>
                          <Typography variant="body2">
                    ${calculateSubtotal().toFixed(2)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                  <Typography variant="body2">Tax (10%)</Typography>
                          <Typography variant="body2">
                    ${calculateTax().toFixed(2)}
                          </Typography>
                        </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                    mb: 2,
                        }}
                      >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Total
                        </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    ${calculateTotal().toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                        <Button
              disabled={activeStep === 0}
                          onClick={handleBack}
              sx={{ mr: 1 }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleNext}
              disabled={loading}
                          sx={{
                            backgroundColor: "#e7582b",
                "&:hover": { backgroundColor: "#d44d24" },
                          }}
                        >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : activeStep === steps.length - 1 ? (
                "Place Order"
              ) : (
                "Next"
              )}
                        </Button>
                      </Box>
                    </Paper>
      </Container>
    </Box>
  );
}

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { AuthContext } from "../context/auth";  // ← added

export default function LoginStaff() {
  const { login } = useContext(AuthContext);           // ← added
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setAuthError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setAuthError("");
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthError("Email and password are required");
      return;
    }

    try {
      // ← replaced manual check with real API call
      await login(email, password);
      // AuthContext will redirect based on role
    } catch (err) {
      console.error(err);
      setAuthError(
        err.response?.data?.msg || "Invalid email or password"
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #f9f9f9, #f3f3f3)",
        backgroundImage:
          'url("https://www.transparenttextures.com/patterns/cubes.png")',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            },
            background: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <RestaurantMenuIcon
                sx={{ color: "#e7582b", fontSize: 48, mb: 1 }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: "#333", fontWeight: "bold", mb: 1 }}
              >
                Bistro
              </Typography>
              <Typography
                variant="subtitle1"
                component="h2"
                sx={{ color: "#666", mb: 2 }}
              >
                Staff Login
              </Typography>
            </Box>

            {authError && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 1, mb: 2, textAlign: "center" }}
              >
                {authError}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#888" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#888" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 2,
                  borderRadius: 3,
                  py: 1.5,
                  backgroundColor: "#e7582b",
                  "&:hover": {
                    backgroundColor: "#d44d24",
                  },
                  fontWeight: "medium",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(231, 88, 43, 0.25)",
                }}
              >
                Sign In
              </Button>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Link
                  href="/reset-password"
                  variant="body2"
                  sx={{ color: "#e7582b" }}
                >
                  Forgot password?
                </Link>
                <Link
                  href="/login/admin"
                  variant="body2"
                  sx={{ color: "#e7582b" }}
                >
                  Admin Login
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

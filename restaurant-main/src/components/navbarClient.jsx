import React from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Avatar,
  Badge,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

const NavbarClient = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
        >
          {/* Logo and Name */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RestaurantMenuIcon
              sx={{ color: "#e7582b", mr: 1, fontSize: 32 }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                color: "#333",
                display: { xs: "none", md: "flex" },
                letterSpacing: "0.05em",
              }}
            >
              Bistro
            </Typography>
          </Link>

          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            sx={{
              display: { xs: "flex", md: "none" },
              color: "#333",
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            <Button
              startIcon={<HomeIcon />}
              component={Link}
              to="/"
              sx={{
                color: "#333",
                "&:hover": { backgroundColor: "#f9f9f9" },
              }}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/about"
              sx={{
                color: "#333",
                "&:hover": { backgroundColor: "#f9f9f9" },
              }}
            >
              About
            </Button>
            <Button
              component={Link}
              to="/contact"
              sx={{
                color: "#333",
                "&:hover": { backgroundColor: "#f9f9f9" },
              }}
            >
              Contact
            </Button>
          </Box>

          {/* User Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ color: "#e7582b" }}>
              <Badge badgeContent={0} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              component={Link}
              to="/login/admin"
              sx={{
                backgroundColor: "#f9e9e5",
                color: "#e7582b",
                "&:hover": { backgroundColor: "#f0dad5" },
                ml: 1,
              }}
            >
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavbarClient;

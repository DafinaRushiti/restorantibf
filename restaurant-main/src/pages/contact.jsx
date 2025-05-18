import React, { useState } from 'react';
import NavbarClient from '../components/navbarClient';
import { 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Divider,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Mesazhi juaj u dërgua me sukses! Do t\'ju kontaktojmë së shpejti.',
      severity: 'success'
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f9f9f9, #f3f3f3)",
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
      }}
    >
      <NavbarClient />
      
      {/* Page Header */}
      <Box
        sx={{
          backgroundColor: '#e7582b',
          py: 6,
          mb: 6,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 'bold' }}>
            Na Kontaktoni
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 300, maxWidth: '700px', mx: 'auto' }}>
            Jemi gjithmonë të gatshëm t'ju dëgjojmë dhe t'ju ndihmojmë me çdo pyetje apo sugjerim
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 4, mb: 6 }}>
        <Grid container spacing={5}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
                Dërgoni një Mesazh
              </Typography>
              <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Emri"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subjekti"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mesazhi"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        backgroundColor: '#e7582b',
                        '&:hover': {
                          backgroundColor: '#d44d24',
                        },
                      }}
                    >
                      Dërgo Mesazhin
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                mb: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
                Informacione Kontakti
              </Typography>
              <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ color: '#e7582b', mr: 2, fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                    Adresa
                  </Typography>
                  <Typography variant="body1">
                    Rruga Kristaq Dhamo 12, Tiranë, Shqipëri
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                <PhoneIcon sx={{ color: '#e7582b', mr: 2, fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                    Telefon
                  </Typography>
                  <Typography variant="body1">
                    +355 69 123 4567
                  </Typography>
                  <Typography variant="body1">
                    +355 4 234 5678
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                <EmailIcon sx={{ color: '#e7582b', mr: 2, fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    info@bistrorugashqipe.com
                  </Typography>
                  <Typography variant="body1">
                    rezervime@bistrorugashqipe.com
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <AccessTimeIcon sx={{ color: '#e7582b', mr: 2, fontSize: 28, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                    Orari
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>E Hënë - E Premte:</strong> 11:00 - 23:00
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>E Shtunë:</strong> 10:00 - 24:00
                  </Typography>
                  <Typography variant="body1">
                    <strong>E Dielë:</strong> 10:00 - 22:00
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* Social Media */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
                Na ndiqni
              </Typography>
              <Divider sx={{ mb: 3, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#3b5998',
                    color: '#3b5998',
                    '&:hover': { borderColor: '#3b5998', backgroundColor: 'rgba(59, 89, 152, 0.1)' }
                  }}
                >
                  Facebook
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#c13584',
                    color: '#c13584',
                    '&:hover': { borderColor: '#c13584', backgroundColor: 'rgba(193, 53, 132, 0.1)' }
                  }}
                >
                  Instagram
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#1da1f2',
                    color: '#1da1f2',
                    '&:hover': { borderColor: '#1da1f2', backgroundColor: 'rgba(29, 161, 242, 0.1)' }
                  }}
                >
                  Twitter
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Map */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
            Ku na gjeni
          </Typography>
          <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
          
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              height: 450,
            }}
          >
            <iframe
              title="Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.7455519286973!2d19.818486776566954!3d41.32026167130354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1350310ff7d14d2d%3A0xc0a2d2c6b58adf04!2sRruga%20Kristaq%20Dhamo%2C%20Tiran%C3%AB%2C%20Albania!5e0!3m2!1sen!2sus!4v1684768327513!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </Paper>
        </Box>
      </Container>
      
      {/* Snackbar for form submission feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;

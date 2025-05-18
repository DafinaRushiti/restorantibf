import React from 'react';
import NavbarClient from '../components/navbarClient';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Box, 
  Paper, 
  ImageList, 
  ImageListItem,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Grow
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const foodItems = [
  { 
    name: 'Pizza Margherita', 
    img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=75', 
    desc: 'Domate të freskëta, mocarela cilësore, borzilok aromatik.',
    price: '8.50€'
  },
  { 
    name: 'Pasta Carbonara', 
    img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=75', 
    desc: 'Veçanërisht kremoze me pancetta të pjekur dhe pecorino.',
    price: '9.90€'
  },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=75',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=75',  
];

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f9f9f9, #f3f3f3)",
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
      }}
    >
      <NavbarClient />
      
      {/* Hero Section - Full width with parallax effect */}
      <Box
        sx={{
          position: 'relative',
          height: isMobile ? '300px' : '500px',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=75')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 6,
        }}
      >
        <Fade in={true} timeout={1500}>
          <Box
            sx={{
              textAlign: 'center',
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.7)',
              p: 3,
              maxWidth: '800px',
            }}
          >
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Bistro Rruga Shqipe
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 300 }}>
              Shija autentike, mikpritja lokale
            </Typography>
          </Box>
        </Fade>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* History Section */}
        <Grow in={true} timeout={1000}>
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HistoryEduIcon sx={{ fontSize: 32, mr: 2, color: '#e7582b' }} />
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium' }}>
                Historiku ynë
              </Typography>
            </Box>
            <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  Në vitin 2010, themeluesit tanë, Arben dhe Elira, nisën ëndrrën e tyre për të sjellë shijet tradicionale shqiptare në zemër të qytetit. Me përbërës të zgjedhur me kujdes nga fermat lokale dhe receta familjare, ne ofrojmë një eksperiencë të ngrohtë dhe të përzemërt.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  Që nga themelimi, Bistro Rruga Shqipe ka fituar zemrat e komunitetit duke mbajtur gjallë traditën dhe mikpritjen shqiptare.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={6}
                  sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: '300px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                >
                  <CardMedia
                    component="img"
                    image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=75"
                    alt="Restaurant interior"
                    sx={{ height: '100%', objectFit: 'cover' }}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Grow>

        {/* Featured Menu Items */}
        <Grow in={true} timeout={1500}>
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <RestaurantMenuIcon sx={{ fontSize: 32, mr: 2, color: '#e7582b' }} />
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium' }}>
                Menu e Përzgjedhur
              </Typography>
            </Box>
            <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
            
            <Grid container spacing={4}>
              {foodItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.name}>
                  <Fade in={true} timeout={1000 + (index * 500)}>
                    <Card 
                      sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        height: '100%',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="220"
                        image={item.img}
                        alt={item.name}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                          <Typography variant="subtitle1" sx={{ color: '#e7582b', fontWeight: 'bold' }}>
                            {item.price}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                          {item.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grow>

        {/* Food Gallery */}
        <Grow in={true} timeout={2000}>
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PhotoLibraryIcon sx={{ fontSize: 32, mr: 2, color: '#e7582b' }} />
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium' }}>
                Galeria e Restorantit
              </Typography>
            </Box>
            <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
            
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <ImageList 
                variant="quilted" 
                cols={isMobile ? 2 : 4} 
                gap={16} 
                rowHeight={isMobile ? 160 : 200}
              >
                {galleryImages.map((img, index) => (
                  <ImageListItem 
                    key={img} 
                    cols={index % 3 === 0 ? 2 : 1} 
                    rows={index % 3 === 0 ? 2 : 1}
                  >
                    <img 
                      src={img} 
                      alt="Foto restoranti" 
                      loading="lazy" 
                      style={{ 
                        borderRadius: '8px',
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          </Box>
        </Grow>

        {/* Location Section */}
        <Grow in={true} timeout={2500}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocationOnIcon sx={{ fontSize: 32, mr: 2, color: '#e7582b' }} />
              <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium' }}>
                Ku na gjeni
              </Typography>
            </Box>
            <Divider sx={{ mb: 4, borderColor: 'rgba(231, 88, 43, 0.3)' }} />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, color: '#e7582b', fontWeight: 'medium' }}>
                    Adresa jonë
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                    Rruga Kristaq Dhamo 12, Tiranë, Shqipëri
                  </Typography>
                  
                  <Typography variant="h5" sx={{ mb: 2, color: '#e7582b', fontWeight: 'medium' }}>
                    Orari
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                    <strong>E Hënë - E Premte:</strong> 11:00 - 23:00
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                    <strong>E Shtunë:</strong> 10:00 - 24:00
                  </Typography>
                  <Typography variant="body1">
                    <strong>E Dielë:</strong> 10:00 - 22:00
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper 
                  elevation={4}
                  sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: '400px'
                  }}
                >
                  <Box sx={{ height: '100%', minHeight: '400px' }}>
                    <iframe
                      title="Google Maps"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.7455519286973!2d19.818486776566954!3d41.32026167130354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1350310ff7d14d2d%3A0xc0a2d2c6b58adf04!2sRruga%20Kristaq%20Dhamo%2C%20Tiran%C3%AB%2C%20Albania!5e0!3m2!1sen!2sus!4v1684768327513!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grow>
      </Container>
    </Box>
  );
};

export default About;

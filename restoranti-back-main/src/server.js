// src/server.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const initDb = require('./config/initDb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Test database connection but don't initialize
sequelize.authenticate()
  .then(() => {
    console.log('✅ DB connected!');
    return initDb();

  })
  .catch(err => console.error('❌ DB connection error:', err));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

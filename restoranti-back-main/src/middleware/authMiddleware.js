// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  // Mer token nga header-i Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Nuk je i autorizuar.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifiko dhe dekripto token-in
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Shto informacionin e përdoruesit në req
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ msg: 'Token i pavlefshëm.' });
  }
};

// Middleware for role-based authorization
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Ju duhet të jeni të kyçur.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: 'Nuk keni leje për këtë veprim.' 
      });
    }

    next();
  };
};

module.exports = { protect, restrictTo };

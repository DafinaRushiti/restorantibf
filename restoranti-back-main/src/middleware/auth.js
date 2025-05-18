const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Get token from header - support both x-auth-token and Authorization header
  let token = req.header('x-auth-token');
  
  // If no x-auth-token, check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 
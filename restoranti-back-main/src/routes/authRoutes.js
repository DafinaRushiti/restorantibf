const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/staff', auth, authController.getStaff);
router.put('/staff/:id', auth, authController.updateStaff);
router.delete('/staff/:id', auth, authController.deleteStaff);

module.exports = router;

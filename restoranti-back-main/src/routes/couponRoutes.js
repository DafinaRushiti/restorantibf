const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const auth = require('../middleware/auth');

// Generate a coupon for an order
router.post('/:orderId', auth, couponController.generateCoupon);

// Get a coupon by order ID
router.get('/:orderId', auth, couponController.getCouponByOrderId);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// Krijo & listo
router.post('/',  protect, orderController.createOrder);
router.get('/',   protect, orderController.getOrders);

// Përditëso statusin e porosisë
router.put('/:id/status', protect, orderController.updateOrderStatus);

// (Opsionale) Fshi porosinë
router.delete('/:id',      protect, orderController.deleteOrder);

// Get a specific order by ID
router.get('/:id', protect, orderController.getOrderById);

module.exports = router;

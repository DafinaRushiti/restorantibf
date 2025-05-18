const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes - only admin can modify products
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;

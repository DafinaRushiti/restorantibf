const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Generate daily report for user and date
router.post('/daily', auth, reportController.generateDailyReport);

// Generate historical reports (admin only)
router.post('/historical', auth, reportController.generateHistoricalReports);

// Get reports for a specific user
router.get('/user/:userId', auth, reportController.getReportsByUser);

// Get all reports (admin only)
router.get('/', auth, reportController.getAllReports);

// Get revenue data
router.get('/revenue', auth, reportController.getRevenueData);

// Get daily reports
router.get('/daily', auth, reportController.getDailyReports);

// Get product performance
router.get('/products', auth, reportController.getProductPerformance);

module.exports = router;

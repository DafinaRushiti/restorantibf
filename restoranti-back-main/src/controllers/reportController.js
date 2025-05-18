const { Op } = require('sequelize');
const DailyReport = require('../models/DailyReport');
const Order = require('../models/Order');
const User = require('../models/User');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');
const sequelize = require('sequelize');

// Get revenue data
exports.getRevenueData = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Query for today's revenue
    const todayRevenue = await Order.sum('totalPrice', {
      where: {
        createdAt: {
          [Op.gte]: today
        },
        status: 'completed'
      }
    });
    
    // Query for weekly revenue
    const weeklyRevenue = await Order.sum('totalPrice', {
      where: {
        createdAt: {
          [Op.gte]: startOfWeek
        },
        status: 'completed'
      }
    });
    
    // Query for monthly revenue
    const monthlyRevenue = await Order.sum('totalPrice', {
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        },
        status: 'completed'
      }
    });
    
    res.json({
      today: todayRevenue || 0,
      weekly: weeklyRevenue || 0,
      monthly: monthlyRevenue || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get daily reports
exports.getDailyReports = async (req, res) => {
  try {
    console.log('Fetching daily reports...');
    
    const reports = await DailyReport.findAll({
      include: [{ model: User, attributes: ['id', 'fullName', 'role'] }],
      order: [['reportDate', 'DESC']]
    });
    
    // Transform the data to ensure consistent structure for the frontend
    const formattedReports = reports.map(report => {
      // Ensure totalSales is a valid number
      const totalSales = parseFloat(report.totalSales) || 0;
      
      // Calculate order count from details if available
      let orderCount = 0;
      if (report.details && report.details.orderCount) {
        orderCount = parseInt(report.details.orderCount) || 0;
      } else if (report.details && Array.isArray(report.details.orders)) {
        orderCount = report.details.orders.length;
      }
      
      // Calculate item count (if available in details)
      let itemCount = 0;
      if (report.details && report.details.itemCount) {
        itemCount = parseInt(report.details.itemCount) || 0;
      } else if (report.details && Array.isArray(report.details.orders)) {
        // Try to calculate from orders data if available
        report.details.orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              itemCount += parseInt(item.quantity) || 0;
            });
          }
        });
      }
      
      return {
        id: report.id,
        reportDate: report.reportDate,
        staffName: report.User ? report.User.fullName : 'Unknown Staff',
        staffRole: report.User ? report.User.role : 'N/A',
        totalSales: totalSales,
        orderCount: orderCount,
        itemCount: itemCount,
        details: report.details
      };
    });
    
    console.log(`Found ${formattedReports.length} reports`);
    res.json(formattedReports);
  } catch (err) {
    console.error('Error fetching daily reports:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Generate daily report
exports.generateDailyReport = async (req, res) => {
  try {
    const { userId, reportDate } = req.body;
    
    console.log(`Generating daily report for user ${userId} on date ${reportDate}`);
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Parse date or use today
    const date = reportDate ? new Date(reportDate) : new Date();
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all completed orders for this date period
    // We'll include orders from all users but track who created the report
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ['completed', 'delivered']
        },
        createdAt: {
          [Op.between]: [date, endDate]
        }
      },
      include: [
        { 
          model: OrderDetail, 
          include: [Product] 
        },
        {
          model: User,
          attributes: ['id', 'fullName', 'role']
        }
      ]
    });
    
    console.log(`Found ${orders.length} completed orders for the report period`);
    
    // Calculate total sales and item count
    let totalSales = 0;
    let totalItems = 0;
    const orderSummaries = [];
    
    for (const order of orders) {
      // Ensure we're working with numbers for calculations
      const orderTotal = parseFloat(order.totalPrice || 0);
      totalSales += orderTotal;
      
      // Count items in this order
      let orderItemCount = 0;
      if (order.OrderDetails && Array.isArray(order.OrderDetails)) {
        orderItemCount = order.OrderDetails.reduce(
          (sum, detail) => sum + (parseInt(detail.quantity) || 0), 0
        );
      }
      totalItems += orderItemCount;
      
      // Create order summary with items
      orderSummaries.push({
        id: order.id,
        totalPrice: orderTotal,
        status: order.status,
        createdAt: order.createdAt,
        staffName: order.User ? order.User.fullName : 'Unknown Staff',
        itemCount: orderItemCount,
        items: order.OrderDetails ? order.OrderDetails.map(detail => ({
          productId: detail.productId,
          productName: detail.Product ? detail.Product.name : 'Unknown Product',
          unitPrice: parseFloat(detail.unitPrice || 0),
          quantity: parseInt(detail.quantity || 0)
        })) : []
      });
    }
    
    // Check if a report already exists for this date and user
    const existingReport = await DailyReport.findOne({
      where: {
        userId,
        reportDate: date
      }
    });
    
    let report;
    
    if (existingReport) {
      // Update existing report
      report = await existingReport.update({
        totalSales,
        details: {
          orderCount: orders.length,
          itemCount: totalItems,
          orders: orderSummaries
        }
      });
      console.log(`Updated existing report with ID ${report.id}`);
    } else {
      // Create new report
      report = await DailyReport.create({
        userId,
        reportDate: date,
        totalSales,
        details: {
          orderCount: orders.length,
          itemCount: totalItems,
          orders: orderSummaries
        }
      });
      console.log(`Created new report with ID ${report.id}`);
    }
    
    res.status(201).json({
      id: report.id,
      reportDate: report.reportDate,
      userId: report.userId,
      staffName: user.fullName,
      staffRole: user.role || 'Staff',
      totalSales: totalSales,
      orderCount: orders.length,
      itemCount: totalItems
    });
  } catch (err) {
    console.error('Error generating daily report:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get all reports (admin only)
exports.getAllReports = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const reports = await DailyReport.findAll({
      include: [{ model: User, attributes: ['fullName'] }],
      order: [['reportDate', 'DESC']]
    });
    
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get reports for a specific user
exports.getReportsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const reports = await DailyReport.findAll({
      where: { userId },
      order: [['reportDate', 'DESC']]
    });
    
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get product performance
exports.getProductPerformance = async (req, res) => {
  try {
    // Get top selling products
    const topProducts = await OrderDetail.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.literal('quantity * unitPrice')), 'totalRevenue']
      ],
      include: [{ model: Product, attributes: ['name', 'category'] }],
      group: ['productId'],
      order: [[sequelize.literal('totalQuantity'), 'DESC']],
      limit: 10
    });
    
    res.json(topProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Generate reports for past dates (admin only)
exports.generateHistoricalReports = async (req, res) => {
  try {
    // Verify that the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized. Admin access required.' });
    }
    
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }
    
    console.log(`Generating historical reports from ${startDate} to ${endDate}`);
    
    // Convert dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ensure valid date range
    if (start > end) {
      return res.status(400).json({ msg: 'Start date must be before end date' });
    }
    
    // Set time to beginning and end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    // Get all users to create reports for
    const users = await User.findAll();
    
    if (users.length === 0) {
      return res.status(404).json({ msg: 'No users found to generate reports for' });
    }
    
    const results = [];
    
    // Generate a report for each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Find completed orders for this day
      const orders = await Order.findAll({
        where: {
          status: {
            [Op.in]: ['completed', 'delivered']
          },
          createdAt: {
            [Op.between]: [dayStart, dayEnd]
          }
        },
        include: [
          { 
            model: OrderDetail, 
            include: [Product] 
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'role']
          }
        ]
      });
      
      if (orders.length === 0) {
        console.log(`No orders found for ${dayStart.toISOString().split('T')[0]}, skipping`);
        continue;
      }
      
      // Generate reports for each user (staff member)
      for (const user of users) {
        // Calculate sales and items
        let totalSales = 0;
        let totalItems = 0;
        const orderSummaries = [];
        
        for (const order of orders) {
          const orderTotal = parseFloat(order.totalPrice || 0);
          totalSales += orderTotal;
          
          let orderItemCount = 0;
          if (order.OrderDetails && Array.isArray(order.OrderDetails)) {
            orderItemCount = order.OrderDetails.reduce(
              (sum, detail) => sum + (parseInt(detail.quantity) || 0), 0
            );
          }
          totalItems += orderItemCount;
          
          orderSummaries.push({
            id: order.id,
            totalPrice: orderTotal,
            status: order.status,
            createdAt: order.createdAt,
            staffName: order.User ? order.User.fullName : 'Unknown Staff',
            itemCount: orderItemCount,
            items: order.OrderDetails ? order.OrderDetails.map(detail => ({
              productId: detail.productId,
              productName: detail.Product ? detail.Product.name : 'Unknown Product',
              unitPrice: parseFloat(detail.unitPrice || 0),
              quantity: parseInt(detail.quantity || 0)
            })) : []
          });
        }
        
        // Check if report already exists
        const existingReport = await DailyReport.findOne({
          where: {
            userId: user.id,
            reportDate: dayStart
          }
        });
        
        if (existingReport) {
          // Update existing report
          await existingReport.update({
            totalSales,
            details: {
              orderCount: orders.length,
              itemCount: totalItems,
              orders: orderSummaries
            }
          });
          results.push(`Updated report for ${user.fullName} on ${dayStart.toISOString().split('T')[0]}`);
        } else {
          // Create new report
          await DailyReport.create({
            userId: user.id,
            reportDate: dayStart,
            totalSales,
            details: {
              orderCount: orders.length,
              itemCount: totalItems,
              orders: orderSummaries
            }
          });
          results.push(`Created report for ${user.fullName} on ${dayStart.toISOString().split('T')[0]}`);
        }
      }
    }
    
    res.status(200).json({ 
      message: `Generated historical reports from ${startDate} to ${endDate}`,
      results
    });
  } catch (err) {
    console.error('Error generating historical reports:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

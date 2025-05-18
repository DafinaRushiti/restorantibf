const Order       = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Product     = require('../models/Product');
const User        = require('../models/User');
const sequelize   = require('../config/database');

exports.createOrder = async (req, res) => {
  try {
    const { items, source, tableNumber, customerName, customerPhone, deliveryAddress, notes } = req.body;
    
    console.log('Creating order with data:', req.body);
    
    // 1) Create the order with totalPrice 0 (will be updated later)
    const orderData = {
      userId: req.user.id,
      source: source || 'lokal',
      tableNumber: tableNumber || null,
      totalPrice: 0
    };
    
    // Check if metadata column exists in orders table
    let hasMetadataColumn = false;
    try {
      // Try a simple query to check if the column exists
      await sequelize.query("SELECT metadata FROM orders LIMIT 1");
      hasMetadataColumn = true;
      console.log('Metadata column exists in orders table');
      
      // For online orders, add additional fields to the metadata
      if (source === 'online' && hasMetadataColumn) {
        orderData.metadata = JSON.stringify({
          customerName: customerName || req.user.fullName || 'Guest',
          customerPhone: customerPhone || 'N/A',
          deliveryAddress: deliveryAddress || 'N/A',
          notes: notes || ''
        });
      }
    } catch (err) {
      console.log('Metadata column does not exist in orders table, will not store customer data');
    }
    
    console.log('Creating order with data:', orderData);
    
    const order = await Order.create(orderData);

    let total = 0;
    // 2) For each item, create order_detail and calculate total
    for (const item of items) {
      const prod = await Product.findByPk(item.productId);
      if (!prod) continue;
      
      // Check if there's enough stock
      if (prod.stock < item.quantity) {
        return res.status(400).json({ 
          msg: `Not enough stock for ${prod.name}. Available: ${prod.stock}` 
        });
      }
      
      const lineTotal = prod.price * item.quantity;
      total += lineTotal;

      // Create order detail
      await OrderDetail.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: prod.price
      });
      
      // Update product stock
      await prod.update({ stock: prod.stock - item.quantity });
    }

    // 3) Update totalPrice in the order
    order.totalPrice = total;
    await order.save();

    // Get the user information for the response
    const user = await User.findByPk(req.user.id);

    res.status(201).json({ 
      orderId: order.id, 
      totalPrice: total,
      customerName: user ? user.fullName : 'Guest',
      userId: user ? user.id : null,
      source: source || 'lokal',
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    console.log('Fetching orders with query:', req.query);
    
    // Build query conditions
    const conditions = {};
    
    // Filter by source if provided
    if (req.query.source) {
      conditions.source = req.query.source;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      conditions.status = req.query.status;
    }
    
    console.log('Query conditions:', conditions);
    
    // First check if metadata column exists in orders table
    let hasMetadataColumn = false;
    try {
      // Try a simple query to check if the column exists
      await sequelize.query("SELECT metadata FROM orders LIMIT 1");
      hasMetadataColumn = true;
      console.log('Metadata column exists in orders table');
    } catch (err) {
      console.log('Metadata column does not exist in orders table, will not fetch it');
    }
    
    // Construct the query based on whether metadata exists
    const orders = await Order.findAll({
      where: conditions,
      include: [
        { 
          model: OrderDetail, 
          include: [Product] 
        },
        {
          model: User,
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${orders.length} orders`);
    
    // Transform data to ensure consistent structure
    const formattedOrders = orders.map(order => {
      // Parse metadata if it exists and column is available
      let metaData = {};
      if (hasMetadataColumn && order.metadata) {
        try {
          metaData = JSON.parse(order.metadata);
          console.log(`Order ${order.id} metadata:`, metaData);
        } catch (err) {
          console.error(`Error parsing metadata for order ${order.id}:`, err);
        }
      }
      
      // Format the order data
      const orderData = {
        id: order.id,
        userId: order.userId,
        customerName: (order.User ? order.User.fullName : 'Guest'),
        customerPhone: 'N/A',
        deliveryAddress: 'N/A',
        notes: '',
        tableNumber: order.tableNumber,
        source: order.source,
        status: order.status,
        totalPrice: parseFloat(order.totalPrice) || 0,
        createdAt: order.createdAt,
        OrderDetails: order.OrderDetails ? order.OrderDetails.map(detail => ({
          id: detail.id,
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: parseFloat(detail.unitPrice) || 0,
          Product: detail.Product ? {
            id: detail.Product.id,
            name: detail.Product.name,
            price: parseFloat(detail.Product.price) || 0,
            category: detail.Product.category
          } : null
        })) : []
      };
      
      return orderData;
    });
    
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [{ 
        model: OrderDetail, 
        include: [Product] 
      }]
    });
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// **Ri-përdorimi**: ndrysho statusin e një porosie
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;  // pending|completed|cancelled
    
    console.log(`Updating order ${id} to status ${status}`);
    
    // Validate the input status
    const validStatuses = ['pending', 'preparing', 'completed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    
    // Check if the status transition is valid (optional but helpful)
    if (order.status === 'completed' && status === 'pending') {
      return res.status(400).json({ msg: 'Cannot change a completed order back to pending' });
    }
    
    if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ msg: 'Cannot change a cancelled order' });
    }
    
    // Update the status
    order.status = status;
    await order.save();
    
    console.log(`Successfully updated order ${id} to status ${status}`);
    
    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// **Opsionale**: fshi porosinë
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ msg: 'Order not found' });
    res.json({ msg: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

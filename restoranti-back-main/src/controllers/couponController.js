const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');

exports.generateCoupon = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }
    
    // Check if coupon already exists for this order
    const existingCoupon = await Coupon.findOne({ where: { orderId } });
    if (existingCoupon) {
      // Return the existing coupon instead of an error
      return res.status(200).json(existingCoupon);
    }
    
    // Get order details with products
    const orderDetails = await OrderDetail.findAll({
      where: { orderId },
      include: [{ model: Product }]
    });
    
    // Format details for JSON storage
    const details = orderDetails.map(item => ({
      productName: item.Product.name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      total: parseFloat(item.unitPrice) * item.quantity
    }));
    
    // Create coupon
    const coupon = await Coupon.create({
      orderId,
      totalPrice: order.totalPrice,
      details: details
    });
    
    // Update order status to completed
    await order.update({ status: 'completed' });
    
    res.status(201).json(coupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error. Please try again.' });
  }
};

exports.getCouponByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const coupon = await Coupon.findOne({ 
      where: { orderId },
      include: [{ model: Order }]
    });
    
    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found.' });
    }
    
    res.json(coupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error. Please try again.' });
  }
};

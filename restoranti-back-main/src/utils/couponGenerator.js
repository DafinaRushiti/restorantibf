const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');

async function generateCoupon(orderId) {
  // 1) Nxjerr porosinë me detajet
  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderDetail, include: [Product] }]
  });
  if (!order) throw new Error('Porosi jo e gjetur');

  // 2) Ndërto listën e produkteve për kupon
  const items = order.OrderDetails.map(od => ({
    product: od.Product.name,
    qty: od.quantity,
    unitPrice: od.unitPrice,
    lineTotal: (od.unitPrice * od.quantity).toFixed(2)
  }));

  const total = order.totalPrice.toFixed(2);

  // 3) Krijo dhe ruaj kuponin në DB
  const coupon = await Coupon.create({
    orderId: order.id,
    totalPrice: total,
    details: { items, total }
  });

  // 4) Kthe objektin për frontend
  return {
    couponId: coupon.id,
    issueDate: coupon.issueDate,
    orderId: order.id,
    items,
    total
  };
}

module.exports = { generateCoupon };

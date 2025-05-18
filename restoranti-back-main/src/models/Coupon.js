const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'order_id'
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'issue_date'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'coupons',
  timestamps: false
});

// Match SQL schema exactly
Coupon.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
module.exports = Coupon;

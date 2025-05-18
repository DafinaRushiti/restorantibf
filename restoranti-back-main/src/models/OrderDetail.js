// src/models/OrderDetail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order   = require('./Order');
const Product = require('./Product');

const OrderDetail = sequelize.define('OrderDetail', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  orderId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'order_id' },
  productId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'product_id' },
  quantity:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  unitPrice:  { type: DataTypes.DECIMAL(10,2),   allowNull: false, field: 'unit_price' },
  createdAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'created_at' }
}, {
  tableName:  'order_details',
  timestamps: false
});

// set up associations matching the SQL schema
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
OrderDetail.belongsTo(Product, { foreignKey: 'product_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = OrderDetail;

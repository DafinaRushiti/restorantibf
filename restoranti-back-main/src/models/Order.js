// src/models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
  tableNumber: { type: DataTypes.STRING, allowNull: true, field: 'table_number' },
  source:     { type: DataTypes.ENUM('lokal','online'), defaultValue: 'lokal' },
  status:     { type: DataTypes.ENUM('pending','preparing','completed','delivered','cancelled'), defaultValue: 'pending' },
  totalPrice: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00, field: 'total_price' },
  metadata:   { type: DataTypes.TEXT, allowNull: true, field: 'metadata' },
  createdAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'created_at' }
}, {
  tableName: 'orders',
  timestamps: false
});

Order.belongsTo(User, { foreignKey: 'user_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
module.exports = Order;

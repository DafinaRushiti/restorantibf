const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url'
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdByAdminId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    field: 'created_by_admin_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;

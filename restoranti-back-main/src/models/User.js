// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName:      { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
  email:         { type: DataTypes.STRING, allowNull: false },
  password:      { type: DataTypes.STRING, allowNull: false },
  role:          { type: DataTypes.ENUM('client','kamarier','admin'), allowNull: false },
  createdAt:     { type: DataTypes.DATE, field: 'created_at' }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;

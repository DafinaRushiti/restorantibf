const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const DailyReport = sequelize.define('DailyReport', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id'
  },
  reportDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'report_date'
  },
  totalSales: {
    type: DataTypes.DECIMAL(12,2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'total_sales'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'daily_reports',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id','report_date'] }
  ]
});

DailyReport.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
module.exports = DailyReport;

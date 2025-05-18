const sequelize = require('./database');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Coupon = require('../models/Coupon');
const DailyReport = require('../models/DailyReport');

// Define relationships - match exactly with SQL schema
User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

Order.hasMany(OrderDetail, { foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Product.hasMany(OrderDetail, { foreignKey: 'product_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
OrderDetail.belongsTo(Product, { foreignKey: 'product_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

Order.hasOne(Coupon, { foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Coupon.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.hasMany(DailyReport, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
DailyReport.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

const initDb = async () => {
  try {
    try {
      await sequelize.query(`
        SELECT metadata FROM orders LIMIT 1
      `).catch(async (err) => {
        if (err.parent && err.parent.code === 'ER_BAD_FIELD_ERROR') {
          console.log('Adding metadata column to orders table...');
          // Add metadata column if it doesn't exist
          await sequelize.query(`
            ALTER TABLE orders 
            ADD COLUMN metadata TEXT NULL AFTER total_price
          `);
          console.log('✅ Added metadata column to orders table');
        }
      });
    } catch (err) {
      console.log('Error checking for metadata column:', err.message);
    }

    // Now sync the models with the database
    // Use { alter: false } to prevent automatic schema changes that might cause errors
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized successfully');
    
    // Check if admin user exists, if not create one
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      
      await User.create({
        fullName: 'Admin User',
        email: 'admin@restaurant.com',
        password: hash,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

module.exports = initDb; 
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,    // mund ta fikësh me false kur dëshiron
    define: {
      underscored: true,      // bën map-naming nga camelCase në snake_case
      timestamps: false       // nëse nuk do createdAt/updatedAt automatikë
    }
  }
);

module.exports = sequelize;

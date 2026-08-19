import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable logging for cleaner console output
  }
);

// Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database Connected Successfully via Sequelize');
  } catch (error) {
    console.error('❌ MySQL Database Connection Failed:', error.message);
  }
})();

export default sequelize;
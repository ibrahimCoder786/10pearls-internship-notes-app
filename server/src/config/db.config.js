const { Pool } = require('pg');
const dotenv = require('dotenv');
const logger = require('./logger.config');

dotenv.config();

// Create the PostgreSQL pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'notes_app_db',
  port: process.env.DB_PORT || 5432,
});

/**
 * Test Database Connection
 */
const checkConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connected successfully (PostgreSQL Pool)');
    client.release();
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
  }
};

checkConnection();

// Wrapper to make it look like mysql2's promise pool for compatibility
module.exports = {
  execute: (text, params) => pool.query(text, params),
  query: (text, params) => pool.query(text, params),
};
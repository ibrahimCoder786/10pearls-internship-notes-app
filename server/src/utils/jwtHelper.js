const jwt = require('jsonwebtoken');
const logger = require('../config/logger.config');

/**
 * Generate a JWT Token for a user
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d', // Default to 7 days if not set
  });
};

/**
 * Verify a JWT Token with error tracking
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.warn({ event: 'JWT_VERIFY_FAILED', error: error.message }, 'JWT verification failed');
    return null;
  }
};

module.exports = { 
  generateToken, 
  verifyToken 
};

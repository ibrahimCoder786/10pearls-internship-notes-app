const { verifyToken } = require('../utils/jwtHelper');
const UserModel = require('../models/user.model');
const logger = require('../config/logger.config');

/**
 * Authentication Middleware: Protects routes from unauthorized access
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header (Bearer TOKEN)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Access denied. No token provided',
        data: null,
      });
    }

    // 2. Extract token string
    const token = authHeader.split(' ')[1];

    // 3. Verify token integrity
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid or expired token',
        data: null,
      });
    }

    // 4. Verify user still exists in database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'User no longer exists',
        data: null,
      });
    }

    // 5. Attach user object to request for downstream use
    req.user = user;

    logger.info(
      { userId: user.id, event: 'AUTH_SUCCESS', path: req.path },
      'User authenticated successfully'
    );

    next();
  } catch (error) {
    logger.error(
      { event: 'AUTH_ERROR', error: error.message },
      'Auth middleware error'
    );
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error during authentication',
      data: null,
    });
  }
};

module.exports = authMiddleware;
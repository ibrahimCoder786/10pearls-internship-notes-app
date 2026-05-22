const logger = require('../config/logger.config');

/**
 * Global Error Handling Middleware: Catches all errors and sends standard responses
 */
const errorMiddleware = (err, req, res, next) => {
  // 1. Determine status code (Default to 500)
  const statusCode = err.statusCode || 500;

  // 2. Specialized Logging
  if (statusCode >= 500) {
    logger.error(
      {
        event: 'SERVER_ERROR',
        statusCode,
        method: req.method,
        path: req.path,
        userId: req.user?.id || null,
        error: err.message,
        stack: err.stack,
      },
      'Internal server error occurred'
    );
  } else {
    logger.warn(
      {
        event: 'CLIENT_ERROR',
        statusCode,
        method: req.method,
        path: req.path,
        userId: req.user?.id || null,
        error: err.message,
      },
      'Client error occurred'
    );
  }

  // 3. Send standardized JSON response
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Something went wrong on our end',
    // Return stack trace only in development environment
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    data: null,
  });
};

module.exports = errorMiddleware;
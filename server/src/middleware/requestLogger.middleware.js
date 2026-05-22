const logger = require('../config/logger.config');

/**
 * Request Logger Middleware: Logs every incoming request and outgoing response details
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 1. Log the incoming request (Using originalUrl for full path)
  logger.info(
    {
      event: 'HTTP_REQUEST',
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || null,
    },
    `Incoming ${req.method} ${req.originalUrl}`
  );

  // 2. Log the response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      event: 'HTTP_RESPONSE',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || null,
    };

    // Log based on status code severity
    if (res.statusCode >= 500) {
      logger.error(logData, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else {
      logger.info(logData, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
};

module.exports = requestLogger;
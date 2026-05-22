const http = require('http');
const app = require('./src/app');
const logger = require('./src/config/logger.config');
const { initSocket, getIO } = require('./src/config/socket');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create standard HTTP Server wrapping the Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  try {
    const io = getIO();
    io.close();
  } catch (e) {}
  server.close(() => process.exit(1));
});

// Graceful shutdown helpers
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`);
  try {
    const io = getIO();
    io.close();
    logger.info('Socket.IO connections closed successfully.');
  } catch (err) {}
  server.close(() => {
    logger.info('Server closed successfully. Freeing resources.');
    process.exit(0);
  });
};

// Handle nodemon restarts (SIGUSR2)
process.once('SIGUSR2', () => {
  logger.info('Nodemon restart detected. Releasing port 5000 gracefully...');
  try {
    const io = getIO();
    io.close();
    logger.info('Socket.IO connections closed successfully on restart.');
  } catch (err) {}
  server.close(() => {
    logger.info('HTTP Server closed successfully on restart.');
    process.kill(process.pid, 'SIGUSR2');
  });
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
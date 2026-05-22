const { Server } = require('socket.io');
const logger = require('./logger.config');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId) {
      const room = `user_${userId}`;
      socket.join(room);
      logger.info({
        event: 'SOCKET_CONNECTED',
        userId,
        socketId: socket.id,
        room
      }, `Socket connected: user ${userId} joined room ${room}`);
    } else {
      logger.warn({
        event: 'SOCKET_CONNECTED_NO_USER',
        socketId: socket.id
      }, 'Socket connected without userId');
    }

    socket.on('disconnect', () => {
      logger.info({
        event: 'SOCKET_DISCONNECTED',
        socketId: socket.id,
        userId
      }, `Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};

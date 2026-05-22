const pino = require('pino');
const dotenv = require('dotenv');

dotenv.config();

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
      level: process.env.LOG_LEVEL || 'info',
    },
    {
      target: 'pino/file',
      options: { destination: './logs/app.log' },
      level: 'info',
    },
    {
      target: 'pino/file',
      options: { destination: './logs/error.log' },
      level: 'error',
    },
  ],
});

const logger = pino(
  {
    level: process.env.NODE_ENV === 'test' ? 'silent' : (process.env.LOG_LEVEL || 'info'),
    base: {
      env: process.env.NODE_ENV,
    },
  },
  transport
);

module.exports = logger;
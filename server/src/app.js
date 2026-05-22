const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const requestLogger = require('./middleware/requestLogger.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const routes = require('./routes');
const { NotFoundError } = require('./utils/errorTypes');

const app = express();

// 1. Security Middlewares
app.use(helmet());
app.use(cors());

// 2. Body Parsers (Standard JSON handling)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request Logging (Logs all incoming traffic)
app.use(requestLogger);

// 4. Base Health Check Route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to Professional Notes App API',
    version: '1.0.0',
    env: process.env.NODE_ENV
  });
});

// 5. API Routes
app.use('/api/v1', routes);

// 6. 404 Not Found Handler (For undefined routes)
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// 7. Global Error Handler (Catches all thrown errors)
app.use(errorMiddleware);

module.exports = app;
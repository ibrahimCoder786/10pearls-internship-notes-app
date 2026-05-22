const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const notesRoutes = require('./notes.routes');

// --- Health Check ---
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notes App API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// --- API Routes ---
router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

module.exports = router;
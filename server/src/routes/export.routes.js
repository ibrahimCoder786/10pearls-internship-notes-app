const express = require('express');
const { exportNotes, importNotes, getExportHistory } = require('../controllers/notes.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all export routes
router.use(authMiddleware);

/**
 * @route   GET /api/v1/export
 * @desc    Export user notes (JSON, CSV, TXT)
 */
router.get('/', exportNotes);

/**
 * @route   POST /api/v1/export/import
 * @desc    Import notes from file content
 */
router.post('/import', importNotes);

/**
 * @route   GET /api/v1/export/history
 * @desc    Get user's export activity history
 */
router.get('/history', getExportHistory);

module.exports = router;

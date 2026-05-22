const express = require('express');
const router = express.Router();
const NotesController = require('../controllers/notes.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
  validate,
  createNoteRules,
  updateNoteRules,
} = require('../middleware/validate.middleware');

// All notes routes are protected
router.use(authMiddleware);

// --- Export / Import Routes (Must be BEFORE /:id to avoid conflict) ---
router.get('/export/download', NotesController.exportNotes);
router.post('/import/upload', NotesController.importNotes);
router.get('/export/history', NotesController.getExportHistory);

// --- CRUD Routes ---
router.get('/', NotesController.getAllNotes);
router.get('/:id', NotesController.getNoteById);
router.post('/', createNoteRules, validate, NotesController.createNote);
router.put('/:id', updateNoteRules, validate, NotesController.updateNote);
router.delete('/:id', NotesController.deleteNote);

// --- Extra Features ---
router.patch('/:id/pin', NotesController.togglePin);
router.patch('/:id/archive', NotesController.toggleArchive);

module.exports = router;
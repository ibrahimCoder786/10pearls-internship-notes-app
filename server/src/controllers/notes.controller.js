const NotesService = require('../services/notes.service');
const ExportService = require('../services/export.service');
const responseHandler = require('../utils/responseHandler');
const logger = require('../config/logger.config');
const { getIO } = require('../config/socket');

const NotesController = {
  /**
   * Get all notes with advanced filtering (Search, Tags, Pinned, Archived)
   */
  getAllNotes: async (req, res, next) => {
    try {
      const { search, tags, is_pinned, is_archived } = req.query;

      const filters = {
        search: search || null,
        tags: tags ? tags.split(',') : null,
        is_pinned: is_pinned !== undefined ? is_pinned === 'true' : undefined,
        is_archived: is_archived !== undefined ? is_archived === 'true' : false,
      };

      const notes = await NotesService.getAllNotes(req.user.id, filters);
      return responseHandler.success(res, notes, 'Notes fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch a single note by its ID
   */
  getNoteById: async (req, res, next) => {
    try {
      const note = await NotesService.getNoteById(
        parseInt(req.params.id),
        req.user.id
      );
      return responseHandler.success(res, note, 'Note fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a brand new note
   */
  createNote: async (req, res, next) => {
    try {
      const { title, content, color, tags } = req.body;
      const note = await NotesService.createNote(req.user.id, {
        title,
        content,
        color,
        tags,
      });

      logger.info(
        { event: 'NOTE_CREATE_SUCCESS', userId: req.user.id, noteId: note.id },
        'Note created successfully'
      );

      try {
        const io = getIO();
        io.to(`user_${req.user.id}`).emit('note:created', note);
      } catch (err) {
        logger.warn(`Socket broadcast failed: ${err.message}`);
      }

      return responseHandler.created(res, note, 'Note created successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an existing note's content or properties
   */
  updateNote: async (req, res, next) => {
    try {
      const { title, content, color, tags, is_pinned, is_archived } = req.body;
      const updated = await NotesService.updateNote(
        parseInt(req.params.id),
        req.user.id,
        { title, content, color, tags, is_pinned, is_archived }
      );

      logger.info(
        { event: 'NOTE_UPDATE_SUCCESS', userId: req.user.id, noteId: req.params.id },
        'Note updated successfully'
      );

      try {
        const io = getIO();
        io.to(`user_${req.user.id}`).emit('note:updated', updated);
      } catch (err) {
        logger.warn(`Socket broadcast failed: ${err.message}`);
      }

      return responseHandler.success(res, updated, 'Note updated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a note permanently from the database
   */
  deleteNote: async (req, res, next) => {
    try {
      const result = await NotesService.deleteNote(
        parseInt(req.params.id),
        req.user.id
      );

      logger.info(
        { event: 'NOTE_DELETE_SUCCESS', userId: req.user.id, noteId: req.params.id },
        'Note deleted successfully'
      );

      try {
        const io = getIO();
        io.to(`user_${req.user.id}`).emit('note:deleted', { id: parseInt(req.params.id) });
      } catch (err) {
        logger.warn(`Socket broadcast failed: ${err.message}`);
      }

      return responseHandler.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle the pinned status of a note
   */
  togglePin: async (req, res, next) => {
    try {
      const updated = await NotesService.togglePin(
        parseInt(req.params.id),
        req.user.id
      );
      try {
        const io = getIO();
        io.to(`user_${req.user.id}`).emit('note:updated', updated);
      } catch (err) {
        logger.warn(`Socket broadcast failed: ${err.message}`);
      }

      return responseHandler.success(res, updated, 'Note pin toggled successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle the archived status of a note
   */
  toggleArchive: async (req, res, next) => {
    try {
      const updated = await NotesService.toggleArchive(
        parseInt(req.params.id),
        req.user.id
      );
      try {
        const io = getIO();
        io.to(`user_${req.user.id}`).emit('note:updated', updated);
      } catch (err) {
        logger.warn(`Socket broadcast failed: ${err.message}`);
      }

      return responseHandler.success(res, updated, 'Note archive toggled successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export all notes in specified format (Direct file download)
   */
  exportNotes: async (req, res, next) => {
    try {
      const { type = 'json' } = req.query;
      const { fileName, exportData, exportType } = await ExportService.exportNotes(
        req.user.id,
        type
      );

      const contentTypes = {
        json: 'application/json',
        csv: 'text/csv',
        txt: 'text/plain',
      };

      logger.info(
        { event: 'EXPORT_SUCCESS', userId: req.user.id, exportType },
        'Notes exported successfully'
      );

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', contentTypes[exportType] || 'application/json');
      return res.send(exportData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Import notes from a provided file content
   */
  importNotes: async (req, res, next) => {
    try {
      const { type = 'json' } = req.query;
      const fileContent = req.body.fileContent;

      if (!fileContent) {
        return responseHandler.error(res, 'File content is required', 400);
      }

      const result = await ExportService.importNotes(
        req.user.id,
        fileContent,
        type
      );

      logger.info(
        { event: 'IMPORT_SUCCESS', userId: req.user.id, count: result.count },
        'Notes imported successfully'
      );

      try {
        const io = getIO();
        io.to(`user_${req.user.id}`).emit('notes:imported', { count: result.count });
      } catch (err) {
        logger.warn(`Socket broadcast failed: ${err.message}`);
      }

      return responseHandler.success(res, result, 'Notes imported successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch all previous export activities
   */
  getExportHistory: async (req, res, next) => {
    try {
      const history = await ExportService.getExportHistory(req.user.id);
      return responseHandler.success(res, history, 'Export history fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = NotesController;
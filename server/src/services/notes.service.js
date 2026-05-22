const NoteModel = require('../models/note.model');
const logger = require('../config/logger.config');

const NotesService = {
  /**
   * Fetch all notes for a user with optional filters (Search, Tags, Pinned)
   */
  getAllNotes: async (userId, filters = {}) => {
    const notes = await NoteModel.findAllByUser(userId, filters);

    logger.info(
      { userId, event: 'NOTES_FETCHED', count: notes.length },
      'User fetched all notes'
    );

    return notes;
  },

  /**
   * Fetch a single note and verify ownership
   */
  getNoteById: async (noteId, userId) => {
    const note = await NoteModel.findById(noteId, userId);

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      { userId, noteId, event: 'NOTE_FETCHED' },
      'User fetched single note'
    );

    return note;
  },

  /**
   * Create a new note
   */
  createNote: async (userId, { title, content, color, tags }) => {
    if (!title || title.trim() === '') {
      const error = new Error('Note title is required');
      error.statusCode = 400;
      throw error;
    }

    const note = await NoteModel.create(userId, {
      title: title.trim(),
      content,
      color,
      tags,
    });

    logger.info(
      { userId, noteId: note.id, event: 'NOTE_CREATED' },
      'User created a new note'
    );

    return note;
  },

  /**
   * Update an existing note
   */
  updateNote: async (noteId, userId, { title, content, color, tags, is_pinned, is_archived }) => {
    const existing = await NoteModel.findById(noteId, userId);
    if (!existing) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    if (!title || title.trim() === '') {
      const error = new Error('Note title is required');
      error.statusCode = 400;
      throw error;
    }

    const updated = await NoteModel.update(noteId, userId, {
      title: title.trim(),
      content,
      color,
      tags,
      is_pinned,
      is_archived,
    });

    logger.info(
      { userId, noteId, event: 'NOTE_UPDATED' },
      'User updated a note'
    );

    return updated;
  },

  /**
   * Delete a note permanently
   */
  deleteNote: async (noteId, userId) => {
    const existing = await NoteModel.findById(noteId, userId);
    if (!existing) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    await NoteModel.delete(noteId, userId);

    logger.info(
      { userId, noteId, event: 'NOTE_DELETED' },
      'User deleted a note'
    );

    return { message: 'Note deleted successfully' };
  },

  /**
   * Toggle the pin status of a note
   */
  togglePin: async (noteId, userId) => {
    const existing = await NoteModel.findById(noteId, userId);
    if (!existing) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await NoteModel.togglePin(noteId, userId);

    logger.info(
      { userId, noteId, event: 'NOTE_PIN_TOGGLED', is_pinned: updated.is_pinned },
      'User toggled note pin'
    );

    return updated;
  },

  /**
   * Toggle the archive status of a note
   */
  toggleArchive: async (noteId, userId) => {
    const existing = await NoteModel.findById(noteId, userId);
    if (!existing) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await NoteModel.toggleArchive(noteId, userId);

    logger.info(
      { userId, noteId, event: 'NOTE_ARCHIVE_TOGGLED', is_archived: updated.is_archived },
      'User toggled note archive'
    );

    return updated;
  },
};

module.exports = NotesService;
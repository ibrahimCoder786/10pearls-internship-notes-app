const ExportModel = require('../models/export.model');
const NoteModel = require('../models/note.model');
const logger = require('../config/logger.config');

const ExportService = {
  /**
   * Export all user notes in various formats (JSON, CSV, TXT)
   */
  exportNotes: async (userId, exportType = 'json') => {
    // 1. Fetch all non-archived notes
    const notes = await NoteModel.exportAllByUser(userId);

    if (notes.length === 0) {
      const error = new Error('No notes found to export');
      error.statusCode = 404;
      throw error;
    }

    // 2. Generate a professional filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `notes_export_${userId}_${timestamp}.${exportType}`;

    // 3. Format the data based on type
    let exportData;

    if (exportType === 'json') {
      exportData = JSON.stringify({ exported_at: new Date(), notes }, null, 2);
    } else if (exportType === 'csv') {
      const header = 'title,content,tags,is_pinned,color,created_at,updated_at\n';
      const rows = notes.map((note) => {
        return [
          `"${(note.title || '').replace(/"/g, '""')}"`,
          `"${(note.content || '').replace(/"/g, '""')}"`,
          `"${(note.tags || []).join('|')}"`,
          note.is_pinned,
          note.color,
          note.created_at,
          note.updated_at,
        ].join(',');
      });
      exportData = header + rows.join('\n');
    } else if (exportType === 'txt') {
      exportData = notes
        .map(
          (note) =>
            `TITLE: ${note.title}\n` +
            `CONTENT: ${note.content || ''}\n` +
            `TAGS: ${(note.tags || []).join(', ')}\n` +
            `CREATED: ${note.created_at}\n` +
            `─────────────────────────────\n`
        )
        .join('\n');
    } else {
      const error = new Error('Invalid export type. Use json, csv, or txt');
      error.statusCode = 400;
      throw error;
    }

    // 4. Record the export activity in DB
    await ExportModel.create(userId, { file_name: fileName, export_type: exportType });

    // 5. Log the event
    logger.info(
      { userId, event: 'NOTES_EXPORTED', exportType, count: notes.length },
      'User exported notes'
    );

    return { fileName, exportData, exportType, count: notes.length };
  },

  /**
   * Import notes from a file (JSON or CSV)
   */
  importNotes: async (userId, fileContent, exportType = 'json') => {
    let notesToImport = [];

    if (exportType === 'json') {
      let parsed;
      try {
        parsed = JSON.parse(fileContent);
      } catch {
        const error = new Error('Invalid JSON file');
        error.statusCode = 400;
        throw error;
      }
      notesToImport = parsed.notes || [];
    } else if (exportType === 'csv') {
      const lines = fileContent.split('\n');
      const dataLines = lines.slice(1).filter((line) => line.trim() !== '');

      notesToImport = dataLines.map((line) => {
        const cols = line.split(',');
        return {
          title: (cols[0] || '').replace(/"/g, ''),
          content: (cols[1] || '').replace(/"/g, ''),
          tags: cols[2] ? cols[2].replace(/"/g, '').split('|') : [],
          color: cols[4] || '#ffffff',
        };
      });
    } else {
      const error = new Error('Import supports json and csv only');
      error.statusCode = 400;
      throw error;
    }

    if (notesToImport.length === 0) {
      const error = new Error('No notes found in file');
      error.statusCode = 400;
      throw error;
    }

    // 2. Process imports sequentially
    const imported = [];
    for (const note of notesToImport) {
      if (!note.title || note.title.trim() === '') continue;

      const created = await NoteModel.create(userId, {
        title: note.title.trim(),
        content: note.content || null,
        color: note.color || '#ffffff',
        tags: note.tags || [],
      });

      imported.push(created);
    }

    // 3. Log the import activity
    logger.info(
      { userId, event: 'NOTES_IMPORTED', count: imported.length },
      'User imported notes'
    );

    return { message: `${imported.length} notes imported successfully`, count: imported.length };
  },

  /**
   * Fetch user's export history
   */
  getExportHistory: async (userId) => {
    const history = await ExportModel.findAllByUser(userId);

    logger.info(
      { userId, event: 'EXPORT_HISTORY_FETCHED' },
      'User fetched export history'
    );

    return history;
  },
};

module.exports = ExportService;

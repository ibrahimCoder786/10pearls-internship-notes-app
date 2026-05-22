const ExportService = require('../services/export.service');
const responseHandler = require('../utils/responseHandler');

/**
 * Export user notes
 */
const exportNotes = async (req, res, next) => {
  try {
    const { type } = req.query; // json, csv, txt
    const result = await ExportService.exportNotes(req.user.id, type);

    // If it's a direct download request, we could send the file
    // For now, we return the formatted data so frontend can handle it
    return responseHandler.success(res, result, 'Notes exported successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Import notes from file
 */
const importNotes = async (req, res, next) => {
  try {
    const { content, type } = req.body;
    const result = await ExportService.importNotes(req.user.id, content, type);
    return responseHandler.success(res, result, 'Notes imported successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get export history
 */
const getExportHistory = async (req, res, next) => {
  try {
    const history = await ExportService.getExportHistory(req.user.id);
    return responseHandler.success(res, history, 'Export history fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportNotes,
  importNotes,
  getExportHistory,
};

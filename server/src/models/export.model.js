const db = require('../config/db.config');

const ExportModel = {
  /**
   * Create a new export record
   */
  create: async (userId, { file_name, export_type }) => {
    const query = `
      INSERT INTO note_exports (user_id, file_name, export_type, status)
      VALUES ($1, $2, $3, 'completed')
      RETURNING *
    `;
    const result = await db.query(query, [userId, file_name, export_type]);
    return result.rows[0];
  },

  /**
   * Fetch all export history for a user
   */
  findAllByUser: async (userId) => {
    const query = `
      SELECT * FROM note_exports
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Fetch a single export record
   */
  findById: async (id, userId) => {
    const query = `
      SELECT * FROM note_exports
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Update the status of an export
   */
  updateStatus: async (id, status) => {
    const query = `
      UPDATE note_exports
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  },
};

module.exports = ExportModel;

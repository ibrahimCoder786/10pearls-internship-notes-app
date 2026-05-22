const db = require('../config/db.config');

const NoteModel = {
  /**
   * Fetch all notes of a user with optional filters
   */
  findAllByUser: async (userId, { search, tags, is_pinned, is_archived } = {}) => {
    let query = `
      SELECT 
        id, title, content, is_pinned, 
        is_archived, color, tags, created_at, updated_at
      FROM notes
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Advanced Full-Text Search
    if (search) {
      query += ` AND to_tsvector('english', title || ' ' || COALESCE(content, ''))
                 @@ plainto_tsquery('english', $${paramIndex})`;
      params.push(search);
      paramIndex++;
    }

    // Tag Filtering (Array overlap)
    if (tags && tags.length > 0) {
      query += ` AND tags @> $${paramIndex}`;
      params.push(tags);
      paramIndex++;
    }

    // Pinned status filter
    if (is_pinned !== undefined) {
      query += ` AND is_pinned = $${paramIndex}`;
      params.push(is_pinned);
      paramIndex++;
    }

    // Archive status filter
    if (is_archived !== undefined) {
      query += ` AND is_archived = $${paramIndex}`;
      params.push(is_archived);
      paramIndex++;
    }

    // Logic: Pinned notes first, then most recently updated
    query += ` ORDER BY is_pinned DESC, updated_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Fetch a single note
   */
  findById: async (id, userId) => {
    const query = `
      SELECT * FROM notes
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Create a new note
   */
  create: async (userId, { title, content, color, tags }) => {
    const query = `
      INSERT INTO notes (user_id, title, content, color, tags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [
      userId,
      title,
      content || null,
      color || 'default',
      tags || [],
    ]);
    return result.rows[0];
  },

  /**
   * Update an existing note
   */
  update: async (id, userId, { title, content, color, tags, is_pinned, is_archived }) => {
    const query = `
      UPDATE notes
      SET
        title      = $1,
        content    = $2,
        color      = $3,
        tags       = $4,
        is_pinned  = COALESCE($5, is_pinned),
        is_archived = COALESCE($6, is_archived),
        updated_at = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    const result = await db.query(query, [
      title,
      content || null,
      color || 'default',
      tags || [],
      is_pinned  !== undefined ? is_pinned  : null,
      is_archived !== undefined ? is_archived : null,
      id,
      userId,
    ]);
    return result.rows[0];
  },

  /**
   * Toggle the pinned status
   */
  togglePin: async (id, userId) => {
    const query = `
      UPDATE notes
      SET is_pinned = NOT is_pinned
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Toggle the archived status
   */
  toggleArchive: async (id, userId) => {
    const query = `
      UPDATE notes
      SET is_archived = NOT is_archived
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Delete a note
   */
  delete: async (id, userId) => {
    const query = `
      DELETE FROM notes
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Export logic (All non-archived notes)
   */
  exportAllByUser: async (userId) => {
    const query = `
      SELECT 
        id, title, content, tags, 
        is_pinned, color, created_at, updated_at
      FROM notes
      WHERE user_id = $1 AND is_archived = false
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },
};

module.exports = NoteModel;
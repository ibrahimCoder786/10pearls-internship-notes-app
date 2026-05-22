const db = require('../config/db.config');

const UserModel = {
  /**
   * Find user by email (used during Login)
   */
  findByEmail: async (email) => {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND is_active = true
      LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  /**
   * Find user by ID (used during Auth Middleware)
   */
  findById: async (id) => {
    const query = `
      SELECT id, name, email, avatar_url, last_login_at, created_at 
      FROM users 
      WHERE id = $1 AND is_active = true
      LIMIT 1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Create a new user (used during Signup)
   */
  create: async ({ name, email, password }) => {
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    const result = await db.query(query, [name, email, password]);
    return result.rows[0];
  },

  /**
   * Update the last login timestamp
   */
  updateLastLogin: async (id) => {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await db.query(query, [id]);
  },

  /**
   * Update user profile information
   */
  updateProfile: async (id, { name, avatar_url }) => {
    const query = `
      UPDATE users 
      SET name = $1, avatar_url = $2
      WHERE id = $3
      RETURNING id, name, email, avatar_url, updated_at
    `;
    const result = await db.query(query, [name, avatar_url, id]);
    return result.rows[0];
  },

  /**
   * Check if an email already exists (Validation)
   */
  emailExists: async (email) => {
    const query = `
      SELECT id FROM users 
      WHERE email = $1
      LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows.length > 0;
  },
};

module.exports = UserModel;
// =============================================
// Helper: Test DB
// Description: DB setup and teardown for tests
// =============================================

const db = require('../../src/config/db.config');

const testDb = {
  // Tests shuru hone se pehle tables ensure karo
  setup: async () => {
    // Note: In a professional setup, we usually use a separate 'notes_test' database
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL          PRIMARY KEY,
        name          VARCHAR(100)    NOT NULL,
        email         VARCHAR(150)    NOT NULL UNIQUE,
        password      VARCHAR(255)    NOT NULL,
        avatar_url    VARCHAR(500)    DEFAULT NULL,
        is_active     BOOLEAN         DEFAULT TRUE,
        last_login_at TIMESTAMP       DEFAULT NULL,
        created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id          SERIAL        PRIMARY KEY,
        user_id     INTEGER       NOT NULL,
        title       VARCHAR(255)  NOT NULL,
        content     TEXT          DEFAULT NULL,
        is_pinned   BOOLEAN       DEFAULT FALSE,
        is_archived BOOLEAN       DEFAULT FALSE,
        color       VARCHAR(20)   DEFAULT '#ffffff',
        tags        TEXT[]        DEFAULT '{}',
        created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_notes_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  },

  // Har test ke baad data clean karo
  cleanup: async () => {
    await db.query('DELETE FROM notes');
    await db.query('DELETE FROM users');
  },

  // Sab tests khatam hone ke baad connection close karo
  teardown: async () => {
    // We don't drop tables in local dev usually, but we close the pool
    await db.end();
  },
};

module.exports = testDb;

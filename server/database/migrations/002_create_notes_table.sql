-- =============================================
-- Table: notes
-- Description: Stores notes for each user
-- Author: Notes App
-- =============================================

CREATE TABLE IF NOT EXISTS notes (
    id            SERIAL          PRIMARY KEY,
    user_id       INTEGER         NOT NULL,
    title         VARCHAR(255)    NOT NULL,
    content       TEXT            DEFAULT NULL,        -- rich text (HTML from editor)
    is_pinned     BOOLEAN         DEFAULT FALSE,       -- pin important notes
    is_archived   BOOLEAN         DEFAULT FALSE,       -- archive old notes
    color         VARCHAR(20)     DEFAULT '#ffffff',   -- note card color
    tags          TEXT[]          DEFAULT '{}',        -- tags array for filter feature
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key → users table
    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE                              -- user delete hoga to notes bhi
);

-- Auto-update updated_at
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for search & filter features
CREATE INDEX IF NOT EXISTS idx_notes_user_id   ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_notes_tags      ON notes USING GIN(tags);  -- fast tag search

-- Full text search index on title + content
CREATE INDEX IF NOT EXISTS idx_notes_fulltext  
    ON notes USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));
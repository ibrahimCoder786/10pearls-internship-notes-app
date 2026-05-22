-- =============================================
-- Table: users
-- Description: Stores all registered users
-- Author: Notes App
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL          PRIMARY KEY,
    name          VARCHAR(100)    NOT NULL,
    email         VARCHAR(150)    NOT NULL UNIQUE,
    password      VARCHAR(255)    NOT NULL,
    avatar_url    VARCHAR(500)    DEFAULT NULL,        -- profile picture (optional)
    is_active     BOOLEAN         DEFAULT TRUE,        -- account active/inactive
    last_login_at TIMESTAMP       DEFAULT NULL,        -- track last login activity
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index on email for fast login lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
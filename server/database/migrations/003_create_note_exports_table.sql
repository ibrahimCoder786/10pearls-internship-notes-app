-- =============================================
-- Table: note_exports
-- Description: Track export/import history
-- Author: Notes App
-- (For optional Export/Import feature)
-- =============================================

CREATE TABLE IF NOT EXISTS note_exports (
    id            SERIAL          PRIMARY KEY,
    user_id       INTEGER         NOT NULL,
    file_name     VARCHAR(255)    NOT NULL,            -- exported file name
    export_type   VARCHAR(20)     NOT NULL,            -- 'json' | 'csv' | 'txt'
    status        VARCHAR(20)     DEFAULT 'completed', -- 'pending' | 'completed' | 'failed'
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_exports_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON note_exports(user_id);
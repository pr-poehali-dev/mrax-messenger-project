CREATE TABLE IF NOT EXISTS chats (id BIGSERIAL PRIMARY KEY, type VARCHAR(16) NOT NULL DEFAULT 'personal', name VARCHAR(128), description TEXT, avatar_url TEXT, owner_id BIGINT, members_count INTEGER DEFAULT 2, is_verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS chat_members (chat_id BIGINT NOT NULL, user_id BIGINT NOT NULL, role VARCHAR(16) DEFAULT 'member', joined_at TIMESTAMP DEFAULT NOW(), PRIMARY KEY (chat_id, user_id));

CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON chat_members(chat_id)
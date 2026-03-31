CREATE TABLE IF NOT EXISTS messages (id BIGSERIAL PRIMARY KEY, chat_id BIGINT NOT NULL, user_id BIGINT NOT NULL, text TEXT NOT NULL, type VARCHAR(16) DEFAULT 'text', reply_to_id BIGINT, is_pinned BOOLEAN DEFAULT FALSE, is_edited BOOLEAN DEFAULT FALSE, is_forwarded BOOLEAN DEFAULT FALSE, metadata JSONB DEFAULT '{}', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS message_reads (message_id BIGINT NOT NULL, user_id BIGINT NOT NULL, read_at TIMESTAMP DEFAULT NOW(), PRIMARY KEY (message_id, user_id));

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)
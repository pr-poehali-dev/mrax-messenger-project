CREATE TABLE IF NOT EXISTS gifts (id BIGSERIAL PRIMARY KEY, name VARCHAR(64) NOT NULL, emoji VARCHAR(16) NOT NULL, description TEXT, price_stars INTEGER NOT NULL, rarity VARCHAR(16) DEFAULT 'common', is_limited BOOLEAN DEFAULT FALSE, total_supply INTEGER, sold_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS sent_gifts (id BIGSERIAL PRIMARY KEY, gift_id BIGINT NOT NULL, from_user_id BIGINT NOT NULL, to_user_id BIGINT NOT NULL, message_id BIGINT, is_opened BOOLEAN DEFAULT FALSE, serial_number INTEGER, created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS stars_transactions (id BIGSERIAL PRIMARY KEY, from_user_id BIGINT NOT NULL, to_user_id BIGINT, amount INTEGER NOT NULL, type VARCHAR(32) NOT NULL, description TEXT, metadata JSONB DEFAULT '{}', created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS premium_plans (id SERIAL PRIMARY KEY, name VARCHAR(32) NOT NULL, duration_months INTEGER NOT NULL, price_stars INTEGER NOT NULL, price_rub INTEGER, features JSONB DEFAULT '[]', is_active BOOLEAN DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS premium_transactions (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, plan_id INTEGER, stars_spent INTEGER NOT NULL, valid_until TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT NOW());

CREATE INDEX IF NOT EXISTS idx_stars_from ON stars_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_stars_to ON stars_transactions(to_user_id)
-- =====================================================
-- Подключаемся к базе данных postgres для создания нашей БД
-- =====================================================
\c postgres;

-- =====================================================
-- Удаляем существующую БД если есть (для чистой инициализации)
-- =====================================================
DROP DATABASE IF EXISTS parkingsmart;

-- =====================================================
-- Создаём БД заново
-- =====================================================
CREATE DATABASE parkingsmart;
\c parkingsmart;

-- =====================================================
-- Расширение PostGIS для геопоиска
-- =====================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- Таблица 1: users (пользователи)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone_hash VARCHAR(64) UNIQUE NOT NULL,
    phone_encrypted VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- =====================================================
-- Таблица 2: parkings (парковки)
-- =====================================================
CREATE TABLE IF NOT EXISTS parkings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat DECIMAL(9,6) NOT NULL,
    lon DECIMAL(9,6) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    is_blocking BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '48 hours')
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_parkings_location ON parkings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_parkings_user_created ON parkings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parkings_expires ON parkings(expires_at);

-- =====================================================
-- ВРЕМЕННОЕ РЕШЕНИЕ: без частичного индекса
-- PostGIS требует IMMUTABLE функции в условии индекса
-- =====================================================
-- CREATE INDEX IF NOT EXISTS idx_active_blockers ON parkings USING GIST(location) 
-- WHERE is_blocking = TRUE AND expires_at > CURRENT_TIMESTAMP;

-- =====================================================
-- Таблица 3: calls (звонки)
-- =====================================================
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    called_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_call_per_pair UNIQUE (blocker_id, caller_id)
);

CREATE INDEX IF NOT EXISTS idx_calls_blocker ON calls(blocker_id, called_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_caller ON calls(caller_id, called_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_recent ON calls(called_at DESC);

-- =====================================================
-- Функция автоматической очистки
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    DELETE FROM parkings WHERE expires_at < NOW();
    DELETE FROM calls WHERE called_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

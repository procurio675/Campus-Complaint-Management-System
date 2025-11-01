-- Drop tables in the correct order to avoid dependency issues
DROP TABLE IF EXISTS trackers CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS resolutions CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS committees CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ROLES TABLE
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('student','committee','admin'))
);

-- COMMITTEES TABLE
CREATE TABLE committees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    committee_id INT REFERENCES committees(id) ON DELETE SET NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMPLAINTS TABLE
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    committee_id INT REFERENCES committees(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new','in-progress','resolved-pending','closed')),
    sensitive BOOLEAN DEFAULT FALSE,
    anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ATTACHMENTS TABLE
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOGS TABLE (history of complaint updates)
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    handler_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESOLUTIONS TABLE (committee’s resolution + student confirmation)
CREATE TABLE resolutions (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    committee_id INT REFERENCES committees(id) ON DELETE SET NULL,
    resolution_note TEXT NOT NULL,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_by_student BOOLEAN DEFAULT FALSE,
    confirmation_at TIMESTAMP
);

-- FEEDBACK TABLE (student satisfaction after closure)
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRACKERS TABLE (latest status for dashboards)
CREATE TABLE trackers (
    id SERIAL PRIMARY KEY,
    complaint_id INT UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    current_status VARCHAR(30) NOT NULL CHECK (current_status IN ('new','in-progress','resolved-pending','closed')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    overdue BOOLEAN DEFAULT FALSE,
    escalated_to_admin BOOLEAN DEFAULT FALSE
);
-- List all tables in the current database schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;


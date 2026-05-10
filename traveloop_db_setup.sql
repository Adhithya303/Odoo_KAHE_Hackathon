-- ============================================================
--  TRAVELOOP — Complete MySQL Database Setup
--  Run this file once to create all tables and seed the dataset
--  Command: mysql -u root -p < traveloop_db_setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS traveloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE traveloop;

SET FOREIGN_KEY_CHECKS = 0;


-- ============================================================
--  SECTION 1: LOOKUP / REFERENCE TABLES
-- ============================================================

-- Trip types (Adventure, Beach, Cultural, etc.)
CREATE TABLE IF NOT EXISTS trip_types (
    id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

-- Group types (Solo, Couple, Friends, Family)
CREATE TABLE IF NOT EXISTS group_types (
    id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(30) NOT NULL UNIQUE
);

-- Months lookup
CREATE TABLE IF NOT EXISTS months (
    id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(15) NOT NULL UNIQUE
);

-- Expense categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE     -- Transport, Stay, Food, Activities, Miscellaneous
);

-- Checklist item categories
CREATE TABLE IF NOT EXISTS checklist_categories (
    id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE     -- Clothing, Documents, Electronics, Toiletries, Miscellaneous
);


-- ============================================================
--  SECTION 2: USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    phone               VARCHAR(20),
    city                VARCHAR(100),
    country             VARCHAR(100),
    profile_photo_url   VARCHAR(500),
    additional_info     TEXT,
    password_hash       VARCHAR(255) NOT NULL,
    role                ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    language_pref       VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
);

-- JWT refresh tokens (for secure re-auth without re-login)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  DATETIME NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_token (user_id, revoked)
);


-- ============================================================
--  SECTION 3: USER PREFERENCES (Onboarding / ML Input)
-- ============================================================

-- Stores answers from the onboarding wizard
-- Used as the primary input to the ML recommendation engine
CREATE TABLE IF NOT EXISTS user_preferences (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED NOT NULL UNIQUE,
    trip_scope          ENUM('Domestic', 'International', 'Both') DEFAULT 'Both',
    -- trip_type is stored as comma-separated tags in the ML layer;
    -- the junction table below handles the relational version
    budget_tier         ENUM('Budget', 'Mid-range', 'Premium') DEFAULT 'Mid-range',
    min_budget          INT UNSIGNED,           -- in INR
    max_budget          INT UNSIGNED,           -- in INR
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Many-to-many: a user can have multiple preferred trip_types
CREATE TABLE IF NOT EXISTS user_pref_trip_types (
    user_id         INT UNSIGNED NOT NULL,
    trip_type_id    TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, trip_type_id),
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (trip_type_id) REFERENCES trip_types(id) ON DELETE CASCADE
);

-- Many-to-many: a user can prefer multiple group types
CREATE TABLE IF NOT EXISTS user_pref_group_types (
    user_id         INT UNSIGNED NOT NULL,
    group_type_id   TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, group_type_id),
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (group_type_id) REFERENCES group_types(id) ON DELETE CASCADE
);


-- ============================================================
--  SECTION 4: DESTINATIONS (Seeded from dataset)
-- ============================================================

CREATE TABLE IF NOT EXISTS destinations (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150) NOT NULL UNIQUE,
    country             VARCHAR(100),
    city                VARCHAR(100),
    trip_scope          ENUM('Domestic', 'International') NOT NULL,
    description         TEXT,
    cover_image_url     VARCHAR(500),
    cost_index          ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    popularity_score    TINYINT UNSIGNED DEFAULT 50,    -- 0-100
    avg_min_budget      INT UNSIGNED,   -- computed from dataset rows, in INR
    avg_max_budget      INT UNSIGNED,
    climate_tags        VARCHAR(255),   -- e.g. "tropical,humid,sunny"
    vibe_tags           VARCHAR(255),   -- e.g. "beach,party,relaxed"
    embedding_vector    LONGTEXT,       -- JSON array; populated by ML seeding script
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_scope     (trip_scope),
    INDEX idx_cost      (cost_index)
);

-- Best trip types per destination (from dataset, normalized)
CREATE TABLE IF NOT EXISTS destination_trip_types (
    destination_id  INT UNSIGNED NOT NULL,
    trip_type_id    TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (destination_id, trip_type_id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_type_id)   REFERENCES trip_types(id)   ON DELETE CASCADE
);

-- Best group types per destination (from dataset, normalized)
CREATE TABLE IF NOT EXISTS destination_group_types (
    destination_id  INT UNSIGNED NOT NULL,
    group_type_id   TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (destination_id, group_type_id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (group_type_id)  REFERENCES group_types(id)  ON DELETE CASCADE
);

-- Best travel months per destination (from dataset, normalized)
CREATE TABLE IF NOT EXISTS destination_travel_months (
    destination_id  INT UNSIGNED NOT NULL,
    month_id        TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (destination_id, month_id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (month_id)       REFERENCES months(id)       ON DELETE CASCADE
);


-- ============================================================
--  SECTION 5: ML RECOMMENDATION DATASET (Raw, from CSV)
--  803 rows — one per dataset record
--  Used directly by the ML pipeline for training & inference
-- ============================================================

CREATE TABLE IF NOT EXISTS recommendation_profiles (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_scope              ENUM('Domestic', 'International') NOT NULL,
    trip_type_tags          VARCHAR(255) NOT NULL,   -- raw comma-separated, e.g. "Cultural,Beach,Relaxation"
    min_budget              INT UNSIGNED NOT NULL,   -- in INR
    max_budget              INT UNSIGNED NOT NULL,   -- in INR
    group_type_tags         VARCHAR(100) NOT NULL,   -- raw comma-separated, e.g. "Couple,Family"
    travel_month_tags       VARCHAR(150) NOT NULL,   -- raw comma-separated, e.g. "October,November,March"
    recommended_destination VARCHAR(150) NOT NULL,
    INDEX idx_destination   (recommended_destination),
    INDEX idx_scope         (trip_scope)
);


-- ============================================================
--  SECTION 6: TRIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS trips (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED NOT NULL,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    cover_photo_url     VARCHAR(500),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    total_budget        DECIMAL(12, 2),                 -- user-set budget in INR
    predicted_budget    DECIMAL(12, 2),                 -- ML-predicted estimate
    visibility          ENUM('private', 'public') NOT NULL DEFAULT 'private',
    status              ENUM('planning', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
    trip_scope          ENUM('Domestic', 'International') DEFAULT 'Domestic',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status   (user_id, status),
    INDEX idx_visibility    (visibility),
    INDEX idx_dates         (start_date, end_date)
);


-- ============================================================
--  SECTION 7: TRIP STOPS (Cities/Places within a trip)
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_stops (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    destination_id  INT UNSIGNED,                       -- NULL if custom location
    custom_place    VARCHAR(255),                       -- if not from destinations table
    section_title   VARCHAR(255),                       -- user-labelled section name
    description     TEXT,
    arrival_date    DATE,
    departure_date  DATE,
    sort_order      TINYINT UNSIGNED NOT NULL DEFAULT 0,-- for drag-to-reorder
    stop_budget     DECIMAL(12, 2),                     -- budget allocated to this stop
    latitude        DECIMAL(10, 7),
    longitude       DECIMAL(10, 7),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id)        REFERENCES trips(id)        ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    INDEX idx_trip_order (trip_id, sort_order)
);


-- ============================================================
--  SECTION 8: ACTIVITIES
-- ============================================================

-- Global activity catalog (can be linked to any stop)
CREATE TABLE IF NOT EXISTS activities (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    destination_id  INT UNSIGNED,                   -- NULL = generic/anywhere
    trip_type_id    TINYINT UNSIGNED,               -- primary category
    description     TEXT,
    image_url       VARCHAR(500),
    estimated_cost  DECIMAL(10, 2),                 -- in INR
    duration_hours  DECIMAL(4, 1),
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    source          ENUM('manual', 'api', 'community') DEFAULT 'manual',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    FOREIGN KEY (trip_type_id)   REFERENCES trip_types(id)   ON DELETE SET NULL,
    INDEX idx_destination   (destination_id),
    INDEX idx_trip_type     (trip_type_id)
);

-- Activities assigned to a specific stop in a trip (many-to-many with metadata)
CREATE TABLE IF NOT EXISTS trip_stop_activities (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    stop_id         INT UNSIGNED NOT NULL,
    activity_id     INT UNSIGNED NOT NULL,
    scheduled_date  DATE,
    start_time      TIME,
    end_time        TIME,
    actual_cost     DECIMAL(10, 2),
    notes           TEXT,
    sort_order      TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (stop_id)     REFERENCES trip_stops(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_stop_date (stop_id, scheduled_date)
);


-- ============================================================
--  SECTION 9: BUDGET & EXPENSES
-- ============================================================

CREATE TABLE IF NOT EXISTS expenses (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    stop_id         INT UNSIGNED,                       -- NULL = trip-level expense
    category_id     TINYINT UNSIGNED NOT NULL,
    description     VARCHAR(255) NOT NULL,
    qty             DECIMAL(6, 2) NOT NULL DEFAULT 1,
    unit            VARCHAR(50),                        -- "nights", "persons", "tickets"
    unit_cost       DECIMAL(10, 2) NOT NULL,
    amount          DECIMAL(12, 2) GENERATED ALWAYS AS (qty * unit_cost) STORED,
    expense_date    DATE,
    payment_status  ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id)     REFERENCES trips(id)               ON DELETE CASCADE,
    FOREIGN KEY (stop_id)     REFERENCES trip_stops(id)          ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)  ON DELETE RESTRICT,
    INDEX idx_trip_category (trip_id, category_id)
);


-- ============================================================
--  SECTION 10: PACKING CHECKLIST
-- ============================================================

CREATE TABLE IF NOT EXISTS packing_checklist (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    category_id     TINYINT UNSIGNED NOT NULL,
    item_name       VARCHAR(255) NOT NULL,
    is_packed       BOOLEAN NOT NULL DEFAULT FALSE,
    is_ai_suggested BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      TINYINT UNSIGNED DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id)     REFERENCES trips(id)                  ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES checklist_categories(id)   ON DELETE RESTRICT,
    INDEX idx_trip_packed (trip_id, is_packed)
);


-- ============================================================
--  SECTION 11: TRIP NOTES / JOURNAL
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_notes (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id     INT UNSIGNED NOT NULL,
    stop_id     INT UNSIGNED,                   -- NULL = trip-level note
    title       VARCHAR(255),
    content     TEXT NOT NULL,
    note_date   DATE,
    tag         ENUM('general', 'hotel', 'reminder', 'contact', 'transport') DEFAULT 'general',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id)      ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE SET NULL,
    INDEX idx_trip_date (trip_id, note_date)
);


-- ============================================================
--  SECTION 12: COMMUNITY
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    trip_id         INT UNSIGNED NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    cover_image_url VARCHAR(500),
    views           INT UNSIGNED NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_published_date (is_published, created_at)
);

CREATE TABLE IF NOT EXISTS community_likes (
    user_id     INT UNSIGNED NOT NULL,
    post_id     INT UNSIGNED NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id)            ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES community_posts(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_comments (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id     INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL,
    content     TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)           ON DELETE CASCADE,
    INDEX idx_post (post_id, created_at)
);

-- Saved / bookmarked trips (users saving other people's trips)
CREATE TABLE IF NOT EXISTS saved_trips (
    user_id     INT UNSIGNED NOT NULL,
    trip_id     INT UNSIGNED NOT NULL,
    saved_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, trip_id),
    FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id)  ON DELETE CASCADE
);


-- ============================================================
--  SECTION 13: ADMIN / AUDIT
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_logs (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id    INT UNSIGNED NOT NULL,
    action      VARCHAR(100) NOT NULL,          -- e.g. "DELETE_USER", "SUSPEND_USER"
    target_type VARCHAR(50),                    -- "user", "trip", "post"
    target_id   INT UNSIGNED,
    details     TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_date (admin_id, created_at)
);


-- ============================================================
--  SECTION 14: SEED DATA — LOOKUP TABLES
-- ============================================================

INSERT IGNORE INTO trip_types (name) VALUES
    ('Adventure'), ('Beach'), ('Cultural'), ('Luxury'),
    ('Nature'), ('Pilgrimage'), ('Relaxation'), ('Wildlife');

INSERT IGNORE INTO group_types (name) VALUES
    ('Solo'), ('Couple'), ('Friends'), ('Family');

INSERT IGNORE INTO months (name) VALUES
    ('January'), ('February'), ('March'), ('April'),
    ('May'), ('June'), ('July'), ('August'),
    ('September'), ('October'), ('November'), ('December');

INSERT IGNORE INTO expense_categories (name) VALUES
    ('Transport'), ('Stay'), ('Food'), ('Activities'), ('Miscellaneous');

INSERT IGNORE INTO checklist_categories (name) VALUES
    ('Documents'), ('Clothing'), ('Electronics'), ('Toiletries'), ('Miscellaneous');


-- ============================================================
--  SECTION 15: SEED DATA — DESTINATIONS (from dataset, 69 places)
-- ============================================================

INSERT IGNORE INTO destinations (name, trip_scope, cost_index) VALUES
-- Domestic
('Amritsar',         'Domestic',      'Low'),
('Andaman Islands',  'Domestic',      'Medium'),
('Auli',             'Domestic',      'Low'),
('Chopta',           'Domestic',      'Low'),
('Coorg',            'Domestic',      'Low'),
('Darjeeling',       'Domestic',      'Low'),
('Goa',              'Domestic',      'Medium'),
('Hampi',            'Domestic',      'Low'),
('Jaipur',           'Domestic',      'Low'),
('Jim Corbett',      'Domestic',      'Medium'),
('Kaziranga',        'Domestic',      'Medium'),
('Kerala',           'Domestic',      'Medium'),
('Ladakh',           'Domestic',      'Medium'),
('Lakshadweep',      'Domestic',      'High'),
('Manali',           'Domestic',      'Low'),
('Mathura Vrindavan','Domestic',      'Low'),
('Meghalaya',        'Domestic',      'Low'),
('Munnar',           'Domestic',      'Low'),
('Mysuru',           'Domestic',      'Low'),
('Ooty',             'Domestic',      'Low'),
('Pondicherry',      'Domestic',      'Low'),
('Rajasthan',        'Domestic',      'Medium'),
('Rann of Kutch',    'Domestic',      'Low'),
('Rishikesh',        'Domestic',      'Low'),
('Shimla',           'Domestic',      'Low'),
('Spiti Valley',     'Domestic',      'Low'),
('Sundarbans',       'Domestic',      'Low'),
('Tirupati',         'Domestic',      'Low'),
('Varanasi',         'Domestic',      'Low'),
('Ziro Valley',      'Domestic',      'Low'),
-- International
('Australia',        'International', 'High'),
('Bali',             'International', 'Medium'),
('Bhutan',           'International', 'Medium'),
('Cambodia',         'International', 'Low'),
('Canada',           'International', 'High'),
('Costa Rica',       'International', 'Medium'),
('Czech Republic',   'International', 'Medium'),
('Dubai',            'International', 'High'),
('Egypt',            'International', 'Medium'),
('Greece',           'International', 'High'),
('Iceland',          'International', 'High'),
('Indonesia',        'International', 'Medium'),
('Italy',            'International', 'High'),
('Japan',            'International', 'High'),
('Jordan',           'International', 'Medium'),
('Kenya',            'International', 'High'),
('Malaysia',         'International', 'Medium'),
('Maldives',         'International', 'High'),
('Mauritius',        'International', 'High'),
('Mexico',           'International', 'Medium'),
('Morocco',          'International', 'Medium'),
('Nepal',            'International', 'Low'),
('New Zealand',      'International', 'High'),
('Norway',           'International', 'High'),
('Paris',            'International', 'High'),
('Peru',             'International', 'Medium'),
('Philippines',      'International', 'Medium'),
('Portugal',         'International', 'Medium'),
('Seychelles',       'International', 'High'),
('Singapore',        'International', 'High'),
('South Africa',     'International', 'High'),
('Spain',            'International', 'High'),
('Sri Lanka',        'International', 'Low'),
('Switzerland',      'International', 'High'),
('Tanzania',         'International', 'High'),
('Thailand',         'International', 'Medium'),
('Turkey',           'International', 'Medium'),
('Vietnam',          'International', 'Low'),
('Zanzibar',         'International', 'High');


-- ============================================================
--  SECTION 16: SEED DATA — recommendation_profiles (803 rows)
--  Paste full CSV data here, or load via Python script below
-- ============================================================

-- NOTE: Load the full 803 rows using the Python loader script
-- (traveloop_seed_dataset.py) provided separately.
-- A sample of 10 rows is included here to validate the schema:

INSERT IGNORE INTO recommendation_profiles
    (trip_scope, trip_type_tags, min_budget, max_budget, group_type_tags, travel_month_tags, recommended_destination)
VALUES
('Domestic',      'Cultural,Beach,Relaxation',       9602,   29695,  'Solo',           'October,November,March',   'Pondicherry'),
('Domestic',      'Cultural',                         6972,   19075,  'Couple,Family',  'March',                    'Mathura Vrindavan'),
('Domestic',      'Cultural,Nature,Adventure',        8844,   23720,  'Friends,Couple', 'February',                 'Hampi'),
('International', 'Adventure',                       153826, 389463,  'Couple,Friends', 'January,July',             'Iceland'),
('International', 'Beach,Cultural,Adventure',         59935, 151142,  'Friends',        'May,September',            'Morocco'),
('Domestic',      'Adventure,Nature',                 7500,   22000,  'Friends',        'June,July,August',         'Ladakh'),
('Domestic',      'Wildlife,Nature',                  9000,   25000,  'Family',         'November,December,January','Jim Corbett'),
('International', 'Cultural,Luxury',                200000, 500000,  'Couple',         'March,April,October',      'Paris'),
('Domestic',      'Pilgrimage',                       5000,   15000,  'Family,Solo',    'October,November',         'Tirupati'),
('International', 'Beach,Relaxation,Luxury',         180000, 450000, 'Couple',         'December,January,February','Maldives');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  SETUP COMPLETE
--  Next step: run traveloop_seed_dataset.py to load all 803 rows
-- ============================================================

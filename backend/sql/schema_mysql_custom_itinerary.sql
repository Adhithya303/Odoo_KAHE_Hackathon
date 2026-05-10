-- Extensions for custom itinerary support
USE traveloop;

-- 1) Add fields to existing `itinerary_items` to support custom activities
ALTER TABLE itinerary_items
  ADD COLUMN is_custom BOOLEAN DEFAULT FALSE,
  ADD COLUMN custom_activity_type VARCHAR(100) NULL,
  ADD COLUMN custom_title VARCHAR(200) NULL,
  ADD COLUMN custom_description TEXT NULL,
  ADD COLUMN custom_lat DECIMAL(9,6) NULL,
  ADD COLUMN custom_lng DECIMAL(9,6) NULL,
  ADD COLUMN created_by INT NULL,
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE itinerary_items
  ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 2) A table to store reusable itinerary templates (user or system)
CREATE TABLE IF NOT EXISTS itinerary_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id INT NULL, -- NULL = system template
  name VARCHAR(200) NOT NULL,
  description TEXT,
  default_duration_days INT DEFAULT 1,
  visibility ENUM('private','shared','public') DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itinerary_template_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  day_number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  est_duration_hours DECIMAL(4,1) DEFAULT 0,
  est_cost DECIMAL(12,2) DEFAULT 0,
  category ENUM('Transport','Stay','Food','Activity','Other') DEFAULT 'Activity',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES itinerary_templates(id) ON DELETE CASCADE,
  INDEX idx_template_day (template_id, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Attachments for itinerary items (images, links, files)
CREATE TABLE IF NOT EXISTS itinerary_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_item_id INT NOT NULL,
  uploaded_by INT NULL,
  type ENUM('image','file','link') DEFAULT 'image',
  url_or_path VARCHAR(1000) NOT NULL,
  meta JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_item_id) REFERENCES itinerary_items(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_item (itinerary_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Activity types table (optional enumerations, editable by admins)
CREATE TABLE IF NOT EXISTS activity_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('Transport','Stay','Food','Activity','Other') DEFAULT 'Activity',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Example convenience view: itinerary item with resolved title/description
CREATE OR REPLACE VIEW vw_itinerary_item_resolved AS
  SELECT ii.*,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_title ELSE ii.title END AS resolved_title,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_description ELSE ii.description END AS resolved_description,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_lat ELSE p.lat END AS resolved_lat,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_lng ELSE p.lng END AS resolved_lng
  FROM itinerary_items ii
  LEFT JOIN places p ON ii.place_id = p.id;

-- Notes:
-- - Existing API code should set `is_custom=TRUE` when users add free-text activities (title/description/time/cost).
-- - `created_by` helps attribute user-created custom items.
-- - Templates allow users to save & reuse multi-day plans; `itinerary_template_items` stores ordered activities by day.
-- - `itinerary_attachments` stores files/links associated with an item; `meta` can contain mime, size, caption.
-- - The provided view `vw_itinerary_item_resolved` simplifies queries for front-end consumption: it returns a single title/description/lat/lng.

-- End of custom itinerary extensions

-- ============================================================
-- TRIP NOTES
-- General and stop-level notes for trips
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  stop_id INT NULL,
  day_number INT NULL,
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE SET NULL,
  INDEX idx_trip_notes_trip_id (trip_id),
  INDEX idx_trip_notes_stop_id (stop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- COMMUNITY TABLES
-- Posts, comments and likes for trip-related social features
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  trip_id INT NOT NULL,
  caption TEXT,
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_trip_id (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)           ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_comment_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_likes (
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)           ON DELETE CASCADE,
  INDEX idx_like_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

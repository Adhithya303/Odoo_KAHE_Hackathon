-- ============================================================
-- TRAVELOOP FULL MYSQL SCHEMA
-- Complete schema for auth, geography, destinations, trips,
-- itineraries, custom itinerary items, community, designations,
-- bookings, attendances, budgets, and checklist tables.
-- ============================================================

CREATE DATABASE IF NOT EXISTS traveloop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE traveloop;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- LOOKUP / REFERENCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_types (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS group_types (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS months (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(15) NOT NULL UNIQUE,
  sort_order TINYINT UNSIGNED NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expense_categories (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checklist_categories (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS designations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- GEOGRAPHY
-- Normalized support for countries, cities, and places.
-- Destinations keep country/city text columns for backward compatibility.
-- ============================================================

CREATE TABLE IF NOT EXISTS countries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  iso2 CHAR(2) NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  country_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  state_region VARCHAR(100) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  is_capital BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_country_city (country_id, name),
  INDEX idx_city_name (name),
  CONSTRAINT fk_cities_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS places (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  country_id INT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  destination_id INT UNSIGNED NULL,
  google_place_id VARCHAR(200) NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NULL,
  description TEXT NULL,
  address VARCHAR(500) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  rating DECIMAL(3,2) NULL,
  cost_index ENUM('Low','Medium','High') DEFAULT 'Medium',
  trip_scope ENUM('Domestic','International','Both') DEFAULT 'Both',
  tags VARCHAR(500) NULL,
  cover_image_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_place_country (country_id),
  INDEX idx_place_city (city_id),
  INDEX idx_place_destination (destination_id),
  FULLTEXT KEY ft_place_search (name, category, description, tags),
  CONSTRAINT fk_places_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  CONSTRAINT fk_places_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  city VARCHAR(100) NULL,
  country VARCHAR(100) NULL,
  profile_photo_url VARCHAR(500) NULL,
  emergency_contact_name VARCHAR(100) NULL,
  emergency_contact_phone VARCHAR(20) NULL,
  emergency_contact_relation VARCHAR(50) NULL,
  additional_info TEXT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  language_pref VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_city (city),
  INDEX idx_users_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_refresh_user_revoked (user_id, revoked),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS otps (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  purpose ENUM('signup','reset_password','login') NOT NULL DEFAULT 'signup',
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  INDEX idx_otp_email_purpose (email, purpose),
  INDEX idx_otp_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_designations (
  user_id INT UNSIGNED NOT NULL,
  designation_id INT UNSIGNED NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, designation_id),
  CONSTRAINT fk_user_designations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_designations_designation FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USER PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  trip_scope ENUM('Domestic','International','Both') DEFAULT 'Both',
  budget_tier ENUM('Budget','Mid-range','Premium') DEFAULT 'Mid-range',
  min_budget INT UNSIGNED NULL,
  max_budget INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_pref_trip_types (
  user_id INT UNSIGNED NOT NULL,
  trip_type_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, trip_type_id),
  CONSTRAINT fk_user_pref_trip_types_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_pref_trip_types_trip_type FOREIGN KEY (trip_type_id) REFERENCES trip_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_pref_group_types (
  user_id INT UNSIGNED NOT NULL,
  group_type_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, group_type_id),
  CONSTRAINT fk_user_pref_group_types_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_pref_group_types_group_type FOREIGN KEY (group_type_id) REFERENCES group_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DESTINATIONS & RECOMMENDATION PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS destinations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  country_id INT UNSIGNED NULL,
  city_id INT UNSIGNED NULL,
  trip_scope ENUM('Domestic','International') NOT NULL,
  description TEXT NULL,
  cover_image_url VARCHAR(500) NULL,
  cost_index ENUM('Low','Medium','High') DEFAULT 'Medium',
  popularity_score TINYINT UNSIGNED DEFAULT 50,
  avg_min_budget INT UNSIGNED NULL,
  avg_max_budget INT UNSIGNED NULL,
  climate_tags VARCHAR(255) NULL,
  vibe_tags VARCHAR(255) NULL,
  embedding_vector LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dest_scope (trip_scope),
  INDEX idx_dest_cost (cost_index),
  INDEX idx_dest_country (country),
  INDEX idx_dest_city (city),
  CONSTRAINT fk_dest_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  CONSTRAINT fk_dest_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destination_trip_types (
  destination_id INT UNSIGNED NOT NULL,
  trip_type_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (destination_id, trip_type_id),
  CONSTRAINT fk_dest_trip_types_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  CONSTRAINT fk_dest_trip_types_trip_type FOREIGN KEY (trip_type_id) REFERENCES trip_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destination_group_types (
  destination_id INT UNSIGNED NOT NULL,
  group_type_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (destination_id, group_type_id),
  CONSTRAINT fk_dest_group_types_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  CONSTRAINT fk_dest_group_types_group_type FOREIGN KEY (group_type_id) REFERENCES group_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destination_travel_months (
  destination_id INT UNSIGNED NOT NULL,
  month_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (destination_id, month_id),
  CONSTRAINT fk_dest_months_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  CONSTRAINT fk_dest_months_month FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recommendation_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_scope ENUM('Domestic','International') NOT NULL,
  trip_type_tags VARCHAR(255) NOT NULL,
  min_budget INT UNSIGNED NOT NULL,
  max_budget INT UNSIGNED NOT NULL,
  group_type_tags VARCHAR(100) NOT NULL,
  travel_month_tags VARCHAR(150) NOT NULL,
  recommended_destination VARCHAR(150) NOT NULL,
  INDEX idx_rec_destination (recommended_destination),
  INDEX idx_rec_scope (trip_scope)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_destinations (
  user_id INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, destination_id),
  CONSTRAINT fk_saved_dest_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_dest_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE places
  ADD CONSTRAINT fk_places_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL;

-- ============================================================
-- TRIPS, PARTICIPATION, AND ATTENDANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS trips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  cover_photo_url VARCHAR(500) NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(12,2) NULL,
  predicted_budget DECIMAL(12,2) NULL,
  visibility ENUM('private','public') NOT NULL DEFAULT 'private',
  status ENUM('planning','ongoing','completed','cancelled') NOT NULL DEFAULT 'planning',
  trip_scope ENUM('Domestic','International') DEFAULT 'Domestic',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trip_user_status (user_id, status),
  INDEX idx_trip_visibility (visibility),
  INDEX idx_trip_dates (start_date, end_date),
  CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  booking_status ENUM('requested','confirmed','rejected','cancelled') NOT NULL DEFAULT 'requested',
  seat_count INT UNSIGNED NOT NULL DEFAULT 1,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at DATETIME NULL,
  notes TEXT NULL,
  INDEX idx_booking_trip_status (trip_id, booking_status),
  INDEX idx_booking_user (user_id),
  CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_booking_trip_user (trip_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendances (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id INT UNSIGNED NOT NULL,
  trip_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  attendance_status ENUM('going','checked_in','no_show','left') NOT NULL DEFAULT 'going',
  checked_in_at DATETIME NULL,
  checked_out_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_booking (booking_id),
  INDEX idx_attendance_trip (trip_id),
  INDEX idx_attendance_user (user_id),
  CONSTRAINT fk_attendances_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendances_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendances_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_stops (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NULL,
  custom_place VARCHAR(255) NULL,
  section_title VARCHAR(255) NULL,
  description TEXT NULL,
  arrival_date DATE NULL,
  departure_date DATE NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  stop_budget DECIMAL(12,2) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trip_stop_order (trip_id, sort_order),
  CONSTRAINT fk_trip_stops_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_stops_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ITINERARIES, ITEMS, TEMPLATES, AND ATTACHMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS itineraries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  day_number INT NOT NULL,
  title VARCHAR(255) NULL,
  description TEXT NULL,
  travel_date DATE NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_itinerary_trip_day (trip_id, day_number),
  INDEX idx_itinerary_trip_order (trip_id, sort_order),
  CONSTRAINT fk_itineraries_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  destination_id INT UNSIGNED NULL,
  trip_type_id TINYINT UNSIGNED NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  estimated_cost DECIMAL(10,2) NULL,
  duration_hours DECIMAL(4,1) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  source ENUM('manual','api','community') DEFAULT 'manual',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_destination (destination_id),
  INDEX idx_activity_trip_type (trip_type_id),
  CONSTRAINT fk_activities_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_trip_type FOREIGN KEY (trip_type_id) REFERENCES trip_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itinerary_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  itinerary_id INT UNSIGNED NOT NULL,
  place_id INT UNSIGNED NULL,
  activity_id INT UNSIGNED NULL,
  title VARCHAR(200) NULL,
  description TEXT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  estimated_cost DECIMAL(12,2) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  custom_activity_type VARCHAR(100) NULL,
  custom_title VARCHAR(200) NULL,
  custom_description TEXT NULL,
  custom_lat DECIMAL(9,6) NULL,
  custom_lng DECIMAL(9,6) NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_item_itinerary (itinerary_id, sort_order),
  INDEX idx_item_place (place_id),
  INDEX idx_item_activity (activity_id),
  CONSTRAINT fk_itinerary_items_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
  CONSTRAINT fk_itinerary_items_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,
  CONSTRAINT fk_itinerary_items_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
  CONSTRAINT fk_itinerary_items_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_stop_activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stop_id INT UNSIGNED NOT NULL,
  activity_id INT UNSIGNED NOT NULL,
  scheduled_date DATE NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  actual_cost DECIMAL(10,2) NULL,
  notes TEXT NULL,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  INDEX idx_stop_activity_date (stop_id, scheduled_date),
  CONSTRAINT fk_stop_activities_stop FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
  CONSTRAINT fk_stop_activities_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itinerary_templates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id INT UNSIGNED NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  default_duration_days INT NOT NULL DEFAULT 1,
  visibility ENUM('private','shared','public') DEFAULT 'private',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_template_owner (owner_user_id),
  CONSTRAINT fk_templates_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itinerary_template_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id INT UNSIGNED NOT NULL,
  day_number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  est_duration_hours DECIMAL(4,1) DEFAULT 0,
  est_cost DECIMAL(12,2) DEFAULT 0,
  category ENUM('Transport','Stay','Food','Activity','Other') DEFAULT 'Activity',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_template_day (template_id, day_number),
  CONSTRAINT fk_template_items_template FOREIGN KEY (template_id) REFERENCES itinerary_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itinerary_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  itinerary_item_id INT UNSIGNED NOT NULL,
  uploaded_by INT UNSIGNED NULL,
  type ENUM('image','file','link') DEFAULT 'image',
  url_or_path VARCHAR(1000) NOT NULL,
  meta JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attachment_item (itinerary_item_id),
  CONSTRAINT fk_attachments_item FOREIGN KEY (itinerary_item_id) REFERENCES itinerary_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('Transport','Stay','Food','Activity','Other') DEFAULT 'Activity',
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_types_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW vw_itinerary_item_resolved AS
  SELECT ii.*,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_title ELSE ii.title END AS resolved_title,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_description ELSE ii.description END AS resolved_description,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_lat ELSE p.latitude END AS resolved_lat,
    CASE WHEN ii.is_custom = TRUE THEN ii.custom_lng ELSE p.longitude END AS resolved_lng
  FROM itinerary_items ii
  LEFT JOIN places p ON ii.place_id = p.id;

-- ============================================================
-- BUDGETS, EXPENSES, AND CHECKLISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  stop_id INT UNSIGNED NULL,
  category_id TINYINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  qty DECIMAL(6,2) NOT NULL DEFAULT 1,
  unit VARCHAR(50) NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) GENERATED ALWAYS AS (qty * unit_cost) STORED,
  expense_date DATE NULL,
  payment_status ENUM('pending','paid','cancelled') DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expense_trip_category (trip_id, category_id),
  CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_stop FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE SET NULL,
  CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS packing_checklist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  category_id TINYINT UNSIGNED NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  is_packed BOOLEAN NOT NULL DEFAULT FALSE,
  is_ai_suggested BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_checklist_trip_packed (trip_id, is_packed),
  CONSTRAINT fk_checklist_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_checklist_category FOREIGN KEY (category_id) REFERENCES checklist_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRIP NOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id INT UNSIGNED NOT NULL,
  stop_id INT UNSIGNED NULL,
  title VARCHAR(255) NULL,
  content TEXT NOT NULL,
  note_date DATE NULL,
  tag ENUM('general','hotel','reminder','contact','transport') DEFAULT 'general',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trip_notes_date (trip_id, note_date),
  CONSTRAINT fk_trip_notes_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_notes_stop FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- COMMUNITY
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  trip_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NULL,
  cover_image_url VARCHAR(500) NULL,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_post_published (is_published, created_at),
  CONSTRAINT fk_community_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_posts_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comment_post (post_id, created_at),
  CONSTRAINT fk_community_comments_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_likes (
  user_id INT UNSIGNED NOT NULL,
  post_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  CONSTRAINT fk_community_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_likes_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_trips (
  user_id INT UNSIGNED NOT NULL,
  trip_id INT UNSIGNED NOT NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, trip_id),
  CONSTRAINT fk_saved_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_trips_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT IGNORE INTO trip_types (name) VALUES
  ('Adventure'), ('Beach'), ('Cultural'), ('Nature'), ('Relaxation'),
  ('Luxury'), ('Pilgrimage'), ('Wildlife'), ('Romantic'), ('Family');

INSERT IGNORE INTO group_types (name) VALUES
  ('Solo'), ('Couple'), ('Friends'), ('Family');

INSERT IGNORE INTO months (id, name, sort_order) VALUES
  (1, 'January', 1), (2, 'February', 2), (3, 'March', 3), (4, 'April', 4),
  (5, 'May', 5), (6, 'June', 6), (7, 'July', 7), (8, 'August', 8),
  (9, 'September', 9), (10, 'October', 10), (11, 'November', 11), (12, 'December', 12);

INSERT IGNORE INTO expense_categories (name) VALUES
  ('Transport'), ('Stay'), ('Food'), ('Activities'), ('Miscellaneous');

INSERT IGNORE INTO checklist_categories (name) VALUES
  ('Clothing'), ('Documents'), ('Electronics'), ('Toiletries'), ('Miscellaneous');

INSERT IGNORE INTO designations (name, description) VALUES
  ('Traveler', 'General traveler profile'),
  ('Trip Planner', 'Creates and manages trips'),
  ('Guide', 'Shares travel guidance'),
  ('Admin', 'Platform administrator');

SET FOREIGN_KEY_CHECKS = 1;

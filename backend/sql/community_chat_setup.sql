-- ============================================================
-- WanderIQ Community Chat Patch
-- Run this AFTER traveloop_db_setup.sql
--
-- Command:
-- mysql -u root -p traveloop < backend/sql/community_chat_setup.sql
-- ============================================================

USE traveloop;

-- Add destination_tag to community_posts if your older schema does not have it yet
SET @destination_tag_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'community_posts'
      AND COLUMN_NAME = 'destination_tag'
);

SET @destination_tag_sql := IF(
    @destination_tag_exists = 0,
    'ALTER TABLE community_posts ADD COLUMN destination_tag VARCHAR(100) NULL AFTER cover_image_url',
    'SELECT "community_posts.destination_tag already exists"'
);

PREPARE destination_tag_stmt FROM @destination_tag_sql;
EXECUTE destination_tag_stmt;
DEALLOCATE PREPARE destination_tag_stmt;

-- Shared public community chat table
CREATE TABLE IF NOT EXISTS community_chat_messages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    room        VARCHAR(50) NOT NULL DEFAULT 'general',
    content     TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_room_created (room, created_at)
);

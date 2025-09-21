
-- Add missing columns to ads table
ALTER TABLE `ads` 
ADD COLUMN `description` text,
ADD COLUMN `target_url` varchar(500),
ADD COLUMN `impressions` integer NOT NULL DEFAULT 0,
ADD COLUMN `clicks` integer NOT NULL DEFAULT 0,
ADD COLUMN `budget` decimal(10,2) DEFAULT '0.00',
ADD COLUMN `spent` decimal(10,2) DEFAULT '0.00';

-- Modify existing columns to match schema
ALTER TABLE `ads` 
MODIFY COLUMN `position` varchar(50) NOT NULL DEFAULT 'sidebar',
MODIFY COLUMN `image_url` varchar(500),
MODIFY COLUMN `link_url` varchar(500),
MODIFY COLUMN `title` varchar(255) NOT NULL;

-- Add content column if it doesn't exist
ALTER TABLE `ads` ADD COLUMN IF NOT EXISTS `content` text NOT NULL DEFAULT '';

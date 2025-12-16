-- Migration to add multilingual description fields
-- Run this SQL script in your MySQL database before starting the backend

-- Add description_fr column for French descriptions
ALTER TABLE products 
ADD COLUMN description_fr TEXT COMMENT 'Product description in French';

-- Add description_ar column for Arabic descriptions
ALTER TABLE products 
ADD COLUMN description_ar TEXT COMMENT 'Product description in Arabic';

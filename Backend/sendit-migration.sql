-- Migration script for Sendit.ma integration
-- Add Sendit tracking fields to orders table

-- Add Sendit tracking code column (unique)
ALTER TABLE orders 
ADD COLUMN sendit_tracking_code VARCHAR(255) UNIQUE AFTER tracking_code;

-- Add Sendit delivery ID column
ALTER TABLE orders 
ADD COLUMN sendit_delivery_id VARCHAR(255) AFTER sendit_tracking_code;

-- Add last Sendit sync timestamp column
ALTER TABLE orders 
ADD COLUMN last_sendit_sync DATETIME AFTER sendit_delivery_id;

-- Add index for faster queries on Sendit tracking code
CREATE INDEX idx_orders_sendit_tracking_code ON orders(sendit_tracking_code);

-- Add index for orders that need syncing
CREATE INDEX idx_orders_last_sendit_sync ON orders(last_sendit_sync);

-- Add index for orders with Sendit tracking
CREATE INDEX idx_orders_sendit_delivery_id ON orders(sendit_delivery_id);

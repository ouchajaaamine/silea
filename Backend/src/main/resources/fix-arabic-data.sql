-- Fix Arabic Text Encoding Issue
-- This script will clean and re-insert all data with proper UTF-8 encoding
-- Run this after ensuring your database uses utf8mb4 charset

-- STEP 1: Clean existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_tracking;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE customers;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- STEP 2: Ensure database and tables use utf8mb4
ALTER DATABASE sileadb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE customers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE order_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE order_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 3: Re-insert data with correct encoding
-- Insert categories (bilingual: French/Arabic)
INSERT INTO categories (name, name_ar, description, is_active, created_at, updated_at) VALUES
('Huiles d''olive', 'زيوت الزيتون', 'Huiles d''olive extra vierge traditionnelles marocaines', true, NOW(), NOW()),
('Miels', 'العسل', 'Miels naturels du Maroc', true, NOW(), NOW());

-- Insert products
INSERT INTO products (name, name_ar, description, price, stock, category_id, status, featured, image_url, created_at, updated_at) VALUES
-- Huiles d'olive
('Huile d''olive extra vierge - Picholine', 'زيت زيتون بيشولين ممتاز', 'Huile d''olive extra vierge de Picholine, récoltée à la main dans les oliveraies traditionnelles du Maroc, équilibrée et fruitée', 45.00, 150, 1, 'ACTIVE', true, 'premium-moroccan-olive-oil-bottle-with-traditional.jpg', NOW(), NOW()),

-- Miels naturels
('Miel de thym pur', 'عسل الزعتر الخالص', 'Miel de thym sauvage récolté dans les montagnes de l''Atlas, certifié bio', 35.00, 80, 2, 'ACTIVE', true, 'moroccan-thyme-honey-in-traditional-glass-jar-with.jpg', NOW(), NOW()),
('Miel de lavande sauvage', 'عسل الخزامى البري', 'Miel de lavande sauvage à la saveur florale, récolté près des champs aromatiques de Marrakech', 38.00, 90, 2, 'ACTIVE', true, 'wild-lavender-honey-jar-with-lavender-sprigs.jpg', NOW(), NOW()),
('Miel d''oranger bio', 'عسل البرتقال العضوي', 'Miel d''oranger biologique, délicatement parfumé, issu des fleurs des orangers de Fès', 32.00, 70, 2, 'ACTIVE', false, 'orange-blossom-honey-jar-with-citrus.jpg', NOW(), NOW()),
('Miel d''eucalyptus', 'عسل الكالبتوس', 'Miel d''eucalyptus aux propriétés médicinales, récolté dans les forêts du nord du Maroc', 42.00, 60, 2, 'ACTIVE', false, 'natural-honey-in-traditional-moroccan-glass-jar.jpg', NOW(), NOW()),
('Miel de ciste', 'عسل الكست', 'Miel de ciste corsé, riche en notes résineuses, issu des collines de l''Atlas', 30.00, 85, 2, 'ACTIVE', false, 'rock-rose-honey-jar-on-stone-slab.jpg', NOW(), NOW());

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, status, total_orders, total_spent, created_at, updated_at) VALUES
('Ahmed Benali', 'ahmed.benali@email.com', '+212600000001', '123 Rue de la Kasbah, Marrakech', 'ACTIVE', 5, 425.50, NOW(), NOW()),
('Fatima Tazi', 'fatima.tazi@email.com', '+212600000002', '456 Avenue Mohammed V, Rabat', 'ACTIVE', 3, 285.00, NOW(), NOW()),
('Youssef Alaoui', 'youssef.alaoui@email.com', '+212600000003', '789 Boulevard Hassan II, Casablanca', 'ACTIVE', 8, 675.25, NOW(), NOW()),
('Amina Bennani', 'amina.bennani@email.com', '+212600000004', '321 Rue des Souks, Fès', 'ACTIVE', 2, 156.75, NOW(), NOW()),
('Karim El Amrani', 'karim.amrani@email.com', '+212600000005', '654 Place Jemaa el-Fna, Marrakech', 'ACTIVE', 12, 1125.80, NOW(), NOW());

-- Insert sample orders
INSERT INTO orders (customer_id, order_number, status, order_date, shipping_address, total, estimated_delivery_date, created_at, updated_at) VALUES
(1, 'ORD-2025001', 'DELIVERED', '2025-09-15 10:30:00', '123 Rue de la Kasbah, Marrakech', 125.00, '2025-09-18 14:00:00', NOW(), NOW()),
(2, 'ORD-2025002', 'SHIPPED', '2025-09-16 14:20:00', '456 Avenue Mohammed V, Rabat', 108.00, '2025-09-20 10:00:00', NOW(), NOW()),
(3, 'ORD-2025003', 'PROCESSING', '2025-09-17 09:15:00', '789 Boulevard Hassan II, Casablanca', 117.00, '2025-09-22 16:00:00', NOW(), NOW()),
(4, 'ORD-2025004', 'PENDING', '2025-09-18 16:45:00', '321 Rue des Souks, Fès', 74.00, '2025-09-23 12:00:00', NOW(), NOW()),
(5, 'ORD-2025005', 'DELIVERED', '2025-09-14 11:00:00', '654 Place Jemaa el-Fna, Marrakech', 103.00, '2025-09-17 15:30:00', NOW(), NOW());

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at) VALUES
-- Order 1 items
(1, 1, 2, 45.00, 90.00, NOW()), -- 2 bottles of olive oil
(1, 2, 1, 35.00, 35.00, NOW()), -- 1 jar of thyme honey

-- Order 2 items
(2, 3, 2, 38.00, 76.00, NOW()), -- 2 jars of lavender honey
(2, 4, 1, 32.00, 32.00, NOW()), -- 1 jar of orange blossom honey

-- Order 3 items
(3, 1, 1, 45.00, 45.00, NOW()), -- 1 bottle of olive oil
(3, 5, 1, 42.00, 42.00, NOW()), -- 1 jar of eucalyptus honey
(3, 6, 1, 30.00, 30.00, NOW()), -- 1 jar of ciste honey

-- Order 4 items
(4, 4, 1, 32.00, 32.00, NOW()), -- 1 jar of orange blossom honey
(4, 5, 1, 42.00, 42.00, NOW()), -- 1 jar of eucalyptus honey

-- Order 5 items
(5, 6, 1, 30.00, 30.00, NOW()), -- 1 jar of ciste honey
(5, 2, 1, 35.00, 35.00, NOW()), -- 1 jar of thyme honey
(5, 3, 1, 38.00, 38.00, NOW()); -- 1 jar of lavender honey

-- Insert order tracking records
INSERT INTO order_tracking (order_id, status, location, carrier, notes, status_date, created_at) VALUES
-- Order 1 tracking (delivered)
(1, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order received and being prepared', '2025-09-15 10:30:00', NOW()),
(1, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order packed and ready for shipping', '2025-09-15 14:00:00', NOW()),
(1, 'SHIPPED', 'Marrakech Post Office', 'Poste Maroc', 'Order shipped via local courier', '2025-09-16 09:00:00', NOW()),
(1, 'DELIVERED', 'Customer Address', 'Poste Maroc', 'Order delivered successfully', '2025-09-18 14:00:00', NOW()),

-- Order 2 tracking (shipped)
(2, 'PROCESSING', 'Rabat Warehouse', 'Internal', 'Order received', '2025-09-16 14:20:00', NOW()),
(2, 'PROCESSING', 'Rabat Warehouse', 'Internal', 'Preparing order for shipment', '2025-09-16 16:00:00', NOW()),
(2, 'SHIPPED', 'Rabat Central Post', 'ARAMEX', 'Order dispatched to customer', '2025-09-17 11:30:00', NOW()),

-- Order 3 tracking (processing)
(3, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-09-17 09:15:00', NOW()),
(3, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2025-09-17 13:45:00', NOW()),

-- Order 4 tracking (pending)
(4, 'PROCESSING', 'Fès Warehouse', 'Internal', 'Order placed successfully', '2025-09-18 16:45:00', NOW()),

-- Order 5 tracking (delivered)
(5, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order received', '2025-09-14 11:00:00', NOW()),
(5, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order packed', '2025-09-14 15:30:00', NOW()),
(5, 'SHIPPED', 'Marrakech Post Office', 'DHL Maroc', 'Order shipped', '2025-09-15 10:00:00', NOW()),
(5, 'DELIVERED', 'Customer Address', 'DHL Maroc', 'Delivered to customer', '2025-09-17 15:30:00', NOW());

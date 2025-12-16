-- =====================================================
-- SILEA E-COMMERCE · CLEAN TEST DATASET
-- Purpose: provide a single source of truth for local testing, analytics dashboards,
--          and the new customer retargeting filters (with-orders, at-risk, repeat, VIP, etc.).
-- Last Update: 2025-01-25
-- =====================================================

-- Optional cleanup helpers (commented to avoid accidental truncation in production)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE order_tracking;
-- TRUNCATE TABLE order_items;
-- TRUNCATE TABLE orders;
-- TRUNCATE TABLE customers;
-- TRUNCATE TABLE product_size_prices;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- USERS (Admin accounts)
-- Password: 'password' encoded with BCrypt
-- =====================================================
INSERT IGNORE INTO users (id, email, password, name, role, created_at, updated_at) VALUES
(1, 'admin@silea.ma', '$2a$12$HmlfLz45Z9a3OLPhRmK7E.CrxVVgHYZfCYVOC.TvDQr8qAIy0dAuO', 'Admin Silea', 'ADMIN', NOW(), NOW()),
(2, 'manager@silea.ma', '$2a$12$HmlfLz45Z9a3OLPhRmK7E.CrxVVgHYZfCYVOC.TvDQr8qAIy0dAuO', 'Manager Silea', 'ADMIN', NOW(), NOW());

-- =====================================================
-- CATEGORIES (Bilingual: French/Arabic)
-- =====================================================
INSERT IGNORE INTO categories (id, name, name_ar, description, slug, image_url, is_active, created_at, updated_at) VALUES
(1, 'Huiles d''olive', 'زيوت الزيتون', 'Huiles d''olive extra vierge traditionnelles marocaines', 'oils', '/premium-moroccan-olive-oil-bottle.jpg', true, NOW(), NOW()),
(2, 'Miels', 'العسل', 'Miels naturels du Maroc', 'honey', '/moroccan-thyme-honey-jar-premium.jpg', true, NOW(), NOW()),
(3, 'Amlou', 'أملو', 'Pâte marocaine à base d''amandes, d''huile d''argan et de miel pour les petits déjeuners premium', 'amlou', '/moroccan-amlou-spread.jpg', true, NOW(), NOW());

-- =====================================================
-- PRODUCTS (with multilingual descriptions: EN, FR, AR)
-- =====================================================
-- First, update existing products with multilingual descriptions
UPDATE products SET
  description = 'Extra virgin Picholine olive oil, hand-harvested in traditional Moroccan olive groves',
  description_fr = 'Huile d''olive extra vierge de Picholine, récoltée à la main dans les oliveraies traditionnelles du Maroc',
  description_ar = 'زيت زيتون بيشولين بكر ممتاز، محصود يدوياً من بساتين الزيتون التقليدية في المغرب'
WHERE id = 1;

UPDATE products SET
  description = 'Traditional Moroccan olive oil, cold-pressed',
  description_fr = 'Huile d''olive traditionnelle marocaine, pressée à froid',
  description_ar = 'زيت زيتون مغربي تقليدي، معصور على البارد'
WHERE id = 2;

UPDATE products SET
  description = 'Certified organic olive oil, pesticide and chemical-free',
  description_fr = 'Huile d''olive biologique certifiée, sans pesticides ni produits chimiques',
  description_ar = 'زيت زيتون عضوي معتمد، خالٍ من المبيدات والمواد الكيميائية'
WHERE id = 3;

UPDATE products SET
  description = 'Pure wild thyme honey harvested from the Atlas Mountains',
  description_fr = 'Miel de thym sauvage récolté dans les montagnes de l''Atlas',
  description_ar = 'عسل زعتر بري خالص محصود من جبال الأطلس'
WHERE id = 4;

UPDATE products SET
  description = 'Wild lavender honey with delicate floral flavor',
  description_fr = 'Miel de lavande sauvage à la saveur florale',
  description_ar = 'عسل خزامى بري بنكهة زهرية رقيقة'
WHERE id = 5;

UPDATE products SET
  description = 'Organic orange blossom honey, delicately perfumed',
  description_fr = 'Miel d''oranger biologique, délicatement parfumé',
  description_ar = 'عسل زهر البرتقال العضوي، معطر بلطف'
WHERE id = 6;

UPDATE products SET
  description = 'Eucalyptus honey with medicinal properties',
  description_fr = 'Miel d''eucalyptus aux propriétés médicinales',
  description_ar = 'عسل الكافور بخصائص طبية'
WHERE id = 7;

UPDATE products SET
  description = 'Rosemary honey with delicate herbal notes',
  description_fr = 'Miel de romarin aux notes herbacées et délicates',
  description_ar = 'عسل إكليل الجبل بنكهات عشبية رقيقة'
WHERE id = 8;

UPDATE products SET
  description = 'Royal Amlou prepared with roasted almonds and golden argan oil',
  description_fr = 'Amlou royal préparé avec des amandes torréfiées et de l''huile d''argan dorée',
  description_ar = 'أملو ملكي محضر بلوز محمص وزيت أرغان ذهبي'
WHERE id = 9;

UPDATE products SET
  description = 'Artisan recipe combining almonds, argan, and wild thyme honey',
  description_fr = 'Recette artisanale mariant amandes, argan et miel de thym sauvage',
  description_ar = 'وصفة حرفية تجمع بين اللوز والأرغان وعسل الزعتر البري'
WHERE id = 10;

-- Insert new products (if they don't exist)
INSERT IGNORE INTO products (id, name, name_ar, description, description_fr, description_ar, price, available, category_id, status, featured, image_url, created_at, updated_at) VALUES
-- Oil products (base price is for 5L)
(1, 'Huile d''olive extra vierge - Picholine', 'زيت زيتون بيشولين ممتاز', 
'Extra virgin Picholine olive oil, hand-harvested in traditional Moroccan olive groves', 
'Huile d''olive extra vierge de Picholine, récoltée à la main dans les oliveraies traditionnelles du Maroc', 
'زيت زيتون بيشولين بكر ممتاز، محصود يدوياً من بساتين الزيتون التقليدية في المغرب', 
450.00, true, 1, 'ACTIVE', true, 'premium-moroccan-olive-oil-bottle-with-traditional.jpg', NOW(), NOW()),

(2, 'Huile d''olive traditionnelle', 'زيت الزيتون التقليدي', 
'Traditional Moroccan olive oil, cold-pressed', 
'Huile d''olive traditionnelle marocaine, pressée à froid', 
'زيت زيتون مغربي تقليدي، معصور على البارد', 
380.00, true, 1, 'ACTIVE', false, 'traditional-olive-oil.jpg', NOW(), NOW()),

(3, 'Huile d''olive bio certifiée', 'زيت الزيتون العضوي المعتمد', 
'Certified organic olive oil, pesticide and chemical-free', 
'Huile d''olive biologique certifiée, sans pesticides ni produits chimiques', 
'زيت زيتون عضوي معتمد، خالٍ من المبيدات والمواد الكيميائية', 
520.00, true, 1, 'ACTIVE', true, 'organic-olive-oil.jpg', NOW(), NOW()),

-- Honey products (base price is for 1kg)
(4, 'Miel de thym pur', 'عسل الزعتر الخالص', 
'Pure wild thyme honey harvested from the Atlas Mountains', 
'Miel de thym sauvage récolté dans les montagnes de l''Atlas', 
'عسل زعتر بري خالص محصود من جبال الأطلس', 
350.00, true, 2, 'ACTIVE', true, 'moroccan-thyme-honey-in-traditional-glass-jar-with.jpg', NOW(), NOW()),

(5, 'Miel de lavande sauvage', 'عسل الخزامى البري', 
'Wild lavender honey with delicate floral flavor', 
'Miel de lavande sauvage à la saveur florale', 
'عسل خزامى بري بنكهة زهرية رقيقة', 
380.00, true, 2, 'ACTIVE', true, 'wild-lavender-honey-jar-with-lavender-sprigs.jpg', NOW(), NOW()),

(6, 'Miel d''oranger bio', 'عسل البرتقال العضوي', 
'Organic orange blossom honey, delicately perfumed', 
'Miel d''oranger biologique, délicatement parfumé', 
'عسل زهر البرتقال العضوي، معطر بلطف', 
320.00, true, 2, 'ACTIVE', false, 'orange-blossom-honey-jar-with-citrus.jpg', NOW(), NOW()),

(7, 'Miel d''eucalyptus', 'عسل الكالبتوس', 
'Eucalyptus honey with medicinal properties', 
'Miel d''eucalyptus aux propriétés médicinales', 
'عسل الكافور بخصائص طبية', 
420.00, true, 2, 'ACTIVE', false, 'natural-honey-in-traditional-moroccan-glass-jar.jpg', NOW(), NOW()),

(8, 'Miel de romarin', 'عسل إكليل الجبل', 
'Rosemary honey with delicate herbal notes', 
'Miel de romarin aux notes herbacées et délicates', 
'عسل إكليل الجبل بنكهات عشبية رقيقة', 
360.00, true, 2, 'ACTIVE', false, 'rosemary-honey.jpg', NOW(), NOW()),

-- Amlou spreads (Category 3)
(9, 'Amlou royal aux amandes', 'أملو ملكي باللوز', 
'Royal Amlou prepared with roasted almonds and golden argan oil', 
'Amlou royal préparé avec des amandes torréfiées et de l''huile d''argan dorée', 
'أملو ملكي محضر بلوز محمص وزيت أرغان ذهبي', 
420.00, true, 3, 'ACTIVE', true, 'royal-amlou-spread.jpg', NOW(), NOW()),

(10, 'Amlou artisanal au miel de thym', 'أملو بالعسل الزعتر', 
'Artisan recipe combining almonds, argan, and wild thyme honey', 
'Recette artisanale mariant amandes, argan et miel de thym sauvage', 
'وصفة حرفية تجمع بين اللوز والأرغان وعسل الزعتر البري', 
460.00, true, 3, 'ACTIVE', true, 'artisan-amlou-honey.jpg', NOW(), NOW());

-- =====================================================
-- PRODUCT SIZE PRICES
-- Uses ProductSize enum: OIL_5L, OIL_2L, OIL_1L, HONEY_1KG, HONEY_500G, HONEY_250G
-- =====================================================
INSERT IGNORE INTO product_size_prices (product_id, size, price) VALUES
-- Product 1 (Huile Picholine) - Oil sizes
(1, 'OIL_5L', 450.00),
(1, 'OIL_2L', 189.00),
(1, 'OIL_1L', 99.00),

-- Product 2 (Huile traditionnelle) - Oil sizes
(2, 'OIL_5L', 380.00),
(2, 'OIL_2L', 159.60),
(2, 'OIL_1L', 83.60),

-- Product 3 (Huile bio) - Oil sizes
(3, 'OIL_5L', 520.00),
(3, 'OIL_2L', 218.40),
(3, 'OIL_1L', 114.40),

-- Product 4 (Miel de thym) - Honey sizes
(4, 'HONEY_1KG', 350.00),
(4, 'HONEY_500G', 182.00),
(4, 'HONEY_250G', 98.00),

-- Product 5 (Miel de lavande) - Honey sizes
(5, 'HONEY_1KG', 380.00),
(5, 'HONEY_500G', 197.60),
(5, 'HONEY_250G', 106.40),

-- Product 6 (Miel d'oranger) - Honey sizes
(6, 'HONEY_1KG', 320.00),
(6, 'HONEY_500G', 166.40),
(6, 'HONEY_250G', 89.60),

-- Product 7 (Miel d'eucalyptus) - Honey sizes
(7, 'HONEY_1KG', 420.00),
(7, 'HONEY_500G', 218.40),
(7, 'HONEY_250G', 117.60),

-- Product 8 (Miel de romarin) - Honey sizes
(8, 'HONEY_1KG', 360.00),
(8, 'HONEY_500G', 187.20),
(8, 'HONEY_250G', 100.80),

-- Product 9 (Amlou royal) - packaged like honey sizes for convenience
(9, 'HONEY_1KG', 420.00),
(9, 'HONEY_500G', 218.40),
(9, 'HONEY_250G', 117.60),

-- Product 10 (Amlou artisanal) - honey-sized jars
(10, 'HONEY_1KG', 460.00),
(10, 'HONEY_500G', 239.20),
(10, 'HONEY_250G', 128.80);

-- =====================================================
-- CUSTOMERS
-- Uses CustomerStatus enum: NEW, ACTIVE, VIP
-- =====================================================
INSERT IGNORE INTO customers (id, name, email, phone, address, status, total_orders, total_spent, last_order_date, created_at, updated_at) VALUES
(1, 'Ahmed Benali', 'ahmed.benali@email.com', '+212600000001', '123 Rue de la Kasbah, Marrakech 40000', 'ACTIVE', 8, 2845.50, '2025-01-20 14:30:00', '2024-12-01 10:00:00', NOW()),
(2, 'Fatima Tazi', 'fatima.tazi@email.com', '+212600000002', '456 Avenue Mohammed V, Rabat 10000', 'ACTIVE', 5, 1520.80, '2025-01-18 16:20:00', '2024-12-05 11:00:00', NOW()),
(3, 'Youssef Alaoui', 'youssef.alaoui@email.com', '+212600000003', '789 Boulevard Hassan II, Casablanca 20000', 'VIP', 15, 5675.25, '2025-01-22 09:15:00', '2024-11-15 08:00:00', NOW()),
(4, 'Amina Bennani', 'amina.bennani@email.com', '+212600000004', '321 Rue des Souks, Fès 30000', 'NEW', 2, 456.75, '2025-01-15 12:00:00', '2025-01-10 14:00:00', NOW()),
(5, 'Karim El Amrani', 'karim.amrani@email.com', '+212600000005', '654 Place Jemaa el-Fna, Marrakech 40000', 'VIP', 20, 11225.80, '2025-01-23 10:45:00', '2024-10-01 09:00:00', NOW()),
(6, 'Sanae Idrissi', 'sanae.idrissi@email.com', '+212600000006', '987 Rue Zerktouni, Casablanca 20000', 'ACTIVE', 6, 1890.40, '2025-01-19 15:30:00', '2024-12-10 10:30:00', NOW()),
(7, 'Mehdi Bensaid', 'mehdi.bensaid@email.com', '+212600000007', '147 Avenue Allal Ben Abdellah, Rabat 10000', 'NEW', 1, 539.00, '2025-01-17 11:20:00', '2025-01-15 13:00:00', NOW()),
(8, 'Laila Chraibi', 'laila.chraibi@email.com', '+212600000008', '258 Rue Tariq Ibn Ziyad, Tangier 90000', 'ACTIVE', 4, 1245.60, '2025-01-16 13:45:00', '2024-12-20 15:00:00', NOW()),
(9, 'Omar Fassi', 'omar.fassi@email.com', '+212600000009', '369 Boulevard Zerktouni, Casablanca 20000', 'VIP', 12, 4320.90, '2025-01-21 08:30:00', '2024-11-20 11:00:00', NOW()),
(10, 'Nadia El Fassi', 'nadia.elfassi@email.com', '+212600000010', '741 Rue Mohammed V, Agadir 80000', 'ACTIVE', 3, 875.20, '2025-01-14 10:00:00', '2024-12-25 12:00:00', NOW()),
(11, 'Salma Radi', 'salma.radi@email.com', '+212600000011', '52 Rue Ibn Sina, Meknès 50000', 'ACTIVE', 4, 1420.70, '2024-11-10 11:00:00', '2024-09-15 09:00:00', NOW()),
(12, 'Hicham Mouline', 'hicham.mouline@email.com', '+212600000012', '18 Avenue Lalla Meriem, Oujda 60000', 'ACTIVE', 3, 980.30, '2024-10-28 17:20:00', '2024-09-30 10:00:00', NOW());

-- =====================================================
-- ORDERS
-- Order Number Format: CMD001, CMD002, etc.
-- Tracking Code Format: SL-YYMMDD-XXXX (e.g., SL-250125-A3B7)
-- Uses OrderStatus enum: PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED
-- =====================================================
INSERT IGNORE INTO orders (id, customer_id, order_number, tracking_code, status, order_date, shipping_address, total, notes, estimated_delivery_date, created_at, updated_at) VALUES
-- Recent orders (January 2025)
(1, 1, 'CMD001', 'SL-250125-A3B7', 'DELIVERED', '2025-01-15 10:30:00', '123 Rue de la Kasbah, Marrakech 40000', 539.00, 'Please deliver in the morning', '2025-01-18 14:00:00', '2025-01-15 10:30:00', '2025-01-18 14:00:00'),
(2, 2, 'CMD002', 'SL-250118-B4C8', 'SHIPPED', '2025-01-18 14:20:00', '456 Avenue Mohammed V, Rabat 10000', 484.80, NULL, '2025-01-22 10:00:00', '2025-01-18 14:20:00', '2025-01-20 11:30:00'),
(3, 3, 'CMD003', 'SL-250122-C5D9', 'PROCESSING', '2025-01-22 09:15:00', '789 Boulevard Hassan II, Casablanca 20000', 675.00, 'Gift wrapping requested', '2025-01-26 16:00:00', '2025-01-22 09:15:00', '2025-01-22 13:45:00'),
(4, 4, 'CMD004', 'SL-250115-E6F2', 'CONFIRMED', '2025-01-15 12:00:00', '321 Rue des Souks, Fès 30000', 207.20, NULL, '2025-01-20 12:00:00', '2025-01-15 12:00:00', '2025-01-15 12:30:00'),
(5, 5, 'CMD005', 'SL-250123-G7H3', 'OUT_FOR_DELIVERY', '2025-01-23 10:45:00', '654 Place Jemaa el-Fna, Marrakech 40000', 535.60, 'Call before delivery', '2025-01-25 15:30:00', '2025-01-23 10:45:00', '2025-01-24 08:00:00'),
(6, 6, 'CMD006', 'SL-250119-J8K4', 'SHIPPED', '2025-01-19 15:30:00', '987 Rue Zerktouni, Casablanca 20000', 890.40, NULL, '2025-01-23 14:00:00', '2025-01-19 15:30:00', '2025-01-20 10:00:00'),
(7, 7, 'CMD007', 'SL-250117-L9M5', 'PENDING', '2025-01-17 11:20:00', '147 Avenue Allal Ben Abdellah, Rabat 10000', 539.00, NULL, '2025-01-22 12:00:00', '2025-01-17 11:20:00', '2025-01-17 11:20:00'),
(8, 8, 'CMD008', 'SL-250116-N2P6', 'DELIVERED', '2025-01-16 13:45:00', '258 Rue Tariq Ibn Ziyad, Tangier 90000', 1245.60, 'Fragile items', '2025-01-19 16:00:00', '2025-01-16 13:45:00', '2025-01-19 15:30:00'),
(9, 9, 'CMD009', 'SL-250121-Q3R7', 'PROCESSING', '2025-01-21 08:30:00', '369 Boulevard Zerktouni, Casablanca 20000', 432.90, NULL, '2025-01-25 10:00:00', '2025-01-21 08:30:00', '2025-01-21 12:00:00'),
(10, 10, 'CMD010', 'SL-250114-S4T8', 'DELIVERED', '2025-01-14 10:00:00', '741 Rue Mohammed V, Agadir 80000', 875.20, NULL, '2025-01-17 14:00:00', '2025-01-14 10:00:00', '2025-01-17 13:00:00'),

-- Older orders (December 2024)
(11, 1, 'CMD011', 'SL-241220-U5V9', 'DELIVERED', '2024-12-20 14:30:00', '123 Rue de la Kasbah, Marrakech 40000', 728.00, NULL, '2024-12-23 16:00:00', '2024-12-20 14:30:00', '2024-12-23 15:00:00'),
(12, 2, 'CMD012', 'SL-241218-W6X2', 'DELIVERED', '2024-12-18 16:20:00', '456 Avenue Mohammed V, Rabat 10000', 356.40, NULL, '2024-12-21 10:00:00', '2024-12-18 16:20:00', '2024-12-21 09:30:00'),
(13, 3, 'CMD013', 'SL-241215-Y7Z3', 'DELIVERED', '2024-12-15 09:15:00', '789 Boulevard Hassan II, Casablanca 20000', 945.00, NULL, '2024-12-18 14:00:00', '2024-12-15 09:15:00', '2024-12-18 13:00:00'),

-- Cancelled orders (to test error handling)
(14, 4, 'CMD014', 'SL-250110-A1B2', 'CANCELLED', '2025-01-10 11:00:00', '321 Rue des Souks, Fès 30000', 456.75, '[CANCELLED] Reason: Customer request - changed mind', '2025-01-15 12:00:00', '2025-01-10 11:00:00', '2025-01-10 15:30:00'),
(15, 6, 'CMD015', 'SL-250108-C3D4', 'CANCELLED', '2025-01-08 14:20:00', '987 Rue Zerktouni, Casablanca 20000', 320.00, '[CANCELLED] Reason: Wrong address provided', '2025-01-12 10:00:00', '2025-01-08 14:20:00', '2025-01-08 16:00:00'),

-- Refunded order
(16, 8, 'CMD016', 'SL-250105-E5F6', 'REFUNDED', '2025-01-05 10:30:00', '258 Rue Tariq Ibn Ziyad, Tangier 90000', 650.00, '[REFUNDED] Reason: Product damaged during shipping', '2025-01-08 14:00:00', '2025-01-05 10:30:00', '2025-01-07 11:00:00'),

-- More recent orders for testing
(17, 1, 'CMD017', 'SL-250120-G7H8', 'CONFIRMED', '2025-01-20 14:30:00', '123 Rue de la Kasbah, Marrakech 40000', 578.00, NULL, '2025-01-25 15:00:00', '2025-01-20 14:30:00', '2025-01-20 15:00:00'),
(18, 3, 'CMD018', 'SL-250124-J9K1', 'SHIPPED', '2025-01-24 09:00:00', '789 Boulevard Hassan II, Casablanca 20000', 1120.50, 'Express delivery', '2025-01-27 12:00:00', '2025-01-24 09:00:00', '2025-01-24 14:00:00'),
(19, 5, 'CMD019', 'SL-250125-L2M3', 'PENDING', '2025-01-25 11:15:00', '654 Place Jemaa el-Fna, Marrakech 40000', 890.40, NULL, '2025-01-30 16:00:00', '2025-01-25 11:15:00', '2025-01-25 11:15:00'),
(20, 9, 'CMD020', 'SL-250124-N4P5', 'OUT_FOR_DELIVERY', '2025-01-24 16:20:00', '369 Boulevard Zerktouni, Casablanca 20000', 765.30, NULL, '2025-01-26 10:00:00', '2025-01-24 16:20:00', '2025-01-25 08:30:00'),

-- Dormant purchases used by the "at-risk" segment filters
(21, 11, 'CMD021', 'SL-241110-P6Q8', 'DELIVERED', '2024-11-10 11:00:00', '52 Rue Ibn Sina, Meknès 50000', 697.20, 'Dormant customer – last winter gift packs', '2024-11-14 15:00:00', '2024-11-10 11:00:00', '2024-11-14 12:00:00'),
(22, 12, 'CMD022', 'SL-241028-R7S9', 'DELIVERED', '2024-10-28 17:20:00', '18 Avenue Lalla Meriem, Oujda 60000', 593.20, 'Dormant customer – add to reactivation campaign', '2024-11-01 13:00:00', '2024-10-28 17:20:00', '2024-11-01 10:30:00');

-- =====================================================
-- ORDER ITEMS
-- Uses ProductSize enum: OIL_5L, OIL_2L, OIL_1L, HONEY_1KG, HONEY_500G, HONEY_250G
-- =====================================================
INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, size, unit_price, total_price, created_at) VALUES
-- Order 1 (CMD001) - Delivered
(1, 1, 1, 1, 'OIL_2L', 189.00, 189.00, '2025-01-15 10:30:00'),
(2, 1, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-15 10:30:00'),

-- Order 2 (CMD002) - Shipped
(3, 2, 5, 2, 'HONEY_500G', 197.60, 395.20, '2025-01-18 14:20:00'),
(4, 2, 6, 1, 'HONEY_250G', 89.60, 89.60, '2025-01-18 14:20:00'),

-- Order 3 (CMD003) - Processing
(5, 3, 1, 1, 'OIL_1L', 99.00, 99.00, '2025-01-22 09:15:00'),
(6, 3, 7, 1, 'HONEY_1KG', 420.00, 420.00, '2025-01-22 09:15:00'),
(7, 3, 6, 1, 'HONEY_500G', 166.40, 166.40, '2025-01-22 09:15:00'),

-- Order 4 (CMD004) - Confirmed
(8, 4, 6, 1, 'HONEY_250G', 89.60, 89.60, '2025-01-15 12:00:00'),
(9, 4, 7, 1, 'HONEY_250G', 117.60, 117.60, '2025-01-15 12:00:00'),

-- Order 5 (CMD005) - Out for Delivery
(10, 5, 4, 1, 'HONEY_500G', 182.00, 182.00, '2025-01-23 10:45:00'),
(11, 5, 5, 1, 'HONEY_500G', 197.60, 197.60, '2025-01-23 10:45:00'),
(12, 5, 6, 1, 'HONEY_500G', 166.40, 166.40, '2025-01-23 10:45:00'),

-- Order 6 (CMD006) - Shipped
(13, 6, 2, 1, 'OIL_5L', 380.00, 380.00, '2025-01-19 15:30:00'),
(14, 6, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-19 15:30:00'),
(15, 6, 8, 1, 'HONEY_500G', 187.20, 187.20, '2025-01-19 15:30:00'),

-- Order 7 (CMD007) - Pending
(16, 7, 1, 1, 'OIL_2L', 189.00, 189.00, '2025-01-17 11:20:00'),
(17, 7, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-17 11:20:00'),

-- Order 8 (CMD008) - Delivered
(18, 8, 3, 1, 'OIL_5L', 520.00, 520.00, '2025-01-16 13:45:00'),
(19, 8, 4, 2, 'HONEY_1KG', 350.00, 700.00, '2025-01-16 13:45:00'),
(20, 8, 5, 1, 'HONEY_250G', 106.40, 106.40, '2025-01-16 13:45:00'),

-- Order 9 (CMD009) - Processing
(21, 9, 6, 1, 'HONEY_1KG', 320.00, 320.00, '2025-01-21 08:30:00'),
(22, 9, 8, 1, 'HONEY_500G', 187.20, 187.20, '2025-01-21 08:30:00'),

-- Order 10 (CMD010) - Delivered
(23, 10, 1, 1, 'OIL_2L', 189.00, 189.00, '2025-01-14 10:00:00'),
(24, 10, 5, 1, 'HONEY_1KG', 380.00, 380.00, '2025-01-14 10:00:00'),
(25, 10, 7, 1, 'HONEY_500G', 218.40, 218.40, '2025-01-14 10:00:00'),
(26, 10, 8, 1, 'HONEY_250G', 100.80, 100.80, '2025-01-14 10:00:00'),

-- Order 11 (CMD011) - Delivered (December)
(27, 11, 1, 1, 'OIL_5L', 450.00, 450.00, '2024-12-20 14:30:00'),
(28, 11, 4, 1, 'HONEY_500G', 182.00, 182.00, '2024-12-20 14:30:00'),
(29, 11, 8, 1, 'HONEY_500G', 187.20, 187.20, '2024-12-20 14:30:00'),

-- Order 12 (CMD012) - Delivered (December)
(30, 12, 6, 1, 'HONEY_1KG', 320.00, 320.00, '2024-12-18 16:20:00'),
(31, 12, 8, 1, 'HONEY_250G', 100.80, 100.80, '2024-12-18 16:20:00'),

-- Order 13 (CMD013) - Delivered (December)
(32, 13, 2, 1, 'OIL_5L', 380.00, 380.00, '2024-12-15 09:15:00'),
(33, 13, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2024-12-15 09:15:00'),
(34, 13, 5, 1, 'HONEY_500G', 197.60, 197.60, '2024-12-15 09:15:00'),
(35, 13, 7, 1, 'HONEY_250G', 117.60, 117.60, '2024-12-15 09:15:00'),

-- Order 14 (CMD014) - Cancelled
(36, 14, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-10 11:00:00'),
(37, 14, 6, 1, 'HONEY_500G', 166.40, 166.40, '2025-01-10 11:00:00'),

-- Order 15 (CMD015) - Cancelled
(38, 15, 6, 1, 'HONEY_1KG', 320.00, 320.00, '2025-01-08 14:20:00'),

-- Order 16 (CMD016) - Refunded
(39, 16, 1, 1, 'OIL_2L', 189.00, 189.00, '2025-01-05 10:30:00'),
(40, 16, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-05 10:30:00'),
(41, 16, 5, 1, 'HONEY_500G', 197.60, 197.60, '2025-01-05 10:30:00'),

-- Order 17 (CMD017) - Confirmed
(42, 17, 1, 1, 'OIL_2L', 189.00, 189.00, '2025-01-20 14:30:00'),
(43, 17, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-20 14:30:00'),
(44, 17, 8, 1, 'HONEY_250G', 100.80, 100.80, '2025-01-20 14:30:00'),

-- Order 18 (CMD018) - Shipped
(45, 18, 3, 1, 'OIL_5L', 520.00, 520.00, '2025-01-24 09:00:00'),
(46, 18, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-24 09:00:00'),
(47, 18, 5, 1, 'HONEY_500G', 197.60, 197.60, '2025-01-24 09:00:00'),
(48, 18, 7, 1, 'HONEY_250G', 117.60, 117.60, '2025-01-24 09:00:00'),

-- Order 19 (CMD019) - Pending
(49, 19, 2, 1, 'OIL_5L', 380.00, 380.00, '2025-01-25 11:15:00'),
(50, 19, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2025-01-25 11:15:00'),
(51, 19, 8, 1, 'HONEY_500G', 187.20, 187.20, '2025-01-25 11:15:00'),

-- Order 20 (CMD020) - Out for Delivery
(52, 20, 1, 1, 'OIL_2L', 189.00, 189.00, '2025-01-24 16:20:00'),
(53, 20, 5, 1, 'HONEY_1KG', 380.00, 380.00, '2025-01-24 16:20:00'),
(54, 20, 6, 1, 'HONEY_500G', 166.40, 166.40, '2025-01-24 16:20:00'),
(55, 20, 8, 1, 'HONEY_250G', 100.80, 100.80, '2025-01-24 16:20:00'),

-- Order 21 (CMD021) - Delivered (dormant customer Salma Radi)
(56, 21, 9, 1, 'HONEY_500G', 218.40, 218.40, '2024-11-10 11:00:00'),
(57, 21, 10, 1, 'HONEY_250G', 128.80, 128.80, '2024-11-10 11:00:00'),
(58, 21, 4, 1, 'HONEY_1KG', 350.00, 350.00, '2024-11-10 11:00:00'),

-- Order 22 (CMD022) - Delivered (dormant customer Hicham Mouline)
(59, 22, 9, 1, 'HONEY_1KG', 420.00, 420.00, '2024-10-28 17:20:00'),
(60, 22, 2, 1, 'OIL_1L', 83.60, 83.60, '2024-10-28 17:20:00'),
(61, 22, 6, 1, 'HONEY_250G', 89.60, 89.60, '2024-10-28 17:20:00');

-- =====================================================
-- ORDER TRACKING
-- Uses TrackingStatus enum: ORDER_PLACED, CONFIRMED, PROCESSING, PACKED, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, DELIVERY_ATTEMPTED, CANCELLED, RETURNED
-- =====================================================
INSERT IGNORE INTO order_tracking (id, order_id, status, location, carrier, notes, status_date, created_at) VALUES
-- Order 1 (CMD001) - Delivered - Complete tracking history
(1, 1, 'ORDER_PLACED', 'Marrakech Warehouse', 'Internal', 'Order placed successfully', '2025-01-15 10:30:00', '2025-01-15 10:30:00'),
(2, 1, 'CONFIRMED', 'Marrakech Warehouse', 'Internal', 'Order received and confirmed', '2025-01-15 10:35:00', '2025-01-15 10:35:00'),
(3, 1, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order being prepared', '2025-01-15 14:00:00', '2025-01-15 14:00:00'),
(4, 1, 'PACKED', 'Marrakech Warehouse', 'Internal', 'Order packed and ready for shipping', '2025-01-15 16:30:00', '2025-01-15 16:30:00'),
(5, 1, 'SHIPPED', 'Marrakech Post Office', 'Poste Maroc', 'Order shipped via local courier', '2025-01-16 09:00:00', '2025-01-16 09:00:00'),
(6, 1, 'IN_TRANSIT', 'Marrakech Distribution Center', 'Poste Maroc', 'Order in transit to delivery address', '2025-01-16 14:30:00', '2025-01-16 14:30:00'),
(7, 1, 'OUT_FOR_DELIVERY', 'Marrakech Local Office', 'Poste Maroc', 'Out for delivery to customer', '2025-01-18 08:00:00', '2025-01-18 08:00:00'),
(8, 1, 'DELIVERED', 'Customer Address', 'Poste Maroc', 'Order delivered successfully', '2025-01-18 14:00:00', '2025-01-18 14:00:00'),

-- Order 2 (CMD002) - Shipped
(9, 2, 'ORDER_PLACED', 'Rabat Warehouse', 'Internal', 'Order placed successfully', '2025-01-18 14:20:00', '2025-01-18 14:20:00'),
(10, 2, 'CONFIRMED', 'Rabat Warehouse', 'Internal', 'Order confirmed', '2025-01-18 14:25:00', '2025-01-18 14:25:00'),
(11, 2, 'PROCESSING', 'Rabat Warehouse', 'Internal', 'Preparing order for shipment', '2025-01-18 16:00:00', '2025-01-18 16:00:00'),
(12, 2, 'PACKED', 'Rabat Warehouse', 'Internal', 'Order packed', '2025-01-19 10:00:00', '2025-01-19 10:00:00'),
(13, 2, 'SHIPPED', 'Rabat Central Post', 'ARAMEX', 'Order dispatched to customer', '2025-01-20 11:30:00', '2025-01-20 11:30:00'),
(14, 2, 'IN_TRANSIT', 'Rabat Distribution Center', 'ARAMEX', 'In transit to delivery address', '2025-01-20 15:00:00', '2025-01-20 15:00:00'),

-- Order 3 (CMD003) - Processing
(15, 3, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2025-01-22 09:15:00', '2025-01-22 09:15:00'),
(16, 3, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-01-22 09:20:00', '2025-01-22 09:20:00'),
(17, 3, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2025-01-22 13:45:00', '2025-01-22 13:45:00'),

-- Order 4 (CMD004) - Confirmed
(18, 4, 'ORDER_PLACED', 'Fès Warehouse', 'Internal', 'Order placed successfully', '2025-01-15 12:00:00', '2025-01-15 12:00:00'),
(19, 4, 'CONFIRMED', 'Fès Warehouse', 'Internal', 'Order confirmed', '2025-01-15 12:30:00', '2025-01-15 12:30:00'),

-- Order 5 (CMD005) - Out for Delivery
(20, 5, 'ORDER_PLACED', 'Marrakech Warehouse', 'Internal', 'Order placed successfully', '2025-01-23 10:45:00', '2025-01-23 10:45:00'),
(21, 5, 'CONFIRMED', 'Marrakech Warehouse', 'Internal', 'Order confirmed', '2025-01-23 10:50:00', '2025-01-23 10:50:00'),
(22, 5, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order being prepared', '2025-01-23 14:00:00', '2025-01-23 14:00:00'),
(23, 5, 'PACKED', 'Marrakech Warehouse', 'Internal', 'Order packed', '2025-01-23 16:00:00', '2025-01-23 16:00:00'),
(24, 5, 'SHIPPED', 'Marrakech Post Office', 'DHL Maroc', 'Order shipped', '2025-01-24 08:00:00', '2025-01-24 08:00:00'),
(25, 5, 'IN_TRANSIT', 'Marrakech Distribution Center', 'DHL Maroc', 'In transit', '2025-01-24 10:00:00', '2025-01-24 10:00:00'),
(26, 5, 'OUT_FOR_DELIVERY', 'Marrakech Local Office', 'DHL Maroc', 'Out for delivery', '2025-01-24 14:00:00', '2025-01-24 14:00:00'),

-- Order 6 (CMD006) - Shipped
(27, 6, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2025-01-19 15:30:00', '2025-01-19 15:30:00'),
(28, 6, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-01-19 15:35:00', '2025-01-19 15:35:00'),
(29, 6, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2025-01-19 17:00:00', '2025-01-19 17:00:00'),
(30, 6, 'PACKED', 'Casablanca Warehouse', 'Internal', 'Order packed', '2025-01-20 09:00:00', '2025-01-20 09:00:00'),
(31, 6, 'SHIPPED', 'Casablanca Central Post', 'ARAMEX', 'Order shipped', '2025-01-20 10:00:00', '2025-01-20 10:00:00'),
(32, 6, 'IN_TRANSIT', 'Casablanca Distribution Center', 'ARAMEX', 'In transit', '2025-01-20 14:00:00', '2025-01-20 14:00:00'),

-- Order 7 (CMD007) - Pending
(33, 7, 'ORDER_PLACED', 'Rabat Warehouse', 'Internal', 'Order placed successfully', '2025-01-17 11:20:00', '2025-01-17 11:20:00'),

-- Order 8 (CMD008) - Delivered
(34, 8, 'ORDER_PLACED', 'Tangier Warehouse', 'Internal', 'Order placed successfully', '2025-01-16 13:45:00', '2025-01-16 13:45:00'),
(35, 8, 'CONFIRMED', 'Tangier Warehouse', 'Internal', 'Order confirmed', '2025-01-16 13:50:00', '2025-01-16 13:50:00'),
(36, 8, 'PROCESSING', 'Tangier Warehouse', 'Internal', 'Order being prepared', '2025-01-16 16:00:00', '2025-01-16 16:00:00'),
(37, 8, 'PACKED', 'Tangier Warehouse', 'Internal', 'Order packed', '2025-01-17 10:00:00', '2025-01-17 10:00:00'),
(38, 8, 'SHIPPED', 'Tangier Post Office', 'Poste Maroc', 'Order shipped', '2025-01-17 14:00:00', '2025-01-17 14:00:00'),
(39, 8, 'IN_TRANSIT', 'Tangier Distribution Center', 'Poste Maroc', 'In transit', '2025-01-18 09:00:00', '2025-01-18 09:00:00'),
(40, 8, 'OUT_FOR_DELIVERY', 'Tangier Local Office', 'Poste Maroc', 'Out for delivery', '2025-01-19 08:00:00', '2025-01-19 08:00:00'),
(41, 8, 'DELIVERED', 'Customer Address', 'Poste Maroc', 'Delivered to customer', '2025-01-19 15:30:00', '2025-01-19 15:30:00'),

-- Order 9 (CMD009) - Processing
(42, 9, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2025-01-21 08:30:00', '2025-01-21 08:30:00'),
(43, 9, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-01-21 08:35:00', '2025-01-21 08:35:00'),
(44, 9, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2025-01-21 12:00:00', '2025-01-21 12:00:00'),

-- Order 10 (CMD010) - Delivered
(45, 10, 'ORDER_PLACED', 'Agadir Warehouse', 'Internal', 'Order placed successfully', '2025-01-14 10:00:00', '2025-01-14 10:00:00'),
(46, 10, 'CONFIRMED', 'Agadir Warehouse', 'Internal', 'Order confirmed', '2025-01-14 10:05:00', '2025-01-14 10:05:00'),
(47, 10, 'PROCESSING', 'Agadir Warehouse', 'Internal', 'Order being prepared', '2025-01-14 13:00:00', '2025-01-14 13:00:00'),
(48, 10, 'PACKED', 'Agadir Warehouse', 'Internal', 'Order packed', '2025-01-14 16:00:00', '2025-01-14 16:00:00'),
(49, 10, 'SHIPPED', 'Agadir Post Office', 'DHL Maroc', 'Order shipped', '2025-01-15 09:00:00', '2025-01-15 09:00:00'),
(50, 10, 'IN_TRANSIT', 'Agadir Distribution Center', 'DHL Maroc', 'In transit', '2025-01-15 14:00:00', '2025-01-15 14:00:00'),
(51, 10, 'OUT_FOR_DELIVERY', 'Agadir Local Office', 'DHL Maroc', 'Out for delivery', '2025-01-17 08:00:00', '2025-01-17 08:00:00'),
(52, 10, 'DELIVERED', 'Customer Address', 'DHL Maroc', 'Delivered to customer', '2025-01-17 13:00:00', '2025-01-17 13:00:00'),

-- Order 11 (CMD011) - Delivered (December)
(53, 11, 'ORDER_PLACED', 'Marrakech Warehouse', 'Internal', 'Order placed successfully', '2024-12-20 14:30:00', '2024-12-20 14:30:00'),
(54, 11, 'CONFIRMED', 'Marrakech Warehouse', 'Internal', 'Order confirmed', '2024-12-20 14:35:00', '2024-12-20 14:35:00'),
(55, 11, 'PROCESSING', 'Marrakech Warehouse', 'Internal', 'Order being prepared', '2024-12-20 16:00:00', '2024-12-20 16:00:00'),
(56, 11, 'PACKED', 'Marrakech Warehouse', 'Internal', 'Order packed', '2024-12-21 10:00:00', '2024-12-21 10:00:00'),
(57, 11, 'SHIPPED', 'Marrakech Post Office', 'Poste Maroc', 'Order shipped', '2024-12-21 14:00:00', '2024-12-21 14:00:00'),
(58, 11, 'IN_TRANSIT', 'Marrakech Distribution Center', 'Poste Maroc', 'In transit', '2024-12-22 09:00:00', '2024-12-22 09:00:00'),
(59, 11, 'OUT_FOR_DELIVERY', 'Marrakech Local Office', 'Poste Maroc', 'Out for delivery', '2024-12-23 08:00:00', '2024-12-23 08:00:00'),
(60, 11, 'DELIVERED', 'Customer Address', 'Poste Maroc', 'Delivered to customer', '2024-12-23 15:00:00', '2024-12-23 15:00:00'),

-- Order 12 (CMD012) - Delivered (December)
(61, 12, 'ORDER_PLACED', 'Rabat Warehouse', 'Internal', 'Order placed successfully', '2024-12-18 16:20:00', '2024-12-18 16:20:00'),
(62, 12, 'CONFIRMED', 'Rabat Warehouse', 'Internal', 'Order confirmed', '2024-12-18 16:25:00', '2024-12-18 16:25:00'),
(63, 12, 'PROCESSING', 'Rabat Warehouse', 'Internal', 'Order being prepared', '2024-12-19 09:00:00', '2024-12-19 09:00:00'),
(64, 12, 'PACKED', 'Rabat Warehouse', 'Internal', 'Order packed', '2024-12-19 14:00:00', '2024-12-19 14:00:00'),
(65, 12, 'SHIPPED', 'Rabat Central Post', 'ARAMEX', 'Order shipped', '2024-12-20 10:00:00', '2024-12-20 10:00:00'),
(66, 12, 'IN_TRANSIT', 'Rabat Distribution Center', 'ARAMEX', 'In transit', '2024-12-20 14:00:00', '2024-12-20 14:00:00'),
(67, 12, 'OUT_FOR_DELIVERY', 'Rabat Local Office', 'ARAMEX', 'Out for delivery', '2024-12-21 08:00:00', '2024-12-21 08:00:00'),
(68, 12, 'DELIVERED', 'Customer Address', 'ARAMEX', 'Delivered to customer', '2024-12-21 09:30:00', '2024-12-21 09:30:00'),

-- Order 13 (CMD013) - Delivered (December)
(69, 13, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2024-12-15 09:15:00', '2024-12-15 09:15:00'),
(70, 13, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2024-12-15 09:20:00', '2024-12-15 09:20:00'),
(71, 13, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2024-12-15 13:00:00', '2024-12-15 13:00:00'),
(72, 13, 'PACKED', 'Casablanca Warehouse', 'Internal', 'Order packed', '2024-12-16 10:00:00', '2024-12-16 10:00:00'),
(73, 13, 'SHIPPED', 'Casablanca Central Post', 'DHL Maroc', 'Order shipped', '2024-12-16 14:00:00', '2024-12-16 14:00:00'),
(74, 13, 'IN_TRANSIT', 'Casablanca Distribution Center', 'DHL Maroc', 'In transit', '2024-12-17 09:00:00', '2024-12-17 09:00:00'),
(75, 13, 'OUT_FOR_DELIVERY', 'Casablanca Local Office', 'DHL Maroc', 'Out for delivery', '2024-12-18 08:00:00', '2024-12-18 08:00:00'),
(76, 13, 'DELIVERED', 'Customer Address', 'DHL Maroc', 'Delivered to customer', '2024-12-18 13:00:00', '2024-12-18 13:00:00'),

-- Order 14 (CMD014) - Cancelled
(77, 14, 'ORDER_PLACED', 'Fès Warehouse', 'Internal', 'Order placed successfully', '2025-01-10 11:00:00', '2025-01-10 11:00:00'),
(78, 14, 'CONFIRMED', 'Fès Warehouse', 'Internal', 'Order confirmed', '2025-01-10 11:05:00', '2025-01-10 11:05:00'),
(79, 14, 'CANCELLED', 'Fès Warehouse', 'Internal', 'Order cancelled by customer', '2025-01-10 15:30:00', '2025-01-10 15:30:00'),

-- Order 15 (CMD015) - Cancelled
(80, 15, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2025-01-08 14:20:00', '2025-01-08 14:20:00'),
(81, 15, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-01-08 14:25:00', '2025-01-08 14:25:00'),
(82, 15, 'CANCELLED', 'Casablanca Warehouse', 'Internal', 'Order cancelled - wrong address', '2025-01-08 16:00:00', '2025-01-08 16:00:00'),

-- Order 16 (CMD016) - Refunded
(83, 16, 'ORDER_PLACED', 'Tangier Warehouse', 'Internal', 'Order placed successfully', '2025-01-05 10:30:00', '2025-01-05 10:30:00'),
(84, 16, 'CONFIRMED', 'Tangier Warehouse', 'Internal', 'Order confirmed', '2025-01-05 10:35:00', '2025-01-05 10:35:00'),
(85, 16, 'PROCESSING', 'Tangier Warehouse', 'Internal', 'Order being prepared', '2025-01-05 14:00:00', '2025-01-05 14:00:00'),
(86, 16, 'PACKED', 'Tangier Warehouse', 'Internal', 'Order packed', '2025-01-06 10:00:00', '2025-01-06 10:00:00'),
(87, 16, 'SHIPPED', 'Tangier Post Office', 'Poste Maroc', 'Order shipped', '2025-01-06 14:00:00', '2025-01-06 14:00:00'),
(88, 16, 'IN_TRANSIT', 'Tangier Distribution Center', 'Poste Maroc', 'In transit', '2025-01-07 09:00:00', '2025-01-07 09:00:00'),
(89, 16, 'DELIVERY_ATTEMPTED', 'Customer Address', 'Poste Maroc', 'Delivery attempted - product damaged', '2025-01-07 11:00:00', '2025-01-07 11:00:00'),
(90, 16, 'RETURNED', 'Tangier Warehouse', 'Poste Maroc', 'Order returned due to damage', '2025-01-07 14:00:00', '2025-01-07 14:00:00'),

-- Order 17 (CMD017) - Confirmed
(91, 17, 'ORDER_PLACED', 'Marrakech Warehouse', 'Internal', 'Order placed successfully', '2025-01-20 14:30:00', '2025-01-20 14:30:00'),
(92, 17, 'CONFIRMED', 'Marrakech Warehouse', 'Internal', 'Order confirmed', '2025-01-20 15:00:00', '2025-01-20 15:00:00'),

-- Order 18 (CMD018) - Shipped
(93, 18, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2025-01-24 09:00:00', '2025-01-24 09:00:00'),
(94, 18, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-01-24 09:05:00', '2025-01-24 09:05:00'),
(95, 18, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2025-01-24 11:00:00', '2025-01-24 11:00:00'),
(96, 18, 'PACKED', 'Casablanca Warehouse', 'Internal', 'Order packed', '2025-01-24 13:00:00', '2025-01-24 13:00:00'),
(97, 18, 'SHIPPED', 'Casablanca Central Post', 'DHL Maroc', 'Order shipped - express delivery', '2025-01-24 14:00:00', '2025-01-24 14:00:00'),
(98, 18, 'IN_TRANSIT', 'Casablanca Distribution Center', 'DHL Maroc', 'In transit', '2025-01-24 16:00:00', '2025-01-24 16:00:00'),

-- Order 19 (CMD019) - Pending
(99, 19, 'ORDER_PLACED', 'Marrakech Warehouse', 'Internal', 'Order placed successfully', '2025-01-25 11:15:00', '2025-01-25 11:15:00'),

-- Order 20 (CMD020) - Out for Delivery
(100, 20, 'ORDER_PLACED', 'Casablanca Warehouse', 'Internal', 'Order placed successfully', '2025-01-24 16:20:00', '2025-01-24 16:20:00'),
(101, 20, 'CONFIRMED', 'Casablanca Warehouse', 'Internal', 'Order confirmed', '2025-01-24 16:25:00', '2025-01-24 16:25:00'),
(102, 20, 'PROCESSING', 'Casablanca Warehouse', 'Internal', 'Order being prepared', '2025-01-24 18:00:00', '2025-01-24 18:00:00'),
(103, 20, 'PACKED', 'Casablanca Warehouse', 'Internal', 'Order packed', '2025-01-25 08:00:00', '2025-01-25 08:00:00'),
(104, 20, 'SHIPPED', 'Casablanca Central Post', 'ARAMEX', 'Order shipped', '2025-01-25 09:00:00', '2025-01-25 09:00:00'),
(105, 20, 'IN_TRANSIT', 'Casablanca Distribution Center', 'ARAMEX', 'In transit', '2025-01-25 11:00:00', '2025-01-25 11:00:00'),
(106, 20, 'OUT_FOR_DELIVERY', 'Casablanca Local Office', 'ARAMEX', 'Out for delivery', '2025-01-25 14:00:00', '2025-01-25 14:00:00'),

-- Order 21 (CMD021) - Delivered (historical)
(107, 21, 'ORDER_PLACED', 'Meknès Warehouse', 'Internal', 'Order placed successfully', '2024-11-10 11:00:00', '2024-11-10 11:00:00'),
(108, 21, 'CONFIRMED', 'Meknès Warehouse', 'Internal', 'Order confirmed for holiday gift set', '2024-11-10 11:10:00', '2024-11-10 11:10:00'),
(109, 21, 'DELIVERED', 'Customer Address', 'Poste Maroc', 'Delivered and signed by client', '2024-11-14 12:00:00', '2024-11-14 12:00:00'),

-- Order 22 (CMD022) - Delivered (historical)
(110, 22, 'ORDER_PLACED', 'Oujda Warehouse', 'Internal', 'Order placed successfully', '2024-10-28 17:20:00', '2024-10-28 17:20:00'),
(111, 22, 'CONFIRMED', 'Oujda Warehouse', 'Internal', 'Order confirmed – regional delivery', '2024-10-28 17:35:00', '2024-10-28 17:35:00'),
(112, 22, 'DELIVERED', 'Customer Address', 'Poste Maroc', 'Delivered within SLA', '2024-11-01 10:30:00', '2024-11-01 10:30:00');

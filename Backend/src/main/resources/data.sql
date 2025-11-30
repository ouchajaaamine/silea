-- Barakah Store Initial Data
-- This file contains sample data for the Moroccan e-commerce platform

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES
('admin@barakahstore.ma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Barakah', 'ADMIN', NOW(), NOW());

-- Insert categories (bilingual: French/Arabic)
INSERT INTO categories (name, name_ar, description, is_active, created_at, updated_at) VALUES
('Huiles d''olive', 'زيوت الزيتون', 'Huiles d''olive extra vierge traditionnelles marocaines', true, NOW(), NOW()),
('Miels', 'العسل', 'Miels naturels du Maroc', true, NOW(), NOW()),
('Épices', 'التوابل', 'Épices et mélanges traditionnels marocains', true, NOW(), NOW()),
('Fruits secs', 'الفواكه المجففة', 'Amandes, noix et fruits secs marocains', true, NOW(), NOW()),
('Thés et infusions', 'الشاي والمنقوعات', 'Thés verts et infusions traditionnelles', true, NOW(), NOW()),
('Cosmétiques naturels', 'مستحضرات التجميل الطبيعية', 'Produits de beauté naturels à base d''huile d''argan', true, NOW(), NOW());

-- Insert products
INSERT INTO products (name, name_ar, description, price, stock, category_id, status, featured, image_url, created_at, updated_at) VALUES
-- Huiles d'olive
('Huile d''olive extra vierge - Picholine', 'زيت زيتون بيشولين ممتاز', 'Huile d''olive extra vierge de Picholine, récoltée à la main dans les oliveraies traditionnelles du Maroc', 45.00, 150, 1, 'ACTIVE', true, 'premium-moroccan-olive-oil-bottle-with-traditional.jpg', NOW(), NOW()),
('Huile d''olive vierge - Arbequina', 'زيت زيتون أربيكينا', 'Huile d''olive vierge Arbequina, douce et fruitée, parfaite pour les salades', 38.00, 200, 1, 'ACTIVE', false, 'olive-oil-bottle.png', NOW(), NOW()),
('Huile d''olive Beldi traditionnelle', 'زيت زيتون بلدي تقليدي', 'Huile d''olive traditionnelle marocaine, pressée à froid selon les méthodes ancestrales', 52.00, 100, 1, 'ACTIVE', true, 'traditional-moroccan-olive-oil-bottle-with-traditional.jpg', NOW(), NOW()),

-- Miels
('Miel de thym pur', 'عسل الزعتر الخالص', 'Miel de thym sauvage récolté dans les montagnes de l''Atlas, certifié bio', 35.00, 80, 2, 'ACTIVE', true, 'moroccan-thyme-honey-in-traditional-glass-jar-with.jpg', NOW(), NOW()),
('Miel d''eucalyptus', 'عسل الكالبتوس', 'Miel d''eucalyptus aux propriétés médicinales, récolté dans les forêts du nord du Maroc', 42.00, 60, 2, 'ACTIVE', false, 'natural-honey-in-traditional-moroccan-glass-jar.jpg', NOW(), NOW()),
('Miel multifloral', 'عسل متعدد الأزهار', 'Miel multifloral des plaines marocaines, riche en saveurs variées', 28.00, 120, 2, 'ACTIVE', false, 'moroccan-multifloral-honey-in-traditional-pot.jpg', NOW(), NOW()),

-- Épices
('Ras el hanout traditionnel', 'راس الحانوت التقليدي', 'Mélange d''épices traditionnel marocain, 27 épices sélectionnées à la main', 18.00, 200, 3, 'ACTIVE', true, 'traditional-moroccan-spice-blend-in-clay-bowl.jpg', NOW(), NOW()),
('Zaatar libanais', 'زعتر لبناني', 'Mélange zaatar traditionnel avec thym, sésame et sumac', 15.00, 150, 3, 'ACTIVE', false, 'premium-zaatar-spice-blend-in-traditional-moroccan.jpg', NOW(), NOW()),
('Paprika doux marocain', 'فلفل حلو مغربي', 'Paprika doux cultivé dans les vallées du Maroc, séché naturellement', 12.00, 180, 3, 'ACTIVE', false, 'moroccan-paprika-spice-in-traditional-clay-pot.jpg', NOW(), NOW()),

-- Fruits secs
('Amandes grillées au miel', 'لوز محمص بالعسل', 'Amandes marocaines grillées au miel, croustillantes et savoureuses', 25.00, 300, 4, 'ACTIVE', true, 'moroccan-grilled-almonds-with-honey.jpg', NOW(), NOW()),
('Noix de Grenoble bio', 'جوز الطيب العضوي', 'Noix de Grenoble cultivées biologiquement dans les montagnes de l''Atlas', 32.00, 120, 4, 'ACTIVE', false, 'organic-walnuts-from-atlas-mountains.jpg', NOW(), NOW()),
('Figues sèches premium', 'تين مجفف فاخر', 'Figues sèches de qualité supérieure, naturellement sucrées', 22.00, 250, 4, 'ACTIVE', false, 'premium-dried-figs-from-morocco.jpg', NOW(), NOW()),

-- Thés et infusions
('Thé vert Gunpowder', 'شاي أخضر جانبودر', 'Thé vert Gunpowder traditionnel marocain, roulé à la main', 16.00, 100, 5, 'ACTIVE', false, 'moroccan-gunpowder-green-tea.jpg', NOW(), NOW()),
('Infusion de menthe poivrée', 'نقع النعناع الفلفلي', 'Feuilles de menthe poivrée fraîche du Maroc, parfaite pour le thé traditionnel', 14.00, 150, 5, 'ACTIVE', true, 'fresh-moroccan-mint-leaves.jpg', NOW(), NOW()),
('Mélange detox ayurvédique', 'خليط التنقية الأيروفيدي', 'Mélange d''herbes marocaines pour une infusion detoxifiante', 19.00, 80, 5, 'ACTIVE', false, 'moroccan-detox-herbal-tea-blend.jpg', NOW(), NOW()),

-- Cosmétiques naturels
('Huile d''argan pure', 'زيت الأركان الخالص', 'Huile d''argan pure extraite des noix d''arganier, 100% naturelle', 85.00, 50, 6, 'ACTIVE', true, 'pure-argan-oil-in-traditional-bottle.jpg', NOW(), NOW()),
('Crème visage à l''argan', 'كريم الوجه بالأركان', 'Crème hydratante pour le visage à base d''huile d''argan et d''ingrédients naturels', 65.00, 75, 6, 'ACTIVE', false, 'argan-oil-face-cream.jpg', NOW(), NOW()),
('Sérum cheveux à l''argan', 'سيروم الشعر بالأركان', 'Sérum nourrissant pour cheveux secs et abîmés à base d''huile d''argan', 55.00, 60, 6, 'ACTIVE', false, 'argan-oil-hair-serum.jpg', NOW(), NOW());

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
(2, 'ORD-2025002', 'SHIPPED', '2025-09-16 14:20:00', '456 Avenue Mohammed V, Rabat', 79.00, '2025-09-20 10:00:00', NOW(), NOW()),
(3, 'ORD-2025003', 'PROCESSING', '2025-09-17 09:15:00', '789 Boulevard Hassan II, Casablanca', 95.00, '2025-09-22 16:00:00', NOW(), NOW()),
(4, 'ORD-2025004', 'PENDING', '2025-09-18 16:45:00', '321 Rue des Souks, Fès', 30.00, '2025-09-23 12:00:00', NOW(), NOW()),
(5, 'ORD-2025005', 'DELIVERED', '2025-09-14 11:00:00', '654 Place Jemaa el-Fna, Marrakech', 165.00, '2025-09-17 15:30:00', NOW(), NOW());

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at) VALUES
-- Order 1 items
(1, 1, 2, 45.00, 90.00, NOW()), -- 2 bottles of olive oil
(1, 4, 1, 35.00, 35.00, NOW()), -- 1 jar of thyme honey

-- Order 2 items
(2, 7, 3, 18.00, 54.00, NOW()), -- 3 packs of ras el hanout
(2, 10, 1, 25.00, 25.00, NOW()), -- 1 pack of almonds

-- Order 3 items
(3, 2, 1, 38.00, 38.00, NOW()), -- 1 bottle of arbequina oil
(3, 5, 1, 42.00, 42.00, NOW()), -- 1 jar of eucalyptus honey
(3, 8, 1, 15.00, 15.00, NOW()), -- 1 pack of zaatar

-- Order 4 items
(4, 13, 1, 16.00, 16.00, NOW()), -- 1 pack of gunpowder tea
(4, 14, 1, 14.00, 14.00, NOW()), -- 1 pack of mint leaves

-- Order 5 items
(5, 16, 1, 85.00, 85.00, NOW()), -- 1 bottle of pure argan oil
(5, 3, 1, 52.00, 52.00, NOW()), -- 1 bottle of beldi olive oil
(5, 6, 1, 28.00, 28.00, NOW()); -- 1 jar of multifloral honey

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
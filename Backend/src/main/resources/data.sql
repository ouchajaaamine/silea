-- =====================================================
-- SILEA E-COMMERCE · PRODUCTION DATASET
-- Purpose: Initial production data for Silea online store
-- Last Update: December 17, 2025
-- =====================================================

-- =====================================================
-- USERS (Admin account)
-- Email: ouchajaaamine@gmail.com
-- Password: Silea@25@ (BCrypt encoded)
-- =====================================================
INSERT IGNORE INTO users (id, email, password, name, role, created_at, updated_at) VALUES
(1, 'ouchajaaamine@gmail.com', '$2a$12$PCiwOOr0CZefYgtYCPCOp.c1L8iGBRoL3G1da8AqKPWyeB2//VpNe', 'Amine Ouchajaa', 'ADMIN', NOW(), NOW());

-- =====================================================
-- CATEGORIES (Bilingual: French/Arabic)
-- =====================================================
INSERT IGNORE INTO categories (id, name, name_ar, description, slug, image_url, is_active, created_at, updated_at) VALUES
(1, 'Huiles d''olive', 'زيوت الزيتون', 'Huiles d''olive extra vierge de qualité supérieure provenant des arbres Hawziya', 'huiles-olive', '/images/categories/olive-oil.jpg', true, NOW(), NOW()),
(2, 'Miels', 'العسل', 'Miels naturels et purs du Maroc', 'miels', '/images/categories/honey.jpg', true, NOW(), NOW());

-- =====================================================
-- PRODUCTS - HUILES D'OLIVE
-- =====================================================
INSERT IGNORE INTO products (id, name, name_ar, description, description_fr, description_ar, price, available, category_id, status, image_url, featured, created_at, updated_at) VALUES
(1, 'Zayt Zaytoun Premium', 'زيت الزيتون الممتاز', 
'Premium extra virgin olive oil from the finest Hawziya trees, cold-pressed to preserve all natural nutrients and authentic flavor', 
'Huile d''olive extra vierge premium issue des meilleurs arbres Hawziya, pressée à froid pour préserver tous les nutriments naturels et le goût authentique', 
'زيت زيتون بكر ممتاز من أفضل أشجار الحوزية، معصور على البارد للحفاظ على جميع العناصر الغذائية الطبيعية والنكهة الأصيلة', 
85.00, true, 1, 'ACTIVE', '/images/products/zayt-zaytoun.jpg', true, NOW(), NOW());

-- Product sizes for Zayt Zaytoun (Olive Oil)
INSERT IGNORE INTO product_size_prices (product_id, size, price) VALUES
(1, 'OIL_1L', 85.00),
(1, 'OIL_2L', 160.00),
(1, 'OIL_5L', 300.00);

-- =====================================================
-- PRODUCTS - MIELS (5 TYPES)
-- =====================================================
INSERT IGNORE INTO products (id, name, name_ar, description, description_fr, description_ar, price, available, category_id, status, image_url, featured, created_at, updated_at) VALUES
(2, 'Miel de Jujubier (Sidr)', 'عسل السدر', 
'Pure Sidr honey from wild jujube trees, renowned for its therapeutic properties and rich, distinctive flavor', 
'Miel de jujubier pur provenant d''arbres sauvages, réputé pour ses propriétés thérapeutiques et sa saveur riche et distinctive', 
'عسل السدر النقي من أشجار النبق البرية، مشهور بخصائصه العلاجية ونكهته الغنية والمميزة', 
180.00, true, 2, 'ACTIVE', '/images/products/miel-sidr.jpg', true, NOW(), NOW()),

(3, 'Miel d''Herbes', 'عسل الأعشاب', 
'Natural multi-flower herbal honey collected from wild mountain herbs, perfect for daily wellness', 
'Miel d''herbes naturel multifloral récolté dans les herbes sauvages de montagne, parfait pour le bien-être quotidien', 
'عسل الأعشاب الطبيعي متعدد الأزهار المحصود من الأعشاب الجبلية البرية، مثالي للصحة اليومية', 
120.00, true, 2, 'ACTIVE', '/images/products/miel-herbes.jpg', true, NOW(), NOW()),

(4, 'Miel de Caroube', 'عسل الخروب', 
'Authentic carob honey with a unique dark color and deep, earthy flavor, rich in antioxidants', 
'Miel de caroube authentique avec une couleur sombre unique et une saveur profonde et terreuse, riche en antioxydants', 
'عسل الخروب الأصيل بلونه الداكن الفريد ونكهته العميقة الترابية، غني بمضادات الأكسدة', 
140.00, true, 2, 'ACTIVE', '/images/products/miel-caroube.jpg', false, NOW(), NOW()),

(5, 'Miel de Daghmous', 'عسل الدغموس', 
'Rare Daghmous honey from wild cactus flowers, prized for its delicate taste and medicinal benefits', 
'Miel rare de Daghmous provenant de fleurs de cactus sauvages, prisé pour son goût délicat et ses bienfaits médicinaux', 
'عسل الدغموس النادر من زهور الصبار البرية، مقدر لطعمه الرقيق وفوائده الطبية', 
160.00, true, 2, 'ACTIVE', '/images/products/miel-daghmous.jpg', false, NOW(), NOW()),

(6, 'Miel de Citron', 'عسل الليمون', 
'Fresh lemon blossom honey with a bright citrus aroma, naturally sweet with subtle tangy notes', 
'Miel de fleur de citronnier avec un arôme d''agrumes vif, naturellement sucré avec des notes acidulées subtiles', 
'عسل زهر الليمون مع رائحة حمضيات زاهية، حلو طبيعياً مع نكهات لاذعة خفيفة', 
130.00, true, 2, 'ACTIVE', '/images/products/miel-citron.jpg', false, NOW(), NOW());

-- Product sizes for all honey products
INSERT IGNORE INTO product_size_prices (product_id, size, price) VALUES
-- Miel de Sidr
(2, 'HONEY_250G', 95.00),
(2, 'HONEY_500G', 180.00),
(2, 'HONEY_1KG', 340.00),

-- Miel d'Herbes
(3, 'HONEY_250G', 65.00),
(3, 'HONEY_500G', 120.00),
(3, 'HONEY_1KG', 220.00),

-- Miel de Caroube
(4, 'HONEY_250G', 75.00),
(4, 'HONEY_500G', 140.00),
(4, 'HONEY_1KG', 260.00),

-- Miel de Daghmous
(5, 'HONEY_250G', 85.00),
(5, 'HONEY_500G', 160.00),
(5, 'HONEY_1KG', 300.00),

-- Miel de Citron
(6, 'HONEY_250G', 70.00),
(6, 'HONEY_500G', 130.00),
(6, 'HONEY_1KG', 240.00);

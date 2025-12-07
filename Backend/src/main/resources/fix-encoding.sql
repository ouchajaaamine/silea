-- Fix database encoding for UTF-8 support
-- Run this script to ensure the database and tables use utf8mb4 charset

-- Set database charset
ALTER DATABASE sileadb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix categories table
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE categories MODIFY name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE categories MODIFY name_ar VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE categories MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix products table
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products MODIFY name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products MODIFY name_ar VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix customers table
ALTER TABLE customers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE customers MODIFY name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE customers MODIFY email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE customers MODIFY phone VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE customers MODIFY address TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix orders table
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE orders MODIFY order_number VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE orders MODIFY shipping_address TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix order_tracking table
ALTER TABLE order_tracking CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE order_tracking MODIFY location VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE order_tracking MODIFY carrier VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE order_tracking MODIFY notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


# Fix for Arabic Text Encoding Issue

## Problem
The Arabic text (`nameAr` fields) is displaying as garbled characters like `Ï╣Ï│┘ä Ïº┘äÏ▓Ï╣Ï¬Ï▒` instead of proper Arabic script like `عسل الزعتر الخالص`.

## Root Cause
The data was originally inserted when the database connection was using an incompatible charset. Even though the SQL file contained correct Arabic text, it was stored with wrong encoding.

## What Was Fixed
1. ✅ Changed JDBC connection charset from `utf8mb4` to `UTF-8` in `application.yml`
2. ✅ Backend now starts successfully without charset errors
3. ✅ Created SQL script to clean and re-insert all data with proper encoding

## How to Fix the Database

### Option 1: Run SQL Script via MySQL Command Line (Recommended)

1. **Stop the Spring Boot backend** (if running):
   ```powershell
   # Press Ctrl+C in the terminal running the backend
   ```

2. **Connect to MySQL**:
   ```powershell
   mysql -u root -p sileadb
   ```

3. **Run the fix script**:
   ```sql
   source C:/Users/pc/Desktop/Silea/Backend/src/main/resources/fix-arabic-data.sql
   ```
   
   Or on Windows Command Prompt:
   ```cmd
   mysql -u root -p sileadb < "C:\Users\pc\Desktop\Silea\Backend\src\main\resources\fix-arabic-data.sql"
   ```

4. **Restart the backend**:
   ```powershell
   cd C:\Users\pc\Desktop\Silea\Backend
   mvn spring-boot:run
   ```

5. **Test the API**:
   - Visit: http://localhost:8080/api/products
   - The `nameAr` fields should now display proper Arabic text

### Option 2: Use MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `Backend/src/main/resources/fix-arabic-data.sql`
4. Execute the entire script
5. Restart the backend

### Option 3: Drop and Recreate Database (Clean Slate)

If you prefer starting fresh:

```sql
DROP DATABASE IF EXISTS sileadb;
CREATE DATABASE sileadb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sileadb;
```

Then restart the Spring Boot app — it will auto-create tables and run `data.sql` with the correct encoding.

## Verification

After running the fix, test the API:

```powershell
# Get all products
curl http://localhost:8080/api/products

# Get product by ID
curl http://localhost:8080/api/products/2
```

You should see proper Arabic text in the response:
```json
{
  "id": 2,
  "name": "Miel de thym pur",
  "nameAr": "عسل الزعتر الخالص",
  ...
}
```

## Technical Details

### Changes Made:
- **File**: `src/main/resources/application.yml`
  - Changed: `characterEncoding=utf8mb4` → `characterEncoding=UTF-8`
  - Reason: Java doesn't recognize `utf8mb4` as a valid charset name

### Why This Fixes It:
- MySQL's `utf8mb4` charset is **stored correctly** in the database
- The JDBC connection now uses `UTF-8` (Java's name for the same encoding)
- The `connectionCollation=utf8mb4_unicode_ci` ensures MySQL uses utf8mb4 internally
- This combination allows proper bidirectional encoding/decoding

## Prevention
To prevent this in the future:
1. Always use `UTF-8` (not `utf8mb4`) in JDBC URLs for Java charset parameter
2. Keep `utf8mb4` in MySQL table/column definitions and collations
3. Ensure your SQL client/tool is also set to UTF-8 encoding

## Need Help?
If Arabic text is still garbled after following these steps:
1. Check your MySQL client encoding: `SHOW VARIABLES LIKE 'character%';`
2. Verify table charset: `SHOW CREATE TABLE products;`
3. Test with a simple INSERT to isolate the issue

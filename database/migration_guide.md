# 🚀 DATABASE MIGRATION GUIDE
## From Legacy Schema to Simplified Schema v3.0.0

### OVERVIEW

This guide provides step-by-step instructions for migrating from the legacy PetTouch database schema to the new simplified schema v3.0.0. The migration addresses critical inconsistencies and adds missing tables required by the application.

### PRE-MIGRATION CHECKLIST

- [ ] **Backup existing database** - Create a full backup before starting
- [ ] **Stop application services** - Ensure no active connections during migration
- [ ] **Verify environment variables** - Check Supabase connection settings
- [ ] **Test migration on staging** - Run migration on a copy first
- [ ] **Notify users** - Schedule maintenance window if needed

### MIGRATION STEPS

#### Step 1: Backup Current Database

```sql
-- Create backup of current schema
pg_dump -h your-host -U your-user -d your-database > pettouch_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Step 2: Add Missing Columns to Existing Tables

```sql
-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS notification_settings JSONB,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Fix store_orders table structure
ALTER TABLE store_orders 
ADD COLUMN IF NOT EXISTS items JSONB;

-- Rename total to total_amount if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'store_orders' AND column_name = 'total') THEN
        ALTER TABLE store_orders RENAME COLUMN total TO total_amount;
    END IF;
END $$;

-- Fix store_products table structure
ALTER TABLE store_products 
ALTER COLUMN images TYPE TEXT[] USING CASE 
    WHEN images IS NULL THEN NULL 
    ELSE string_to_array(images, ',') 
END,
ALTER COLUMN tags TYPE TEXT[] USING CASE 
    WHEN tags IS NULL THEN NULL 
    ELSE string_to_array(tags, ',') 
END;
```

#### Step 3: Create Missing Tables

```sql
-- Create store_stores table if it doesn't exist
CREATE TABLE IF NOT EXISTS store_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    social_media JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table for Supabase Auth compatibility
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    plan TEXT,
    role TEXT
);

-- Create scans table for legacy compatibility
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    location JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_info JSONB,
    scanner_ip TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create store_wishlist table if missing
CREATE TABLE IF NOT EXISTS store_wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

#### Step 4: Update Constraints

```sql
-- Update constraints to match new schema
ALTER TABLE store_orders 
DROP CONSTRAINT IF EXISTS chk_total_positive,
ADD CONSTRAINT chk_total_positive CHECK (total_amount > 0);

-- Add foreign key for store_products.store_id if not exists
ALTER TABLE store_products 
ADD CONSTRAINT fk_store_products_store 
FOREIGN KEY (store_id) REFERENCES store_stores(id) ON DELETE SET NULL;
```

#### Step 5: Create Missing Indexes

```sql
-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
CREATE INDEX IF NOT EXISTS idx_store_products_store_id ON store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_store_stores_owner_id ON store_stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_store_stores_is_active ON store_stores(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_scans_pet_id ON scans(pet_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_store_wishlist_user_id ON store_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_store_wishlist_product_id ON store_wishlist(product_id);
```

#### Step 6: Enable RLS and Create Policies

```sql
-- Enable RLS on new tables
ALTER TABLE store_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Anyone can view active stores" ON store_stores FOR SELECT USING (is_active = true);
CREATE POLICY "Store owners can manage own stores" ON store_stores FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin can manage all stores" ON store_stores FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view scans" ON scans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scans" ON scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own scans" ON scans FOR SELECT USING (auth.uid() = user_id);
```

#### Step 7: Data Migration

```sql
-- Migrate existing data if needed
-- Example: Populate profiles table from users table
INSERT INTO profiles (id, email, full_name, plan, role)
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) as full_name,
    plan,
    role
FROM users
ON CONFLICT (id) DO NOTHING;

-- Migrate existing scan data to new scans table if you have legacy scan data
-- INSERT INTO scans (pet_id, location, created_at, device_info, scanner_ip, user_id)
-- SELECT ... FROM legacy_scans_table;
```

#### Step 8: Update Schema Metadata

```sql
-- Update schema version
UPDATE schema_metadata 
SET value = '3.0.0', updated_at = NOW() 
WHERE key = 'version';

INSERT INTO schema_metadata (key, value) VALUES 
('migration_date', NOW()::TEXT),
('migration_from', '2.0.0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```

### POST-MIGRATION STEPS

#### Step 1: Regenerate Supabase Types

```bash
# Generate new types from updated schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

#### Step 2: Update Frontend Code

The following files need to be updated to match the new schema:

1. **src/types/index.ts** - ✅ Already updated
2. **src/pages/Store.tsx** - Update Product interface usage
3. **src/pages/admin/AdminOrders.tsx** - Update Order interface usage
4. **src/hooks/useProducts.tsx** - Update product operations

#### Step 3: Test Critical Functionality

- [ ] **User Authentication** - Test login/logout flows
- [ ] **Pet Management** - Test CRUD operations on pets
- [ ] **NFC Tag Operations** - Test tag scanning and management
- [ ] **Store Functionality** - Test product browsing and ordering
- [ ] **Admin Operations** - Test admin panel functionality
- [ ] **Wishlist Operations** - Test add/remove from wishlist

#### Step 4: Performance Verification

```sql
-- Check query performance on key operations
EXPLAIN ANALYZE SELECT * FROM store_products WHERE is_active = true LIMIT 10;
EXPLAIN ANALYZE SELECT * FROM nfc_scans WHERE created_at > NOW() - INTERVAL '1 day';
EXPLAIN ANALYZE SELECT * FROM pets WHERE owner_id = 'user-uuid';
```

### ROLLBACK PLAN

If issues occur during migration:

```sql
-- Restore from backup
psql -h your-host -U your-user -d your-database < pettouch_backup_YYYYMMDD_HHMMSS.sql

-- Or selective rollback
DROP TABLE IF EXISTS store_stores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS scans CASCADE;

-- Revert column changes
ALTER TABLE users 
DROP COLUMN IF EXISTS last_login,
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS notification_settings,
DROP COLUMN IF EXISTS language;
```

### VALIDATION QUERIES

Run these queries to verify migration success:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify column additions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY column_name;

-- Check constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### TROUBLESHOOTING

#### Common Issues and Solutions

1. **Foreign Key Constraint Errors**
   ```sql
   -- Check for orphaned records
   SELECT * FROM store_products WHERE store_id IS NOT NULL 
   AND store_id NOT IN (SELECT id FROM store_stores);
   ```

2. **Array Type Conversion Errors**
   ```sql
   -- Handle NULL values in array conversion
   UPDATE store_products SET images = '{}' WHERE images IS NULL;
   UPDATE store_products SET tags = '{}' WHERE tags IS NULL;
   ```

3. **RLS Policy Conflicts**
   ```sql
   -- Drop conflicting policies
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   ```

### MONITORING

After migration, monitor these metrics:

- Database connection count
- Query performance (especially on store_products and nfc_scans)
- Error rates in application logs
- User authentication success rates

### SUPPORT

If you encounter issues during migration:

1. Check the error logs for specific error messages
2. Verify all prerequisites are met
3. Test on a smaller dataset first
4. Contact the development team with specific error details

---

**Migration Checklist Summary:**
- [ ] Database backup created
- [ ] Missing columns added
- [ ] Missing tables created
- [ ] Constraints updated
- [ ] Indexes created
- [ ] RLS policies applied
- [ ] Data migrated
- [ ] Schema metadata updated
- [ ] Supabase types regenerated
- [ ] Frontend code updated
- [ ] Functionality tested
- [ ] Performance verified
- [ ] Monitoring in place

**Estimated Migration Time:** 30-60 minutes (depending on data size)
**Downtime Required:** 15-30 minutes
**Risk Level:** Medium (with proper backup and testing)

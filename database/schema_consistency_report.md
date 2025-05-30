# 🚨 SCHEMA CONSISTENCY REPORT
## Database Schema vs Frontend/Backend Code Analysis

### CRITICAL INCONSISTENCIES FOUND

## 1. MISSING TABLES IN NEW SCHEMA

### 🚨 CRITICAL: Missing Tables
**Location**: Multiple files throughout codebase
**Issue**: The new simplified schema is missing several tables that are actively used in the application
**Severity**: CRITICAL

**Missing Tables:**
1. **`profiles`** - Referenced in Supabase types
2. **`scans`** - Referenced in Supabase types (separate from nfc_scans)
3. **`store_stores`** - Referenced in Supabase types and admin pages
4. **`store_wishlist`** - Used in Store.tsx but missing from new schema
5. **`pet_images`** - Defined in new schema but missing relationships
6. **`subscription_history`** - Defined in new schema but not in Supabase types

**Fix Required**: Add missing tables to the new schema

## 2. COLUMN INCONSISTENCIES

### 🚨 HIGH: store_orders Table Structure Mismatch
**Location**: src/integrations/supabase/types.ts vs database/schema.sql
**Issue**: Column names and structure don't match between schema and types
**Severity**: HIGH

**Schema Definition:**
```sql
CREATE TABLE store_orders (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    total NUMERIC NOT NULL,
    shipping_address JSONB NOT NULL,
    item_amount NUMERIC NOT NULL,
    payment_info JSONB,
    tracking_number TEXT,
    customer_email TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    billing_address JSONB,
    subtotal NUMERIC,
    shipping_fee NUMERIC,
    tax NUMERIC,
    discount NUMERIC,
    notes TEXT,
    estimated_delivery TIMESTAMPTZ
);
```

**Supabase Types Definition:**
```typescript
store_orders: {
  Row: {
    created_at: string | null
    id: string
    items: Json  // ❌ Missing in schema
    payment_info: Json | null
    shipping_address: Json
    status: string
    total_amount: number  // ❌ Schema has 'total', types have 'total_amount'
    tracking_number: string | null
    user_id: string
  }
}
```

**Fix Required**: 
- Add `items` JSONB column to store_orders table
- Rename `total` to `total_amount` OR update types to use `total`
- Add missing columns from schema to types

### 🚨 HIGH: store_products Table Structure Mismatch
**Location**: src/integrations/supabase/types.ts vs database/schema.sql
**Issue**: Column data types don't match
**Severity**: HIGH

**Schema vs Types Mismatch:**
- Schema: `images TEXT` vs Types: `images: string[] | null`
- Schema: `tags TEXT` vs Types: `tags: string[] | null`
- Schema: Missing `is_active` column in types

**Fix Required**: Update schema to use proper array types or update types to match schema

### 🚨 MEDIUM: users Table Missing Columns
**Location**: src/types/index.ts vs database/schema.sql
**Issue**: Frontend User interface expects columns not in new schema
**Severity**: MEDIUM

**Missing Columns in Schema:**
```typescript
// Expected by frontend but missing in schema:
last_login: string | null;
avatar_url: string | null;
address: Json | null;
notification_settings: Json | null;
language: string;
```

**Fix Required**: Add missing columns to users table in schema

## 3. RELATIONSHIP INCONSISTENCIES

### 🚨 HIGH: NFC Scans Foreign Key Mismatch
**Location**: database/schema.sql vs src/integrations/supabase/types.ts
**Issue**: Foreign key relationship doesn't match
**Severity**: HIGH

**Schema Definition:**
```sql
nfc_scans (
    tag_id TEXT NOT NULL,  -- References tag_code as TEXT
    ...
)
```

**Supabase Types:**
```typescript
Relationships: [
  {
    foreignKeyName: "nfc_scans_tag_id_fkey"
    columns: ["tag_id"]
    referencedRelation: "nfc_tags"
    referencedColumns: ["tag_code"]  // ✅ Correct
  }
]
```

**Current Code Usage:**
- Store.tsx and other files expect tag_id to reference nfc_tags.id (UUID)
- But schema defines it as TEXT referencing tag_code

**Fix Required**: Clarify whether tag_id should reference nfc_tags.id or nfc_tags.tag_code

## 4. DATA TYPE INCONSISTENCIES

### 🚨 MEDIUM: Boolean vs String Status Fields
**Location**: Multiple files
**Issue**: Inconsistent data types for status fields
**Severity**: MEDIUM

**Examples:**
- `lost_found_posts.status`: Schema uses TEXT, but frontend expects specific enum values
- `subscription_requests.status`: Same issue
- `nfc_tags.status`: Same issue

**Fix Required**: Define proper ENUM types or update frontend to handle TEXT properly

## 5. MISSING INDEXES AND CONSTRAINTS

### 🚨 LOW: Missing Unique Constraints
**Location**: database/schema.sql
**Issue**: Some tables missing important unique constraints
**Severity**: LOW

**Missing Constraints:**
- `store_wishlist`: Already has UNIQUE(user_id, product_id) ✅
- `pet_images`: Should have constraint for only one primary image per pet
- `subscription_requests`: Should prevent duplicate pending requests per user

## 6. FRONTEND CODE INCONSISTENCIES

### 🚨 HIGH: Store.tsx Product Interface Mismatch
**Location**: src/pages/Store.tsx:35
**Issue**: Product interface doesn't match schema exactly
**Current Code**: Uses `images: string[]` but schema has `images TEXT`
**Expected (Schema)**: Should be TEXT field
**Severity**: HIGH
**Fix Required**: Update Product interface or schema to match

### 🚨 HIGH: Missing store_wishlist Table
**Location**: src/pages/Store.tsx:200-250
**Issue**: Code references store_wishlist table not in new schema
**Current Code**: 
```typescript
const { data, error } = await supabase
  .from('store_wishlist')  // ❌ Table missing from new schema
  .select('product_id')
```
**Expected (Schema)**: Table should exist
**Severity**: HIGH
**Fix Required**: Add store_wishlist table to schema

## RECOMMENDED FIXES

### 1. Update Schema (Priority: CRITICAL)
```sql
-- Add missing tables
CREATE TABLE store_wishlist (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Fix store_orders table
ALTER TABLE store_orders 
ADD COLUMN items JSONB,
RENAME COLUMN total TO total_amount;

-- Fix store_products table
ALTER TABLE store_products 
ALTER COLUMN images TYPE TEXT[],
ALTER COLUMN tags TYPE TEXT[],
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add missing columns to users
ALTER TABLE users 
ADD COLUMN last_login TIMESTAMPTZ,
ADD COLUMN avatar_url TEXT,
ADD COLUMN address JSONB,
ADD COLUMN notification_settings JSONB,
ADD COLUMN language TEXT DEFAULT 'en';
```

### 2. Update Supabase Types (Priority: HIGH)
- Regenerate types from updated schema
- Ensure all column names match exactly
- Fix data type mismatches

### 3. Update Frontend Interfaces (Priority: HIGH)
- Update Product interface to match schema
- Update User interface to match schema
- Fix all type mismatches in components

### 4. Add Missing RLS Policies (Priority: MEDIUM)
- Add RLS policy for store_wishlist
- Review and test all existing policies

## TESTING CHECKLIST

### Database Operations
- [ ] Test all CRUD operations on each table
- [ ] Verify foreign key constraints work
- [ ] Test RLS policies
- [ ] Verify indexes improve query performance

### Frontend Integration
- [ ] Test Store page functionality
- [ ] Test user profile operations
- [ ] Test pet management
- [ ] Test NFC tag operations
- [ ] Test order management
- [ ] Test wishlist functionality

### API Endpoints
- [ ] Test all Supabase queries
- [ ] Verify error handling
- [ ] Test authentication flows
- [ ] Test admin operations

## CONCLUSION

The new simplified schema has several critical inconsistencies that must be resolved before deployment:

1. **Missing Tables**: 6 tables used by the application are missing
2. **Column Mismatches**: Multiple tables have incorrect column definitions
3. **Type Mismatches**: Data types don't match between schema and frontend
4. **Relationship Issues**: Foreign key relationships are inconsistent

**Estimated Fix Time**: 4-6 hours
**Risk Level**: HIGH - Application will break without these fixes
**Priority**: CRITICAL - Must fix before any deployment

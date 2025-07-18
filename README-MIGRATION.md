# Database Migration Instructions

This README contains instructions for fixing errors related to the order management system in the application.

## Issues Fixed

1. Incorrect attempts to update orders in non-existent tables (`orders`, `user_orders`)
2. Missing columns in the `store_orders` table (subtotal, shipping_fee, tax, discount, etc.)
3. Email notification triggers causing errors when order status changes

## How to Apply the Migration

### Option 1: Using Supabase UI

1. Log in to your Supabase account at https://app.supabase.com/
2. Select your project (`etlzuamrufdhslnjicxi`)
3. Go to the SQL Editor
4. Open the file `migration.sql` from this project
5. Copy and paste the contents into the SQL Editor
6. Click "Run" to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push --db-url "postgresql://postgres:YOUR_PASSWORD@db.etlzuamrufdhslnjicxi.supabase.co:5432/postgres" migration.sql
```

Replace `YOUR_PASSWORD` with your database password.

### Option 3: Using Any PostgreSQL Client

Connect to your Supabase PostgreSQL database using any client (like pgAdmin, DBeaver, etc.) and run the SQL script from `migration.sql`.

## Verification

After applying the migration, you should:

1. Verify that all required columns are in the `store_orders` table
2. Confirm that email notification triggers have been removed
3. Restart your application and test order status updates

## Code Changes

The application code has also been updated to:

1. Only attempt to update orders in the `store_orders` table
2. Provide better error handling and user feedback
3. Remove all email notification related code

These changes should resolve the 404 errors seen in the console and prevent errors related to email notifications when order status changes. 
# PetTouch Database Schema

This directory contains the consolidated database schema for the PetTouch application.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, RLS policies, functions, and triggers

## Schema Overview

The consolidated schema includes:

### Core Tables
- **users** - User accounts and authentication
- **pets** - Pet profiles and information
- **nfc_tags** - NFC tag management
- **nfc_scans** / **scans** - Scan tracking (dual tables for compatibility)

### E-commerce System
- **products** / **store_products** - Product catalog
- **orders** / **store_orders** - Order management
- **order_items** / **store_order_items** - Order line items
- **store_categories** - Product categories
- **store_stores** - Store information
- **store_reviews** - Product reviews
- **store_wishlist** - User wishlists
- **store_coupons** - Discount coupons

### Subscription System
- **subscription_plans** - Available subscription plans
- **subscription_requests** - Upgrade requests
- **subscription_history** - Subscription history

### Additional Features
- **lost_found_posts** - Lost & found pet posts
- **tips** - Pet care tips and content
- **admin_notifications** - Admin notifications
- **customers** - Legacy customer data

## Key Features

### Row Level Security (RLS)
All tables have comprehensive RLS policies that ensure:
- Users can only access their own data
- Admins have full access
- Public data is accessible to anonymous users (for NFC scanning)

### Subscription Limits
Built-in functions enforce subscription limits:
- Free plan: 1 pet, 1 NFC tag
- Basic plan: 3 pets, 3 NFC tags
- Premium plan: 10 pets, 10 NFC tags
- Enterprise plan: Unlimited

### Storage Buckets
- `pet-images` - Pet profile images
- `subscription-uploads` - Subscription upgrade proofs

### Functions & Triggers
- Automatic subscription limit enforcement
- Scan count tracking
- Product rating calculations
- Updated timestamp management

## Usage

To apply this schema to your Supabase database:

1. Copy the contents of `schema.sql`
2. Run it in your Supabase SQL editor
3. Verify all tables and policies are created correctly

## Version

Schema Version: 2.0.0
Last Updated: 2024

## Notes

- The schema maintains backward compatibility with existing code
- Both `owner_id` and `user_id` columns are supported where needed
- Legacy tables are preserved for smooth migration

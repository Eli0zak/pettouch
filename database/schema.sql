-- =============================================
-- PETTOUCH SIMPLIFIED DATABASE SCHEMA
-- Simplified schema with core tables only
-- Generated: 2024
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    avatar_url TEXT,
    address JSONB,
    notification_settings JSONB,
    language TEXT DEFAULT 'en'
);

-- Pets table
CREATE TABLE pets (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    breed TEXT,
    gender TEXT,
    birthday DATE,
    color TEXT,
    weight_kg NUMERIC,
    microchip_id TEXT,
    medical_info JSONB,
    profile_image_url TEXT,
    qr_code_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    emergency_contact JSONB,
    veterinarian JSONB,
    notes TEXT,
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ
);

-- NFC Tags table
CREATE TABLE nfc_tags (
    id UUID PRIMARY KEY,
    tag_code VARCHAR NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR NOT NULL DEFAULT 'inactive',
    tag_type VARCHAR NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    notes TEXT
);

-- NFC Scans table
CREATE TABLE nfc_scans (
    id UUID PRIMARY KEY,
    tag_id TEXT NOT NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    location JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_info JSONB,
    scanner_ip TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Pet Images table
CREATE TABLE pet_images (
    id UUID PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Subscription History table
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_plan TEXT,
    new_plan TEXT,
    change_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_id UUID,
    notes TEXT
);

-- Subscription Requests table
CREATE TABLE subscription_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_plan TEXT,
    requested_plan TEXT,
    payment_method TEXT,
    phone_number TEXT,
    notes TEXT,
    transaction_proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Store Categories table
CREATE TABLE store_categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    parent_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Products table
CREATE TABLE store_products (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    sale_price NUMERIC,
    images TEXT[],
    thumbnail TEXT,
    category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
    tags TEXT[],
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    attributes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    store_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Store Wishlist table
CREATE TABLE store_wishlist (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Store Orders table
CREATE TABLE store_orders (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC NOT NULL,
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
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

-- Lost Found Posts table
CREATE TABLE lost_found_posts (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    title TEXT NOT NULL,
    description TEXT,
    last_seen_date TIMESTAMPTZ,
    last_seen_location TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    pet_name TEXT,
    pet_type TEXT,
    pet_breed TEXT,
    pet_color TEXT,
    pet_gender TEXT,
    pet_age INTEGER,
    image_url TEXT,
    resolved_at TIMESTAMPTZ
);

-- Tips table
CREATE TABLE tips (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    video_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Store Stores table (missing from original schema)
CREATE TABLE store_stores (
    id UUID PRIMARY KEY,
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

-- Profiles table (for Supabase Auth compatibility)
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    plan TEXT,
    role TEXT
);

-- Scans table (legacy compatibility)
CREATE TABLE scans (
    id UUID PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    location JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_info JSONB,
    scanner_ip TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- CONSTRAINTS
-- =============================================

-- Add data validation constraints
ALTER TABLE pets ADD CONSTRAINT chk_weight_positive CHECK (weight_kg > 0);
ALTER TABLE store_products ADD CONSTRAINT chk_price_positive CHECK (price >= 0);
ALTER TABLE store_products ADD CONSTRAINT chk_stock_non_negative CHECK (stock >= 0);
ALTER TABLE store_orders ADD CONSTRAINT chk_total_positive CHECK (total_amount > 0);
-- Note: Constraint for one primary image per pet will be handled by application logic
-- ALTER TABLE pet_images ADD CONSTRAINT chk_one_primary_per_pet UNIQUE (pet_id, is_primary) DEFERRABLE INITIALLY DEFERRED;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_plan ON users(plan);

-- Pets indexes
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_pets_type ON pets(type);
CREATE INDEX idx_pets_is_active ON pets(is_active);
CREATE INDEX idx_pets_created_at ON pets(created_at);

-- NFC Tags indexes
CREATE INDEX idx_nfc_tags_tag_code ON nfc_tags(tag_code);
CREATE INDEX idx_nfc_tags_user_id ON nfc_tags(user_id);
CREATE INDEX idx_nfc_tags_pet_id ON nfc_tags(pet_id);
CREATE INDEX idx_nfc_tags_is_active ON nfc_tags(is_active);
CREATE INDEX idx_nfc_tags_status ON nfc_tags(status);

-- NFC Scans indexes
CREATE INDEX idx_nfc_scans_tag_id ON nfc_scans(tag_id);
CREATE INDEX idx_nfc_scans_pet_id ON nfc_scans(pet_id);
CREATE INDEX idx_nfc_scans_user_id ON nfc_scans(user_id);
CREATE INDEX idx_nfc_scans_created_at ON nfc_scans(created_at);

-- Pet Images indexes
CREATE INDEX idx_pet_images_pet_id ON pet_images(pet_id);
CREATE INDEX idx_pet_images_user_id ON pet_images(user_id);
CREATE INDEX idx_pet_images_is_primary ON pet_images(is_primary);

-- Subscription indexes
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_subscription_requests_user_id ON subscription_requests(user_id);
CREATE INDEX idx_subscription_requests_status ON subscription_requests(status);

-- Store Categories indexes
CREATE INDEX idx_store_categories_slug ON store_categories(slug);
CREATE INDEX idx_store_categories_parent_id ON store_categories(parent_id);
CREATE INDEX idx_store_categories_featured ON store_categories(featured);

-- Store Products indexes
CREATE INDEX idx_store_products_category_id ON store_products(category_id);
CREATE INDEX idx_store_products_sku ON store_products(sku);
CREATE INDEX idx_store_products_featured ON store_products(featured);
CREATE INDEX idx_store_products_is_active ON store_products(is_active);
CREATE INDEX idx_store_products_price ON store_products(price);
CREATE INDEX idx_store_products_name ON store_products(name);
CREATE INDEX idx_store_products_store_id ON store_products(store_id);

-- Store Stores indexes
CREATE INDEX idx_store_stores_owner_id ON store_stores(owner_id);
CREATE INDEX idx_store_stores_is_active ON store_stores(is_active);

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);

-- Scans indexes
CREATE INDEX idx_scans_pet_id ON scans(pet_id);
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at);

-- Additional Users indexes
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_users_language ON users(language);

-- Store Wishlist indexes
CREATE INDEX idx_store_wishlist_user_id ON store_wishlist(user_id);
CREATE INDEX idx_store_wishlist_product_id ON store_wishlist(product_id);

-- Store Orders indexes
CREATE INDEX idx_store_orders_user_id ON store_orders(user_id);
CREATE INDEX idx_store_orders_status ON store_orders(status);
CREATE INDEX idx_store_orders_created_at ON store_orders(created_at);

-- Lost Found Posts indexes
CREATE INDEX idx_lost_found_posts_user_id ON lost_found_posts(user_id);
CREATE INDEX idx_lost_found_posts_pet_id ON lost_found_posts(pet_id);
CREATE INDEX idx_lost_found_posts_status ON lost_found_posts(status);
CREATE INDEX idx_lost_found_posts_created_at ON lost_found_posts(created_at);

-- Tips indexes
CREATE INDEX idx_tips_category ON tips(category);
CREATE INDEX idx_tips_is_featured ON tips(is_featured);
CREATE INDEX idx_tips_author_id ON tips(author_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin can update all users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Pets policies
CREATE POLICY "Anyone can view pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Users can manage own pets" ON pets FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin can manage all pets" ON pets FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- NFC Tags policies
CREATE POLICY "Anyone can view active tags" ON nfc_tags FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own tags" ON nfc_tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all tags" ON nfc_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- NFC Scans policies
CREATE POLICY "Anyone can view scans" ON nfc_scans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scans" ON nfc_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own scans" ON nfc_scans FOR SELECT USING (auth.uid() = user_id);

-- Pet Images policies
CREATE POLICY "Anyone can view pet images" ON pet_images FOR SELECT USING (true);
CREATE POLICY "Users can manage own pet images" ON pet_images FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Pet owners can manage images" ON pet_images FOR ALL USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_images.pet_id AND pets.owner_id = auth.uid())
);

-- Subscription policies
CREATE POLICY "Users can view own subscription history" ON subscription_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage subscription history" ON subscription_history FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Users can manage own subscription requests" ON subscription_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all subscription requests" ON subscription_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Store policies
CREATE POLICY "Anyone can view store categories" ON store_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage store categories" ON store_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Anyone can view active products" ON store_products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage store products" ON store_products FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Users can manage own wishlist" ON store_wishlist FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own orders" ON store_orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all orders" ON store_orders FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Lost Found Posts policies
CREATE POLICY "Anyone can view active posts" ON lost_found_posts FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage own posts" ON lost_found_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all posts" ON lost_found_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Tips policies
CREATE POLICY "Anyone can view tips" ON tips FOR SELECT USING (true);
CREATE POLICY "Admin can manage tips" ON tips FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Store Stores policies
CREATE POLICY "Anyone can view active stores" ON store_stores FOR SELECT USING (is_active = true);
CREATE POLICY "Store owners can manage own stores" ON store_stores FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin can manage all stores" ON store_stores FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Scans policies (legacy compatibility)
CREATE POLICY "Anyone can view scans" ON scans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scans" ON scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own scans" ON scans FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- SCHEMA METADATA
-- =============================================

-- Create a metadata table to track schema version
CREATE TABLE schema_metadata (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert schema version
INSERT INTO schema_metadata (key, value) VALUES 
('version', '3.0.0'),
('created_at', NOW()::TEXT),
('description', 'PetTouch simplified database schema'),
('last_updated', NOW()::TEXT);

-- End of simplified schema

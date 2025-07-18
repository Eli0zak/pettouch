-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  content text NOT NULL,
  video_url character varying,
  thumbnail_url character varying,
  category character varying NOT NULL CHECK (category::text = ANY (ARRAY['Nutrition'::character varying, 'Grooming'::character varying, 'Training'::character varying, 'Health'::character varying, 'Safety'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_featured boolean DEFAULT false,
  social_proof_tags ARRAY,
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lost_found_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type = ANY (ARRAY['found'::text, 'know'::text])),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  resolved_at timestamp with time zone,
  CONSTRAINT lost_found_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT lost_found_interactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.lost_found_posts(id),
  CONSTRAINT lost_found_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lost_found_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  pet_id uuid,
  status text NOT NULL CHECK (status = ANY (ARRAY['open'::text, 'resolved'::text, 'closed'::text])),
  title text NOT NULL,
  description text NOT NULL,
  last_seen_date timestamp with time zone,
  last_seen_location text,
  contact_phone text,
  contact_email text,
  pet_name text,
  pet_type text CHECK (pet_type = ANY (ARRAY['dog'::text, 'cat'::text, 'bird'::text, 'other'::text])),
  pet_breed text,
  pet_color text,
  pet_gender text CHECK (pet_gender = ANY (ARRAY['male'::text, 'female'::text])),
  pet_age integer,
  image_url text,
  resolved_at timestamp with time zone,
  type text,
  government text,
  area text,
  CONSTRAINT lost_found_posts_pkey PRIMARY KEY (id),
  CONSTRAINT lost_found_posts_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT lost_found_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.nfc_scans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tag_id text NOT NULL,
  pet_id uuid,
  location jsonb,
  created_at timestamp with time zone DEFAULT now(),
  device_info jsonb,
  scanner_ip text,
  user_id uuid,
  CONSTRAINT nfc_scans_pkey PRIMARY KEY (id),
  CONSTRAINT nfc_scans_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id)
);
CREATE TABLE public.nfc_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tag_code character varying NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  status character varying NOT NULL DEFAULT 'unassigned'::character varying,
  tag_type character varying NOT NULL DEFAULT 'standard'::character varying,
  user_id uuid,
  pet_id uuid,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  activated_at timestamp with time zone,
  notes text,
  CONSTRAINT nfc_tags_pkey PRIMARY KEY (id),
  CONSTRAINT nfc_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT nfc_tags_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pet_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  pet_id uuid NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  caption text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT pet_images_pkey PRIMARY KEY (id),
  CONSTRAINT pet_images_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id)
);
CREATE TABLE public.pets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  breed text,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
  birthday date,
  color text,
  weight_kg numeric CHECK (weight_kg > 0::numeric),
  microchip_id text,
  medical_info jsonb,
  profile_image_url text,
  qr_code_url text,
  is_active boolean DEFAULT true,
  emergency_contact jsonb,
  veterinarian jsonb,
  notes text,
  scan_count integer DEFAULT 0,
  last_scanned_at timestamp with time zone,
  CONSTRAINT pets_pkey PRIMARY KEY (id),
  CONSTRAINT pets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  plan text,
  role text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scans (
  id uuid NOT NULL,
  pet_id uuid NOT NULL,
  location jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  device_info jsonb,
  scanner_ip text,
  user_id uuid,
  CONSTRAINT scans_pkey PRIMARY KEY (id),
  CONSTRAINT scans_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.schema_metadata (
  key character varying NOT NULL,
  value text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schema_metadata_pkey PRIMARY KEY (key)
);
CREATE TABLE public.store_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  parent_id uuid,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_categories_pkey PRIMARY KEY (id),
  CONSTRAINT store_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.store_categories(id)
);
CREATE TABLE public.store_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  items jsonb NOT NULL,
  shipping_address jsonb NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0::numeric),
  payment_info jsonb,
  tracking_number text,
  customer_email text,
  updated_at timestamp with time zone DEFAULT now(),
  billing_address jsonb,
  subtotal numeric,
  shipping_fee numeric,
  tax numeric,
  discount numeric,
  notes text,
  estimated_delivery timestamp with time zone,
  CONSTRAINT store_orders_pkey PRIMARY KEY (id),
  CONSTRAINT store_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.store_products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0::numeric),
  sale_price numeric,
  images ARRAY,
  thumbnail text,
  category_id uuid,
  tags ARRAY,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku text,
  rating numeric,
  review_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  store_id uuid,
  is_active boolean DEFAULT true,
  last_updated timestamp with time zone,
  CONSTRAINT store_products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_store_products_category FOREIGN KEY (category_id) REFERENCES public.store_categories(id)
);
CREATE TABLE public.store_stores (
  id uuid NOT NULL,
  name text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  address text,
  phone text,
  email text,
  website text,
  social_media jsonb,
  is_active boolean NOT NULL DEFAULT true,
  owner_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_stores_pkey PRIMARY KEY (id),
  CONSTRAINT store_stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.store_wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT store_wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT store_wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.store_products(id)
);
CREATE TABLE public.subscription_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  previous_plan text NOT NULL,
  new_plan text NOT NULL,
  change_date timestamp with time zone DEFAULT now(),
  request_id uuid,
  notes text,
  CONSTRAINT subscription_history_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_history_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.subscription_requests(id),
  CONSTRAINT subscription_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.subscription_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  current_plan text NOT NULL,
  requested_plan text NOT NULL,
  payment_method text NOT NULL,
  phone_number text,
  notes text,
  transaction_proof_url text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  CONSTRAINT subscription_requests_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id),
  CONSTRAINT subscription_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['Nutrition'::text, 'Grooming'::text, 'Training'::text, 'Health'::text, 'Safety'::text])),
  image_url text,
  video_url text,
  is_featured boolean DEFAULT false,
  author_id uuid,
  CONSTRAINT tips_pkey PRIMARY KEY (id),
  CONSTRAINT tips_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_points (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  points integer NOT NULL CHECK (points > 0),
  transaction_type character varying NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_points_pkey PRIMARY KEY (id),
  CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_read_articles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  article_id uuid,
  read_at timestamp with time zone DEFAULT now(),
  points_awarded integer DEFAULT 0,
  is_saved boolean DEFAULT false,
  CONSTRAINT user_read_articles_pkey PRIMARY KEY (id),
  CONSTRAINT user_read_articles_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT user_read_articles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_streaks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_streaks_pkey PRIMARY KEY (id),
  CONSTRAINT user_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  phone text,
  role text DEFAULT 'user'::text,
  plan text DEFAULT 'free'::text,
  created_at timestamp with time zone DEFAULT now(),
  language text,
  total_points integer NOT NULL DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
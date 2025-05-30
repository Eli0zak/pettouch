
import { Json } from "@/integrations/supabase/types";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  sku?: string | null;
  category_id: string;
  store_id?: string | null;
  images?: string[] | null;
  thumbnail?: string | null;
  tags?: string[] | null;
  featured?: boolean | null;
  is_new?: boolean | null;
  is_bestseller?: boolean | null;
  is_active?: boolean;
  attributes?: Record<string, string | number | string[]>;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  parent_id?: string | null;
  image?: string | null;
  featured?: boolean | null;
}

export interface Store {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  is_active?: boolean | null;
  owner_id?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  } | null;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  sku?: string;
  category_id: string;
  store_id?: string | null;
  images: string[];
  thumbnail?: string;
  tags?: string[];
  is_active: boolean;
  featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  attributes?: Record<string, string | number | string[]>;
}

export type ProductStatus = 'all' | 'active' | 'inactive' | 'out-of-stock' | 'sale';
export type ProductSortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

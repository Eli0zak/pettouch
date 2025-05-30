import { Json } from '@/integrations/supabase/types';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  microchip_id: string | null;
  birthday: string | null;
  weight_kg: number | null;
  medical_info: Json | null;
  emergency_contact: Json | null;
  veterinarian: Json | null;
  notes: string | null;
  created_at: string;
  qr_code_url: string | null;
  scan_count: number;
  last_scanned_at: string | null;
  owner?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export interface NfcTag {
  id: string;
  tag_code: string;
  pet_id: string | null;
  user_id: string | null;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
  notes: string | null;
  tag_type: string;
  status: string;
  last_updated: string;
  pet?: Pet | {
    name: string;
    profile_image_url: string | null;
  } | null;
  owner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export interface NfcScan {
  id: string;
  tag_id: string;
  pet_id: string | null;
  user_id: string | null;
  location: Json | null;
  device_info: Json | null;
  scanner_ip: string | null;
  created_at: string;
  tag?: NfcTag;
  pet?: Pet;
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  plan: string;
  created_at: string;
  last_login: string | null;
  avatar_url: string | null;
  address: Json | null;
  notification_settings: Json | null;
  language: string;
}

export interface LostFoundPost {
  id: string;
  title: string;
  description: string;
  pet_name?: string | null;
  pet_type?: string | null;
  pet_breed?: string | null;
  pet_color?: string | null;
  pet_gender?: string | null;
  pet_age?: number | null;
  last_seen_location?: string | null;
  last_seen_date?: string | null;
  status: 'open' | 'resolved' | 'closed';
  image_url?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  user_id: string;
  created_at: string;
  resolved_at?: string | null;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  current_plan: string;
  requested_plan: string;
  payment_method: string;
  phone_number: string;
  transaction_proof_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  images: string[] | null;
  thumbnail: string;
  category_id: string;
  tags: string[] | null;
  stock: number;
  sku: string;
  rating?: number;
  review_count?: number;
  featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  attributes?: {
    [key: string]: string | string[] | number;
  };
  created_at: string;
  updated_at: string;
  store_id?: string;
  is_active: boolean;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  is_active: boolean;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  featured?: boolean;
  products_count?: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  selected_attributes?: {
    [key: string]: string | number;
  };
  added_at: string;
}

export interface ShippingAddress {
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'cash_on_delivery' | 'bank_transfer';
  details: {
    [key: string]: any;
  };
  is_default?: boolean;
}

export interface PaymentInfo {
  method: string;
  status: string;
  transaction_id?: string;
  paid_at?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  selected_attributes?: {
    [key: string]: string | number;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  created_at: string;
  status: OrderStatus;
  total_amount: number;
  subtotal?: number;
  shipping_fee?: number;
  tax?: number;
  discount?: number;
  tracking_number: string | null;
  payment_info: {
    method: string;
    status: string;
    transaction_id?: string;
    paid_at?: string;
  } | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  notes?: string;
  estimated_delivery?: string;
  customer_email?: string;
  billing_address?: ShippingAddress;
  updated_at?: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  added_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
  helpful_count?: number;
  user?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase?: number;
  product_ids?: string[];
  category_ids?: string[];
  starts_at: string;
  expires_at: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
}

export interface LogoProps {
  size?: number;
  className?: string;
}

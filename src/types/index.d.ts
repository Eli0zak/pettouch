
export interface Language {
  code: string;
  name: string;
  displayName: string;
  flag: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  birthday: string | null;
  color: string | null;
  microchip_id: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
  medical_info: any;
  emergency_contact: any;
  owner?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  scan_count?: number;
  last_scanned_at?: string | null;
}

export interface LostFoundPost {
  id: string;
  created_at: string;
  updated_at: string;
  pet_name: string | null;
  pet_type: string | null;
  breed: string | null;
  gender: string | null;
  color: string | null;
  location: string | null;
  date_lost_found: string | null;
  description: string | null;
  image_url: string | null;
  status: string | null;
  user_id: string | null;
  contact_info: string | null;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
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
}

export interface PaymentInfo {
  method: string;
  transaction_id: string;
  status: string;
}

import { Database } from './supabase';

export interface NfcTag {
  id: string;
  tag_code: string;
  pet_id: string | null;
  owner_id: string | null;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
  notes: string | null;
  tag_type: string;
  status: string;
  updated_at: string;
  pet?: {
    id: string;
    name: string;
    type: string;
    profile_image_url?: string | null;
  } | null;
  owner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

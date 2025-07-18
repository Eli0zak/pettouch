export interface Pet {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  color: string;
  birthday: string;
  microchip_id: string;
  weight_kg: number;
  profile_image_url: string | null;
  medical_info: {
    blood_type: string;
    conditions: string[];
    allergies: string[];
    medications: string[];
    vaccinations: Array<{
      name: string;
      date: string;
      next_due: string;
    }>;
    last_checkup: string;
    next_checkup: string;
    medical_notes: string;
    veterinarian: {
      name: string;
      phone: string;
      email: string;
      clinic: string;
      address: string;
      specialization: string;
      license_number: string;
    }
  };
  emergency_contact: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    address: string;
  };
  notes: string | null;
  is_active: boolean;
  qr_code_url: string | null;
  scan_count?: number;
  last_scanned_at?: string;
  // New Pet Story fields
  personality_traits: string | null;
  favorite_things: string | null;
  adoption_date: string | null;
}

export interface DbPet {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  birthday: string | null;
  microchip_id: string | null;
  weight_kg: number | null;
  profile_image_url: string | null;
  medical_info: any;
  emergency_contact: any;
  veterinarian: any;
  notes: string | null;
  is_active: boolean;
  qr_code_url: string | null;
  scan_count?: number;
  last_scanned_at?: string;
}

# Frontend Schema Compliance Fixes - Implementation Guide

**Priority:** CRITICAL - Immediate Implementation Required  
**Estimated Time:** 3-5 days for Priority 1 fixes  
**Status:** Ready for Implementation  

## 🚨 CRITICAL FIXES - PRIORITY 1 (Implement Immediately)

### 1. Fix Checkout.tsx - CRITICAL ORDER PROCESSING VIOLATIONS

**Current Issues:**
- Incorrect field mapping for shipping_address
- Wrong JSONB structure for order items
- Missing required fields validation
- Incorrect data types for NUMERIC fields

**Schema Requirements:**
```sql
-- store_orders table structure
CREATE TABLE store_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR NOT NULL DEFAULT 'pending',
    total_amount NUMERIC NOT NULL,
    subtotal NUMERIC,
    shipping_fee NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    tracking_number VARCHAR,
    payment_info JSONB,
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
    notes TEXT,
    estimated_delivery TIMESTAMPTZ,
    customer_email VARCHAR,
    billing_address JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**FIXED CODE for Checkout.tsx:**
```typescript
// BEFORE (WRONG)
const shippingAddress = {
  firstName: formData.firstName,  // Wrong field names
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  address: formData.address,
  city: formData.city,
  state: formData.state,
  zipCode: formData.zipCode,
  country: formData.country,
};

// AFTER (CORRECT)
const shippingAddress = {
  name: `${formData.firstName} ${formData.lastName}`,
  street: formData.address,
  street2: null,
  city: formData.city,
  state: formData.state,
  zip: formData.zipCode,
  country: formData.country,
  phone: formData.phone,
  is_default: false
};

// BEFORE (WRONG)
const { error } = await supabase.from('store_orders').insert({
  user_id: user.id,
  items: orderItems,
  shipping_address: shippingAddress,
  total_amount: subtotal,  // Missing proper NUMERIC handling
  status: 'pending',
  payment_info: {
    method: 'credit_card',
    status: 'pending',
  },
});

// AFTER (CORRECT)
const { error } = await supabase.from('store_orders').insert({
  user_id: user.id,
  items: orderItems,
  shipping_address: shippingAddress,
  total_amount: Number(subtotal.toFixed(2)), // Proper NUMERIC handling
  subtotal: Number(subtotal.toFixed(2)),
  shipping_fee: 0,
  tax: 0,
  discount: 0,
  status: 'pending',
  payment_info: {
    method: 'credit_card',
    status: 'pending',
    transaction_id: null,
    paid_at: null
  },
  customer_email: formData.email,
  notes: formData.notes || null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
```

### 2. Fix Dashboard.tsx - USER DATA VIOLATIONS

**Current Issues:**
- Wrong table name 'scans' instead of 'nfc_scans'
- Incorrect field references
- Missing proper foreign key validation

**FIXED CODE for Dashboard.tsx:**
```typescript
// BEFORE (WRONG)
const { count: scansCount, error: scansError } = await retrySupabaseQuery(() => 
  supabase
    .from('scans')  // WRONG TABLE NAME
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
);

// AFTER (CORRECT)
const { count: scansCount, error: scansError } = await retrySupabaseQuery(() => 
  supabase
    .from('nfc_scans')  // CORRECT TABLE NAME
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
);
```

### 3. Fix MyPets.tsx - CRITICAL PET DATA VIOLATIONS

**Current Issues:**
- Custom Pet interface overrides schema types
- Improper JSONB field handling
- Missing constraint validation

**FIXED CODE for MyPets.tsx:**
```typescript
// BEFORE (WRONG) - Remove custom interface
interface Pet extends Omit<DbPet, 'breed' | 'birthday'...> {
  breed: string;  // Schema allows NULL
  birthday: string; // Schema uses DATE
}

// AFTER (CORRECT) - Use schema-compliant interface
interface Pet {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string | null;  // Allow NULL as per schema
  gender: string | null;
  color: string | null;
  birthday: string | null;  // Allow NULL as per schema
  microchip_id: string | null;
  weight_kg: number | null;
  profile_image_url: string | null;
  medical_info: any | null;  // JSONB field
  emergency_contact: any | null;  // JSONB field
  veterinarian: any | null;  // JSONB field (deprecated, use medical_info)
  notes: string | null;
  is_active: boolean;
  qr_code_url: string | null;
  scan_count: number;
  last_scanned_at: string | null;
}

// BEFORE (WRONG) - Unsafe JSONB transformation
const petsWithImages = data?.map((dbPet: DbPet) => {
  return {
    ...dbPet,
    breed: dbPet.breed || "",  // WRONG - Forces non-null
    birthday: dbPet.birthday || "",  // WRONG - Forces non-null
    // ... more forced non-null values
  };
}) as Pet[];

// AFTER (CORRECT) - Preserve schema nullability
const petsWithImages = data?.map((dbPet: any) => {
  return {
    ...dbPet,
    // Keep all fields as they are from database
    // Don't force non-null values where schema allows NULL
    medical_info: dbPet.medical_info || null,
    emergency_contact: dbPet.emergency_contact || null,
    scan_count: dbPet.scan_count || 0,
  };
}) as Pet[];
```

### 4. Fix TagsManagement.tsx - NFC TAG VIOLATIONS

**Current Issues:**
- Wrong status values not matching schema
- Improper foreign key handling
- Missing constraint validation

**FIXED CODE for TagsManagement.tsx:**
```typescript
// BEFORE (WRONG) - Custom status values
status: 'assigned',    // Not in schema
status: 'unassigned', // Not in schema

// AFTER (CORRECT) - Use schema status values
status: 'active',     // Matches schema DEFAULT
status: 'inactive',   // Matches schema

// BEFORE (WRONG) - Missing proper validation
const { data: tag, error } = await supabase
  .from('nfc_tags')
  .insert({
    tag_code: newTagCode,
    user_id: session.user.id,
    status: 'unassigned',  // WRONG STATUS
    tag_type: 'standard',
    is_active: true
  });

// AFTER (CORRECT) - Schema compliant
const { data: tag, error } = await supabase
  .from('nfc_tags')
  .insert({
    tag_code: newTagCode,
    user_id: session.user.id,
    pet_id: null,
    is_active: true,
    status: 'inactive',  // CORRECT DEFAULT STATUS
    tag_type: 'standard',
    notes: null,
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString()
  });
```

### 5. Fix Store.tsx - E-COMMERCE VIOLATIONS

**Current Issues:**
- Wrong table names
- Incorrect NUMERIC field handling
- Missing proper JSONB validation

**FIXED CODE for Store.tsx:**
```typescript
// BEFORE (WRONG) - Wrong table names
.from('store_products')    // Should be 'products'
.from('store_categories')  // Should be 'product_categories'
.from('store_wishlist')    // Should be 'wishlists'

// AFTER (CORRECT) - Schema table names
.from('products')
.from('product_categories')
.from('wishlists')

// BEFORE (WRONG) - Improper NUMERIC handling
query = query
  .gte('price', priceRange[0])      // Direct number comparison
  .lte('price', priceRange[1]);

// AFTER (CORRECT) - Proper NUMERIC handling
query = query
  .gte('price', priceRange[0].toString())
  .lte('price', priceRange[1].toString());
```

## 🔧 PRIORITY 2 FIXES - HIGH IMPORTANCE

### 1. Update TypeScript Interfaces

**Fix src/types/index.ts:**
```typescript
// Add missing fields and correct data types
export interface Pet {
  id: string;
  owner_id: string;  // NOT owner_id - check schema
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  microchip_id: string | null;
  birthday: string | null;  // DATE field
  weight_kg: number | null;  // NUMERIC field
  medical_info: any | null;  // JSONB
  emergency_contact: any | null;  // JSONB
  veterinarian: any | null;  // JSONB (deprecated)
  notes: string | null;
  created_at: string;  // TIMESTAMPTZ
  qr_code_url: string | null;
  scan_count: number;
  last_scanned_at: string | null;  // TIMESTAMPTZ
}

export interface NfcTag {
  id: string;
  tag_code: string;
  pet_id: string | null;
  user_id: string | null;
  is_active: boolean;
  created_at: string;  // TIMESTAMPTZ
  activated_at: string | null;  // TIMESTAMPTZ
  notes: string | null;
  tag_type: string;
  status: string;  // Must match schema values
  last_updated: string;  // TIMESTAMPTZ
}
```

### 2. Add Proper Validation Functions

**Create src/utils/schemaValidation.ts:**
```typescript
export const validatePetData = (petData: any) => {
  const errors: string[] = [];
  
  if (!petData.name || petData.name.trim() === '') {
    errors.push('Pet name is required');
  }
  
  if (!petData.type || petData.type.trim() === '') {
    errors.push('Pet type is required');
  }
  
  if (!petData.owner_id) {
    errors.push('Owner ID is required');
  }
  
  if (petData.weight_kg !== null && petData.weight_kg < 0) {
    errors.push('Weight must be positive');
  }
  
  return errors;
};

export const validateOrderData = (orderData: any) => {
  const errors: string[] = [];
  
  if (!orderData.user_id) {
    errors.push('User ID is required');
  }
  
  if (!orderData.total_amount || orderData.total_amount <= 0) {
    errors.push('Total amount must be positive');
  }
  
  if (!orderData.shipping_address) {
    errors.push('Shipping address is required');
  }
  
  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order items are required');
  }
  
  return errors;
};
```

## 🔍 PRIORITY 3 FIXES - MEDIUM IMPORTANCE

### 1. Standardize TIMESTAMPTZ Handling

**Create src/utils/dateUtils.ts:**
```typescript
export const formatTimestampTZ = (date: Date | string): string => {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
};

export const parseTimestampTZ = (timestamp: string): Date => {
  return new Date(timestamp);
};
```

### 2. Add JSONB Validation

**Create src/utils/jsonbUtils.ts:**
```typescript
export const validateMedicalInfo = (medicalInfo: any) => {
  if (!medicalInfo) return null;
  
  return {
    blood_type: medicalInfo.blood_type || null,
    conditions: Array.isArray(medicalInfo.conditions) ? medicalInfo.conditions : [],
    allergies: Array.isArray(medicalInfo.allergies) ? medicalInfo.allergies : [],
    medications: Array.isArray(medicalInfo.medications) ? medicalInfo.medications : [],
    vaccinations: Array.isArray(medicalInfo.vaccinations) ? medicalInfo.vaccinations : [],
    last_checkup: medicalInfo.last_checkup || null,
    next_checkup: medicalInfo.next_checkup || null,
    medical_notes: medicalInfo.medical_notes || null,
    veterinarian: medicalInfo.veterinarian || null
  };
};

export const validateEmergencyContact = (contact: any) => {
  if (!contact) return null;
  
  return {
    name: contact.name || null,
    phone: contact.phone || null,
    email: contact.email || null,
    relationship: contact.relationship || null,
    address: contact.address || null
  };
};
```

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1 - Critical Fixes (Day 1-2)
- [ ] Fix Checkout.tsx order processing
- [ ] Fix Dashboard.tsx table references
- [ ] Fix MyPets.tsx Pet interface
- [ ] Fix TagsManagement.tsx status values
- [ ] Fix Store.tsx table names

### Phase 2 - High Priority (Day 3-4)
- [ ] Update all TypeScript interfaces
- [ ] Add schema validation functions
- [ ] Fix NUMERIC field handling
- [ ] Fix JSONB field validation

### Phase 3 - Medium Priority (Day 5)
- [ ] Standardize TIMESTAMPTZ handling
- [ ] Add comprehensive JSONB validation
- [ ] Update error handling
- [ ] Add automated tests

## 🧪 TESTING REQUIREMENTS

### Database Integration Tests
```typescript
// Test schema compliance
describe('Schema Compliance Tests', () => {
  test('Pet creation follows schema constraints', async () => {
    const petData = {
      name: 'Test Pet',
      type: 'dog',
      owner_id: 'valid-uuid',
      breed: null, // Test NULL handling
      weight_kg: 15.5 // Test NUMERIC handling
    };
    
    const result = await supabase.from('pets').insert(petData);
    expect(result.error).toBeNull();
  });
  
  test('Order creation follows schema constraints', async () => {
    const orderData = {
      user_id: 'valid-uuid',
      total_amount: 99.99,
      shipping_address: { /* valid JSONB */ },
      items: [{ /* valid items */ }]
    };
    
    const result = await supabase.from('store_orders').insert(orderData);
    expect(result.error).toBeNull();
  });
});
```

## 🚨 DEPLOYMENT BLOCKERS

**DO NOT DEPLOY** until these critical fixes are implemented:
1. Checkout.tsx order processing fixes
2. Dashboard.tsx table name corrections
3. MyPets.tsx interface compliance
4. TagsManagement.tsx status value fixes
5. Store.tsx table name corrections

**Estimated Impact:** These fixes will prevent data corruption and ensure proper database operations.

---

**Next Steps:**
1. Implement Priority 1 fixes immediately
2. Test each fix thoroughly
3. Update automated tests
4. Continue with Priority 2 and 3 fixes
5. Complete remaining page audits

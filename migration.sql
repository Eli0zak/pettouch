-- Email notifications table removed

-- Remove email notification triggers from store_orders table
DROP TRIGGER IF EXISTS order_status_change_trigger ON public.store_orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.store_orders;

-- Remove the notification functions if they exist
DROP FUNCTION IF EXISTS public.notify_order_status_change();
DROP FUNCTION IF EXISTS public.notify_order_status_update();

-- Update the store_orders table with missing fields if they don't exist
DO $$
BEGIN
    -- Add subtotal column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'subtotal') THEN
        ALTER TABLE public.store_orders ADD COLUMN subtotal NUMERIC(10, 2);
    END IF;
    
    -- Add shipping_fee column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'shipping_fee') THEN
        ALTER TABLE public.store_orders ADD COLUMN shipping_fee NUMERIC(10, 2);
    END IF;
    
    -- Add tax column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'tax') THEN
        ALTER TABLE public.store_orders ADD COLUMN tax NUMERIC(10, 2);
    END IF;
    
    -- Add discount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'discount') THEN
        ALTER TABLE public.store_orders ADD COLUMN discount NUMERIC(10, 2);
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'notes') THEN
        ALTER TABLE public.store_orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add estimated_delivery column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'estimated_delivery') THEN
        ALTER TABLE public.store_orders ADD COLUMN estimated_delivery TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add customer_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'customer_email') THEN
        ALTER TABLE public.store_orders ADD COLUMN customer_email TEXT;
    END IF;
    
    -- Add billing_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'store_orders' AND column_name = 'billing_address') THEN
        ALTER TABLE public.store_orders ADD COLUMN billing_address JSONB;
    END IF;
    
    -- Create index on tracking_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'store_orders' AND indexname = 'store_orders_tracking_number_idx'
    ) THEN
        CREATE INDEX store_orders_tracking_number_idx ON public.store_orders USING btree (tracking_number);
    END IF;
END $$; 

-- Update users table to make first_name, last_name, and phone fields required
DO $$
BEGIN
    -- First, ensure all existing users have these fields filled (with placeholder if needed)
    UPDATE public.users
    SET first_name = COALESCE(first_name, 'User')
    WHERE first_name IS NULL;
    
    UPDATE public.users
    SET last_name = COALESCE(last_name, 'Account')
    WHERE last_name IS NULL;
    
    UPDATE public.users
    SET phone = COALESCE(phone, 'Not provided')
    WHERE phone IS NULL;
    
    -- Then alter the table to make these fields NOT NULL
    ALTER TABLE public.users
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL,
    ALTER COLUMN phone SET NOT NULL;
END $$;

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        phone
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account'),
        COALESCE(NEW.raw_user_meta_data->>'phone', 'Not provided')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 

-- Create NFC tags table
CREATE TABLE IF NOT EXISTS public.nfc_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tag_code TEXT NOT NULL UNIQUE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on tag_code
CREATE INDEX IF NOT EXISTS nfc_tags_tag_code_idx ON public.nfc_tags USING btree (tag_code);

-- Create NFC tag scans table
CREATE TABLE IF NOT EXISTS public.nfc_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tag_id UUID REFERENCES public.nfc_tags(id) ON DELETE CASCADE NOT NULL,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id),
    location JSONB,
    device_info JSONB,
    scanner_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to update pet scan count and last_scanned_at when an NFC tag is scanned
CREATE OR REPLACE FUNCTION public.update_pet_nfc_scan_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the pet's scan count and last_scanned_at if pet_id is not null
    IF NEW.pet_id IS NOT NULL THEN
        UPDATE public.pets
        SET 
            scan_count = COALESCE(scan_count, 0) + 1,
            last_scanned_at = NOW()
        WHERE id = NEW.pet_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for NFC scan events
DROP TRIGGER IF EXISTS on_nfc_scan_created ON public.nfc_scans;
CREATE TRIGGER on_nfc_scan_created
AFTER INSERT ON public.nfc_scans
FOR EACH ROW EXECUTE FUNCTION public.update_pet_nfc_scan_stats(); 
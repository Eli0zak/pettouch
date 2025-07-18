-- Add government and area fields to lost_found_posts table
ALTER TABLE lost_found_posts
ADD COLUMN government text,
ADD COLUMN area text;

-- Update existing rows to have default values
UPDATE lost_found_posts
SET government = 'Unknown',
    area = 'Unknown'
WHERE government IS NULL
   OR area IS NULL;

-- Add these fields to the RLS policies
ALTER POLICY "Enable insert for authenticated users only"
ON lost_found_posts
WITH CHECK (auth.uid()::text = user_id::text);

ALTER POLICY "Enable update for users based on user_id"
ON lost_found_posts
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

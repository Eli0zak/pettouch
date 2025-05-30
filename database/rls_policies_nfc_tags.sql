-- Enable Row Level Security on nfc_tags table
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT on nfc_tags (anyone can view NFC tag data)
CREATE POLICY "Allow public select on nfc_tags" ON nfc_tags
FOR SELECT
USING (true);

-- Allow INSERT only for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON nfc_tags
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow UPDATE only for owners or admins
CREATE POLICY "Allow update for owners or admins" ON nfc_tags
FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow DELETE only for admins
CREATE POLICY "Allow delete for admins" ON nfc_tags
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

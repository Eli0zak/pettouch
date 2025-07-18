-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT DEFAULT 'general',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for inserting notifications (authenticated users only)
CREATE POLICY "Enable insert for authenticated users only"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for viewing own notifications
CREATE POLICY "Enable read access for users based on user_id"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Policy for updating own notifications (e.g., marking as read)
CREATE POLICY "Enable update for users based on user_id"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy for deleting own notifications
CREATE POLICY "Enable delete for users based on user_id"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Add indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX notifications_read_idx ON notifications(read);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Create lost_found_interactions table
CREATE TABLE IF NOT EXISTS lost_found_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES lost_found_posts(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('found', 'know')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE lost_found_interactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create interactions
CREATE POLICY "Anyone can create interactions" ON lost_found_interactions
    FOR INSERT TO public
    WITH CHECK (true);

-- Allow anyone to view interactions
CREATE POLICY "Anyone can view interactions" ON lost_found_interactions
    FOR SELECT TO public
    USING (true);

-- Allow post owners to update interactions on their posts
CREATE POLICY "Post owners can update interactions" ON lost_found_interactions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lost_found_posts
            WHERE lost_found_posts.id = lost_found_interactions.post_id
            AND lost_found_posts.user_id = auth.uid()
        )
    );

-- Allow interaction creators to view their own interactions
CREATE POLICY "Users can view their own interactions" ON lost_found_interactions
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
    );

-- Allow admins to view all interactions
CREATE POLICY "Admins can view all interactions" ON lost_found_interactions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Create index for performance
CREATE INDEX idx_lost_found_interactions_post_id ON lost_found_interactions(post_id);
CREATE INDEX idx_lost_found_interactions_user_id ON lost_found_interactions(user_id);

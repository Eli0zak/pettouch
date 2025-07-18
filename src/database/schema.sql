-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'bird', 'other');
CREATE TYPE post_status AS ENUM ('open', 'resolved', 'closed');
CREATE TYPE post_type AS ENUM ('lost', 'found');
CREATE TYPE interaction_type AS ENUM ('found', 'know', 'comment');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role to users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Lost and Found Posts Table
CREATE TABLE lost_found_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    pet_name VARCHAR(100),
    pet_breed VARCHAR(100),
    pet_type pet_type NOT NULL,
    type post_type NOT NULL,
    status post_status NOT NULL DEFAULT 'open',
    last_seen_location TEXT,
    government VARCHAR(100),
    area VARCHAR(100),
    image_url TEXT,
    reward_amount DECIMAL(10,2),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reunions Table
CREATE TABLE reunions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES lost_found_posts(id) ON DELETE CASCADE,
    found_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    pet_name VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    reunion_date DATE NOT NULL,
    story TEXT,
    location_found TEXT,
    finder_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_post_reunion UNIQUE(post_id)
);

-- Post Interactions Table
CREATE TABLE post_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES lost_found_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type interaction_type NOT NULL,
    message TEXT,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, interaction_type)
);

-- Post Comments Table
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES lost_found_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to mark a pet as found and create reunion
CREATE OR REPLACE FUNCTION mark_pet_as_found(
    post_id_param UUID,
    admin_user_id UUID,
    finder_notes_param TEXT DEFAULT NULL,
    admin_notes_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reunion_id UUID;
    post_record lost_found_posts%ROWTYPE;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = admin_user_id 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can mark pets as found';
    END IF;

    -- Get post details
    SELECT * INTO post_record
    FROM lost_found_posts
    WHERE id = post_id_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Post not found';
    END IF;

    -- Update post status
    UPDATE lost_found_posts
    SET status = 'resolved',
        updated_at = NOW()
    WHERE id = post_id_param;

    -- Create reunion record
    INSERT INTO reunions (
        post_id,
        found_by_user_id,
        pet_name,
        image_url,
        reunion_date,
        story,
        location_found,
        finder_notes,
        admin_notes
    ) VALUES (
        post_id_param,
        admin_user_id,
        post_record.pet_name,
        post_record.image_url,
        CURRENT_DATE,
        CASE 
            WHEN post_record.type = 'lost' 
            THEN 'Pet was found and reunited with their family!'
            ELSE 'Pet was successfully returned to their family!'
        END,
        post_record.last_seen_location,
        finder_notes_param,
        admin_notes_param
    )
    RETURNING id INTO reunion_id;

    RETURN reunion_id;
END;
$$;

-- Indexes
CREATE INDEX idx_lost_found_posts_user_id ON lost_found_posts(user_id);
CREATE INDEX idx_lost_found_posts_status ON lost_found_posts(status);
CREATE INDEX idx_lost_found_posts_type ON lost_found_posts(type);
CREATE INDEX idx_lost_found_posts_pet_type ON lost_found_posts(pet_type);
CREATE INDEX idx_lost_found_posts_government ON lost_found_posts(government);
CREATE INDEX idx_lost_found_posts_area ON lost_found_posts(area);
CREATE INDEX idx_reunions_post_id ON reunions(post_id);
CREATE INDEX idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_lost_found_posts
    BEFORE UPDATE ON lost_found_posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reunions
    BEFORE UPDATE ON reunions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_post_interactions
    BEFORE UPDATE ON post_interactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_post_comments
    BEFORE UPDATE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Row Level Security Policies
ALTER TABLE lost_found_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mark_pet_as_found TO authenticated;

-- Policies for lost_found_posts
CREATE POLICY "Public posts are viewable by everyone"
    ON lost_found_posts FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own posts"
    ON lost_found_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON lost_found_posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON lost_found_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for reunions
CREATE POLICY "Reunions are viewable by everyone"
    ON reunions FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create reunions"
    ON reunions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update reunions"
    ON reunions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Policies for post_interactions
CREATE POLICY "Interactions are viewable by post owner and interaction creator"
    ON post_interactions FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM lost_found_posts
            WHERE id = post_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create interactions"
    ON post_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for post_comments
CREATE POLICY "Comments are viewable by everyone"
    ON post_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON post_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Row Level Security on lost_found_posts table
ALTER TABLE lost_found_posts ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT on lost_found_posts (anyone can view posts)
CREATE POLICY "Allow public select on lost_found_posts" ON lost_found_posts
FOR SELECT
USING (true);

-- Allow INSERT without authentication (no check)
CREATE POLICY "Allow insert on lost_found_posts" ON lost_found_posts
FOR INSERT
WITH CHECK (true);

-- Allow UPDATE without authentication (no check)
CREATE POLICY "Allow update on lost_found_posts" ON lost_found_posts
FOR UPDATE
USING (true);

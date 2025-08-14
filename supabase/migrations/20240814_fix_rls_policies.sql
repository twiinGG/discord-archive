-- Enable RLS on all tables
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous users to read all data
CREATE POLICY "Allow public read access to channels"
ON channels FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public read access to users"
ON users FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public read access to messages"
ON messages FOR SELECT
TO anon
USING (true);

-- Also allow authenticated users to read all data
CREATE POLICY "Allow authenticated read access to channels"
ON channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read access to users"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read access to messages"
ON messages FOR SELECT
TO authenticated
USING (true);
